import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../db/pool.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 10;

// ── POST /api/auth/signup ─────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // ── Field presence ────────────────────────────────────────
  if (!email || !password || !firstName) {
    return res
      .status(400)
      .json({ error: "firstName, email, and password are required." });
  }

  // ── Password strength ─────────────────────────────────────
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }

  // ── Basic email format ────────────────────────────────────
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res
      .status(400)
      .json({ error: "A valid email address is required." });
  }

  // ── firstName sanity ──────────────────────────────────────
  if (typeof firstName !== "string" || firstName.trim().length < 1) {
    return res.status(400).json({ error: "First name is required." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const avatar = (firstName[0] || "U").toUpperCase();

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, avatar, created_at`,
      [
        email.toLowerCase().trim(),
        passwordHash,
        firstName.trim(),
        (lastName || "").trim(),
        avatar,
      ],
    );

    const user = rows[0];

    await pool.query(
      "INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, 'free', 'active')",
      [user.id],
    );

    const token = signToken({ userId: user.id, email: user.email });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error during signup." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, avatar, created_at
         FROM users WHERE email = $1`,
      [email.toLowerCase().trim()],
    );

    if (rows.length === 0) {
      // Use the same message as a wrong password to avoid user enumeration
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken({ userId: user.id, email: user.email });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error during login." });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, first_name, last_name, avatar, created_at
         FROM users WHERE id = $1`,
      [req.user.userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found." });

    const u = rows[0];
    return res.json({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      avatar: u.avatar,
      createdAt: u.created_at,
    });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
