import { Router } from "express";
import crypto from "crypto";
import pool from "../db/pool.js";
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
    id: c.id,
    title: c.title,
    prompt: c.prompt,
    chartConfig: c.chart_config,
    tag: c.tag,
    category: c.category,
    desc: c.description,
    views: c.views,
    trend: c.trend,
    up: c.trend_up,
    starred: c.starred,
    data: Array.isArray(c.sparkline) ? c.sparkline : [],
    updated: timeAgo(c.updated_at),
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    shareToken: c.share_token ?? null,
    shared: !!c.share_token,
  };
}

async function logActivity(userId, action, chartId, chartTitle) {
  try {
    const userRow = await pool.query("SELECT avatar FROM users WHERE id = $1", [
      userId,
    ]);
    const avatar = userRow.rows[0]?.avatar ?? "U";
    await pool.query(
      `INSERT INTO activity_log (user_id, action, chart_id, chart_title, avatar)
         VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, chartId ?? null, chartTitle, avatar],
    );
  } catch (err) {
    // Activity log failures are non-fatal — never let them break the main request
    console.error("Activity log error:", err);
  }
}

// NOTE: The share_token column is now declared in db/init.sql directly.
// The old runtime ALTER TABLE that used to run here on every server start
// has been removed — it was noisy and unnecessary since we control the schema.

// ── POST /api/charts ──────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const {
    title,
    prompt,
    chartConfig,
    tag = "Line",
    category = "General",
    description = "",
    trend = "0%",
    trendUp = true,
    sparkline = [],
  } = req.body;

  if (!chartConfig) {
    return res.status(400).json({ error: "chartConfig is required." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO saved_charts
         (user_id, title, prompt, chart_config, tag, category, description, trend, trend_up, sparkline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, title, prompt, chart_config, tag, category, description,
                 views, trend, trend_up, starred, sparkline, share_token,
                 created_at, updated_at`,
      [
        userId,
        title || "Untitled Chart",
        prompt || "",
        chartConfig,
        tag,
        category,
        description,
        trend,
        trendUp,
        JSON.stringify(sparkline),
      ],
    );
    const chart = shapeChart(rows[0]);
    await logActivity(userId, "Created", chart.id, chart.title);
    return res.status(201).json(chart);
  } catch (err) {
    console.error("Save chart error:", err);
    return res.status(500).json({ error: "Failed to save chart." });
  }
});

// ── GET /api/charts/share/:token ──────────────────────────────
// PUBLIC — no auth required.
// Registered BEFORE /:id so Express doesn't treat "share" as a UUID param.
router.get("/share/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT id, title, chart_config, tag, views, created_at
         FROM saved_charts WHERE share_token = $1`,
      [token],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Shared chart not found." });
    }

    // Fire-and-forget view increment — never let it block the response
    pool
      .query(`UPDATE saved_charts SET views = views + 1 WHERE id = $1`, [
        rows[0].id,
      ])
      .catch(() => {});

    const c = rows[0];
    return res.json({
      id: c.id,
      title: c.title,
      chartConfig: c.chart_config,
      tag: c.tag,
      views: c.views,
      createdAt: c.created_at,
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
    // Increment views and fetch in one round-trip would require a CTE;
    // two queries is fine for single-chart opens.
    await pool.query(
      `UPDATE saved_charts SET views = views + 1 WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    const { rows } = await pool.query(
      `SELECT id, title, prompt, chart_config, tag, category, description,
              views, trend, trend_up, starred, sparkline, share_token,
              created_at, updated_at
         FROM saved_charts WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Chart not found." });
    }
    return res.json(shapeChart(rows[0]));
  } catch (err) {
    console.error("Get chart error:", err);
    return res.status(500).json({ error: "Failed to fetch chart." });
  }
});

// ── PATCH /api/charts/:id ─────────────────────────────────────
router.patch("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const {
    title,
    tag,
    category,
    description,
    trend,
    trendUp,
    starred,
    sparkline,
    chartConfig,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE saved_charts SET
         title        = COALESCE($3,  title),
         tag          = COALESCE($4,  tag),
         category     = COALESCE($5,  category),
         description  = COALESCE($6,  description),
         trend        = COALESCE($7,  trend),
         trend_up     = COALESCE($8,  trend_up),
         starred      = COALESCE($9,  starred),
         sparkline    = COALESCE($10, sparkline),
         chart_config = COALESCE($11, chart_config),
         updated_at   = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, prompt, chart_config, tag, category, description,
                 views, trend, trend_up, starred, sparkline, share_token,
                 created_at, updated_at`,
      [
        id,
        userId,
        title ?? null,
        tag ?? null,
        category ?? null,
        description ?? null,
        trend ?? null,
        trendUp ?? null,
        starred ?? null,
        sparkline ? JSON.stringify(sparkline) : null,
        chartConfig ?? null,
      ],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }
    const chart = shapeChart(rows[0]);
    if (starred === undefined) {
      await logActivity(userId, "Edited", chart.id, chart.title);
    }
    return res.json(chart);
  } catch (err) {
    console.error("Update chart error:", err);
    return res.status(500).json({ error: "Failed to update chart." });
  }
});

// ── POST /api/charts/:id/star ─────────────────────────────────
router.post("/:id/star", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE saved_charts SET starred = NOT starred, updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, title, starred`,
      [id, userId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }
    const { title, starred } = rows[0];
    await logActivity(userId, starred ? "Starred" : "Unstarred", id, title);
    return res.json({ id, starred });
  } catch (err) {
    console.error("Star toggle error:", err);
    return res.status(500).json({ error: "Failed to toggle star." });
  }
});

// ── POST /api/charts/:id/share ────────────────────────────────
// Idempotent — returns the existing token if one already exists.
router.post("/:id/share", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const { rows: existing } = await pool.query(
      `SELECT id, title, share_token FROM saved_charts WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }

    // Already shared — return existing token (idempotent)
    if (existing[0].share_token) {
      return res.json({ id, shareToken: existing[0].share_token });
    }

    const shareToken = crypto.randomBytes(16).toString("hex");

    const { rows } = await pool.query(
      `UPDATE saved_charts SET share_token = $3, updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, title, share_token`,
      [id, userId, shareToken],
    );

    await logActivity(userId, "Shared", id, rows[0].title);
    return res.json({ id, shareToken: rows[0].share_token });
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
    const result = await pool.query(
      `DELETE FROM saved_charts WHERE id = $1 AND user_id = $2 RETURNING id, title`,
      [id, userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Chart not found or not yours." });
    }
    await logActivity(userId, "Deleted", null, result.rows[0].title);
    return res.json({ deleted: id });
  } catch (err) {
    console.error("Delete chart error:", err);
    return res.status(500).json({ error: "Failed to delete chart." });
  }
});

export default router;
