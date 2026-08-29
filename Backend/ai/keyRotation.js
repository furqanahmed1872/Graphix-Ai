// ── Groq Key Rotation ─────────────────────────────────────────
//
// State lives in Postgres, not in this process. On serverless every request
// may get a fresh container, so in-memory cooldowns never survived: a
// rate-limited key was retried immediately and a revoked key was retried
// forever. Both are exactly what rotation exists to prevent.
//
// Failure causes are not interchangeable:
//
//   429  the key really is rate limited   -> cooldown, retry later
//   401  the key is wrong/revoked         -> permanently out
//   400  the *request* was bad            -> nothing to do with the key
//
// Keys are identified by a SHA-256 prefix, never stored in full, and never
// by their position in .env — reordering the variables or swapping one key
// must not let it inherit another key's cooldown.

import crypto from "node:crypto";
import prisma from "../prisma/client.js";

const PLACEHOLDER = /^(your_|<|changeme|xxx|replace)/i;

const KEYS = [];
const keySources = [];
const seen = new Set();

const addKey = (raw, source) => {
  const k = (raw || "").trim();
  if (!k || PLACEHOLDER.test(k)) return;
  if (seen.has(k)) return; // same key under two names is still one quota
  seen.add(k);
  KEYS.push(k);
  keySources.push(source);
};

// Both spellings are accepted. Reading only GROQ_KEY_N once meant a .env
// using GROQ_API_KEY_N loaded zero rotation keys and silently fell back to
// the single GROQ_API_KEY.
for (let i = 1; i <= 100; i++) {
  addKey(process.env[`GROQ_KEY_${i}`], `GROQ_KEY_${i}`);
  addKey(process.env[`GROQ_API_KEY_${i}`], `GROQ_API_KEY_${i}`);
}
addKey(process.env.GROQ_API_KEY, "GROQ_API_KEY");

console.log(
  `Loaded ${KEYS.length} Groq API key(s): ${keySources.join(", ") || "none"}`,
);
if (KEYS.length === 0) {
  console.error(
    "[keyRotation] No Groq keys found. Set GROQ_API_KEY, or GROQ_API_KEY_1..N " +
      "(GROQ_KEY_1..N also works) in the environment.",
  );
}

const FINGERPRINTS = KEYS.map((k) =>
  crypto.createHash("sha256").update(k).digest("hex").slice(0, 16),
);

const DEFAULT_COOLDOWN_MS = 20 * 1000;
const CACHE_TTL_MS = 3000; // cooldowns are >=20s, so a 3s cache cannot skip one

let currentKeyIndex = 0;

// Read-through cache of unavailable keys, plus a fallback copy used when the
// database is unreachable. Chart generation must not hard-fail just because
// the cooldown table is momentarily unavailable.
let cache = { at: 0, cooling: new Map(), invalid: new Set() };
const memoryFallback = { cooling: new Map(), invalid: new Set() };
let degraded = false;

async function loadState() {
  const now = Date.now();
  if (now - cache.at < CACHE_TTL_MS) return cache;

  try {
    const rows = await prisma.groqKeyState.findMany({
      where: { status: { not: "available" } },
      select: { fingerprint: true, status: true, cooldownUntil: true },
    });

    const cooling = new Map();
    const invalid = new Set();
    for (const r of rows) {
      if (r.status === "invalid") invalid.add(r.fingerprint);
      else if (r.cooldownUntil && r.cooldownUntil.getTime() > now) {
        cooling.set(r.fingerprint, r.cooldownUntil.getTime());
      }
    }
    cache = { at: now, cooling, invalid };
    if (degraded) {
      console.log("[keyRotation] key-state database reachable again");
      degraded = false;
    }
    return cache;
  } catch (err) {
    if (!degraded) {
      console.error(
        "[keyRotation] key-state table unreachable, falling back to " +
          "in-process state: " + err.message.slice(0, 120),
      );
      degraded = true;
    }
    return { at: now, ...memoryFallback };
  }
}

async function writeState(index, status, cooldownUntil, lastError) {
  const fingerprint = FINGERPRINTS[index];
  // Always record locally too, so the fallback path stays useful.
  if (status === "invalid") memoryFallback.invalid.add(fingerprint);
  else if (cooldownUntil) {
    memoryFallback.cooling.set(fingerprint, cooldownUntil.getTime());
  }
  cache.at = 0; // force the next read to refresh

  try {
    await prisma.groqKeyState.upsert({
      where: { fingerprint },
      create: { fingerprint, status, cooldownUntil, lastError },
      update: { status, cooldownUntil, lastError },
    });
  } catch (err) {
    console.error(
      `[keyRotation] could not persist state for key #${index + 1}: ` +
        err.message.slice(0, 120),
    );
  }
}

export async function getNextAvailableKey() {
  if (KEYS.length === 0) {
    return { key: null, index: -1, allExhausted: true, allInvalid: true };
  }

  const now = Date.now();
  const { cooling, invalid } = await loadState();

  const usable = FINGERPRINTS.map((f, i) => i).filter(
    (i) => !invalid.has(FINGERPRINTS[i]),
  );
  if (usable.length === 0) {
    return { key: null, index: -1, allExhausted: true, allInvalid: true };
  }

  // Start from wherever we left off so load spreads across keys rather than
  // hammering the first one. indexOf can be -1 if the current key was just
  // marked invalid, hence the clamp.
  const start = Math.max(0, usable.indexOf(currentKeyIndex));
  for (let n = 0; n < usable.length; n++) {
    const idx = usable[(start + n) % usable.length];
    const until = cooling.get(FINGERPRINTS[idx]);
    if (!until || until < now) {
      currentKeyIndex = idx;
      return { key: KEYS[idx], index: idx };
    }
  }

  // Everything usable is cooling — report when the earliest frees up so the
  // caller can tell the user something specific.
  let soonestIdx = usable[0];
  let soonestTime = Infinity;
  for (const i of usable) {
    const t = cooling.get(FINGERPRINTS[i]) || 0;
    if (t < soonestTime) {
      soonestTime = t;
      soonestIdx = i;
    }
  }
  return {
    key: KEYS[soonestIdx],
    index: soonestIdx,
    allExhausted: true,
    retryAfterMs: Math.max(0, soonestTime - now),
  };
}

/** A genuine rate limit. Honours Groq's Retry-After header when it sends one. */
export async function markKeyExhausted(index, retryAfterMs = DEFAULT_COOLDOWN_MS) {
  const ms = Math.min(Math.max(retryAfterMs, 1000), 5 * 60 * 1000);
  const until = new Date(Date.now() + ms);
  console.log(
    `Key #${index + 1} rate limited, cooling down ${Math.round(ms / 1000)}s`,
  );
  currentKeyIndex = (index + 1) % Math.max(1, KEYS.length);
  await writeState(index, "cooling", until, "429 rate limited");
}

/** The key itself is bad (401/403). No cooldown will fix it. */
export async function markKeyInvalid(index) {
  console.error(
    `[keyRotation] Key #${index + 1} rejected as invalid (401/403). ` +
      `Remove or replace it.`,
  );
  await writeState(index, "invalid", null, "401/403 invalid key");
}

export async function keyReport() {
  const now = Date.now();
  const { cooling, invalid } = await loadState();
  return KEYS.map((_, i) => {
    const f = FINGERPRINTS[i];
    const until = cooling.get(f);
    return {
      key: `Key #${i + 1}`,
      source: keySources[i],
      status: invalid.has(f)
        ? "invalid"
        : until && until > now
          ? "cooling down"
          : "available",
      resetsIn: until && until > now ? `${Math.ceil((until - now) / 1000)}s` : "ready",
    };
  });
}

export { KEYS, FINGERPRINTS };
