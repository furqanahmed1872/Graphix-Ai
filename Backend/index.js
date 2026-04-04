import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chartRoutes from "./routes/charts.js";
import feedbackRoutes from "./routes/feedback.js";
import aiRoutes from "./ai/chartRoute.js";

const app = express();
const upload = multer();

// ── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/graph", aiRoutes); // handles POST /api/graph and GET /api/status

// ── Status ────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`✅ Graphix server running on http://localhost:${PORT}`),
);
