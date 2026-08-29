// Backend/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import prisma from "../prisma/client.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: shape user response ───────────────────────────────
function shapeUser(u) {
  return {
    id:        u.id,
    email:     u.email,
    firstName: u.firstName,
    lastName:  u.lastName,
    avatar:    u.avatar,
    createdAt: u.createdAt,
  };
}

// ── POST /api/auth/signup ─────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password || !firstName) {
    return res.status(400).json({ error: "firstName, email, and password are required." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (typeof firstName !== "string" || firstName.trim().length < 1) {
    return res.status(400).json({ error: "First name is required." });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const avatar = (firstName[0] || "U").toUpperCase();

    // Create user + subscription in one transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email:        email.toLowerCase().trim(),
          passwordHash,
          firstName:    firstName.trim(),
          lastName:     (lastName || "").trim(),
          avatar,
        },
      });
      await tx.subscription.create({
        data: { userId: newUser.id, plan: "free", status: "active" },
      });
      return newUser;
    });

    const token = signToken({ userId: user.id, email: user.email });
    return res.status(201).json({ token, user: shapeUser(user) });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error during signup." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      // No user OR user signed up via Google — same message to avoid enumeration
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken({ userId: user.id, email: user.email });
    return res.json({ token, user: shapeUser(user) });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(shapeUser(user));
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ── GET /api/auth/google ──────────────────────────────────────
router.get("/google", (req, res) => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id",     process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri",  process.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope",         "openid email profile");
  url.searchParams.set("access_type",   "offline");
  res.redirect(url.toString());
});

// ── GET /api/auth/google/callback ─────────────────────────────
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/signin?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
        grant_type:    "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.id_token) {
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=token_failed`);
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken:  tokenData.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // Upsert user — create if new, return existing if not
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existing) return existing;

      const avatar = (given_name?.[0] || "U").toUpperCase();
      const newUser = await tx.user.create({
        data: {
          email:        email.toLowerCase(),
          passwordHash: null,           // Google users have no password
          firstName:    given_name  || "",
          lastName:     family_name || "",
          avatar,
        },
      });
      await tx.subscription.create({
        data: { userId: newUser.id, plan: "free", status: "active" },
      });
      return newUser;
    });

    const token = signToken({ userId: user.id, email: user.email });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);

  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
  }
});

export default router;