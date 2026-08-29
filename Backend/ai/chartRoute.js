import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import {
  SYSTEM_PROMPT_WITH_CONTEXT,
  SYSTEM_PROMPT_NO_CONTEXT,
} from "./prompts.js";
import {
  KEYS,
  exhaustedUntil,
  getNextAvailableKey,
  markKeyExhausted,
} from "./keyRotation.js";

// llama-3.3-70b-versatile was decommissioned by Groq. Override with GROQ_MODEL
// if this default is retired too — see https://console.groq.com/docs/models
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const router = Router();
const upload = multer();

// ── POST /api/chart ───────────────────────────────────────────
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  const { prompt, fileContent, previousChart } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid prompt" });
  }

  if (KEYS.length === 0) {
    return res.status(500).json({
      error:
        "No API keys configured. Add GROQ_KEY_1 through GROQ_KEY_N or GROQ_API_KEY to your .env",
    });
  }

  const hasContext = !!previousChart;
  const systemPrompt = hasContext
    ? SYSTEM_PROMPT_WITH_CONTEXT
    : SYSTEM_PROMPT_NO_CONTEXT;

  let fullPrompt = "";
  if (hasContext) {
    fullPrompt = `PREVIOUS CHART CONTEXT:\n${JSON.stringify(previousChart, null, 2)}\n\nUSER REQUEST:\n${prompt}${
      fileContent
        ? `\n\nATTACHED FILE DATA (use this to create a new chart):\n${fileContent}`
        : ""
    }`;
  } else {
    fullPrompt = fileContent
      ? `Visualize this data:\n\n${fileContent}\n\nInstruction: ${prompt}`
      : prompt;
  }

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const { key, index, allExhausted } = getNextAvailableKey();

    if (allExhausted) {
      return res.status(429).json({
        error:
          "All API keys are temporarily exhausted. Please wait a minute and try again.",
      });
    }

    console.log(`Attempt ${attempt + 1} using key #${index + 1}`);

    let response;
    try {
      response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: fullPrompt },
            ],
            temperature: 0.9,
            max_tokens: 4096,
            response_format: { type: "json_object" },
          }),
        },
      );
    } catch (fetchErr) {
      console.warn(`Key #${index + 1} fetch failed: ${fetchErr.message}`);
      markKeyExhausted(index);
      continue;
    }

    if (
      response.status === 429 ||
      response.status === 401 ||
      response.status === 400
    ) {
      markKeyExhausted(index);
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      console.error(`Key #${index + 1} error:`, err);
      return res.status(500).json({ error: "Groq API failed", detail: err });
    }

    let groqData;
    try {
      groqData = await response.json();
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse Groq response" });
    }

    const raw = groqData?.choices?.[0]?.message?.content;
    if (!raw) {
      return res.status(500).json({ error: "Empty response from Groq" });
    }

    let chartConfig;
    try {
      const cleaned = raw
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      chartConfig = JSON.parse(cleaned);
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Failed to parse chart JSON from AI response" });
    }

    // Soft error from AI (unrelated prompt etc.)
    if (chartConfig.error) {
      console.log(`AI soft-rejected: ${chartConfig.error}`);
      return res.json(chartConfig);
    }

    if (!chartConfig.data || !chartConfig.layout) {
      return res
        .status(500)
        .json({ error: "AI returned invalid chart structure" });
    }

    console.log(`✓ Success with key #${index + 1}`);
    return res.json({
      action: chartConfig.action || "create",
      data: chartConfig.data,
      layout: chartConfig.layout,
    });
  }

  return res
    .status(429)
    .json({ error: "All API keys exhausted. Try again in a minute." });
});

// ── GET /api/status ───────────────────────────────────────────
// Local:   http://localhost:{PORT}/api/status (PORT from .env)
// Docker:  http://localhost:5080/api/status
// Vercel:  https://your-app.vercel.app/api/status
router.get("/status", (req, res) => {
  const now = Date.now();
  res.json({
    totalKeys: KEYS.length,
    keys: KEYS.map((_, i) => ({
      key: `Key #${i + 1}`,
      status:
        exhaustedUntil[i] && exhaustedUntil[i] > now
          ? "exhausted"
          : "available",
      resetsIn:
        exhaustedUntil[i] && exhaustedUntil[i] > now
          ? `${Math.ceil((exhaustedUntil[i] - now) / 1000)}s`
          : "ready",
    })),
  });
});

export default router;
