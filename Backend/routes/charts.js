// Backend/routes/charts.js
import { Router } from "express";
import crypto from "crypto";
import prisma from "../prisma/client.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── Helpers ───────────────────────────────────────────────────

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function shapeChart(c) {
  return {
    id:          c.id,
    title:       c.title,
    prompt:      c.prompt,
    chartConfig: c.chartConfig,
    tag:         c.tag,
    category:    c.category,
    desc:        c.description,
    views:       c.views,
    trend:       c.trend,
    up:          c.trendUp,
    starred:     c.starred,
    data:        Array.isArray(c.sparkline) ? c.sparkline : [],
    updated:     timeAgo(c.updatedAt),
    createdAt:   c.createdAt,
    updatedAt:   c.updatedAt,
    shareToken:  c.shareToken ?? null,
    shared:      !!c.shareToken,
  };
}

async function logActivity(userId, action, chartId, chartTitle) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { avatar: true },
    });
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        chartId:    chartId ?? null,
        chartTitle,
        avatar:     user?.avatar ?? "U",
      },
    });
  } catch (err) {
    // Non-fatal — never block the main request
    console.error("Activity log error:", err);
  }
}

// ── POST /api/charts ──────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const {
    title,
    prompt,
    chartConfig,
    tag         = "Line",
    category    = "General",
    description = "",
    trend       = "0%",
    trendUp     = true,
    sparkline   = [],
  } = req.body;

  if (!chartConfig) {
    return res.status(400).json({ error: "chartConfig is required." });
  }

  try {
    const chart = await prisma.savedChart.create({
      data: {
        userId,
        title:       title || "Untitled Chart",
        prompt:      prompt || "",
        chartConfig,
        tag,
        category,
        description,
        trend,
        trendUp,
        sparkline,
      },
    });

    await logActivity(userId, "Created", chart.id, chart.title);
    return res.status(201).json(shapeChart(chart));
  } catch (err) {
    console.error("Save chart error:", err);
    return res.status(500).json({ error: "Failed to save chart." });
  }
});

// ── GET /api/charts/share/:token ──────────────────────────────
// PUBLIC — no auth. Registered BEFORE /:id so "share" isn't treated as a UUID.
router.get("/share/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const chart = await prisma.savedChart.findUnique({
      where: { shareToken: token },
    });

    if (!chart) {
      return res.status(404).json({ error: "Shared chart not found." });
    }

    // Fire-and-forget view increment
    prisma.savedChart
      .update({ where: { id: chart.id }, data: { views: { increment: 1 } } })
      .catch(() => {});

    return res.json({
      id:          chart.id,
      title:       chart.title,
      chartConfig: chart.chartConfig,
      tag:         chart.tag,
      views:       chart.views,
      createdAt:   chart.createdAt,
    });
  } catch (err) {
    console.error("Public share fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch shared chart." });
  }
});

// ── GET /api/charts/:id ───────────────────────────────────────
router.get("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  try {
    // Fetch first, then increment — fixes the old bug where views
    // were incremented even when the chart didn't exist
    const chart = await prisma.savedChart.findFirst({
      where: { id, userId },
    });

    if (!chart) {
      return res.status(404).json({ error: "Chart not found." });
    }

    // Fire-and-forget increment after we know chart exists
    prisma.savedChart
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {});

    return res.json(shapeChart(chart));
  } catch (err) {
    console.error("Get chart error:", err);
    return res.status(500).json({ error: "Failed to fetch chart." });
  }
});

// ── PATCH /api/charts/:id ─────────────────────────────────────
router.patch("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const { title, tag, category, description, trend, trendUp, starred, sparkline, chartConfig } = req.body;

  try {
    const chart = await prisma.savedChart.update({
      where: { id_userId: { id, userId } },   // compound unique — enforces ownership
      data: {
        // Only update fields that were actually sent
        ...(title       !== undefined && { title }),
        ...(tag         !== undefined && { tag }),
        ...(category    !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(trend       !== undefined && { trend }),
        ...(trendUp     !== undefined && { trendUp }),
        ...(starred     !== undefined && { starred }),
        ...(sparkline   !== undefined && { sparkline }),
        ...(chartConfig !== undefined && { chartConfig }),
      },
    });

    if (starred === undefined) {
      await logActivity(userId, "Edited", chart.id, chart.title);
    }
    return res.json(shapeChart(chart));
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }
    console.error("Update chart error:", err);
    return res.status(500).json({ error: "Failed to update chart." });
  }
});

// ── POST /api/charts/:id/star ─────────────────────────────────
router.post("/:id/star", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  try {
    // Read current state first, then flip
    const existing = await prisma.savedChart.findFirst({
      where:  { id, userId },
      select: { starred: true, title: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }

    const chart = await prisma.savedChart.update({
      where: { id },
      data:  { starred: !existing.starred },
    });

    await logActivity(userId, chart.starred ? "Starred" : "Unstarred", id, existing.title);
    return res.json({ id, starred: chart.starred });
  } catch (err) {
    console.error("Star toggle error:", err);
    return res.status(500).json({ error: "Failed to toggle star." });
  }
});

// ── POST /api/charts/:id/share ────────────────────────────────
// Idempotent — returns existing token if already shared.
router.post("/:id/share", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const existing = await prisma.savedChart.findFirst({
      where:  { id, userId },
      select: { shareToken: true, title: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }

    // Already shared — return existing token (idempotent)
    if (existing.shareToken) {
      return res.json({ id, shareToken: existing.shareToken });
    }

    const shareToken = crypto.randomBytes(16).toString("hex");

    const chart = await prisma.savedChart.update({
      where: { id },
      data:  { shareToken },
    });

    await logActivity(userId, "Shared", id, existing.title);
    return res.json({ id, shareToken: chart.shareToken });
  } catch (err) {
    console.error("Share chart error:", err);
    return res.status(500).json({ error: "Failed to share chart." });
  }
});

// ── DELETE /api/charts/:id ────────────────────────────────────
router.delete("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  try {
    const chart = await prisma.savedChart.delete({
      where: { id_userId: { id, userId } },
    });

    await logActivity(userId, "Deleted", null, chart.title);
    return res.json({ deleted: id });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }
    console.error("Delete chart error:", err);
    return res.status(500).json({ error: "Failed to delete chart." });
  }
});

export default router;