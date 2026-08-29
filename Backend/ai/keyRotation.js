// ── Groq Key Rotation ─────────────────────────────────────────
//
// Failure causes are NOT interchangeable, and treating them as one thing is
// what made a single bad request take the whole service down:
//
//   429  the key really is rate limited      -> short cooldown, retry later
//   401  the key is wrong/revoked            -> permanently out, alert loudly
//   400  the *request* was bad (too long)    -> nothing to do with the key
//
// The previous version funnelled all three into a 60s cooldown. With one key
// configured that meant any 400 or 429 blocked every user for a full minute.

// Both spellings are accepted. The loader used to read only GROQ_KEY_N, so a
// .env using the (equally natural) GROQ_API_KEY_N loaded zero rotation keys
// and silently fell back to the single GROQ_API_KEY — which looks exactly
// like "I configured four keys and still get rate limited".
const PLACEHOLDER = /^(your_|<|changeme|xxx|replace)/i;

const KEYS = [];
const seen = new Set();
const addKey = (raw, source) => {
  const k = (raw || "").trim();
  if (!k || PLACEHOLDER.test(k)) return;
  if (seen.has(k)) return; // same key under two names is still one quota
  seen.add(k);
  KEYS.push(k);
  keySources.push(source);
};

const keySources = [];
for (let i = 1; i <= 50; i++) {
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
      "(GROQ_KEY_1..N also works) in Backend/.env",
  );
}
if (KEYS.length === 1) {
  console.warn(
    "[keyRotation] Only one Groq key is configured. A rate limit on it has " +
      "no fallback and will surface to users. Add GROQ_KEY_1..N for headroom.",
  );
}

const DEFAULT_COOLDOWN_MS = 20 * 1000;

let currentKeyIndex = 0;
const exhaustedUntil = {}; // index -> epoch ms the cooldown ends
const invalidKeys = new Set(); // indices that will never work again

export function getNextAvailableKey() {
  const now = Date.now();
  const usable = KEYS.map((_, i) => i).filter((i) => !invalidKeys.has(i));

  if (usable.length === 0) {
    return { key: null, index: -1, allExhausted: true, allInvalid: true };
  }

  for (let n = 0; n < usable.length; n++) {
    const start = Math.max(0, usable.indexOf(currentKeyIndex));
    const idx = usable[(start + n) % usable.length];
    if (!exhaustedUntil[idx] || exhaustedUntil[idx] < now) {
      currentKeyIndex = idx;
      return { key: KEYS[idx], index: idx };
    }
  }

  // Every usable key is cooling down — report when the earliest one frees up
  // so the caller can tell the user something specific.
  let soonestIdx = usable[0];
  let soonestTime = Infinity;
  for (const i of usable) {
    const t = exhaustedUntil[i] || 0;
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
export function markKeyExhausted(index, retryAfterMs = DEFAULT_COOLDOWN_MS) {
  const ms = Math.min(Math.max(retryAfterMs, 1000), 5 * 60 * 1000);
  exhaustedUntil[index] = Date.now() + ms;
  console.log(
    `Key #${index + 1} rate limited, cooling down ${Math.round(ms / 1000)}s`,
  );
  const usable = KEYS.map((_, i) => i).filter((i) => !invalidKeys.has(i));
  if (usable.length > 1) currentKeyIndex = (index + 1) % KEYS.length;
}

/** The key itself is bad (401/403). No cooldown will fix it. */
export function markKeyInvalid(index) {
  invalidKeys.add(index);
  console.error(
    `[keyRotation] Key #${index + 1} rejected as invalid (401/403). ` +
      `Remove or replace it. ${KEYS.length - invalidKeys.size} key(s) left.`,
  );
  if (invalidKeys.size === KEYS.length) {
    console.error("[keyRotation] NO VALID GROQ KEYS REMAIN — chart generation is down.");
  }
}

export function keyReport() {
  const now = Date.now();
  return KEYS.map((_, i) => ({
    key: `Key #${i + 1}`,
    status: invalidKeys.has(i)
      ? "invalid"
      : exhaustedUntil[i] && exhaustedUntil[i] > now
        ? "cooling down"
        : "available",
    resetsIn:
      !invalidKeys.has(i) && exhaustedUntil[i] && exhaustedUntil[i] > now
        ? `${Math.ceil((exhaustedUntil[i] - now) / 1000)}s`
        : "ready",
  }));
}

export { KEYS, exhaustedUntil, invalidKeys, currentKeyIndex };
