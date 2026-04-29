// Backend/routes/feedback.js
import { Router } from "express";
import prisma from "../prisma/client.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

// ── Helper ────────────────────────────────────────────────────
function shapeFeedback(f) {
  return {
    id:         f.id,
    authorName: f.authorName,
    message:    f.message,
    rating:     f.rating,
    createdAt:  f.createdAt,
  };
}

// ── POST /api/feedback ────────────────────────────────────────
// Semi-public: stores userId if authenticated, null if not.
router.post("/", optionalAuth, async (req, res) => {
  const { name, email, thoughts, rating = 5 } = req.body;
  const userId = req.user?.userId ?? null;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters." });
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "A valid email is required." });
  }
  if (!thoughts || typeof thoughts !== "string" || thoughts.trim().length < 10) {
    return res.status(400).json({ error: "Thoughts must be at least 10 characters." });
  }
  if (thoughts.trim().length > 1000) {
    return res.status(400).json({ error: "Thoughts must be 1000 characters or fewer." });
  }

  const safeRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        authorName: name.trim(),
        message:    thoughts.trim(),
        rating:     safeRating,
      },
    });

    return res.status(201).json(shapeFeedback(feedback));
  } catch (err) {
    console.error("Feedback insert error:", err);
    return res.status(500).json({ error: "Failed to save feedback. Please try again." });
  }
});

// ── GET /api/feedback ─────────────────────────────────────────
// Public — latest 20 for landing page + bootstrap.
router.get("/", async (_req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take:    20,
    });

    return res.json(feedbacks.map(shapeFeedback));
  } catch (err) {
    console.error("Feedback fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch feedbacks." });
  }
});

// ── GET /api/feedback/mine ────────────────────────────────────
// Auth required — returns only the logged-in user's own feedbacks.
router.get("/mine", requireAuth, async (req, res) => {
  const { userId } = req.user;
  try {
    const feedbacks = await prisma.feedback.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(feedbacks.map(shapeFeedback));
  } catch (err) {
    console.error("Feedback mine error:", err);
    return res.status(500).json({ error: "Failed to fetch your feedbacks." });
  }
});

// ── DELETE /api/feedback/:id ──────────────────────────────────
// Owner only — deletes own feedback.
router.delete("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    await prisma.feedback.delete({
      where: { id, userId },
    });

    return res.json({ deleted: id });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Feedback not found or not yours." });
    }
    console.error("Feedback delete error:", err);
    return res.status(500).json({ error: "Failed to delete feedback." });
  }
});

export default router;