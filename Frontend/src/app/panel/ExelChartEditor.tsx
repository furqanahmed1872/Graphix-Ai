"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Plotly from "plotly.js-dist-min";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChartType {
  id: string;
  name: string;
  icon: string;
}
interface History {
  data: string[][];
  timestamp: number;
}
interface Annotation {
  x: string;
  y: number;
  text: string;
  id: string;
}
interface ConditionalRule {
  column: number;
  operator: string;
  value: number;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CHART_TYPES: ChartType[] = [
  { id: "bar", name: "Bar", icon: "▐▌" },
  { id: "line", name: "Line", icon: "╱╲" },
  { id: "scatter", name: "Scatter", icon: "∴∵" },
  { id: "pie", name: "Pie", icon: "◑" },
  { id: "donut", name: "Donut", icon: "◎" },
  { id: "area", name: "Area", icon: "▲" },
  { id: "stacked", name: "Stacked", icon: "▪▪" },
  { id: "histogram", name: "Histogram", icon: "⊟" },
  { id: "box", name: "Box", icon: "⬜" },
  { id: "heatmap", name: "Heatmap", icon: "▥" },
  { id: "bubble", name: "Bubble", icon: "⊙" },
  { id: "radar", name: "Radar", icon: "⬡" },
  { id: "funnel", name: "Funnel", icon: "⊳" },
  { id: "waterfall", name: "Waterfall", icon: "↕" },
  { id: "violin", name: "Violin", icon: "𝄞" },
];

const PALETTES: Record<string, string[]> = {
  neon: [
    "#00f5ff",
    "#bf5fff",
    "#ff006e",
    "#ffbe0b",
    "#00e676",
    "#ff4081",
    "#40c4ff",
    "#69ff47",
  ],
  earth: [
    "#a0522d",
    "#d2691e",
    "#cd853f",
    "#deb887",
    "#f4a460",
    "#8b4513",
    "#bc8a5f",
    "#c19a6b",
  ],
  ocean: [
    "#006994",
    "#0099cc",
    "#00bcd4",
    "#26c6da",
    "#4dd0e1",
    "#80deea",
    "#b2ebf2",
    "#e0f7fa",
  ],
  sunset: [
    "#ff6b35",
    "#f7931e",
    "#ffcd3c",
    "#9bc42c",
    "#00a8c6",
    "#aa3c59",
    "#e36397",
    "#f5a4c7",
  ],
  mono: [
    "#ffffff",
    "#d4d4d4",
    "#a3a3a3",
    "#737373",
    "#525252",
    "#404040",
    "#262626",
    "#171717",
  ],
  candy: [
    "#ff6b9d",
    "#c8a8e9",
    "#a3d9ff",
    "#b8f2e6",
    "#ffd6a5",
    "#ffadad",
    "#caffbf",
    "#fdffb6",
  ],
};

const SAMPLE_DATASETS: Record<string, { title: string; data: string[][] }> = {
  sales: {
    title: "Monthly Sales Performance",
    data: [
      ["Month", "Sales", "Revenue", "Profit", "Expenses"],
      ["Jan", "120", "15000", "3000", "12000"],
      ["Feb", "150", "18000", "3500", "14500"],
      ["Mar", "180", "22000", "4200", "17800"],
      ["Apr", "200", "25000", "5000", "20000"],
      ["May", "170", "21000", "4000", "17000"],
      ["Jun", "220", "27000", "5500", "21500"],
    ],
  },
  climate: {
    title: "Temperature & Rainfall",
    data: [
      ["Month", "Temp(°C)", "Rainfall(mm)", "Humidity(%)"],
      ["Jan", "2", "45", "78"],
      ["Feb", "4", "38", "72"],
      ["Mar", "9", "42", "65"],
      ["Apr", "14", "52", "60"],
      ["May", "18", "61", "58"],
      ["Jun", "23", "55", "55"],
    ],
  },
  market: {
    title: "Stock Comparison",
    data: [
      ["Week", "AAPL", "GOOGL", "MSFT", "AMZN"],
      ["W1", "182", "141", "375", "178"],
      ["W2", "185", "143", "380", "181"],
      ["W3", "179", "138", "371", "177"],
      ["W4", "188", "147", "385", "184"],
      ["W5", "191", "150", "390", "188"],
    ],
  },
};

const FORMULA_FUNCTIONS: Record<string, (nums: number[]) => number> = {
  SUM: (ns) => ns.reduce((a, b) => a + b, 0),
  AVG: (ns) => ns.reduce((a, b) => a + b, 0) / ns.length,
  MAX: (ns) => Math.max(...ns),
  MIN: (ns) => Math.min(...ns),
  COUNT: (ns) => ns.length,
};

// ─── Component ────────────────────────────────────────────────────────────────
const DataChartEditor: React.FC = () => {
  const [data, setData] = useState<string[][]>([
    ["Month", "Sales", "Revenue", "Profit"],
    ["Jan", "120", "15000", "3000"],
    ["Feb", "150", "18000", "3500"],
    ["Mar", "180", "22000", "4200"],
    ["Apr", "200", "25000", "5000"],
    ["May", "170", "21000", "4000"],
  ]);
  const [chartType, setChartType] = useState("bar");
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [leftWidth, setLeftWidth] = useState(48);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<History[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chartTitle, setChartTitle] = useState("Monthly Sales Performance");
  const [palette, setPalette] = useState("neon");
  const [activeTab, setActiveTab] = useState<
    "data" | "style" | "annotations" | "stats"
  >("data");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [searchCell, setSearchCell] = useState("");
  const [conditionalRules, setConditionalRules] = useState<ConditionalRule[]>(
    [],
  );
  const [newRule, setNewRule] = useState<ConditionalRule>({
    column: 1,
    operator: ">",
    value: 0,
    color: "#ff006e",
  });
  const [formulaBar, setFormulaBar] = useState("");
  const [chartSubtype, setChartSubtype] = useState<"grouped" | "stacked">(
    "grouped",
  );
  const [smoothLines, setSmoothLines] = useState(false);
  const [markerSize, setMarkerSize] = useState(8);
  const [opacity, setOpacity] = useState(0.85);
  const [gridLines, setGridLines] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [xAxisLabel, setXAxisLabel] = useState("");
  const [yAxisLabel, setYAxisLabel] = useState("");
  const [logScale, setLogScale] = useState(false);
  const [sortData, setSortData] = useState<"none" | "asc" | "desc">("none");
  const [filterZero, setFilterZero] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    x: "",
    y: "",
    text: "",
  });
  const [flashCell, setFlashCell] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [exportMenu, setExportMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);

  // ── Init history ──────────────────────────────────────────────────────────
  useEffect(() => {
    setHistory([{ data, timestamp: Date.now() }]);
    setHistoryIndex(0);
  }, []);

  // ── Render chart ──────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(renderChart, 80);
    return () => clearTimeout(t);
  }, [
    data,
    chartType,
    palette,
    chartTitle,
    gridLines,
    showLegend,
    xAxisLabel,
    yAxisLabel,
    logScale,
    sortData,
    filterZero,
    smoothLines,
    markerSize,
    opacity,
    chartSubtype,
    annotations,
  ]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "Z"))
      ) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [historyIndex, history]);

  // ── Drag resizer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - r.left) / r.width) * 100;
      if (pct > 25 && pct < 75) setLeftWidth(pct);
    };
    const mu = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", mu);
    }
    return () => {
      document.removeEventListener("mousemove", mm);
      document.removeEventListener("mouseup", mu);
    };
  }, [isDragging]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToHistory = (d: string[][]) => {
    const h = history.slice(0, historyIndex + 1);
    h.push({ data: d, timestamp: Date.now() });
    setHistory(h);
    setHistoryIndex(h.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setData(history[historyIndex - 1].data);
    }
  };
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setData(history[historyIndex + 1].data);
    }
  };

  const colLabel = (i: number) => {
    let l = "";
    let n = i;
    while (n >= 0) {
      l = String.fromCharCode(65 + (n % 26)) + l;
      n = Math.floor(n / 26) - 1;
    }
    return l;
  };

  const handleCellChange = (r: number, c: number, v: string) => {
    const d = data.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? v : cell)),
    );
    setData(d);
    addToHistory(d);
    setFormulaBar(v);
  };

  const evaluateFormula = (expr: string): string => {
    if (!expr.startsWith("=")) return expr;
    const inner = expr.slice(1).toUpperCase();
    const match = inner.match(/^(\w+)\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (!match) return expr;
    const [, fn, c1, r1, c2, r2] = match;
    if (!FORMULA_FUNCTIONS[fn]) return "#ERR";
    const sc = c1.charCodeAt(0) - 65,
      ec = c2.charCodeAt(0) - 65;
    const sr = parseInt(r1) - 1,
      er = parseInt(r2) - 1;
    const nums: number[] = [];
    for (let ri = sr; ri <= er; ri++)
      for (let ci = sc; ci <= ec; ci++) {
        const n = parseFloat(data[ri]?.[ci] ?? "");
        if (!isNaN(n)) nums.push(n);
      }
    if (!nums.length) return "0";
    return String(FORMULA_FUNCTIONS[fn](nums).toFixed(2));
  };

  const commitFormula = () => {
    if (!selectedCell) return;
    const val = evaluateFormula(formulaBar);
    handleCellChange(selectedCell.row, selectedCell.col, val);
    showToast("Formula applied ✓");
  };

  const addRow = () => {
    const d = [...data, Array(data[0].length).fill("")];
    setData(d);
    addToHistory(d);
  };
  const addColumn = () => {
    const d = data.map((r) => [...r, ""]);
    setData(d);
    addToHistory(d);
  };
  const deleteRow = (i: number) => {
    if (data.length <= 2) return;
    const d = data.filter((_, idx) => idx !== i);
    setData(d);
    addToHistory(d);
  };
  const deleteColumn = (i: number) => {
    if (data[0].length <= 2) return;
    const d = data.map((r) => r.filter((_, idx) => idx !== i));
    setData(d);
    addToHistory(d);
  };

  const getCellBg = (ri: number, ci: number): string => {
    const val = parseFloat(data[ri]?.[ci] ?? "");
    if (isNaN(val)) return "transparent";
    for (const rule of conditionalRules) {
      if (ci !== rule.column) continue;
      const pass =
        rule.operator === ">"
          ? val > rule.value
          : rule.operator === "<"
            ? val < rule.value
            : rule.operator === "="
              ? val === rule.value
              : false;
      if (pass) return rule.color + "33";
    }
    return "transparent";
  };

  const computeStats = () => {
    const headers = data[0];
    return headers.slice(1).map((h, hi) => {
      const nums = data
        .slice(1)
        .map((r) => parseFloat(r[hi + 1]))
        .filter((n) => !isNaN(n));
      if (!nums.length)
        return { name: h, sum: 0, avg: 0, min: 0, max: 0, count: 0 };
      return {
        name: h,
        sum: nums.reduce((a, b) => a + b, 0),
        avg: nums.reduce((a, b) => a + b, 0) / nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
        count: nums.length,
      };
    });
  };

  const handleSave = () => {
    const blob = new Blob(
      [JSON.stringify({ data, chartType, chartTitle, palette }, null, 2)],
      { type: "application/json" },
    );
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `chart-${Date.now()}.json`,
    });
    a.click();
    showToast("Saved as JSON ✓");
  };
  const handleExportPNG = () => {
    const el = document.getElementById("chart-container");
    if (el)
      Plotly.downloadImage(el, {
        format: "png",
        width: 1920,
        height: 1080,
        filename: chartTitle || "chart",
      });
  };
  const handleExportSVG = () => {
    const el = document.getElementById("chart-container");
    if (el)
      Plotly.downloadImage(el, {
        format: "svg",
        width: 1920,
        height: 1080,
        filename: chartTitle || "chart",
      });
  };
  const handleExportCSV = () => {
    const csv = data.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `data-${Date.now()}.csv`,
    });
    a.click();
    showToast("CSV exported ✓");
  };
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = text
        .split("\n")
        .map((r) => r.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
      const filtered = parsed.filter((r) => r.some((c) => c));
      setData(filtered);
      addToHistory(filtered);
      showToast("CSV imported ✓");
    };
    reader.readAsText(f);
  };
  const loadSample = (key: string) => {
    const s = SAMPLE_DATASETS[key];
    setData(s.data);
    setChartTitle(s.title);
    addToHistory(s.data);
    showToast(`Loaded: ${s.title}`);
  };

  const transposeData = () => {
    const t: string[][] = data[0].map((_, ci) => data.map((r) => r[ci]));
    setData(t);
    addToHistory(t);
    showToast("Data transposed ✓");
  };

  const sortDataBy = (col: number) => {
    const header = data[0];
    const rows = data
      .slice(1)
      .sort((a, b) => parseFloat(a[col] || "0") - parseFloat(b[col] || "0"));
    const d = [header, ...rows];
    setData(d);
    addToHistory(d);
    showToast(`Sorted by ${header[col]}`);
  };

  const searchHighlight = (ri: number, ci: number) => {
    if (!searchCell) return false;
    return data[ri][ci].toLowerCase().includes(searchCell.toLowerCase());
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderChart = () => {
    const chartEl = document.getElementById("chart-container");
    if (!chartEl) return;

    const headers = data[0].filter((h) => h.trim());
    const rawRows = data.slice(1).filter((r) => r.some((c) => c.trim()));

    let rows = rawRows;
    if (filterZero)
      rows = rows.filter((r) => r.slice(1).some((v) => parseFloat(v) !== 0));
    if (sortData === "asc")
      rows = [...rows].sort(
        (a, b) => parseFloat(a[1] || "0") - parseFloat(b[1] || "0"),
      );
    if (sortData === "desc")
      rows = [...rows].sort(
        (a, b) => parseFloat(b[1] || "0") - parseFloat(a[1] || "0"),
      );

    if (!rows.length || !headers.length) {
      Plotly.purge(chartEl);
      return;
    }

    const colors = PALETTES[palette] || PALETTES.neon;
    const bg = "#111111";
    const gridC = "#222222";
    const textC = "#888888";
    const xVals = rows.map((r) => r[0]);

    const layout: Partial<Plotly.Layout> = {
      title: chartTitle
        ? {
            text: chartTitle,
            font: {
              color: "#e2e8f0",
              size: 15,
              family: "'DM Mono', monospace",
            },
            x: 0.5,
          }
        : undefined,
      paper_bgcolor: bg,
      plot_bgcolor: bg,
      font: { family: "'DM Mono', monospace", color: textC, size: 11 },
      margin: {
        t: chartTitle ? 50 : 20,
        r: 20,
        b: 50,
        l: yAxisLabel ? 70 : 55,
      },
      autosize: true,
      xaxis: {
       title: xAxisLabel ? { text: xAxisLabel } : undefined,

        gridcolor: gridLines ? gridC : "transparent",
        zerolinecolor: gridC,
        linecolor: "#252525",
        tickfont: { color: textC },
        type: "category",
        showgrid: gridLines,
        tickcolor: "#252525",
      },
      yaxis: {
        title: yAxisLabel ? { text: yAxisLabel } : undefined,
        gridcolor: gridLines ? gridC : "transparent",
        zerolinecolor: gridC,
        linecolor: "#252525",
        tickfont: { color: textC },
        showgrid: gridLines,
        type: logScale ? "log" : "linear",
        tickcolor: "#252525",
      },
      showlegend: showLegend,
      legend: {
        font: { color: textC, size: 10 },
        bgcolor: "rgba(0,0,0,0.3)",
        bordercolor: "#252525",
        borderwidth: 1,
        orientation: "h",
        y: -0.22,
        x: 0.5,
        xanchor: "center",
      },
      hoverlabel: {
        bgcolor: "#0d0d1f",
        bordercolor: colors[0],
        font: { color: "#fff", size: 11 },
      },
      annotations: annotations.map((a) => ({
        x: a.x,
        y: a.y,
        text: a.text,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: colors[0],
        font: { color: "#fff", size: 10 },
        bgcolor: "rgba(0,0,0,0.7)",
        bordercolor: colors[0],
        borderwidth: 1,
      })),
    };

    let traces: Partial<Plotly.PlotData>[] = [];

    const numericSeries = (idx: number) =>
      rows.map((r) => {
        const v = parseFloat(r[idx + 1]);
        return isNaN(v) ? 0 : v;
      });

    switch (chartType) {
      case "bar":
        traces = headers.slice(1).map((h, i) => ({
          x: xVals,
          y: numericSeries(i),
          type: "bar",
          name: h,
          marker: { color: colors[i % colors.length], opacity },
          barmode: chartSubtype,
        }));
        (layout as any).barmode =
          chartSubtype === "stacked" ? "stack" : "group";
        break;

      case "stacked":
        traces = headers.slice(1).map((h, i) => ({
          x: xVals,
          y: numericSeries(i),
          type: "bar",
          name: h,
          marker: { color: colors[i % colors.length], opacity },
        }));
        (layout as any).barmode = "stack";
        break;

      case "line":
        traces = headers.slice(1).map((h, i) => ({
          x: xVals,
          y: numericSeries(i),
          type: "scatter",
          mode: "lines+markers",
          name: h,
          line: {
            color: colors[i % colors.length],
            width: 2.5,
            shape: smoothLines ? "spline" : "linear",
            smoothing: 1.3,
          },
          marker: { size: markerSize, color: colors[i % colors.length] },
        }));
        break;

      case "scatter":
        traces = headers.slice(1).map((h, i) => ({
          x: xVals,
          y: numericSeries(i),
          type: "scatter",
          mode: "markers",
          name: h,
          marker: {
            color: colors[i % colors.length],
            size: markerSize + 4,
            opacity,
            symbol: "circle",
          },
        }));
        break;

      case "pie":
        traces = [
          {
            labels: xVals,
            values: numericSeries(0),
            type: "pie",
            hole: 0,
            marker: { colors, line: { color: bg, width: 2 } },
            textfont: { color: "#fff", size: 11 },
            hoverinfo: "label+percent+value" as any,
          },
        ];
        break;

      case "donut":
        traces = [
          {
            labels: xVals,
            values: numericSeries(0),
            type: "pie",
            hole: 0.55,
            marker: { colors, line: { color: bg, width: 2 } },
            textfont: { color: "#fff", size: 11 },
            hoverinfo: "label+percent+value" as any,
          },
        ];
        break;

      case "area":
        traces = headers.slice(1).map((h, i) => ({
          x: xVals,
          y: numericSeries(i),
          type: "scatter",
          mode: "lines",
          fill: i === 0 ? "tozeroy" : "tonexty",
          name: h,
          line: {
            color: colors[i % colors.length],
            width: 2,
            shape: smoothLines ? "spline" : "linear",
          },
          fillcolor: colors[i % colors.length] + "44",
        }));
        break;

      case "histogram":
        traces = headers.slice(1).map((h, i) => ({
          x: numericSeries(i),
          type: "histogram",
          name: h,
          marker: { color: colors[i % colors.length], opacity },
          opacity: 0.8,
        }));
        layout.barmode = "overlay" as any;
        break;

      case "box":
        traces = headers.slice(1).map((h, i) => ({
          y: numericSeries(i),
          type: "box",
          name: h,
          marker: { color: colors[i % colors.length] },
          line: { color: colors[i % colors.length], width: 1.5 },
          fillcolor: colors[i % colors.length] + "44",
          boxpoints: "outliers",
        }));
        break;

      case "violin":
        traces = headers.slice(1).map((h, i) => ({
          y: numericSeries(i),
          type: "violin",
          name: h,
          fillcolor: colors[i % colors.length] + "55",
          line: { color: colors[i % colors.length], width: 1.5 },
          meanline: { visible: true, color: "#fff" },
        }));
        break;

      case "heatmap":
        traces = [
          {
            z: rows.map((r) =>
              r.slice(1).map((c) => {
                const v = parseFloat(c);
                return isNaN(v) ? 0 : v;
              }),
            ),
            x: headers.slice(1),
            y: xVals,
            type: "heatmap",
            colorscale: [
              [0, bg],
              [0.25, "#222222"],
              [0.5, colors[0]],
              [0.75, colors[1]],
              [1, colors[2]],
            ],
            colorbar: { tickfont: { color: textC } },
          },
        ];
        break;

      case "bubble":
        traces = headers.slice(1).map((h, i) => ({
          x: xVals,
          y: numericSeries(i),
          mode: "markers",
          name: h,
          type: "scatter",
          marker: {
            size: numericSeries(i).map((v) => Math.max(8, Math.abs(v) / 8)),
            color: colors[i % colors.length],
            opacity: opacity * 0.8,
            line: { color: colors[i % colors.length], width: 1 },
            sizemode: "area",
          },
        }));
        break;

      case "radar":
        traces = headers.slice(1).map((h, i) => ({
          type: "scatterpolar",
          r: numericSeries(i),
          theta: xVals,
          fill: "toself",
          name: h,
          line: { color: colors[i % colors.length], width: 2 },
          fillcolor: colors[i % colors.length] + "30",
          marker: { color: colors[i % colors.length], size: 5 },
        }));
        layout.polar = {
          bgcolor: bg,
          radialaxis: {
            gridcolor: gridC,
            color: textC,
            tickfont: { color: textC },
          },
          angularaxis: {
            gridcolor: gridC,
            color: textC,
            tickfont: { color: textC },
          },
        };
        break;

      case "funnel":
        traces = [
          {
            type: "funnel",
            y: xVals,
            x: numericSeries(0),
            marker: { color: colors.slice(0, xVals.length) },
            textfont: { color: "#fff" },
          },
        ];
        break;

      case "waterfall":
        traces = [
          {
            type: "waterfall",
            x: xVals,
            y: numericSeries(0),
            name: headers[1] || "Value",
            connector: { line: { color: "#333333" } },
            increasing: { marker: { color: colors[3] } },
            decreasing: { marker: { color: colors[4] } },
            totals: { marker: { color: colors[0] } },
            textfont: { color: "#fff" },
          } as any,
        ];
        break;
    }

    Plotly.react(chartEl, traces, layout, {
      responsive: true,
      displayModeBar: false,
    });
  };

  const stats = computeStats();

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#f0f0f0",
        fontFamily: "'DM Mono', monospace",
        fontSize: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        * { box-sizing: border-box; }
        .left-panel ::-webkit-scrollbar { width:5px; height:5px; }
        .left-panel ::-webkit-scrollbar-track { background:#f4f4f4; }
        .left-panel ::-webkit-scrollbar-thumb { background:#d4d4d4; border-radius:3px; }
        .left-panel ::-webkit-scrollbar-thumb:hover { background:#b8b8b8; }
        .right-panel ::-webkit-scrollbar { width:5px; height:5px; }
        .chart-type-bar::-webkit-scrollbar { display:none; }
        .chart-type-bar { scrollbar-width:none; -ms-overflow-style:none; }
        .right-panel ::-webkit-scrollbar-track { background:#181818; }
        .right-panel ::-webkit-scrollbar-thumb { background:#2e2e2e; border-radius:3px; }
        .right-panel ::-webkit-scrollbar-thumb:hover { background:#404040; }
        .cell-input { transition: background 0.12s; }
        .cell-input:focus { outline:none; }
        .chart-btn { transition: all 0.13s cubic-bezier(.4,0,.2,1); }
        .chart-btn:hover { background:#2a2a2a !important; color:#fff !important; }
        .chart-btn.active { box-shadow: inset 0 0 0 1px #ffffff30; }
        .tab-btn { transition: all 0.13s; border-bottom: 2px solid transparent; }
        .tab-btn.active { border-bottom-color: #1a1a1a; color:#1a1a1a !important; }
        .lbtn:hover { background:#ebebeb !important; }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:none; } }
        .toast { animation: fadeSlideIn 0.18s ease; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .flash { animation: pulse 0.4s ease 2; }
        input[type=range] { accent-color: #333; }
        input[type=checkbox] { accent-color: #333; }
      `}</style>

      {/* ── Top Bar (light) ── */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e2e2",
          padding: "0 16px",
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#1a1a1a",
              fontWeight: 500,
            }}
          >
            ◈ CHARTLAB
          </span>
          <div style={{ width: 1, height: 20, background: "#e0e0e0" }} />
          <input
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            placeholder="Untitled Chart"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#1a1a1a",
              fontSize: 13,
              fontFamily: "inherit",
              width: 220,
              fontWeight: 500,
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            ["↶", "Undo", handleUndo, historyIndex <= 0],
            ["↷", "Redo", handleRedo, historyIndex >= history.length - 1],
          ].map(([ic, tt, fn, dis]) => (
            <button
              key={tt as string}
              onClick={fn as () => void}
              disabled={dis as boolean}
              title={tt as string}
              className="lbtn"
              style={{
                background: "#f5f5f5",
                border: "1px solid #ddd",
                color: dis ? "#ccc" : "#555",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: dis ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontSize: 14,
              }}
            >
              {ic as string}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: "#e0e0e0" }} />
          <select
            onChange={(e) => {
              if (e.target.value) loadSample(e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
            style={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              color: "#555",
              borderRadius: 6,
              padding: "4px 10px",
              fontFamily: "inherit",
              fontSize: 11,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="" disabled>
              Load Sample ▾
            </option>
            {Object.entries(SAMPLE_DATASETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="lbtn"
            style={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              color: "#555",
              borderRadius: 6,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
            }}
          >
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{ display: "none" }}
          />
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setExportMenu((v) => !v)}
              className="lbtn"
              style={{
                background: "#f5f5f5",
                border: "1px solid #ddd",
                color: "#555",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
              }}
            >
              Export ▾
            </button>
            {exportMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 32,
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  zIndex: 100,
                  minWidth: 130,
                  padding: 4,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                }}
              >
                {[
                  ["PNG", handleExportPNG],
                  ["SVG", handleExportSVG],
                  ["CSV", handleExportCSV],
                  ["JSON", handleSave],
                ].map(([l, fn]) => (
                  <button
                    key={l as string}
                    onClick={() => {
                      (fn as () => void)();
                      setExportMenu(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "7px 14px",
                      background: "transparent",
                      border: "none",
                      color: "#444",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 11,
                      borderRadius: 5,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    ↓ {l as string}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            style={{
              background: "#1a1a1a",
              border: "1px solid #1a1a1a",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 16px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            ⊕ Save
          </button>
        </div>
      </div>

      {/* ── Formula Bar (light) ── */}
      <div
        style={{
          background: "#fafafa",
          borderBottom: "1px solid #e2e2e2",
          padding: "4px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 34,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "#aaa",
            fontSize: 10,
            letterSpacing: "0.1em",
            minWidth: 28,
          }}
        >
          {selectedCell
            ? `${colLabel(selectedCell.col)}${selectedCell.row + 1}`
            : "—"}
        </span>
        <div style={{ width: 1, height: 16, background: "#e0e0e0" }} />
        <span style={{ color: "#aaa", fontSize: 11 }}>ƒx</span>
        <input
          ref={formulaInputRef}
          value={formulaBar}
          onChange={(e) => setFormulaBar(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitFormula();
          }}
          placeholder="Select a cell or type a formula: =SUM(B1:B6)"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#1a1a1a",
            fontFamily: "inherit",
            fontSize: 11,
          }}
        />
        {formulaBar.startsWith("=") && (
          <button
            onClick={commitFormula}
            style={{
              background: "#1a1a1a",
              border: "1px solid #1a1a1a",
              color: "#fff",
              borderRadius: 4,
              padding: "2px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 10,
            }}
          >
            Apply
          </button>
        )}
        <div style={{ width: 1, height: 16, background: "#e0e0e0" }} />
        <input
          id="search-input"
          value={searchCell}
          onChange={(e) => setSearchCell(e.target.value)}
          placeholder="⌕ Search cells"
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 5,
            padding: "2px 10px",
            color: "#555",
            fontFamily: "inherit",
            fontSize: 11,
            outline: "none",
            width: 160,
          }}
        />
      </div>

      {/* ── Main ── */}
      <div
        ref={containerRef}
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        {/* ── Left: Spreadsheet (LIGHT) ── */}
        <div
          className="left-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            width: `${leftWidth}%`,
            borderRight: "1px solid #e0e0e0",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              background: "#fafafa",
              borderBottom: "1px solid #e8e8e8",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: 38,
              flexShrink: 0,
            }}
          >
            {(["data", "style", "annotations", "stats"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: activeTab === tab ? "#1a1a1a" : "#999",
                  padding: "0 12px",
                  height: "100%",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ color: "#bbb", fontSize: 10 }}>
              {data.length - 1}r × {data[0].length}c
            </span>
          </div>

          {/* ── DATA TAB ── */}
          {activeTab === "data" && (
            <>
              <div
                style={{
                  background: "#fafafa",
                  borderBottom: "1px solid #ebebeb",
                  padding: "5px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {[
                  ["+ Row", addRow],
                  ["+ Col", addColumn],
                  ["⇄ Transpose", transposeData],
                ].map(([l, fn]) => (
                  <button
                    key={l as string}
                    onClick={fn as () => void}
                    className="lbtn"
                    style={{
                      background: "#fff",
                      border: "1px solid #ddd",
                      color: "#555",
                      borderRadius: 5,
                      padding: "3px 10px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 10,
                    }}
                  >
                    {l as string}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <span style={{ color: "#bbb", fontSize: 10 }}>Sort:</span>
                <select
                  value={sortData}
                  onChange={(e) => setSortData(e.target.value as any)}
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    color: "#555",
                    borderRadius: 5,
                    padding: "3px 8px",
                    fontFamily: "inherit",
                    fontSize: 10,
                    outline: "none",
                  }}
                >
                  <option value="none">None</option>
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#888",
                    fontSize: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filterZero}
                    onChange={(e) => setFilterZero(e.target.checked)}
                  />{" "}
                  Hide zeros
                </label>
              </div>

              <div style={{ flex: 1, overflow: "auto" }}>
                <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          position: "sticky",
                          top: 0,
                          left: 0,
                          zIndex: 20,
                          width: 40,
                          height: 24,
                          background: "#f4f4f4",
                          borderRight: "1px solid #e4e4e4",
                          borderBottom: "1px solid #e4e4e4",
                        }}
                      />
                      {data[0].map((_, ci) => (
                        <th
                          key={ci}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            minWidth: 110,
                            background: "#f4f4f4",
                            borderRight: "1px solid #e4e4e4",
                            borderBottom: "1px solid #e4e4e4",
                            color: "#aaa",
                            fontWeight: 500,
                            padding: "0 8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ fontSize: 10 }}>{colLabel(ci)}</span>
                            <div style={{ display: "flex", gap: 2 }}>
                              <button
                                onClick={() => sortDataBy(ci)}
                                title="Sort"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ccc",
                                  cursor: "pointer",
                                  fontSize: 9,
                                  padding: "0 1px",
                                }}
                              >
                                ↕
                              </button>
                              <button
                                onClick={() => deleteColumn(ci)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ccc",
                                  cursor: "pointer",
                                  fontSize: 9,
                                  padding: "0 1px",
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, ri) => (
                      <tr key={ri}>
                        <td
                          style={{
                            position: "sticky",
                            left: 0,
                            zIndex: 5,
                            width: 40,
                            height: 27,
                            background: "#f7f7f7",
                            borderRight: "1px solid #e8e8e8",
                            borderBottom: "1px solid #f0f0f0",
                            textAlign: "center",
                            color: "#bbb",
                            fontSize: 10,
                            fontWeight: 500,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingRight: 2,
                              paddingLeft: 4,
                            }}
                          >
                            <span>{ri + 1}</span>
                            <button
                              onClick={() => deleteRow(ri)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ddd",
                                cursor: "pointer",
                                fontSize: 9,
                                padding: 0,
                                lineHeight: 1,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                        {row.map((cell, ci) => {
                          const isSelected =
                            selectedCell?.row === ri &&
                            selectedCell?.col === ci;
                          const isHighlighted = searchHighlight(ri, ci);
                          const cellBg = getCellBg(ri, ci);
                          return (
                            <td
                              key={ci}
                              style={{
                                borderRight: "1px solid #efefef",
                                borderBottom: "1px solid #f4f4f4",
                                padding: 0,
                                background: isHighlighted ? "#fff3cd" : cellBg,
                                outline: isSelected
                                  ? "2px solid #1a1a1a"
                                  : "none",
                                outlineOffset: "-2px",
                              }}
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) =>
                                  handleCellChange(ri, ci, e.target.value)
                                }
                                onFocus={() => {
                                  setSelectedCell({ row: ri, col: ci });
                                  setFormulaBar(cell);
                                }}
                                onBlur={() => setSelectedCell(null)}
                                className="cell-input"
                                placeholder={
                                  ri === 0
                                    ? ci === 0
                                      ? "Category"
                                      : `Header ${ci}`
                                    : ci === 0
                                      ? "Label"
                                      : "Value"
                                }
                                style={{
                                  width: "100%",
                                  minWidth: 110,
                                  height: 27,
                                  padding: "0 8px",
                                  background: "transparent",
                                  border: "none",
                                  outline: "none",
                                  color: ri === 0 ? "#1a1a1a" : "#444",
                                  fontFamily: "inherit",
                                  fontSize: 11,
                                  fontWeight: ri === 0 ? 600 : 400,
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── STYLE TAB ── */}
          {activeTab === "style" && (
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <LSection title="Color Palette">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(PALETTES).map(([key, colors]) => (
                    <button
                      key={key}
                      onClick={() => setPalette(key)}
                      style={{
                        background: palette === key ? "#f0f0f0" : "#fff",
                        border: `1px solid ${palette === key ? "#1a1a1a" : "#ddd"}`,
                        borderRadius: 8,
                        padding: "6px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div style={{ display: "flex", gap: 2 }}>
                        {colors.slice(0, 5).map((c, i) => (
                          <div
                            key={i}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background: c,
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          color: palette === key ? "#1a1a1a" : "#888",
                          fontSize: 10,
                        }}
                      >
                        {key}
                      </span>
                    </button>
                  ))}
                </div>
              </LSection>

              <LSection title="Chart Options">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <LToggle
                    label="Grid Lines"
                    value={gridLines}
                    onChange={setGridLines}
                  />
                  <LToggle
                    label="Legend"
                    value={showLegend}
                    onChange={setShowLegend}
                  />
                  <LToggle
                    label="Smooth Lines"
                    value={smoothLines}
                    onChange={setSmoothLines}
                  />
                  <LToggle
                    label="Log Scale"
                    value={logScale}
                    onChange={setLogScale}
                  />
                </div>
              </LSection>

              <LSection title="Bar Subtype">
                <div style={{ display: "flex", gap: 8 }}>
                  {["grouped", "stacked"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setChartSubtype(st as any)}
                      style={{
                        background: chartSubtype === st ? "#1a1a1a" : "#fff",
                        border: `1px solid ${chartSubtype === st ? "#1a1a1a" : "#ddd"}`,
                        color: chartSubtype === st ? "#fff" : "#666",
                        borderRadius: 6,
                        padding: "4px 14px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 11,
                        textTransform: "capitalize",
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </LSection>

              <LSection title="Marker Size">
                <LSlider
                  label=""
                  value={markerSize}
                  min={4}
                  max={20}
                  onChange={setMarkerSize}
                />
              </LSection>

              <LSection title="Opacity">
                <LSlider
                  label=""
                  value={opacity}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onChange={setOpacity}
                />
              </LSection>

              <LSection title="Axis Labels">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <LInput
                    label="X Axis"
                    value={xAxisLabel}
                    onChange={setXAxisLabel}
                  />
                  <LInput
                    label="Y Axis"
                    value={yAxisLabel}
                    onChange={setYAxisLabel}
                  />
                </div>
              </LSection>

              <LSection title="Conditional Formatting">
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    value={newRule.column}
                    onChange={(e) =>
                      setNewRule((r) => ({
                        ...r,
                        column: parseInt(e.target.value),
                      }))
                    }
                    style={lSelectStyle}
                  >
                    {data[0].slice(1).map((h, i) => (
                      <option key={i} value={i + 1}>
                        {h || `Col ${i + 2}`}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newRule.operator}
                    onChange={(e) =>
                      setNewRule((r) => ({ ...r, operator: e.target.value }))
                    }
                    style={lSelectStyle}
                  >
                    {[">", "<", "="].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newRule.value}
                    onChange={(e) =>
                      setNewRule((r) => ({
                        ...r,
                        value: parseFloat(e.target.value),
                      }))
                    }
                    style={{ ...lInputStyle, width: 70 }}
                  />
                  <input
                    type="color"
                    value={newRule.color}
                    onChange={(e) =>
                      setNewRule((r) => ({ ...r, color: e.target.value }))
                    }
                    style={{
                      width: 32,
                      height: 28,
                      border: "1px solid #ddd",
                      borderRadius: 5,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  />
                  <button
                    onClick={() => {
                      setConditionalRules((rs) => [
                        ...rs,
                        { ...newRule, id: Date.now().toString() },
                      ]);
                      showToast("Rule added ✓");
                    }}
                    style={{
                      ...lBtnStyle,
                      background: "#1a1a1a",
                      borderColor: "#1a1a1a",
                      color: "#fff",
                    }}
                  >
                    + Add
                  </button>
                </div>
                {conditionalRules.map((rule, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                      padding: "4px 8px",
                      background: "#fafafa",
                      borderRadius: 5,
                      border: "1px solid #ebebeb",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: rule.color,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 10, color: "#666" }}>
                      Col {rule.column} {rule.operator} {rule.value}
                    </span>
                    <button
                      onClick={() =>
                        setConditionalRules((rs) =>
                          rs.filter((_, ri) => ri !== i),
                        )
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e53e3e",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </LSection>
            </div>
          )}

          {/* ── ANNOTATIONS TAB ── */}
          {activeTab === "annotations" && (
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <LSection title="Add Annotation">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <LInput
                    label="X (category)"
                    value={newAnnotation.x}
                    onChange={(v) => setNewAnnotation((a) => ({ ...a, x: v }))}
                  />
                  <LInput
                    label="Y (value)"
                    value={newAnnotation.y}
                    onChange={(v) => setNewAnnotation((a) => ({ ...a, y: v }))}
                  />
                  <LInput
                    label="Label text"
                    value={newAnnotation.text}
                    onChange={(v) =>
                      setNewAnnotation((a) => ({ ...a, text: v }))
                    }
                  />
                  <button
                    onClick={() => {
                      if (!newAnnotation.x || !newAnnotation.text) return;
                      setAnnotations((as) => [
                        ...as,
                        {
                          ...newAnnotation,
                          y: parseFloat(newAnnotation.y) || 0,
                          id: Date.now().toString(),
                        },
                      ]);
                      setNewAnnotation({ x: "", y: "", text: "" });
                      showToast("Annotation added ✓");
                    }}
                    style={{
                      ...lBtnStyle,
                      background: "#1a1a1a",
                      borderColor: "#1a1a1a",
                      color: "#fff",
                    }}
                  >
                    + Add Annotation
                  </button>
                </div>
              </LSection>
              <LSection title="Active Annotations">
                {annotations.length === 0 && (
                  <p style={{ color: "#bbb", fontSize: 11 }}>
                    No annotations yet.
                  </p>
                )}
                {annotations.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                      padding: "6px 10px",
                      background: "#fafafa",
                      borderRadius: 6,
                      border: "1px solid #ebebeb",
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 10, color: "#555" }}>
                      "{a.text}" @ {a.x}, {a.y}
                    </span>
                    <button
                      onClick={() =>
                        setAnnotations((as) => as.filter((x) => x.id !== a.id))
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e53e3e",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </LSection>
            </div>
          )}

          {/* ── STATS TAB ── */}
          {activeTab === "stats" && (
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <LSection title="Column Statistics">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Column", "Sum", "Avg", "Min", "Max", "Count"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                padding: "4px 10px",
                                borderBottom: "1px solid #ebebeb",
                                color: "#aaa",
                                fontSize: 10,
                                textAlign: "right",
                                fontWeight: 500,
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((s, i) => (
                        <tr key={i}>
                          {[
                            s.name,
                            s.sum.toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            }),
                            s.avg.toFixed(1),
                            s.min,
                            s.max,
                            s.count,
                          ].map((v, vi) => (
                            <td
                              key={vi}
                              style={{
                                padding: "5px 10px",
                                borderBottom: "1px solid #f5f5f5",
                                color: vi === 0 ? "#1a1a1a" : "#666",
                                fontSize: 11,
                                textAlign: "right",
                                fontWeight: vi === 0 ? 600 : 400,
                              }}
                            >
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </LSection>

              <LSection title="Quick Insights">
                {stats.map((s, i) => {
                  const pct = (((s.max - s.min) / (s.avg || 1)) * 100).toFixed(
                    0,
                  );
                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: 8,
                        padding: "8px 12px",
                        background: "#fafafa",
                        borderRadius: 6,
                        border: "1px solid #ebebeb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            color: "#1a1a1a",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {s.name}
                        </span>
                        <span style={{ color: "#bbb", fontSize: 10 }}>
                          range ±{pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: "#ebebeb",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, (s.avg / s.max) * 100)}%`,
                            background: PALETTES[palette][i % 8],
                            borderRadius: 2,
                            transition: "width 0.5s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </LSection>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div
          onMouseDown={() => setIsDragging(true)}
          style={{
            width: 4,
            background: isDragging ? "#555" : "#e0e0e0",
            cursor: "col-resize",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        />

        {/* ── Right: Chart Panel (DARK NEUTRAL) ── */}
        <div
          className="right-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
            background: "#111111",
          }}
        >
          {/* Chart type selector */}
          <div
            style={{
              background: "#171717",
              borderBottom: "1px solid #222",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              overflowX: "auto",
              flexShrink: 0,
              height: 46,
            }}
            className="chart-type-bar"
          >
            {CHART_TYPES.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setChartType(ct.id)}
                className={`chart-btn ${chartType === ct.id ? "active" : ""}`}
                style={{
                  background: chartType === ct.id ? "#2a2a2a" : "transparent",
                  border: `1px solid ${chartType === ct.id ? "#404040" : "#222"}`,
                  color: chartType === ct.id ? "#fff" : "#666",
                  borderRadius: 5,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 10,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.13s",
                }}
              >
                <span style={{ fontSize: 11 }}>{ct.icon}</span>
                <span>{ct.name}</span>
              </button>
            ))}
          </div>

          {/* Chart canvas */}
          <div style={{ flex: 1, background: "#111111", position: "relative" }}>
            <div
              id="chart-container"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="toast"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1a1a",
            border: "1px solid #333",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 20px",
            fontSize: 11,
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Click-away for export menu */}
      {exportMenu && (
        <div
          onClick={() => setExportMenu(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
        />
      )}
    </div>
  );
};

// ── Sub-components (light theme) ──────────────────────────────────────────────
const LSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        fontSize: 9,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#bbb",
        marginBottom: 10,
        fontWeight: 500,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const LToggle: React.FC<{
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, value, onChange }) => (
  <label
    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
  >
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 32,
        height: 17,
        borderRadius: 9,
        background: value ? "#1a1a1a" : "#e8e8e8",
        border: `1px solid ${value ? "#1a1a1a" : "#ddd"}`,
        position: "relative",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: value ? "#fff" : "#bbb",
          position: "absolute",
          top: 2,
          left: value ? 17 : 2,
          transition: "all 0.2s",
        }}
      />
    </div>
    <span style={{ color: "#555", fontSize: 11 }}>{label}</span>
  </label>
);

const LSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    {label && (
      <span style={{ color: "#888", fontSize: 10, minWidth: 60 }}>{label}</span>
    )}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ flex: 1 }}
    />
    <span
      style={{ color: "#555", fontSize: 10, minWidth: 28, textAlign: "right" }}
    >
      {typeof value === "number" && value < 1 ? value.toFixed(2) : value}
    </span>
  </div>
);

const LInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ color: "#888", fontSize: 10, minWidth: 70 }}>{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 5,
        padding: "4px 8px",
        color: "#333",
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        outline: "none",
      }}
    />
  </div>
);

const lSelectStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ddd",
  color: "#555",
  borderRadius: 5,
  padding: "4px 8px",
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  outline: "none",
};
const lInputStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ddd",
  color: "#555",
  borderRadius: 5,
  padding: "4px 8px",
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  outline: "none",
};
const lBtnStyle: React.CSSProperties = {
  background: "#f5f5f5",
  border: "1px solid #ddd",
  color: "#555",
  borderRadius: 5,
  padding: "4px 12px",
  cursor: "pointer",
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
};

export default DataChartEditor;
