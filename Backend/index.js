import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chartRoutes from "./routes/charts.js";
import feedbackRoutes from "./routes/feedback.js";
import aiRoutes from "./ai/chartRoute.js";

// ── Startup guard — fail fast if critical env vars are missing ─
const requiredEnvVars = ["JWT_SECRET", "PORT", "CLIENT_URL"];
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
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

// ── Rate Limiters ─────────────────────────────────────────────
// Auth routes: 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

// General API: 300 requests per minute per IP (prevents scraping)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
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

const PORT = process.env.PORT;

// `node --watch` can spawn the replacement process before the previous one has
// released the socket — on Windows it terminates the child without delivering a
// signal, so the old process can't always close it first. Retry briefly instead
// of dying on EADDRINUSE and leaving an orphan serving stale code.
const MAX_BIND_RETRIES = 10;
let bindRetries = 0;

const server = app.listen(PORT, () =>
  console.log(`✅ Graphix server running on http://localhost:${PORT}`),
);

server.on("error", (err) => {
  if (err.code !== "EADDRINUSE") throw err;
  if (bindRetries++ >= MAX_BIND_RETRIES) {
    console.error(
      `FATAL: port ${PORT} is still in use after ${MAX_BIND_RETRIES} retries. ` +
        `Another process is holding it.`,
    );
    process.exit(1);
  }
  console.warn(`Port ${PORT} busy, retrying (${bindRetries}/${MAX_BIND_RETRIES})…`);
  setTimeout(() => server.listen(PORT), 300);
});

// Close the socket on Ctrl+C / SIGTERM so the next start binds immediately.
let shuttingDown = false;
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
