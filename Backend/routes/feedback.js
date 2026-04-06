import { Router } from "express";
import pool from "../db/pool.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

// ── POST /api/feedback ────────────────────────────────────────
// Semi-public: authenticated users get their userId stored for traceability,
// but the route does NOT block unauthenticated visitors from submitting.
// Uses optionalAuth — sets req.user if a valid JWT is present, otherwise leaves it undefined.
router.post("/", optionalAuth, async (req, res) => {
  const { name, email, thoughts, rating = 5 } = req.body;

  // userId is null for unauthenticated visitors — that's fine, the column allows NULL
  const userId = req.user?.userId ?? null;

  // ── Validation ────────────────────────────────────────────
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Name must be at least 2 characters." });
  }
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({ error: "A valid email is required." });
  }
  if (
    !thoughts ||
    typeof thoughts !== "string" ||
    thoughts.trim().length < 10
  ) {
    return res
      .status(400)
      .json({ error: "Thoughts must be at least 10 characters." });
  }
  if (thoughts.trim().length > 1000) {
    return res
      .status(400)
      .json({ error: "Thoughts must be 1000 characters or fewer." });
  }

  const safeRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

  try {
    const { rows } = await pool.query(
      `INSERT INTO feedbacks (user_id, author_name, message, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, author_name, message, rating, created_at`,
      [userId, name.trim(), thoughts.trim(), safeRating],
    );

    const fb = rows[0];
    return res.status(201).json({
      id: fb.id,
      authorName: fb.author_name,
      message: fb.message,
      rating: fb.rating,
      createdAt: fb.created_at,
    });
  } catch (err) {
    console.error("Feedback insert error:", err);
    return res
      .status(500)
      .json({ error: "Failed to save feedback. Please try again." });
  }
});

// ── GET /api/feedback ─────────────────────────────────────────
// Public — returns latest 20 feedbacks for the landing page ticker
// and dashboard bootstrap. No auth required.
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, author_name, message, rating, created_at
         FROM feedbacks
         ORDER BY created_at DESC
         LIMIT 20`,
    );

    return res.json(
      rows.map((f) => ({
        id: f.id,
        authorName: f.author_name,
        message: f.message,
        rating: f.rating,
        createdAt: f.created_at,
      })),
    );
  } catch (err) {
    console.error("Feedback fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch feedbacks." });
  }
});

// ── DELETE /api/feedback/:id ──────────────────────────────────
// Admin / owner cleanup — requires auth, only deletes own feedback.
router.delete("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM feedbacks WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Feedback not found or not yours." });
    }
    return res.json({ deleted: id });
  } catch (err) {
    console.error("Feedback delete error:", err);
    return res.status(500).json({ error: "Failed to delete feedback." });
  }
});

export default router;
