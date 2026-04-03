/**
 * csvPreprocessor.ts
 *
 * Handles real-world messy CSV files: $1,234.56 · 42.3% · 00:02:34 · "paid" · N/A
 */

export type ChartHint =
  | "scatter"
  | "heatmap"
  | "waterfall"
  | "radar"
  | "line"
  | "bar"
  | "pie"
  | "bubble"
  | "multiline"
  | "auto";

// ─── Value cleaner ────────────────────────────────────────────────────────────
// Strips $, commas, %, whitespace and returns a clean number string or NaN
function cleanNumber(v: any): number {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim();
  if (s === "" || s === "-" || s === "N/A" || s === "n/a" || s === "#N/A")
    return NaN;
  // Time strings like 00:02:34 — NOT numeric
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return NaN;
  // Strip $, commas, %, +, spaces
  const cleaned = s.replace(/[$,\s+]/g, "").replace(/%$/, "");
  const n = Number(cleaned);
  return isNaN(n) ? NaN : n;
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────
export function parseCSV(csv: string): Record<string, any>[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  // Handle quoted fields properly
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseLine(line);
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      const raw = vals[i] ?? "";
      const n = cleanNumber(raw);
      // Store cleaned number if parseable, otherwise raw string
      obj[h] = isNaN(n) ? raw : n;
    });
    return obj;
  });
}

// ─── Column classifiers ───────────────────────────────────────────────────────

// A column is "numeric" if most values (≥70%) can be parsed as numbers
function isNumericCol(rows: Record<string, any>[], col: string): boolean {
  if (rows.length === 0) return false;
  const nonEmpty = rows.filter((r) => {
    const v = r[col];
    return v !== "" && v !== null && v !== undefined;
  });
  if (nonEmpty.length === 0) return false;
  const numericCount = nonEmpty.filter(
    (r) => typeof r[col] === "number",
  ).length;
  return numericCount / nonEmpty.length >= 0.7;
}

function isStringCol(rows: Record<string, any>[], col: string): boolean {
  return rows.every((r) => typeof r[col] === "string");
}

function isDateCol(col: string, rows: Record<string, any>[]): boolean {
  const n = col.toLowerCase();
  if (
    /date|month|year|week|day|time|period|quarter|created|updated|timestamp/.test(
      n,
    )
  )
    return true;
  const sample = String(rows[0]?.[col] || "");
  return (
    /^\d{4}[-/]/.test(sample) ||
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(sample) ||
    /^q[1-4]\s?\d{4}/i.test(sample) ||
    /^\d{1,2}\/\d{1,2}\/\d{4}/.test(sample)
  );
}

function isLabelCol(col: string, rows: Record<string, any>[]): boolean {
  const n = col.toLowerCase();
  if (
    /name|label|category|product|country|city|region|item|title|company|brand|group|type|segment|department|page|email|address|ticker|symbol|coin|video|campaign|question|team/.test(
      n,
    )
  )
    return true;
  if (!isNumericCol(rows, col)) {
    const unique = new Set(rows.map((r) => r[col])).size;
    return unique <= rows.length * 0.85;
  }
  return false;
}

function isHeatmapAxisCol(col: string): boolean {
  const n = col.toLowerCase();
  const dayMonthPattern =
    /^(mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|week|wk)/i;
  if (dayMonthPattern.test(n)) return true;
  const isMetric =
    /revenue|expense|profit|cost|sales|income|loss|amount|value|price|rate|score|count|total|avg|mean|sum|percent|pct|growth|margin|views|clicks|spend|impressions|conversions/.test(
      n,
    );
  return !isMetric && n.length <= 15;
}

function hasAllPositiveValues(
  rows: Record<string, any>[],
  col: string,
): boolean {
  return rows
    .filter((r) => typeof r[col] === "number")
    .every((r) => Number(r[col]) >= 0);
}

function hasMixedSignValues(rows: Record<string, any>[], col: string): boolean {
  const vals = rows
    .filter((r) => typeof r[col] === "number")
    .map((r) => Number(r[col]));
  return vals.some((v) => v < 0) && vals.some((v) => v > 0);
}

function isIdCol(col: string, rows: Record<string, any>[]): boolean {
  const lower = col.toLowerCase();
  if (/^(id|_id|uuid|index|key|serial|row_?num|#|no\.)$/.test(lower))
    return true;
  if (lower.endsWith("_id") || lower.endsWith(" id")) return true;
  const vals = rows.map((r) => Number(r[col]));
  const isSeq = vals.every((v, i) => i === 0 || v === vals[i - 1] + 1);
  if (isSeq && vals[0] <= 1) return true;
  return false;
}

function colHasKeyword(col: string, keywords: string[]): boolean {
  const lower = col.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

// ─── Main detection ───────────────────────────────────────────────────────────
export function autoDetectChartHint(csvString: string): ChartHint {
  const rows = parseCSV(csvString);
  if (rows.length < 2) return "auto";

  const cols = Object.keys(rows[0]);
  const numericCols = cols.filter((c) => isNumericCol(rows, c));
  const nonIdNumericCols = numericCols.filter((c) => !isIdCol(c, rows));
  const stringCols = cols.filter((c) => !isNumericCol(rows, c));
  const dateCols = cols.filter((c) => isDateCol(c, rows));

  // ── 1. WATERFALL ────────────────────────────────────────────────────────────
  const typeCol = cols.find((c) => /^(type|measure|direction|kind)$/i.test(c));
  if (typeCol) {
    const typeVals = rows.map((r) => String(r[typeCol]).toLowerCase());
    const wfKeywords = [
      "absolute",
      "relative",
      "total",
      "increase",
      "decrease",
      "start",
      "end",
      "subtotal",
    ];
    if (typeVals.some((v) => wfKeywords.some((k) => v.includes(k))))
      return "waterfall";
  }
  if (
    stringCols.length >= 1 &&
    nonIdNumericCols.length === 1 &&
    hasMixedSignValues(rows, nonIdNumericCols[0]) &&
    rows.length <= 20
  )
    return "waterfall";

  // ── 2. HEATMAP ──────────────────────────────────────────────────────────────
  const restCols = cols.slice(1);
  if (
    dateCols.length === 0 &&
    !isNumericCol(rows, cols[0]) &&
    restCols.length >= 3 &&
    restCols.every((c) => isNumericCol(rows, c)) &&
    restCols.some((c) => isHeatmapAxisCol(c)) &&
    rows.length >= 3
  )
    return "heatmap";

  // ── 3. RADAR ────────────────────────────────────────────────────────────────
  if (
    colHasKeyword(cols[0], [
      "attribute",
      "metric",
      "dimension",
      "skill",
      "criteria",
      "factor",
      "kpi",
      "feature",
    ]) &&
    nonIdNumericCols.length >= 2 &&
    rows.length >= 3 &&
    rows.length <= 15
  )
    return "radar";

  if (
    rows.length >= 3 &&
    rows.length <= 12 &&
    nonIdNumericCols.length >= 2 &&
    nonIdNumericCols.length <= 6 &&
    isStringCol(rows, cols[0]) &&
    dateCols.length === 0 &&
    nonIdNumericCols.every((c) => {
      const vals = rows.map((r) => Number(r[c]));
      return vals.every((v) => v >= 0 && v <= 100);
    })
  )
    return "radar";

  // ── 4. PIE ──────────────────────────────────────────────────────────────────
  // Must have exactly 1 label col + 1 numeric col, small number of rows, no dates
  const labelCols = cols.filter(
    (c) => isLabelCol(c, rows) && !isNumericCol(rows, c),
  );
  if (
    labelCols.length >= 1 &&
    nonIdNumericCols.length === 1 &&
    hasAllPositiveValues(rows, nonIdNumericCols[0]) &&
    rows.length >= 2 &&
    rows.length <= 15 &&
    dateCols.length === 0
  ) {
    const valColName = nonIdNumericCols[0].toLowerCase();
    const vals = rows
      .map((r) => Number(r[nonIdNumericCols[0]]))
      .filter((v) => !isNaN(v));
    const sum = vals.reduce((s, v) => s + v, 0);
    if (
      /share|percent|pct|portion|count|revenue|sales|amount|market|budget|spend|allocation/.test(
        valColName,
      ) ||
      (sum > 80 && sum < 120) // values roughly sum to 100
    )
      return "pie";
  }

  // ── 5. BUBBLE ───────────────────────────────────────────────────────────────
  if (
    nonIdNumericCols.length >= 3 &&
    nonIdNumericCols.some((c) =>
      colHasKeyword(c, [
        "population",
        "size",
        "volume",
        "count",
        "total",
        "radius",
        "weight",
        "employees",
        "users",
        "views",
        "audience",
        "subscribers",
        "headcount",
      ]),
    )
  )
    return "bubble";

  // ── 6. SCATTER ──────────────────────────────────────────────────────────────
  if (
    dateCols.length === 0 &&
    nonIdNumericCols.length === 2 &&
    rows.length >= 8
  )
    return "scatter";
  if (
    dateCols.length === 0 &&
    nonIdNumericCols.length >= 2 &&
    stringCols.length === 1 &&
    rows.length >= 6
  )
    return "scatter";

  // ── 7. MULTI-LINE ───────────────────────────────────────────────────────────
  if (dateCols.length >= 1 && nonIdNumericCols.length >= 2) return "multiline";

  // ── 8. LINE ─────────────────────────────────────────────────────────────────
  if (dateCols.length >= 1 && nonIdNumericCols.length === 1) return "line";
  if (
    rows.length >= 8 &&
    nonIdNumericCols.length === 1 &&
    (isStringCol(rows, cols[0]) || isDateCol(cols[0], rows))
  )
    return "line";

  // ── 9. BAR ──────────────────────────────────────────────────────────────────
  if (
    stringCols.length >= 1 &&
    nonIdNumericCols.length >= 1 &&
    nonIdNumericCols.length <= 5 &&
    rows.length >= 2 &&
    rows.length <= 25
  )
    return "bar";

  return "auto";
}

// ─── Value getter — always returns a clean number ─────────────────────────────
function getNum(row: Record<string, any>, col: string): number {
  const v = row[col];
  if (typeof v === "number") return v;
  return cleanNumber(v);
}

// ─── CSV → Plotly config ──────────────────────────────────────────────────────
export function csvToPlotly(
  csvString: string,
  chartHint: ChartHint,
  title = "Chart",
): { data: any[]; layout: any } {
  const rows = parseCSV(csvString);
  if (!rows.length) return { data: [], layout: { title: { text: title } } };

  const cols = Object.keys(rows[0]);
  const numericCols = cols.filter((c) => isNumericCol(rows, c));
  const nonIdNumericCols = numericCols.filter((c) => !isIdCol(c, rows));
  const stringCols = cols.filter((c) => !isNumericCol(rows, c));
  const dateCols = cols.filter((c) => isDateCol(c, rows));

  const COLORS = [
    "#6366f1",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#f97316",
    "#8b5cf6",
    "#14b8a6",
    "#84cc16",
  ];

  // ── LINE ──────────────────────────────────────────────────────────────────
  if (chartHint === "line") {
    const xCol = dateCols[0] || stringCols[0] || cols[0];
    const yCol = nonIdNumericCols[0];
    return {
      data: [
        {
          type: "scatter",
          mode: "lines+markers",
          x: rows.map((r) => r[xCol]),
          y: rows.map((r) => getNum(r, yCol)),
          name: yCol.replace(/_/g, " "),
          line: { color: COLORS[0], width: 2.5 },
          marker: { size: 6, color: COLORS[0] },
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCol.replace(/_/g, " ") } },
      },
    };
  }

  // ── MULTI-LINE ─────────────────────────────────────────────────────────────
  if (chartHint === "multiline") {
    const xCol = dateCols[0] || stringCols[0] || cols[0];
    const yCols = nonIdNumericCols.filter((c) => c !== xCol).slice(0, 8);
    return {
      data: yCols.map((col, i) => ({
        type: "scatter",
        mode: "lines+markers",
        x: rows.map((r) => r[xCol]),
        y: rows.map((r) => getNum(r, col)),
        name: col.replace(/_/g, " "),
        line: { color: COLORS[i % COLORS.length], width: 2.5 },
        marker: { size: 5, color: COLORS[i % COLORS.length] },
      })),
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCols[0]?.replace(/_/g, " ") } },
      },
    };
  }

  // ── BAR ────────────────────────────────────────────────────────────────────
  if (chartHint === "bar") {
    const xCol =
      cols.find((c) => isLabelCol(c, rows) && !isNumericCol(rows, c)) ||
      dateCols[0] ||
      stringCols[0] ||
      cols[0];
    const yCols = nonIdNumericCols.filter((c) => c !== xCol).slice(0, 5);
    return {
      data: yCols.map((col, i) => ({
        type: "bar",
        x: rows.map((r) => r[xCol]),
        y: rows.map((r) => getNum(r, col)),
        name: col.replace(/_/g, " "),
        marker: { color: COLORS[i % COLORS.length] },
      })),
      layout: {
        title: { text: title },
        barmode: yCols.length > 1 ? "group" : undefined,
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCols[0]?.replace(/_/g, " ") } },
      },
    };
  }

  // ── PIE ────────────────────────────────────────────────────────────────────
  if (chartHint === "pie") {
    const labelCol =
      cols.find((c) => isLabelCol(c, rows) && !isNumericCol(rows, c)) ||
      stringCols[0];
    const valueCol = nonIdNumericCols[0];
    return {
      data: [
        {
          type: "pie",
          labels: rows.map((r) => r[labelCol]),
          values: rows.map((r) => getNum(r, valueCol)),
          marker: { colors: COLORS },
          textinfo: "label+percent",
          hoverinfo: "label+value+percent",
        },
      ],
      layout: { title: { text: title } },
    };
  }

  // ── SCATTER ────────────────────────────────────────────────────────────────
  if (chartHint === "scatter") {
    const xCol = nonIdNumericCols[0];
    const yCol = nonIdNumericCols[1];
    const colorCol = stringCols.find((c) =>
      colHasKeyword(c, [
        "gender",
        "group",
        "category",
        "type",
        "continent",
        "region",
        "class",
        "species",
        "team",
        "segment",
        "department",
        "country",
      ]),
    );
    if (colorCol) {
      const groups = [...new Set(rows.map((r) => r[colorCol]))];
      return {
        data: groups.map((g, i) => {
          const gRows = rows.filter((r) => r[colorCol] === g);
          return {
            type: "scatter",
            mode: "markers",
            name: String(g),
            x: gRows.map((r) => getNum(r, xCol)),
            y: gRows.map((r) => getNum(r, yCol)),
            marker: {
              size: 9,
              color: COLORS[i % COLORS.length],
              opacity: 0.8,
              line: { color: "white", width: 1 },
            },
          };
        }),
        layout: {
          title: { text: title },
          xaxis: { title: { text: xCol } },
          yaxis: { title: { text: yCol } },
        },
      };
    }
    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          x: rows.map((r) => getNum(r, xCol)),
          y: rows.map((r) => getNum(r, yCol)),
          marker: {
            size: 9,
            color: COLORS[0],
            opacity: 0.8,
            line: { color: "white", width: 1 },
          },
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCol } },
      },
    };
  }

  // ── BUBBLE ─────────────────────────────────────────────────────────────────
  if (chartHint === "bubble") {
    const xCol = nonIdNumericCols[0];
    const yCol = nonIdNumericCols[1];
    const sizeCol =
      nonIdNumericCols.find((c) =>
        colHasKeyword(c, [
          "population",
          "size",
          "volume",
          "count",
          "total",
          "radius",
          "weight",
          "employees",
          "users",
          "views",
          "audience",
          "subscribers",
          "headcount",
        ]),
      ) || nonIdNumericCols[2];
    const colorCol = stringCols.find((c) =>
      colHasKeyword(c, [
        "continent",
        "region",
        "category",
        "group",
        "type",
        "country",
        "name",
        "company",
      ]),
    );
    const allSizes = rows.map((r) => Math.abs(getNum(r, sizeCol)) || 0);
    const maxSize = Math.max(...allSizes) || 1;
    const sizeScale = (v: number) => Math.sqrt(Math.abs(v) / maxSize) * 50 + 8;

    if (colorCol) {
      const groups = [...new Set(rows.map((r) => r[colorCol]))];
      return {
        data: groups.map((g, i) => {
          const gRows = rows.filter((r) => r[colorCol] === g);
          return {
            type: "scatter",
            mode: "markers",
            name: String(g),
            x: gRows.map((r) => getNum(r, xCol)),
            y: gRows.map((r) => getNum(r, yCol)),
            marker: {
              size: gRows.map((r) => sizeScale(getNum(r, sizeCol))),
              color: COLORS[i % COLORS.length],
              opacity: 0.75,
              line: { color: "white", width: 1 },
            },
          };
        }),
        layout: {
          title: { text: title },
          xaxis: { title: { text: xCol } },
          yaxis: { title: { text: yCol } },
        },
      };
    }
    // Single series with per-row labels
    const labelCol = stringCols.find((c) => isLabelCol(c, rows));
    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          text: labelCol ? rows.map((r) => String(r[labelCol])) : undefined,
          x: rows.map((r) => getNum(r, xCol)),
          y: rows.map((r) => getNum(r, yCol)),
          marker: {
            size: rows.map((r) => sizeScale(getNum(r, sizeCol))),
            color: rows.map((_, i) => COLORS[i % COLORS.length]),
            opacity: 0.75,
            line: { color: "white", width: 1 },
          },
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: xCol } },
        yaxis: { title: { text: yCol } },
      },
    };
  }

  // ── HEATMAP ────────────────────────────────────────────────────────────────
  if (chartHint === "heatmap") {
    const rowLabelCol = cols[0];
    const valueCols = cols.slice(1).filter((c) => isNumericCol(rows, c));
    const z = rows.map((r) => valueCols.map((c) => getNum(r, c)));
    return {
      data: [
        {
          type: "heatmap",
          z,
          x: valueCols,
          y: rows.map((r) => String(r[rowLabelCol])),
          colorscale: "Viridis",
          showscale: true,
          hoverongaps: false,
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: "" } },
        yaxis: { title: { text: rowLabelCol }, autorange: "reversed" },
      },
    };
  }

  // ── WATERFALL ──────────────────────────────────────────────────────────────
  if (chartHint === "waterfall") {
    const labelCol = stringCols[0] || cols[0];
    const valueCol = nonIdNumericCols[0];
    const typeCol = cols.find((c) =>
      /^(type|measure|direction|kind)$/i.test(c),
    );
    const x = rows.map((r) => String(r[labelCol]));
    const y = rows.map((r) => getNum(r, valueCol));
    const measure = typeCol
      ? rows.map((r) => {
          const t = String(r[typeCol]).toLowerCase();
          if (t.includes("abs") || t.includes("start") || t.includes("begin"))
            return "absolute";
          if (
            t.includes("total") ||
            t.includes("end") ||
            t.includes("final") ||
            t.includes("sum")
          )
            return "total";
          return "relative";
        })
      : y.map((_, i) =>
          i === 0 ? "absolute" : i === y.length - 1 ? "total" : "relative",
        );
    return {
      data: [
        {
          type: "waterfall",
          x,
          y,
          measure,
          connector: {
            line: { color: "rgba(0,0,0,0.15)", width: 1, dash: "dot" },
          },
          increasing: { marker: { color: "#10b981" } },
          decreasing: { marker: { color: "#ef4444" } },
          totals: { marker: { color: "#6366f1" } },
          textposition: "outside",
        },
      ],
      layout: {
        title: { text: title },
        xaxis: { title: { text: labelCol } },
        yaxis: { title: { text: valueCol } },
      },
    };
  }

  // ── RADAR ──────────────────────────────────────────────────────────────────
  if (chartHint === "radar") {
    const attrCol = cols[0];
    const seriesCols = nonIdNumericCols;
    const theta = rows.map((r) => String(r[attrCol]));
    return {
      data: seriesCols.map((col, i) => ({
        type: "scatterpolar",
        r: [...rows.map((r) => getNum(r, col)), getNum(rows[0], col)],
        theta: [...theta, theta[0]],
        fill: "toself",
        name: col.replace(/_/g, " "),
        opacity: 0.75,
        line: { color: COLORS[i % COLORS.length], width: 2 },
        marker: { color: COLORS[i % COLORS.length], size: 5 },
      })),
      layout: {
        title: { text: title },
        polar: { radialaxis: { visible: true, range: [0, 100] } },
      },
    };
  }

  return { data: [], layout: { title: { text: title } } };
}
