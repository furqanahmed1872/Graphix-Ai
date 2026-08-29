import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import {
  SYSTEM_PROMPT_WITH_CONTEXT,
  SYSTEM_PROMPT_NO_CONTEXT,
  SPEC_PROMPT_CREATE,
  SPEC_PROMPT_EDIT,
} from "./prompts.js";
import {
  buildDigest,
  bindSpec,
  normaliseSpec,
  profile,
  downsample,
  isBindable,
  namesUnbindableType,
} from "./dataset.js";
import { resolveLocalEdit } from "./localEdit.js";
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

/**
 * One call to the model, with key rotation.
 * Resolves { ok: true, json } or { ok: false, status, body } — the caller
 * decides what to say to the user. Never marks a key bad for something that
 * was not the key's fault.
 */
async function callModel(systemPrompt, userPrompt, maxTokens) {
  let lastError = null;

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const { key, index, allExhausted, allInvalid, retryAfterMs } =
      getNextAvailableKey();

    if (allInvalid) {
      return {
        ok: false,
        status: 503,
        body: {
          error:
            "Chart generation is unavailable: no valid API key is configured.",
        },
      };
    }
    if (allExhausted) {
      const secs = Math.ceil((retryAfterMs || 20000) / 1000);
      return {
        ok: false,
        status: 429,
        body: {
          error: `Rate limited upstream. Try again in about ${secs}s.`,
          retryAfterSeconds: secs,
        },
      };
    }

    let response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.4,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
        }),
      });
    } catch (fetchErr) {
      // A DNS hiccup says nothing about the key — don't cool it down.
      console.warn(`Key #${index + 1} fetch failed: ${fetchErr.message}`);
      lastError = { status: 0, detail: `Network error: ${fetchErr.message}` };
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      markKeyInvalid(index);
      continue;
    }

    if (response.status === 429) {
      const ra = parseFloat(response.headers.get("retry-after") || "");
      markKeyExhausted(index, Number.isFinite(ra) ? ra * 1000 : undefined);
      lastError = {
        status: 429,
        detail: (await response.text().catch(() => "")).slice(0, 500),
      };
      continue;
    }

    if (response.status === 400) {
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      console.error(`Groq rejected the request (400): ${detail}`);
      return {
        ok: false,
        status: 400,
        body: { error: "The model rejected that request.", detail },
      };
    }

    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      return {
        ok: false,
        status: 502,
        body: { error: "Chart service error.", detail },
      };
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      return {
        ok: false,
        status: 502,
        body: { error: "Could not read the model's response." },
      };
    }

    const raw = payload?.choices?.[0]?.message?.content;
    const finish = payload?.choices?.[0]?.finish_reason;
    if (!raw) {
      return { ok: false, status: 502, body: { error: "Empty model response." } };
    }
    if (finish === "length") {
      // Previously surfaced as an unhelpful JSON parse error.
      return {
        ok: false,
        status: 502,
        body: {
          error:
            "The model's answer was cut off. Try a simpler request or fewer series.",
        },
      };
    }

    try {
      const cleaned = raw
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      return { ok: true, json: JSON.parse(cleaned) };
    } catch {
      return {
        ok: false,
        status: 502,
        body: { error: "The model returned malformed JSON." },
      };
    }
  }

  if (lastError && lastError.status === 0) {
    return {
      ok: false,
      status: 502,
      body: {
        error: "Could not reach the chart service. Please try again.",
        detail: lastError.detail,
      },
    };
  }
  return {
    ok: false,
    status: 429,
    body: {
      error:
        KEYS.length === 1
          ? "The API key is rate limited. Try again shortly."
          : "All API keys are rate limited. Try again shortly.",
      ...(lastError ? { detail: lastError.detail } : {}),
    },
  };
}

// ── POST /api/chart ───────────────────────────────────────────
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  const { prompt, fileContent, previousChart, previousSpec, dataset } =
    req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid prompt" });
  }
  if (KEYS.length === 0) {
    return res.status(500).json({
      error:
        "No API keys configured. Add GROQ_KEY_1 through GROQ_KEY_N or GROQ_API_KEY to your .env",
    });
  }

  // `dataset` is the conversation's data, kept so follow-up edits can rebind
  // without the user re-uploading. `fileContent` is a fresh upload this turn.
  const data = fileContent || dataset || null;

  /* ── SPEC MODE ────────────────────────────────────────────────
     Whenever real data is in play. The model sees a digest (constant size)
     and returns column references; we bind the rows ourselves. */
  /* Chart types the binder cannot build (sankey, parallel coordinates, geo
     maps and the rest of the long tail) still have to come from the model as
     raw Plotly. Route those to the freeform path with a downsampled dataset
     so the full catalogue keeps working without the token blowup. */
  const needsFreeform = data && namesUnbindableType(prompt);

  if (data && !needsFreeform) {
    const { digest, columns, rowCount } = buildDigest(data);
    if (!columns.length) {
      return res.status(400).json({
        error: "That file could not be read as a table. Try a CSV with a header row.",
      });
    }

    // A fresh upload starts a new chart; otherwise edit the spec we already have.
    const editing = !!previousSpec && !fileContent;

    /* Most edits are field assignments, not language problems. Resolve those
       here for zero tokens and zero latency; anything ambiguous falls through
       to the model untouched. */
    if (editing) {
      const local = resolveLocalEdit(prompt, previousSpec, columns);
      if (local) {
        try {
          const { types } = profile(data);
          const spec = normaliseSpec(local.spec, columns, types);
          const figure = bindSpec(spec, data);
          console.log(`local edit (0 tokens): ${local.changed.join("; ")}`);
          return res.json({
            action: "edit",
            spec,
            data: figure.data,
            layout: figure.layout,
            resolvedLocally: true,
          });
        } catch (err) {
          console.warn("Local edit failed to bind, deferring to model:", err.message);
        }
      }
    }
    const userPrompt = editing
      ? `DATASET COLUMNS:\n${columns.map((c) => `  - "${c}"`).join("\n")}\n` +
        `ROW COUNT: ${rowCount}\n\n` +
        `CURRENT SPEC:\n${JSON.stringify(previousSpec)}\n\n` +
        `USER REQUEST:\n${prompt}`
      : `DATASET:\n${digest}\n\nUSER REQUEST:\n${prompt}`;

    const result = await callModel(
      editing ? SPEC_PROMPT_EDIT : SPEC_PROMPT_CREATE,
      userPrompt,
      1024, // a spec is small; no need to reserve room for a data echo
    );
    if (!result.ok) return res.status(result.status).json(result.body);

    const specJson = result.json;
    if (specJson.error) return res.json(specJson); // in-character refusal

    /* The model chose a type the binder does not cover. Rather than forcing
       it into a bar chart, fall through to the freeform path below. */
    if (specJson.chartType && !isBindable(specJson.chartType)) {
      console.log(`spec asked for "${specJson.chartType}" -> freeform fallback`);
      return freeform(req, res, data, prompt, previousChart);
    }

    try {
      const { types } = profile(data);
      const spec = normaliseSpec(specJson, columns, types);
      const figure = bindSpec(spec, data);
      return res.json({
        action: editing ? "edit" : "create",
        spec, // echoed back so the next edit is a cheap patch
        data: figure.data,
        layout: figure.layout,
      });
    } catch (err) {
      console.error("Spec binding failed:", err);
      return res.status(500).json({
        error: "Could not build a chart from that data.",
        detail: String(err.message || err),
      });
    }
  }

  return freeform(req, res, data, prompt, previousChart);
});

/* ── FREEFORM MODE ──────────────────────────────────────────────
   The model returns a Plotly figure directly. Used for the chart types the
   binder cannot build, and for prompts with no dataset at all. When there IS
   data it is downsampled first — that is what keeps a 50,000-row upload from
   blowing the context. */
async function freeform(req, res, data, prompt, previousChart) {
  let dataBlock = "";
  if (data) {
    const s = downsample(data, 150);
    dataBlock = s.sampled
      ? `

DATA (${s.kept} evenly spaced rows sampled from ${s.total} total; ` +
        `the shape is representative of the full set):
${s.text}`
      : `

DATA:
${s.text}`;
  }

  const hasContext = !!previousChart && !data;
  const systemPrompt = hasContext
    ? SYSTEM_PROMPT_WITH_CONTEXT
    : SYSTEM_PROMPT_NO_CONTEXT;

  // Compact, not pretty-printed — indentation doubled this for no benefit.
  const userPrompt = hasContext
    ? `PREVIOUS CHART CONTEXT:\n${JSON.stringify(previousChart)}\n\nUSER REQUEST:\n${prompt}`
    : `${prompt}${dataBlock}`;

  const result = await callModel(systemPrompt, userPrompt, 4096);
  if (!result.ok) return res.status(result.status).json(result.body);

  const chartConfig = result.json;
  if (chartConfig.error) return res.json(chartConfig);

  if (!chartConfig.data || !chartConfig.layout) {
    return res.status(502).json({ error: "AI returned invalid chart structure" });
  }

  return res.json({
    action: chartConfig.action || "create",
    data: chartConfig.data,
    layout: chartConfig.layout,
  });
}

// ── GET /api/status ───────────────────────────────────────────
router.get("/status", (req, res) => {
  res.json({ totalKeys: KEYS.length, model: GROQ_MODEL, keys: keyReport() });
});

export default router;
