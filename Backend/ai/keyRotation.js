// ── Groq Key Rotation ─────────────────────────────────────────

const KEYS = [];
for (let i = 1; i <= 20; i++) {
  const k = process.env[`GROQ_KEY_${i}`];
  if (k) KEYS.push(k);
}
if (KEYS.length === 0 && process.env.GROQ_API_KEY) {
  KEYS.push(process.env.GROQ_API_KEY);
}
console.log(`Loaded ${KEYS.length} Groq API key(s)`);

let currentKeyIndex = 0;
const exhaustedUntil = {};

export function getNextAvailableKey() {
  const now = Date.now();
  for (let i = 0; i < KEYS.length; i++) {
    const idx = (currentKeyIndex + i) % KEYS.length;
    if (!exhaustedUntil[idx] || exhaustedUntil[idx] < now) {
      currentKeyIndex = idx;
      return { key: KEYS[idx], index: idx };
    }
  }
  // All exhausted — return soonest to recover
  let soonestIdx = 0;
  let soonestTime = Infinity;
  for (let i = 0; i < KEYS.length; i++) {
    if ((exhaustedUntil[i] || 0) < soonestTime) {
      soonestTime = exhaustedUntil[i] || 0;
      soonestIdx = i;
    }
  }
  return { key: KEYS[soonestIdx], index: soonestIdx, allExhausted: true };
}

export function markKeyExhausted(index) {
  exhaustedUntil[index] = Date.now() + 60 * 1000;
  console.log(`Key #${index + 1} exhausted, switching...`);
  currentKeyIndex = (index + 1) % KEYS.length;
}

export { KEYS, exhaustedUntil, currentKeyIndex };
