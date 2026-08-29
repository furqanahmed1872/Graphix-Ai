import "dotenv/config";
import { pathToFileURL } from "node:url";
import express from "express";
import cors from "cors";
import multer from "multer";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { PostgresRateLimitStore } from "./middleware/pgRateLimitStore.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chartRoutes from "./routes/charts.js";
import feedbackRoutes from "./routes/feedback.js";
import aiRoutes from "./ai/chartRoute.js";

// ── Startup guard — fail fast if critical env vars are missing ─
// PORT and CLIENT_URL are deliberately not required: serverless never binds a
// port, and same-origin deployment has no cross-origin to allow.
const requiredEnvVars = ["JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`FATAL: Missing required env vars: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app = express();
const upload = multer();

// Trust proxy — needed when behind reverse proxy/load balancer
app.set("trust proxy", 1);

// ── CORS ──────────────────────────────────────────────────────
// Only needed when the site and API are on different origins (local dev:
// :3000 -> :5000). In production they share an origin behind /api/*, so
// leaving CLIENT_URL unset skips CORS entirely rather than sending a
// wildcard that would conflict with credentials.
if (process.env.CLIENT_URL) {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );
}

app.use(express.json({ limit: "10mb" }));

// ── Client IP ─────────────────────────────────────────────────
// serverless-http builds a request with no underlying socket, so
// `req.socket.remoteAddress` is undefined and Express derives `req.ip` from
// it — leaving req.ip undefined no matter what `trust proxy` says. Every
// request would then share a single rate-limit bucket, turning the 20-per-15
// -minutes auth limit into a site-wide lockout. req.ips is still parsed from
// X-Forwarded-For, so prefer that, and fall back to the headers directly.
function clientIp(req) {
  const ip =
    req.ip ||
    (req.ips && req.ips[0]) ||
    req.headers["x-nf-client-connection-ip"] ||
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress;

  // ipKeyGenerator normalises IPv6 to a /64 subnet so a single client cannot
  // walk its own address space to get a fresh allowance per request.
  return ip ? ipKeyGenerator(ip) : "unknown";
}

// ── Rate Limiters ─────────────────────────────────────────────
// Auth routes: 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  keyGenerator: clientIp,
  // Shared across instances. The default MemoryStore counts per process, so
  // on serverless an attacker gets a fresh allowance on every cold start.
  store: new PostgresRateLimitStore({ prefix: "auth" }),
});

// General API: 300 requests per minute per IP (prevents scraping)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
  keyGenerator: clientIp,
});

// Apply general limiter to all /api routes
app.use("/api", apiLimiter);

// Apply strict limiter specifically to auth endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/graph", aiRoutes);

// ── Status ────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler — catch unknown routes before error handler ───
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────
// Must be defined last and have 4 params so Express recognises it as an error handler.
// Catches any error thrown or passed via next(err) from any route.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error."
      : err.message || "Internal server error.";
  res.status(status).json({ error: message });
});

// ── Export for serverless, listen when run directly ───────────
// Netlify invokes the exported app through a function handler and must not
// bind a port. Running `node index.js` locally still starts a real server.
export default app;

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const PORT = process.env.PORT || 5000;
  const MAX_BIND_RETRIES = 10;
  let bindRetries = 0;

  const server = app.listen(PORT, () =>
    console.log(`✅ Graphix server running on http://localhost:${PORT}`),
  );

  // `node --watch` can respawn before the old process released the socket.
  server.on("error", (err) => {
    if (err.code !== "EADDRINUSE") throw err;
    if (bindRetries++ >= MAX_BIND_RETRIES) {
      console.error(`FATAL: port ${PORT} still in use after ${MAX_BIND_RETRIES} retries.`);
      process.exit(1);
    }
    console.warn(`Port ${PORT} busy, retrying (${bindRetries}/${MAX_BIND_RETRIES})…`);
    setTimeout(() => server.listen(PORT), 300);
  });

  let shuttingDown = false;
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      if (shuttingDown) return;
      shuttingDown = true;
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 3000).unref();
    });
  }
}
