import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import {
  SYSTEM_PROMPT_WITH_CONTEXT,
  SYSTEM_PROMPT_NO_CONTEXT,
} from "./prompts.js";
import {
  KEYS,
  getNextAvailableKey,
  markKeyExhausted,
  markKeyInvalid,
  keyReport,
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

  // A newly attached file means "chart this data", not "edit what's on screen".
  // Sending both made the prompt carry two full datasets.
  const hasContext = !!previousChart && !fileContent;
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

  let lastError = null;

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const { key, index, allExhausted, allInvalid, retryAfterMs } =
      getNextAvailableKey();

    if (allInvalid) {
      return res.status(503).json({
        error:
          "Chart generation is unavailable: no valid API key is configured.",
      });
    }

    if (allExhausted) {
      const secs = Math.ceil((retryAfterMs || 20000) / 1000);
      return res.status(429).json({
        error: `Rate limited upstream. Try again in about ${secs}s.`,
        retryAfterSeconds: secs,
        ...(lastError ? { detail: lastError.detail } : {}),
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
      // A DNS hiccup or socket timeout says nothing about the key. Cooling it
      // down here meant one transient blip took a single-key deployment
      // offline. Record it and move on; if this was the only key the loop
      // simply ends and we report a network fault, not a rate limit.
      console.warn(`Key #${index + 1} fetch failed: ${fetchErr.message}`);
      lastError = { status: 0, detail: `Network error: ${fetchErr.message}` };
      continue;
    }

    // 401/403 — the key is bad. Rotating past it is right, but a cooldown
    // would let it come back and fail again a minute later.
    if (response.status === 401 || response.status === 403) {
      markKeyInvalid(index);
      continue;
    }

    // 429 — a real rate limit. Respect Groq's Retry-After when present.
    if (response.status === 429) {
      const ra = parseFloat(response.headers.get("retry-after") || "");
      markKeyExhausted(index, Number.isFinite(ra) ? ra * 1000 : undefined);
      const body = await response.text().catch(() => "");
      lastError = { status: 429, detail: body.slice(0, 500) };
      continue;
    }

    // 400 — the REQUEST was rejected (usually context length), not the key.
    // The old code marked the key exhausted here, which took the whole
    // service offline for 60s because of one oversized prompt.
    if (response.status === 400) {
      const body = await response.text().catch(() => "");
      console.error(`Groq rejected the request (400): ${body.slice(0, 500)}`);
      return res.status(400).json({
        error:
          "That request was too large for the model to process. Try a smaller " +
          "dataset, or start a new chart instead of editing this one.",
        detail: body.slice(0, 500),
      });
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

  if (lastError && lastError.status === 0) {
    return res.status(502).json({
      error: "Could not reach the chart service. Please try again.",
      detail: lastError.detail,
    });
  }

  return res.status(429).json({
    error:
      KEYS.length === 1
        ? "The API key is rate limited. Try again shortly."
        : "All API keys are rate limited. Try again shortly.",
    ...(lastError ? { detail: lastError.detail } : {}),
  });
});

// ── GET /api/status ───────────────────────────────────────────
// Local:   http://localhost:{PORT}/api/status (PORT from .env)
// Docker:  http://localhost:5080/api/status
// Vercel:  https://your-app.vercel.app/api/status
router.get("/status", (req, res) => {
  res.json({ totalKeys: KEYS.length, model: GROQ_MODEL, keys: keyReport() });
});

export default router;
