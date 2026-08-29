// ── Postgres-backed store for express-rate-limit ──────────────
//
// The default MemoryStore counts per process. On serverless every invocation
// can be a fresh container, so an attacker gets the full allowance again on
// each one and the limit stops meaning anything. This keeps the counters in
// Postgres so they are shared across every instance.
//
// Only the auth limiter uses this. The general /api limiter stays in memory
// on purpose: DB-backing a 300/min cap would mean a write on every request
// to deter scraping, which costs more than it protects.

import prisma from "../prisma/client.js";

export class PostgresRateLimitStore {
  constructor({ prefix = "rl" } = {}) {
    this.prefix = prefix;
    this.windowMs = 60_000;
    this.lastSweep = 0;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  #key(key) {
    return `${this.prefix}:${key}`;
  }

  /**
   * One atomic statement: insert, or bump the counter, or start a new window
   * if the old one has passed. Doing this as read-then-write would let two
   * concurrent requests both read the same count and undercount the total.
   */
  async increment(key) {
    const expiresAt = new Date(Date.now() + this.windowMs);
    try {
      const rows = await prisma.$queryRaw`
        INSERT INTO rate_limit_hits (key, hits, expires_at)
        VALUES (${this.#key(key)}, 1, ${expiresAt})
        ON CONFLICT (key) DO UPDATE SET
          hits = CASE
                   WHEN rate_limit_hits.expires_at <= NOW() THEN 1
                   ELSE rate_limit_hits.hits + 1
                 END,
          expires_at = CASE
                         WHEN rate_limit_hits.expires_at <= NOW()
                           THEN EXCLUDED.expires_at
                         ELSE rate_limit_hits.expires_at
                       END
        RETURNING hits, expires_at`;

      this.#maybeSweep();
      const row = rows[0];
      return { totalHits: Number(row.hits), resetTime: row.expires_at };
    } catch (err) {
      // Fail open. A database blip should not lock every user out of signing
      // in; losing the limit briefly is the lesser failure.
      console.error(
        "[rateLimit] store unavailable, allowing request: " +
          err.message.slice(0, 120),
      );
      return { totalHits: 1, resetTime: expiresAt };
    }
  }

  async decrement(key) {
    try {
      await prisma.$executeRaw`
        UPDATE rate_limit_hits SET hits = GREATEST(hits - 1, 0)
        WHERE key = ${this.#key(key)}`;
    } catch {
      /* non-critical */
    }
  }

  async resetKey(key) {
    try {
      await prisma.$executeRaw`
        DELETE FROM rate_limit_hits WHERE key = ${this.#key(key)}`;
    } catch {
      /* non-critical */
    }
  }

  /** Clear expired rows now and then so the table cannot grow without bound. */
  #maybeSweep() {
    const now = Date.now();
    if (now - this.lastSweep < 5 * 60_000) return;
    this.lastSweep = now;
    prisma
      .$executeRaw`DELETE FROM rate_limit_hits WHERE expires_at < NOW() - INTERVAL '1 hour'`
      .catch(() => {});
  }
}
