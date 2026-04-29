// Backend/routes/user.js
import { Router } from "express";
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

function buildDashboardStats(charts, subscription) {
  const totalGraphs  = charts.length;
  const totalViews   = charts.reduce((sum, c) => sum + (c.views || 0), 0);
  const sharedCount  = charts.filter((c) => !!c.shareToken).length;

  const storageBytes = charts.reduce(
    (sum, c) => sum + JSON.stringify(c.chartConfig || {}).length,
    0,
  );
  const storageMB = (storageBytes / (1024 * 1024)).toFixed(1);

  const now   = Date.now();
  const day7  = now - 7  * 86400_000;
  const day14 = now - 14 * 86400_000;

  const recentCharts = charts.filter((c) => new Date(c.createdAt).getTime() > day7).length;
  const prevCharts   = charts.filter((c) => {
    const t = new Date(c.createdAt).getTime();
    return t > day14 && t <= day7;
  }).length;
  const chartsDelta = recentCharts - prevCharts;

  const recentViews = charts
    .filter((c) => new Date(c.updatedAt).getTime() > day7)
    .reduce((s, c) => s + (c.views || 0), 0);

  return [
    {
      label: "Total Graphs",
      value: String(totalGraphs),
      delta: chartsDelta > 0 ? `+${chartsDelta} this week` : chartsDelta < 0 ? `${chartsDelta} this week` : "No change",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      label: "Total Views",
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews),
      delta: recentViews > 0 ? `+${recentViews} this week` : "No views yet",
      icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    },
    {
      label: "Shared Links",
      value: String(sharedCount),
      delta: sharedCount > 0 ? `${sharedCount} active` : "None shared",
      icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
    },
    {
      label: "Storage Used",
      value: `${storageMB}MB`,
      delta: subscription?.plan === "free" ? "Free plan limit: 100MB" : "Unlimited on Pro",
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    },
  ];
}

// ── PATCH /api/user/profile ───────────────────────────────────
router.patch("/profile", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { firstName, lastName, email } = req.body;

  if (!firstName && !lastName && !email) {
    return res.status(400).json({ error: "No fields to update." });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        // Only update fields that were actually provided
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName  && { lastName:  lastName.trim()  }),
        ...(email     && { email:     email.toLowerCase().trim() }),
      },
    });

    return res.json({
      id:        user.id,
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      avatar:    user.avatar,
      createdAt: user.createdAt,
    });
  } catch (err) {
    // P2025 = record not found
    if (err.code === "P2025") return res.status(404).json({ error: "User not found." });
    console.error("Update profile error:", err);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

// ── GET /api/user/bootstrap ───────────────────────────────────
router.get("/bootstrap", requireAuth, async (req, res) => {
  const { userId } = req.user;

  try {
    // All 6 queries fire in parallel — same as before
    const [user, subscription, charts, activityLogs, graphTemplates, feedbacks] =
      await Promise.all([

        // User profile
        prisma.user.findUnique({
          where: { id: userId },
        }),

        // Latest subscription
        prisma.subscription.findFirst({
          where:   { userId },
          orderBy: { createdAt: "desc" },
        }),

        // Saved charts — last 50
        prisma.savedChart.findMany({
          where:   { userId },
          orderBy: { updatedAt: "desc" },
          take:    50,
        }),

        // Activity feed — last 20
        prisma.activityLog.findMany({
          where:   { userId },
          orderBy: { createdAt: "desc" },
          take:    20,
        }),

        // Global templates
        prisma.graphTemplate.findMany({
          orderBy: [{ isTrending: "desc" }, { createdAt: "asc" }],
        }),

        // Global feedbacks
        prisma.feedback.findMany({
          orderBy: { createdAt: "desc" },
          take:    20,
        }),
      ]);

    if (!user) return res.status(404).json({ error: "User not found." });

    const sub = subscription ?? {
      plan:      "free",
      status:    "active",
      startedAt: null,
      expiresAt: null,
    };

    // ── Shape savedCharts ─────────────────────────────────────
    // Prisma returns camelCase — no manual mapping needed for most fields
    const savedCharts = charts.map((c) => ({
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
    }));

    // ── Shape activityFeed ────────────────────────────────────
    const activityFeed = activityLogs.map((a) => ({
      id:     a.id,
      action: a.action,
      graph:  a.chartTitle,
      time:   timeAgo(a.createdAt),
      avatar: a.avatar,
      own:    a.userId === userId,   // computed — no raw SQL needed
    }));

    // ── Dashboard stats ───────────────────────────────────────
    const dashboardStats = buildDashboardStats(charts, sub);

    // ── Shape global data ─────────────────────────────────────
    const shapedTemplates = graphTemplates.map((t) => ({
      id:          t.id,
      title:       t.title,
      category:    t.category,
      description: t.description,
      trend:       t.trend,
      isTrending:  t.isTrending,
      template:    t.template,
      tag:         t.tag,
      count:       t.chartCount,
      desc:        t.description,
    }));

    const shapedFeedbacks = feedbacks.map((f) => ({
      id:         f.id,
      authorName: f.authorName,
      message:    f.message,
      rating:     f.rating,
      createdAt:  f.createdAt,
    }));

    return res.json({
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        avatar:    user.avatar,
        createdAt: user.createdAt,
      },
      subscription: {
        plan:      sub.plan,
        status:    sub.status,
        startedAt: sub.startedAt,
        expiresAt: sub.expiresAt,
      },
      savedCharts,
      dashboardStats,
      activityFeed,
      globalData: {
        graphTemplates: shapedTemplates,
        feedbacks:      shapedFeedbacks,
      },
    });
  } catch (err) {
    console.error("Bootstrap error:", err);
    return res.status(500).json({ error: "Failed to load user data." });
  }
});

export default router;