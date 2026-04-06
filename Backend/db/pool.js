import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "graphix_db",
  user: process.env.DB_USER || "graphix_user",
  password: process.env.DB_PASSWORD || "graphix_pass",

  // ── Pool sizing ───────────────────────────────────────────
  max: 20, // max concurrent connections
  idleTimeoutMillis: 30_000, // close idle connections after 30 s
  connectionTimeoutMillis: 5_000, // was 2000 — give production DB more time to respond

  // ── Keep-alive ────────────────────────────────────────────
  // Prevents connections from being silently dropped by firewalls / load balancers
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

// ── Log unexpected pool-level errors ─────────────────────────
pool.on("error", (err) => {
  console.error("Unexpected DB pool error:", err.message);
  // Don't exit — pool will auto-recover by creating a new connection
});

// ── Verify connectivity on startup ────────────────────────────
// Runs once when the module is first imported. If the DB is unreachable
// we log a clear warning; the process continues so you can see the error
// rather than getting a cryptic port-binding failure.
pool
  .query("SELECT 1")
  .then(() => console.log("✅ Database connection verified."))
  .catch((err) =>
    console.error(
      "⚠️  Database connection failed on startup:",
      err.message,
      "\nCheck DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME in your .env",
    ),
  );

export default pool;
