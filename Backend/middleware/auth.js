import jwt from "jsonwebtoken";

// ── Startup guard ─────────────────────────────────────────────
// index.js already calls process.exit(1) if JWT_SECRET is missing,
// but we guard here too in case auth.js is ever imported in isolation
// (e.g. tests, scripts).
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET env var is not set.");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ── signToken ─────────────────────────────────────────────────
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ── verifyToken ───────────────────────────────────────────────
// Exported so routes that do optional auth (e.g. feedback) can call it
// directly without going through the middleware chain.
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// ── requireAuth middleware ────────────────────────────────────
// Attaches req.user = { userId, email } or returns 401.
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header." });
  }

  const token = auth.slice(7);
  try {
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Token expired or invalid. Please sign in again." });
  }
}

// ── optionalAuth middleware ───────────────────────────────────
// Does NOT block the request if there is no token.
// Sets req.user if a valid token is present, leaves it undefined otherwise.
// Use this on routes that are public but benefit from knowing who's logged in.
export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decoded = verifyToken(auth.slice(7));
      req.user = { userId: decoded.userId, email: decoded.email };
    } catch (_) {
      // Invalid / expired token on a public route — just ignore it
    }
  }
  next();
}
