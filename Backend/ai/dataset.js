// ── Dataset handling ──────────────────────────────────────────
//
// The model never sees the rows. It sees a digest (columns, types, row count,
// a few samples) and answers with a SPEC that names columns. This module turns
// the raw file into that digest, and turns a spec back into a full Plotly
// figure using every row.
//
// Consequences:
//   * prompt size is constant no matter how big the upload is
//   * the chart plots the user's real numbers, because the model never
//     retypes them
//   * an edit is a ~200 token spec patch instead of a full data echo

const MAX_SAMPLE_ROWS = 8;

/* ── CSV parsing (quote-aware) ─────────────────────────────── */
export function parseCSV(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  const src = String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const cleaned = rows.filter((r) => r.some((c) => String(c).trim() !== ""));
  if (!cleaned.length) return { columns: [], rows: [] };

  const columns = cleaned[0].map((h, i) => {
    const name = String(h).trim();
    return name || `column_${i + 1}`;
  });
  const body = cleaned.slice(1).map((r) => {
    const o = {};
    columns.forEach((c, i) => {
      o[c] = (r[i] ?? "").trim();
    });
    return o;
  });
  return { columns, rows: body };
}

/* ── Type inference ────────────────────────────────────────── */
const NUM_RE = /^-?[\d,]*\.?\d+(?:[eE][-+]?\d+)?%?$/;

export function toNumber(v) {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(/[,$\s]/g, "").replace(/%$/, "");
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function inferType(rows, col) {
  const vals = rows
    .map((r) => r[col])
    .filter((v) => v !== "" && v !== null && v !== undefined)
    .slice(0, 200);
  if (!vals.length) return "empty";

  const numeric = vals.filter((v) => NUM_RE.test(String(v).trim().replace(/[,$\s]/g, "")));
  if (numeric.length / vals.length > 0.85) return "number";

  const dates = vals.filter((v) => !Number.isNaN(Date.parse(String(v))));
  if (dates.length / vals.length > 0.85) return "date";

  return "text";
}

export function profile(text) {
  const { columns, rows } = parseCSV(text);
  const types = {};
  const uniques = {};
  for (const c of columns) {
    types[c] = inferType(rows, c);
    const seen = new Set();
    for (const r of rows) {
      seen.add(r[c]);
      if (seen.size > 60) break;
    }
    uniques[c] = seen.size;
  }
  return { columns, rows, types, uniques };
}

/* ── The digest the model actually receives ────────────────── */
export function buildDigest(text) {
  const { columns, rows, types, uniques } = profile(text);
  if (!columns.length) return { digest: "EMPTY DATASET", columns: [], rowCount: 0 };

  const lines = [
    `ROW COUNT: ${rows.length}`,
    "COLUMNS:",
    ...columns.map(
      (c) =>
        `  - "${c}" (${types[c]}${
          types[c] === "text" ? `, ${uniques[c]}${uniques[c] > 60 ? "+" : ""} distinct` : ""
        })`,
    ),
    `SAMPLE ROWS (${Math.min(MAX_SAMPLE_ROWS, rows.length)} of ${rows.length}):`,
    ...rows.slice(0, MAX_SAMPLE_ROWS).map((r) => "  " + columns.map((c) => r[c]).join(" | ")),
  ];
  return { digest: lines.join("\n"), columns, types, rowCount: rows.length };
}

/* ── Spec -> Plotly, using every row ───────────────────────── */
const DEFAULT_COLORS = [
  "#E8FF5A", "#FF8A5B", "#6ED4C8", "#B8A6F2",
  "#FF6B8A", "#9BE564", "#7A8C1F", "#3FA9B8",
];

const AGGREGATORS = {
  sum: (xs) => xs.reduce((a, b) => a + b, 0),
  avg: (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0),
  min: (xs) => (xs.length ? Math.min(...xs) : 0),
  max: (xs) => (xs.length ? Math.max(...xs) : 0),
  count: (xs) => xs.length,
};

function applyFilter(rows, filter) {
  if (!filter || !filter.column) return rows;
  const { column, op = "=", value } = filter;
  return rows.filter((r) => {
    const raw = r[column];
    const n = toNumber(raw);
    const v = toNumber(value);
    const bothNumeric = !Number.isNaN(n) && !Number.isNaN(v);
    switch (op) {
      case ">": return bothNumeric && n > v;
      case ">=": return bothNumeric && n >= v;
      case "<": return bothNumeric && n < v;
      case "<=": return bothNumeric && n <= v;
      case "!=": return String(raw) !== String(value);
      case "contains":
        return String(raw).toLowerCase().includes(String(value).toLowerCase());
      default:
        return bothNumeric ? n === v : String(raw) === String(value);
    }
  });
}

/** Turn a validated spec plus the full dataset into { data, layout }. */
export function bindSpec(spec, text) {
  const { columns, rows: allRows, types } = profile(text);
  if (!columns.length) throw new Error("Dataset is empty or unreadable.");

  const s = normaliseSpec(spec, columns, types);
  let rows = applyFilter(allRows, s.filter);

  const catCol = s.x;
  const valCols = s.y;

  /* ── specialised types read dedicated columns straight from the rows ──
     These bypass the category/series aggregation entirely. */
  if (OHLC_TYPES.has(s.chartType)) {
    return bindOHLC(s, rows);
  }
  if (MATRIX_TYPES.has(s.chartType)) {
    return bindMatrix(s, rows);
  }
  if (s.chartType === "scatter3d") {
    return bindScatter3d(s, rows);
  }

  // ── group + aggregate ──
  let categories;
  let series = {}; // seriesName -> Map(category -> number)

  if (s.groupBy && s.groupBy !== catCol) {
    const groups = [...new Set(rows.map((r) => String(r[s.groupBy])))].slice(0, 40);
    const valCol = valCols[0];
    categories = [...new Set(rows.map((r) => String(r[catCol])))];
    for (const g of groups) {
      const m = new Map();
      for (const cat of categories) {
        const bucket = rows
          .filter((r) => String(r[s.groupBy]) === g && String(r[catCol]) === cat)
          .map((r) => toNumber(r[valCol]))
          .filter((n) => !Number.isNaN(n));
        m.set(cat, bucket.length ? AGGREGATORS[s.aggregate](bucket) : 0);
      }
      series[g] = m;
    }
  } else {
    const needsAgg =
      s.aggregate !== "none" &&
      new Set(rows.map((r) => String(r[catCol]))).size < rows.length;

    if (needsAgg) {
      categories = [...new Set(rows.map((r) => String(r[catCol])))];
      for (const vc of valCols) {
        const m = new Map();
        for (const cat of categories) {
          const bucket = rows
            .filter((r) => String(r[catCol]) === cat)
            .map((r) => toNumber(r[vc]))
            .filter((n) => !Number.isNaN(n));
          m.set(cat, bucket.length ? AGGREGATORS[s.aggregate](bucket) : 0);
        }
        series[vc] = m;
      }
    } else {
      categories = rows.map((r) => String(r[catCol]));
      for (const vc of valCols) {
        const m = new Map();
        rows.forEach((r, i) => {
          const n = toNumber(r[vc]);
          m.set(categories[i], Number.isNaN(n) ? 0 : n);
        });
        series[vc] = m;
      }
    }
  }

  // ── sort + limit ──
  const firstSeries = series[Object.keys(series)[0]] || new Map();
  if (s.sort) {
    const dir = s.sort.dir === "asc" ? 1 : -1;
    categories = [...categories].sort((a, b) =>
      s.sort.by === "x"
        ? dir * String(a).localeCompare(String(b), undefined, { numeric: true })
        : dir * ((firstSeries.get(a) ?? 0) - (firstSeries.get(b) ?? 0)),
    );
  }
  if (s.limit && s.limit > 0) categories = categories.slice(0, s.limit);

  // ── traces ──
  const colors = s.colors && s.colors.length ? s.colors : DEFAULT_COLORS;
  const names = Object.keys(series);
  const horizontal = s.orientation === "h";
  const data = [];

  if (s.chartType === "pie" || s.chartType === "donut") {
    const m = series[names[0]] || new Map();
    data.push({
      type: "pie",
      labels: categories,
      values: categories.map((c) => m.get(c) ?? 0),
      marker: { colors: categories.map((_, i) => colors[i % colors.length]) },
      ...(s.chartType === "donut" ? { hole: 0.55 } : {}),
      textinfo: "label+percent",
    });
  } else if (s.chartType === "treemap" || s.chartType === "sunburst") {
    const m = series[names[0]] || new Map();
    data.push({
      type: s.chartType,
      labels: categories,
      parents: categories.map(() => ""),
      values: categories.map((c) => m.get(c) ?? 0),
      marker: { colors: categories.map((_, i) => colors[i % colors.length]) },
      textinfo: "label+value",
    });
  } else if (s.chartType === "funnel") {
    const m = series[names[0]] || new Map();
    data.push({
      type: "funnel",
      y: categories,
      x: categories.map((c) => m.get(c) ?? 0),
      marker: { color: categories.map((_, i) => colors[i % colors.length]) },
    });
  } else if (s.chartType === "waterfall") {
    const m = series[names[0]] || new Map();
    data.push({
      type: "waterfall",
      x: categories,
      y: categories.map((c) => m.get(c) ?? 0),
      connector: { line: { color: "rgba(242,241,236,0.25)" } },
      increasing: { marker: { color: colors[0] } },
      decreasing: { marker: { color: colors[4] || "#FF6B8A" } },
      totals: { marker: { color: colors[2] || "#6ED4C8" } },
    });
  } else if (s.chartType === "radar") {
    for (const [i, n] of names.entries()) {
      const m = series[n];
      data.push({
        type: "scatterpolar",
        name: n,
        theta: [...categories, categories[0]],
        r: [...categories.map((c) => m.get(c) ?? 0), m.get(categories[0]) ?? 0],
        fill: "toself",
        line: { color: colors[i % colors.length] },
      });
    }
  } else if (s.chartType === "violin") {
    for (const [i, n] of names.entries()) {
      const m = series[n];
      data.push({
        type: "violin",
        name: n,
        y: categories.map((c) => m.get(c) ?? 0),
        box: { visible: true },
        meanline: { visible: true },
        line: { color: colors[i % colors.length] },
      });
    }
  } else if (s.chartType === "histogram") {
    for (const [i, n] of names.entries()) {
      const m = series[n];
      data.push({
        type: "histogram",
        name: n,
        [horizontal ? "y" : "x"]: categories.map((c) => m.get(c) ?? 0),
        marker: { color: colors[i % colors.length] },
      });
    }
  } else {
    for (const [i, n] of names.entries()) {
      const m = series[n];
      const values = categories.map((c) => m.get(c) ?? 0);
      const color = colors[i % colors.length];
      const base = {
        name: n,
        x: horizontal ? values : categories,
        y: horizontal ? categories : values,
      };

      if (s.chartType === "line" || s.chartType === "area" || s.chartType === "step") {
        data.push({
          ...base,
          type: "scatter",
          mode: "lines+markers",
          line: { color, width: 2, ...(s.chartType === "step" ? { shape: "hv" } : {}) },
          marker: { color, size: 6 },
          ...(s.chartType === "area" ? { fill: i === 0 ? "tozeroy" : "tonexty" } : {}),
        });
      } else if (s.chartType === "scatter" || s.chartType === "bubble") {
        const sizes =
          s.chartType === "bubble" && s.size
            ? categories.map((c, ci) => {
                const raw = toNumber(rows[ci]?.[s.size]);
                return Number.isNaN(raw) ? 9 : raw;
              })
            : null;
        const maxS = sizes ? Math.max(...sizes, 1) : 1;
        data.push({
          ...base,
          type: "scatter",
          mode: "markers",
          marker: sizes
            ? { color, size: sizes.map((v) => 6 + (v / maxS) * 34), sizemode: "diameter" }
            : { color, size: 9 },
        });
      } else if (s.chartType === "box") {
        data.push({ type: "box", name: n, y: values, marker: { color } });
      } else {
        data.push({
          ...base,
          type: "bar",
          orientation: horizontal ? "h" : "v",
          marker: { color },
        });
      }
    }
  }

  const layout = {
    title: s.title ? { text: s.title } : undefined,
    barmode: s.stacked ? "stack" : "group",
    showlegend: s.showLegend !== false && names.length > 1,
    xaxis: { title: { text: horizontal ? s.yTitle : s.xTitle }, automargin: true },
    yaxis: { title: { text: horizontal ? s.xTitle : s.yTitle }, automargin: true },
  };
  if (["pie", "donut", "treemap", "sunburst", "radar"].includes(s.chartType)) {
    delete layout.xaxis;
    delete layout.yaxis;
    delete layout.barmode;
    layout.showlegend = s.chartType === "radar" ? names.length > 1 : true;
    if (s.chartType === "radar") layout.polar = { radialaxis: { visible: true } };
  }

  return { data, layout };
}


/* ── Financial: candlestick / OHLC ─────────────────────────── */
function bindOHLC(s, rows) {
  const x = rows.map((r) => r[s.x]);
  const num = (col) => rows.map((r) => toNumber(r[col]));
  const up = (s.colors && s.colors[0]) || "#9BE564";
  const down = (s.colors && s.colors[1]) || "#FF6B8A";
  return {
    data: [
      {
        type: s.chartType === "ohlc" ? "ohlc" : "candlestick",
        x,
        open: num(s.open),
        high: num(s.high),
        low: num(s.low),
        close: num(s.close),
        increasing: { line: { color: up } },
        decreasing: { line: { color: down } },
        name: s.title || "Price",
      },
    ],
    layout: {
      title: s.title ? { text: s.title } : undefined,
      showlegend: false,
      xaxis: { title: { text: s.xTitle }, rangeslider: { visible: false }, automargin: true },
      yaxis: { title: { text: s.yTitle }, automargin: true },
    },
  };
}

/* ── Matrix: heatmap / contour / 3D surface ────────────────── */
function bindMatrix(s, rows) {
  const yCol = s.y[0];
  const xs = [...new Set(rows.map((r) => String(r[s.x])))];
  const ys = [...new Set(rows.map((r) => String(r[yCol])))];
  const index = new Map();
  for (const r of rows) {
    index.set(JSON.stringify([r[s.x], r[yCol]]), toNumber(r[s.z]));
  }
  const z = ys.map((yv) =>
    xs.map((xv) => {
      const v = index.get(JSON.stringify([xv, yv]));
      return Number.isNaN(v) || v === undefined ? 0 : v;
    }),
  );
  const scale = [
    [0, "#14150F"], [0.25, "#33451F"], [0.5, "#5E7A2C"],
    [0.75, "#9DBE3C"], [1, "#E8FF5A"],
  ];
  const type = s.chartType === "surface" ? "surface" : s.chartType;
  const trace = { type, z, colorscale: scale, showscale: true };
  if (type !== "surface") {
    trace.x = xs;
    trace.y = ys;
  }
  return {
    data: [trace],
    layout: {
      title: s.title ? { text: s.title } : undefined,
      showlegend: false,
      ...(type === "surface"
        ? { scene: { xaxis: { title: { text: s.xTitle } }, yaxis: { title: { text: yCol } }, zaxis: { title: { text: s.z } } } }
        : {
            xaxis: { title: { text: s.xTitle }, automargin: true },
            yaxis: { title: { text: yCol }, automargin: true },
          }),
    },
  };
}

/* ── 3D scatter ────────────────────────────────────────────── */
function bindScatter3d(s, rows) {
  const yCol = s.y[0];
  return {
    data: [
      {
        type: "scatter3d",
        mode: "markers",
        x: rows.map((r) => toNumber(r[s.x])),
        y: rows.map((r) => toNumber(r[yCol])),
        z: rows.map((r) => toNumber(r[s.z])),
        marker: {
          size: 4,
          color: rows.map((r) => toNumber(r[s.z])),
          colorscale: [[0, "#33451F"], [0.5, "#9DBE3C"], [1, "#E8FF5A"]],
        },
      },
    ],
    layout: {
      title: s.title ? { text: s.title } : undefined,
      showlegend: false,
      scene: {
        xaxis: { title: { text: s.xTitle } },
        yaxis: { title: { text: yCol } },
        zaxis: { title: { text: s.z } },
      },
    },
  };
}

/* ── Spec validation ───────────────────────────────────────── */
const CHART_TYPES = new Set([
  // cartesian
  "bar", "line", "scatter", "area", "step", "bubble",
  // part-to-whole
  "pie", "donut", "funnel", "treemap", "sunburst",
  // distribution
  "histogram", "box", "violin",
  // matrix / surface
  "heatmap", "contour", "surface", "scatter3d",
  // financial
  "candlestick", "ohlc", "waterfall",
  // polar
  "radar",
]);

/* Types whose data comes from dedicated columns rather than the generic
   x/y series machinery. */
const OHLC_TYPES = new Set(["candlestick", "ohlc"]);
const MATRIX_TYPES = new Set(["heatmap", "contour", "surface"]);

/**
 * Force a model-produced spec into something bindable. The model is an
 * unreliable narrator about column names, so every reference is checked
 * against the real header and repaired when it can be.
 */
export function normaliseSpec(spec, columns, types) {
  const s = { ...(spec || {}) };
  const byLower = new Map(columns.map((c) => [c.toLowerCase(), c]));
  const resolve = (name) => {
    if (name == null) return null;
    const exact = columns.find((c) => c === name);
    if (exact) return exact;
    const ci = byLower.get(String(name).toLowerCase().trim());
    if (ci) return ci;
    const loose = columns.find(
      (c) => c.toLowerCase().replace(/[\s_-]/g, "") ===
             String(name).toLowerCase().replace(/[\s_-]/g, ""),
    );
    return loose || null;
  };

  const numericCols = columns.filter((c) => types?.[c] === "number");
  const textCols = columns.filter((c) => types?.[c] !== "number");

  s.chartType = CHART_TYPES.has(s.chartType) ? s.chartType : "bar";

  s.x = resolve(s.x) || textCols[0] || columns[0];

  let y = Array.isArray(s.y) ? s.y : s.y ? [s.y] : [];
  y = y.map(resolve).filter(Boolean).filter((c) => c !== s.x);
  if (!y.length) y = numericCols.filter((c) => c !== s.x).slice(0, 3);
  if (!y.length) y = columns.filter((c) => c !== s.x).slice(0, 1);
  s.y = y;

  s.groupBy = resolve(s.groupBy);
  if (s.groupBy === s.x) s.groupBy = null;

  /* Dedicated columns for the specialised chart types. Resolved the same
     forgiving way as x/y, and auto-detected from common header names when the
     model does not name them. */
  const pick = (given, ...guesses) => {
    const r = resolve(given);
    if (r) return r;
    for (const g of guesses) {
      const hit = columns.find((c) => c.toLowerCase().trim() === g);
      if (hit) return hit;
    }
    return null;
  };
  s.open = pick(s.open, "open", "o");
  s.high = pick(s.high, "high", "h");
  s.low = pick(s.low, "low", "l");
  s.close = pick(s.close, "close", "c", "adj close");
  s.z = resolve(s.z) || null;
  s.size = resolve(s.size) || null;

  /* If a financial type was asked for but the columns are not there, fall
     back to a line rather than refusing — the user still gets a chart. */
  if (OHLC_TYPES.has(s.chartType) && !(s.open && s.high && s.low && s.close)) {
    s.chartType = "line";
  }
  if (MATRIX_TYPES.has(s.chartType) && !s.z) {
    const num = numericCols.filter((c) => c !== s.x && !s.y.includes(c));
    s.z = num[0] || s.y[0] || null;
    if (!s.z) s.chartType = "bar";
  }

  s.aggregate = AGGREGATORS[s.aggregate] ? s.aggregate : "sum";
  s.orientation = s.orientation === "h" ? "h" : "v";
  s.stacked = !!s.stacked;
  s.showLegend = s.showLegend !== false;

  if (s.filter && resolve(s.filter.column)) {
    s.filter = { ...s.filter, column: resolve(s.filter.column) };
  } else s.filter = null;

  if (s.sort && (s.sort.by === "x" || s.sort.by === "y")) {
    s.sort = { by: s.sort.by, dir: s.sort.dir === "asc" ? "asc" : "desc" };
  } else s.sort = null;

  s.limit = Number.isFinite(s.limit) && s.limit > 0 ? Math.floor(s.limit) : null;

  s.title = typeof s.title === "string" ? s.title.slice(0, 120) : "";
  s.xTitle = typeof s.xTitle === "string" ? s.xTitle.slice(0, 60) : s.x;
  s.yTitle = typeof s.yTitle === "string" ? s.yTitle.slice(0, 60) : s.y.join(", ");

  s.colors =
    Array.isArray(s.colors) && s.colors.length
      ? s.colors.filter((c) => typeof c === "string").slice(0, 12)
      : null;

  return s;
}

export { DEFAULT_COLORS, MAX_SAMPLE_ROWS };

/* ── Downsampling, for the freeform path ───────────────────────
   Chart types the binder does not cover still go to the model as raw rows,
   because only the model can emit arbitrary Plotly. Sending 50,000 rows is
   what broke the token budget, so send an evenly spaced sample plus an honest
   note about what was left out. */
export function downsample(text, maxRows = 150) {
  const lines = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.trim());
  if (lines.length <= maxRows + 1) {
    return { text, sampled: false, total: Math.max(0, lines.length - 1) };
  }
  const header = lines[0];
  const body = lines.slice(1);
  const step = body.length / maxRows;
  const picked = [];
  for (let i = 0; i < maxRows; i++) picked.push(body[Math.floor(i * step)]);
  return {
    text: [header, ...picked].join("\n"),
    sampled: true,
    total: body.length,
    kept: picked.length,
  };
}

/** Chart types the binder can render from a spec, with exact data. */
export function isBindable(type) {
  return CHART_TYPES.has(String(type || "").toLowerCase().trim());
}

/* Words naming a chart the binder cannot build. When one appears we hand the
   request to the model rather than forcing it into a bar chart. */
const EXOTIC_HINTS = [
  "sankey", "chord", "parallel", "coordinates", "ternary", "polar", "windrose",
  "gauge", "indicator", "bullet", "mesh", "cone", "streamtube", "isosurface",
  "volume", "ribbon", "spiral", "icicle", "dendrogram", "choropleth", "map",
  "geo", "scattergeo", "mapbox", "network", "timeline", "gantt", "calendar",
  "bump", "slope", "dumbbell", "lollipop", "marimekko", "mekko", "pyramid",
  "tornado", "spider", "wordcloud", "density", "carpet", "splom", "quiver",
  "errorbar", "vector", "sonar", "radial",
];

export function namesUnbindableType(prompt) {
  const t = String(prompt || "").toLowerCase();
  // Word-set membership rather than a built regex: escaping "\b" through a
  // string literal is fragile and silently degrades to a backspace char.
  const words = new Set(t.split(/[^a-z0-9]+/).filter(Boolean));
  return EXOTIC_HINTS.some((w) => words.has(w));
}
