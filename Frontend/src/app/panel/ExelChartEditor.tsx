"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import Plotly from "plotly.js-dist-min";
import { getApiUrl } from "@/lib/api";
import { SERIES_DARK, CHROME_DARK, CHART_FONT } from "@/lib/chartTheme";

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
  { id: "hbar", name: "H-Bar", icon: "▬" },
  { id: "stacked", name: "Stacked", icon: "▪▪" },
  { id: "line", name: "Line", icon: "╱╲" },
  { id: "area", name: "Area", icon: "▲" },
  { id: "scatter", name: "Scatter", icon: "∴∵" },
  { id: "bubble", name: "Bubble", icon: "⊙" },
  { id: "pie", name: "Pie", icon: "◑" },
  { id: "donut", name: "Donut", icon: "◎" },
  { id: "histogram", name: "Histogram", icon: "⊟" },
  { id: "box", name: "Box Plot", icon: "⬜" },
  { id: "violin", name: "Violin", icon: "♪" },
  { id: "heatmap", name: "Heatmap", icon: "▥" },
  { id: "radar", name: "Radar", icon: "⬡" },
  { id: "funnel", name: "Funnel", icon: "⊳" },
  { id: "waterfall", name: "Waterfall", icon: "↕" },
  { id: "treemap", name: "Treemap", icon: "▦" },
  { id: "sunburst", name: "Sunburst", icon: "☀" },
  { id: "scatter3d", name: "3D Scatter", icon: "⬡" },
  { id: "surface3d", name: "3D Surface", icon: "⊞" },
  { id: "candlestick", name: "Candlestick", icon: "⊕" },
];

const PALETTES: Record<string, string[]> = {
  /* Matches the site accent, so a chart made with defaults looks like it
     belongs to Graphix rather than to whatever was first in the list. */
  graphix: [...SERIES_DARK, "#7A8C1F", "#3FA9B8"],
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
    "#FBFAF4",
    "rgba(26,26,22,0.20)",
    "#a3a3a3",
    "#737373",
    "#525252",
    "#4A4A42",
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

const API = getApiUrl();

// ─── Component ────────────────────────────────────────────────────────────────
const DataChartEditor: React.FC = () => {
  const router = useRouter();
  const { token, isAuthenticated, addSavedChart, updateSavedChart } =
    useAppStore();

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
  const [palette, setPalette] = useState("graphix");
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
  // Save state
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [existingChartId, setExistingChartId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);

  // ── Init history ──────────────────────────────────────────────────────────
  useEffect(() => {
    setHistory([{ data, timestamp: Date.now() }]);
    setHistoryIndex(0);
  }, []);

  // ── Import chart from dashboard (sessionStorage) ──────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("graphix_panel_chart");
      if (!raw) return;
      sessionStorage.removeItem("graphix_panel_chart");
      const { chartConfig, title: t, chartId } = JSON.parse(raw);
      if (t) setChartTitle(t);
      if (chartId) setExistingChartId(chartId);
      if (!chartConfig?.data?.length) return;

      const traces = chartConfig.data;
      const firstTrace = traces[0] || {};

      // Reconstruct data table from Plotly traces
      const xVals: any[] =
        firstTrace.x ||
        firstTrace.labels ||
        firstTrace.theta ||
        firstTrace.y ||
        [];
      const headers = [
        "Category",
        ...traces.map((tr: any, i: number) => tr.name || `Series ${i + 1}`),
      ];
      const rows: string[][] = xVals.map((x: any, i: number) => [
        String(x),
        ...traces.map((tr: any) => {
          const vals = tr.y || tr.values || tr.r || tr.x || [];
          return String(vals[i] ?? "");
        }),
      ]);
      const newData = [headers, ...rows];
      setData(newData);
      setHistory([{ data: newData, timestamp: Date.now() }]);
      setHistoryIndex(0);

      // Detect chart type
      const type = (firstTrace.type || "bar").toLowerCase();
      const mode = (firstTrace.mode || "").toLowerCase();
      if (type === "scatter" && mode.includes("lines") && firstTrace.fill)
        setChartType("area");
      else if (type === "scatter" && mode.includes("lines"))
        setChartType("line");
      else if (type === "scatter" && mode.includes("markers"))
        setChartType("scatter");
      else if (type === "scatterpolar") setChartType("radar");
      else if (type === "pie" && firstTrace.hole > 0) setChartType("donut");
      else if (type === "pie") setChartType("pie");
      else if (type === "bar" && firstTrace.orientation === "h")
        setChartType("hbar");
      else if (type === "surface") setChartType("surface3d");
      else if (type === "scatter3d") setChartType("scatter3d");
      else if (CHART_TYPES.find((c) => c.id === type)) setChartType(type);
      else setChartType("bar");
    } catch (e) {
      console.error("Panel import error:", e);
    }
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
        handleSaveChart();
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
      if (pct > 20 && pct < 80) setLeftWidth(pct);
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
    let l = "",
      n = i;
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
      ec = c2.charCodeAt(0) - 65,
      sr = parseInt(r1) - 1,
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

  // ── Save to database ──────────────────────────────────────────────────────
  const handleSaveChart = async () => {
    if (!token || !isAuthenticated || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      const chartEl = document.getElementById("chart-container") as any;
      const chartConfig = {
        data: chartEl?.data ?? [],
        layout: chartEl?.layout
          ? { ...chartEl.layout, title: { text: chartTitle } }
          : { title: { text: chartTitle } },
      };
      const body = {
        title: chartTitle,
        prompt: "Created in Data Editor",
        chartConfig,
        tag: (chartType || "BAR").toUpperCase(),
        category: "General",
        sparkline: [],
        trend: "+0%",
        trendUp: true,
      };
      const hdrs = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (existingChartId) {
        const res = await fetch(`${API}/api/charts/${existingChartId}`, {
          method: "PATCH",
          headers: hdrs,
          body: JSON.stringify({ title: chartTitle, chartConfig }),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        updateSavedChart(updated);
        showToast("Chart updated ✓");
      } else {
        const res = await fetch(`${API}/api/charts`, {
          method: "POST",
          headers: hdrs,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        addSavedChart(created);
        setExistingChartId(created.id);
        showToast("Chart saved to dashboard ✓");
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
      showToast("Save failed — try again");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // ── Export helpers ────────────────────────────────────────────────────────
  const handleExportPNG = () => {
    const el = document.getElementById("chart-container");
    if (el)
      Plotly.downloadImage(el as any, {
        format: "png",
        width: 1920,
        height: 1080,
        filename: chartTitle || "chart",
      });
  };
  const handleExportSVG = () => {
    const el = document.getElementById("chart-container");
    if (el)
      Plotly.downloadImage(el as any, {
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
    const t = data[0].map((_, ci) => data.map((r) => r[ci]));
    setData(t);
    addToHistory(t);
    showToast("Data transposed ✓");
  };
  const sortDataBy = (col: number) => {
    const header = data[0],
      rows = data
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

  // ── Render chart ──────────────────────────────────────────────────────────
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
      Plotly.purge(chartEl as any);
      return;
    }

    const colors = PALETTES[palette] || PALETTES.graphix;
    const bg = "#14150F",
      gridC = CHROME_DARK.grid,
      textC = CHROME_DARK.tick;
    const xVals = rows.map((r) => r[0]);
    const numericSeries = (seriesIdx: number) =>
      rows.map((r) => {
        const v = parseFloat(r[seriesIdx + 1] || "0");
        return isNaN(v) ? 0 : v;
      });

    const layout: Partial<Plotly.Layout> = {
      title: chartTitle
        ? {
            text: chartTitle,
            font: {
              color: "#F2F1EC",
              size: 15,
              family: CHART_FONT.family,
            },
            x: 0.5,
          }
        : undefined,
      paper_bgcolor: bg,
      plot_bgcolor: bg,
      font: { family: CHART_FONT.family, color: textC, size: CHART_FONT.size },
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
        tickfont: { color: textC },
        zeroline: false,
        type: logScale ? "log" : undefined,
      },
      yaxis: {
        title: yAxisLabel ? { text: yAxisLabel } : undefined,
        gridcolor: gridLines ? gridC : "transparent",
        tickfont: { color: textC },
        zeroline: false,
        type: logScale ? "log" : undefined,
      },
      showlegend: showLegend,
      legend: {
        font: { color: textC },
        bgcolor: "rgba(0,0,0,0.5)",
        bordercolor: "#2E2E27",
      },
    } as any;

    let traces: any[] = [];

    switch (chartType) {
      case "bar":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            x: xVals,
            y: numericSeries(i),
            type: "bar",
            name: h,
            marker: { color: colors[i % colors.length], opacity },
          }));
        (layout as any).barmode =
          chartSubtype === "stacked" ? "stack" : "group";
        break;

      case "hbar":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            y: xVals,
            x: numericSeries(i),
            type: "bar",
            orientation: "h",
            name: h,
            marker: { color: colors[i % colors.length], opacity },
          }));
        (layout as any).barmode = "group";
        break;

      case "stacked":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            x: xVals,
            y: numericSeries(i),
            type: "bar",
            name: h,
            marker: { color: colors[i % colors.length], opacity },
          }));
        (layout as any).barmode = "stack";
        break;

      case "line":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            x: xVals,
            y: numericSeries(i),
            type: "scatter",
            mode: "lines+markers",
            name: h,
            line: {
              color: colors[i % colors.length],
              width: 2.5,
              shape: smoothLines ? "spline" : "linear",
            },
            marker: { size: markerSize, color: colors[i % colors.length] },
          }));
        break;

      case "area":
        traces = headers
          .slice(1)
          .map((h, i) => ({
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

      case "scatter":
        traces = headers
          .slice(1)
          .map((h, i) => ({
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

      case "bubble":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            x: xVals,
            y: numericSeries(i),
            type: "scatter",
            mode: "markers",
            name: h,
            marker: {
              color: colors[i % colors.length],
              size: numericSeries(i).map((v) =>
                Math.max(8, Math.min(60, Math.abs(v) / 10)),
              ),
              sizemode: "diameter",
              opacity,
              line: { color: colors[i % colors.length], width: 1 },
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
            textfont: { color: "#F2F1EC", size: 11 },
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
            textfont: { color: "#F2F1EC", size: 11 },
            hoverinfo: "label+percent+value" as any,
          },
        ];
        break;

      case "histogram":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            x: numericSeries(i),
            type: "histogram",
            name: h,
            marker: { color: colors[i % colors.length], opacity },
            opacity: 0.75,
          }));
        (layout as any).barmode = "overlay";
        break;

      case "box":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            y: numericSeries(i),
            type: "box",
            name: h,
            marker: { color: colors[i % colors.length] },
            boxmean: true,
            fillcolor: colors[i % colors.length] + "44",
            line: { color: colors[i % colors.length] },
          }));
        break;

      case "violin":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            y: numericSeries(i),
            type: "violin",
            name: h,
            fillcolor: colors[i % colors.length] + "55",
            line: { color: colors[i % colors.length] },
            box: { visible: true },
            meanline: { visible: true },
          }));
        break;

      case "heatmap": {
        const zData = headers.slice(1).map((_, i) =>
          rows.map((r) => {
            const v = parseFloat(r[i + 1] || "0");
            return isNaN(v) ? 0 : v;
          }),
        );
        traces = [
          {
            z: zData,
            x: headers.slice(1),
            y: xVals,
            type: "heatmap",
            colorscale: [
              [0, bg],
              [0.25, "#22221C"],
              [0.5, colors[0]],
              [0.75, colors[1]],
              [1, colors[2]],
            ],
            colorbar: { tickfont: { color: textC } },
          },
        ];
        (layout as any).xaxis = {
          tickfont: { color: textC },
          gridcolor: gridC,
        };
        (layout as any).yaxis = {
          tickfont: { color: textC },
          gridcolor: gridC,
        };
        break;
      }

      case "radar":
        traces = headers
          .slice(1)
          .map((h, i) => ({
            type: "scatterpolar",
            r: numericSeries(i),
            theta: xVals,
            fill: "toself",
            name: h,
            line: { color: colors[i % colors.length], width: 2 },
            fillcolor: colors[i % colors.length] + "30",
            marker: { color: colors[i % colors.length], size: 5 },
          }));
        (layout as any).polar = {
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
        delete (layout as any).xaxis;
        delete (layout as any).yaxis;
        break;

      case "funnel":
        traces = [
          {
            type: "funnel",
            y: xVals,
            x: numericSeries(0),
            marker: { color: colors.slice(0, xVals.length) },
            textfont: { color: "#F2F1EC" },
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
            connector: { line: { color: "#2E2E27" } },
            increasing: { marker: { color: colors[3] } },
            decreasing: { marker: { color: colors[4] } },
            totals: { marker: { color: colors[0] } },
            textfont: { color: "#F2F1EC" },
          } as any,
        ];
        break;

      case "treemap":
        traces = [
          {
            type: "treemap",
            labels: xVals,
            parents: xVals.map(() => ""),
            values: numericSeries(0),
            marker: { colors: colors.slice(0, xVals.length) },
            textfont: { color: "#F2F1EC" },
          },
        ];
        delete (layout as any).xaxis;
        delete (layout as any).yaxis;
        break;

      case "sunburst":
        traces = [
          {
            type: "sunburst",
            labels: xVals,
            parents: xVals.map(() => ""),
            values: numericSeries(0),
            marker: { colors: colors.slice(0, xVals.length) },
            textfont: { color: "#F2F1EC" },
          },
        ];
        delete (layout as any).xaxis;
        delete (layout as any).yaxis;
        break;

      case "scatter3d":
        traces = [
          {
            type: "scatter3d",
            x: xVals,
            y: numericSeries(0),
            z: numericSeries(1).length
              ? numericSeries(1)
              : numericSeries(0).map((_, i) => i),
            mode: "markers",
            name: headers[1] || "Data",
            marker: { color: colors[0], size: 5, opacity },
          },
        ];
        (layout as any).scene = {
          bgcolor: bg,
          xaxis: { gridcolor: gridC, tickfont: { color: textC } },
          yaxis: { gridcolor: gridC, tickfont: { color: textC } },
          zaxis: { gridcolor: gridC, tickfont: { color: textC } },
        };
        break;

      case "surface3d": {
        const gridSize = Math.ceil(Math.sqrt(xVals.length));
        const zGrid: number[][] = [];
        for (let r = 0; r < gridSize; r++) {
          const row: number[] = [];
          for (let c = 0; c < gridSize; c++) {
            row.push(numericSeries(0)[r * gridSize + c] ?? 0);
          }
          zGrid.push(row);
        }
        traces = [{ type: "surface", z: zGrid, colorscale: "Viridis" }];
        (layout as any).scene = { bgcolor: bg };
        break;
      }

      case "candlestick": {
        const base = numericSeries(0);
        traces = [
          {
            type: "candlestick",
            x: xVals,
            open: base.map((v) => v * 0.95),
            high: base.map((v) => v * 1.05),
            low: base.map((v) => v * 0.9),
            close: base,
            name: headers[1] || "Price",
          } as any,
        ];
        break;
      }

      default:
        traces = headers
          .slice(1)
          .map((h, i) => ({
            x: xVals,
            y: numericSeries(i),
            type: "bar",
            name: h,
            marker: { color: colors[i % colors.length], opacity },
          }));
    }

    // Add annotations
    if (annotations.length > 0) {
      (layout as any).annotations = annotations.map((a) => ({
        x: a.x,
        y: a.y,
        text: a.text,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: colors[0],
        font: { color: textC, size: 11 },
      }));
    }

    try {
      Plotly.react(chartEl as any, traces, layout as any, {
        responsive: true,
        displayModeBar: false,
      });
    } catch (e) {
      console.error("Render error:", e);
    }
  };

  const stats = computeStats();

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#E5E1D4",
        fontFamily: "'DM Mono', monospace",
        fontSize: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        * { box-sizing:border-box }
        .left-panel ::-webkit-scrollbar { width:5px; height:5px }
        .left-panel ::-webkit-scrollbar-track { background:#EAE7DA }
        .left-panel ::-webkit-scrollbar-thumb { background:rgba(26,26,22,0.20); border-radius:3px }
        .left-panel ::-webkit-scrollbar-thumb:hover { background:rgba(26,26,22,0.32) }
        .right-panel ::-webkit-scrollbar { width:5px; height:5px }
        .chart-type-bar::-webkit-scrollbar { display:none }
        .chart-type-bar { scrollbar-width:none; -ms-overflow-style:none }
        .right-panel ::-webkit-scrollbar-track { background:#14150F }
        .right-panel ::-webkit-scrollbar-thumb { background:#2A2A22; border-radius:3px }
        .right-panel ::-webkit-scrollbar-thumb:hover { background:#4A4A42 }
        .cell-input { transition:background 0.12s }
        .cell-input:focus { outline:none }
        .chart-btn { transition:all 0.13s cubic-bezier(.4,0,.2,1) }
        .chart-btn:hover { background:#26261F !important; color:#FBFAF4 !important }
        .tab-btn { transition:all 0.13s; border-bottom:2px solid transparent; padding:0 10px; height:100%; background:transparent; border-top:none; border-left:none; border-right:none; cursor:pointer; font-family:inherit; font-size:13px; color:#7A7A6E; letter-spacing:0 }
        .tab-btn.active { border-bottom-color:#1A1A16; color:#1A1A16; font-weight:500 }
        .lbtn:hover { background:#E5E1D4 !important }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }
        .toast { animation:fadeSlideIn 0.18s ease }
        input[type=range] { accent-color:#2E2E27 }
        input[type=checkbox] { accent-color:#2E2E27 }
      `}</style>

      {/* ── Top Bar ── */}
      <div
        style={{
          background: "#FBFAF4",
          borderBottom: "1px solid rgba(26,26,22,0.13)",
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 46,
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid rgba(26,26,22,0.14)",
            background: "#F4F2EA",
            color: "#4E4E45",
            fontFamily: "inherit",
            fontSize: 11,
            cursor: "pointer",
            fontWeight: 500,
            flexShrink: 0,
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E1D4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F4F2EA")}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Dashboard
        </button>

        <div
          style={{ width: 1, height: 20, background: "rgba(26,26,22,0.14)", flexShrink: 0 }}
        />

        {/* App identity */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "linear-gradient(135deg,#1A1A16,#2E2E27)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
           <img src="/logo.png" alt="" className="invert w-4" />
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1A1A16",
              letterSpacing: "-0.02em",
            }}
          >
            Graphix Data Editor
          </span>
        </div>

        <div
          style={{ width: 1, height: 20, background: "rgba(26,26,22,0.14)", flexShrink: 0 }}
        />

        {/* Editable chart title */}
        <input
          value={chartTitle}
          onChange={(e) => setChartTitle(e.target.value)}
          style={{
            flex: 1,
            border: "1px solid rgba(26,26,22,0.14)",
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 11,
            fontFamily: "inherit",
            color: "#2E2E27",
            outline: "none",
            background: "#F4F2EA",
            minWidth: 0,
          }}
          placeholder="Chart title…"
        />

        {/* Undo / Redo */}
        {[
          { label: "↩", fn: handleUndo, dis: historyIndex <= 0 },
          {
            label: "↪",
            fn: handleRedo,
            dis: historyIndex >= history.length - 1,
          },
        ].map(({ label, fn, dis }) => (
          <button
            key={label}
            onClick={fn}
            disabled={dis}
            style={{
              padding: "3px 8px",
              border: "1px solid rgba(26,26,22,0.16)",
              borderRadius: 6,
              background: "#F4F2EA",
              color: dis ? "rgba(26,26,22,0.28)" : "#4E4E45",
              fontFamily: "inherit",
              fontSize: 12,
              cursor: dis ? "not-allowed" : "pointer",
            }}
          >
            {label}
          </button>
        ))}

        {/* Sample data loader */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowHelp((h) => !h)}
            style={{
              padding: "3px 10px",
              border: "1px solid rgba(26,26,22,0.16)",
              borderRadius: 6,
              background: "#F4F2EA",
              color: "#4E4E45",
              fontFamily: "inherit",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Samples ▾
          </button>
          {showHelp && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 200,
                background: "#FBFAF4",
                border: "1px solid rgba(26,26,22,0.14)",
                borderRadius: 6,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                padding: 6,
                minWidth: 160,
                marginTop: 4,
              }}
            >
              {Object.entries(SAMPLE_DATASETS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => {
                    loadSample(key);
                    setShowHelp(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 10px",
                    border: "none",
                    background: "transparent",
                    color: "#3E3E36",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 11,
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#EAE7DA")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save / Update */}
        {isAuthenticated && token && (
          <button
            onClick={handleSaveChart}
            disabled={saveStatus === "saving"}
            style={{
              padding: "5px 16px",
              borderRadius: 6,
              border: "none",
              background:
                saveStatus === "saved"
                  ? "#10b981"
                  : saveStatus === "error"
                    ? "#ef4444"
                    : "#1A1A16",
              color: "#F2F1EC",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 600,
              cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "✓ Saved"
                : saveStatus === "error"
                  ? "✗ Failed"
                  : existingChartId
                    ? "Update Chart"
                    : "Save to Dashboard"}
          </button>
        )}

        {/* Export */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setExportMenu((m) => !m)}
            style={{
              padding: "4px 10px",
              border: "1px solid rgba(26,26,22,0.16)",
              borderRadius: 6,
              background: "#F4F2EA",
              color: "#4E4E45",
              fontFamily: "inherit",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Export ▾
          </button>
          {exportMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 200,
                background: "#FBFAF4",
                border: "1px solid rgba(26,26,22,0.14)",
                borderRadius: 6,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                padding: 6,
                minWidth: 130,
                marginTop: 4,
              }}
            >
              {[
                ["PNG", "handleExportPNG"],
                ["SVG", "handleExportSVG"],
                ["CSV", "handleExportCSV"],
              ].map(([lbl]) => (
                <button
                  key={lbl}
                  onClick={() => {
                    setExportMenu(false);
                    lbl === "PNG"
                      ? handleExportPNG()
                      : lbl === "SVG"
                        ? handleExportSVG()
                        : handleExportCSV();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 10px",
                    border: "none",
                    background: "transparent",
                    color: "#3E3E36",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 11,
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#EAE7DA")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  ↓ {lbl}
                </button>
              ))}
              <hr
                style={{
                  margin: "4px 0",
                  border: "none",
                  borderTop: "1px solid rgba(26,26,22,0.11)",
                }}
              />
              <button
                onClick={() => {
                  setExportMenu(false);
                  fileInputRef.current?.click();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 10px",
                  border: "none",
                  background: "transparent",
                  color: "#3E3E36",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  borderRadius: 6,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#EAE7DA")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                ↑ Import CSV
              </button>
              <button
                onClick={() => {
                  setExportMenu(false);
                  transposeData();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 10px",
                  border: "none",
                  background: "transparent",
                  color: "#3E3E36",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  borderRadius: 6,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#EAE7DA")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                ⇄ Transpose
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleImportCSV}
        />
      </div>

      {/* ── Formula Bar ── */}
      <div
        style={{
          background: "#F4F2EA",
          borderBottom: "1px solid rgba(26,26,22,0.13)",
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
            fontSize: 12,
            letterSpacing: "0.1em",
            minWidth: 28,
          }}
        >
          {selectedCell
            ? `${colLabel(selectedCell.col)}${selectedCell.row + 1}`
            : "—"}
        </span>
        <div style={{ width: 1, height: 16, background: "rgba(26,26,22,0.14)" }} />
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
            color: "#1A1A16",
            fontFamily: "inherit",
            fontSize: 11,
          }}
        />
        {formulaBar.startsWith("=") && (
          <button
            onClick={commitFormula}
            style={{
              background: "#1A1A16",
              border: "1px solid #1A1A16",
              color: "#F2F1EC",
              borderRadius: 6,
              padding: "2px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
            }}
          >
            Apply
          </button>
        )}
        <div style={{ width: 1, height: 16, background: "rgba(26,26,22,0.14)" }} />
        <input
          id="search-input"
          value={searchCell}
          onChange={(e) => setSearchCell(e.target.value)}
          placeholder="⌕ Search cells"
          style={{
            background: "#FBFAF4",
            border: "1px solid rgba(26,26,22,0.16)",
            borderRadius: 6,
            padding: "2px 10px",
            color: "#4E4E45",
            fontFamily: "inherit",
            fontSize: 11,
            outline: "none",
            width: 160,
          }}
        />
      </div>

      {/* ── Main split ── */}
      <div
        ref={containerRef}
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        {/* ── LEFT: Spreadsheet ── */}
        <div
          className="left-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            width: `${leftWidth}%`,
            borderRight: "1px solid rgba(26,26,22,0.14)",
            overflow: "hidden",
            background: "#FBFAF4",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              background: "#F4F2EA",
              borderBottom: "1px solid rgba(26,26,22,0.12)",
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
              >
                {tab}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button
              onClick={addRow}
              className="lbtn"
              style={{
                padding: "2px 8px",
                border: "1px solid rgba(26,26,22,0.14)",
                borderRadius: 6,
                background: "#F4F2EA",
                color: "#4E4E45",
                fontFamily: "inherit",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              + Row
            </button>
            <button
              onClick={addColumn}
              className="lbtn"
              style={{
                padding: "2px 8px",
                border: "1px solid rgba(26,26,22,0.14)",
                borderRadius: 6,
                background: "#F4F2EA",
                color: "#4E4E45",
                fontFamily: "inherit",
                fontSize: 12,
                cursor: "pointer",
                marginLeft: 4,
              }}
            >
              + Col
            </button>
          </div>

          {/* DATA TAB */}
          {activeTab === "data" && (
            <div style={{ flex: 1, overflow: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  tableLayout: "fixed",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#EAE7DA",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <th
                      style={{
                        width: 32,
                        padding: "6px 0",
                        textAlign: "center",
                        color: "rgba(26,26,22,0.35)",
                        fontSize: 11,
                        borderBottom: "1px solid rgba(26,26,22,0.12)",
                        borderRight: "1px solid rgba(26,26,22,0.12)",
                      }}
                    >
                      #
                    </th>
                    {data[0].map((h, ci) => (
                      <th
                        key={ci}
                        style={{
                          padding: "4px 6px",
                          textAlign: "left",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6E6E62",
                          borderBottom: "1px solid rgba(26,26,22,0.12)",
                          borderRight: "1px solid rgba(26,26,22,0.10)",
                          minWidth: 100,
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{colLabel(ci)}</span>
                          <button
                            onClick={() => sortDataBy(ci)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              color: "rgba(26,26,22,0.28)",
                              fontSize: 11,
                              padding: 0,
                            }}
                          >
                            ⇅
                          </button>
                          {ci > 0 && (
                            <button
                              onClick={() => deleteColumn(ci)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "rgba(26,26,22,0.28)",
                                fontSize: 11,
                                padding: 0,
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, ri) => (
                    <tr
                      key={ri}
                      style={{ background: ri % 2 === 0 ? "#FBFAF4" : "#F4F2EA" }}
                    >
                      <td
                        style={{
                          textAlign: "center",
                          color: "rgba(26,26,22,0.28)",
                          fontSize: 11,
                          padding: "0 4px",
                          borderRight: "1px solid rgba(26,26,22,0.12)",
                          borderBottom: "1px solid #E5E1D4",
                          verticalAlign: "middle",
                        }}
                      >
                        {ri > 0 && (
                          <button
                            onClick={() => deleteRow(ri)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              color: "rgba(26,26,22,0.16)",
                              fontSize: 11,
                              padding: 0,
                              display: "block",
                              margin: "0 auto",
                            }}
                          >
                            ✕
                          </button>
                        )}
                        {ri === 0 ? "H" : ri}
                      </td>
                      {row.map((cell, ci) => {
                        const isSelected =
                          selectedCell?.row === ri && selectedCell?.col === ci;
                        const cellBg = getCellBg(ri, ci);
                        const isFlash = flashCell === `${ri}-${ci}`;
                        const isSearch = searchHighlight(ri, ci);
                        return (
                          <td
                            key={ci}
                            style={{
                              padding: 0,
                              borderRight: "1px solid rgba(26,26,22,0.10)",
                              borderBottom: "1px solid #E5E1D4",
                              background: isSearch ? "#fff3cd" : cellBg,
                              outline: isSelected
                                ? "2px solid #1A1A16"
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
                                minWidth: 100,
                                height: 27,
                                padding: "0 8px",
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                color: ri === 0 ? "#1A1A16" : "#3E3E36",
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
          )}

          {/* STYLE TAB */}
          {activeTab === "style" && (
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <LSection title="Color Palette">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(PALETTES).map(([key, cols]) => (
                    <button
                      key={key}
                      onClick={() => setPalette(key)}
                      style={{
                        background: palette === key ? "#E5E1D4" : "#FBFAF4",
                        border: `1px solid ${palette === key ? "#1A1A16" : "rgba(26,26,22,0.16)"}`,
                        borderRadius: 6,
                        padding: "5px 8px",
                        cursor: "pointer",
                        display: "flex",
                        gap: 3,
                        alignItems: "center",
                      }}
                    >
                      {cols.slice(0, 5).map((c, i) => (
                        <span
                          key={i}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: c,
                            display: "block",
                          }}
                        />
                      ))}
                      <span
                        style={{ fontSize: 12, color: "#4E4E45", marginLeft: 4 }}
                      >
                        {key}
                      </span>
                    </button>
                  ))}
                </div>
              </LSection>
              <LSection title="Chart Options">
                <LToggle
                  label="Grid Lines"
                  value={gridLines}
                  onChange={setGridLines}
                />
                <LToggle
                  label="Show Legend"
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
                <LToggle
                  label="Filter Zero Values"
                  value={filterZero}
                  onChange={setFilterZero}
                />
              </LSection>
              <LSection title="Marker Size">
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={markerSize}
                  onChange={(e) => setMarkerSize(+e.target.value)}
                  style={{ width: "100%" }}
                />
                <span style={{ fontSize: 12, color: "#7A7A6E" }}>
                  {markerSize}px
                </span>
              </LSection>
              <LSection title="Opacity">
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(+e.target.value)}
                  style={{ width: "100%" }}
                />
                <span style={{ fontSize: 12, color: "#7A7A6E" }}>
                  {Math.round(opacity * 100)}%
                </span>
              </LSection>
              <LSection title="Sort Data">
                {(["none", "asc", "desc"] as const).map((v) => (
                  <label
                    key={v}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 5,
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    <input
                      type="radio"
                      name="sortData"
                      value={v}
                      checked={sortData === v}
                      onChange={() => setSortData(v)}
                    />{" "}
                    {v === "none"
                      ? "None"
                      : v === "asc"
                        ? "Ascending"
                        : "Descending"}
                  </label>
                ))}
              </LSection>
              <LSection title="Axis Labels">
                <input
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder="X-Axis label"
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    border: "1px solid rgba(26,26,22,0.16)",
                    borderRadius: 6,
                    fontFamily: "inherit",
                    fontSize: 11,
                    marginBottom: 6,
                    outline: "none",
                  }}
                />
                <input
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder="Y-Axis label"
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    border: "1px solid rgba(26,26,22,0.16)",
                    borderRadius: 6,
                    fontFamily: "inherit",
                    fontSize: 11,
                    outline: "none",
                  }}
                />
              </LSection>
            </div>
          )}

          {/* ANNOTATIONS TAB */}
          {activeTab === "annotations" && (
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <LSection title="Add Annotation">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <input
                    value={newAnnotation.x}
                    onChange={(e) =>
                      setNewAnnotation((a) => ({ ...a, x: e.target.value }))
                    }
                    placeholder="X value (e.g. Jan)"
                    style={{
                      padding: "4px 8px",
                      border: "1px solid rgba(26,26,22,0.16)",
                      borderRadius: 6,
                      fontFamily: "inherit",
                      fontSize: 11,
                      outline: "none",
                    }}
                  />
                  <input
                    value={newAnnotation.y}
                    onChange={(e) =>
                      setNewAnnotation((a) => ({ ...a, y: e.target.value }))
                    }
                    placeholder="Y value (number)"
                    type="number"
                    style={{
                      padding: "4px 8px",
                      border: "1px solid rgba(26,26,22,0.16)",
                      borderRadius: 6,
                      fontFamily: "inherit",
                      fontSize: 11,
                      outline: "none",
                    }}
                  />
                  <input
                    value={newAnnotation.text}
                    onChange={(e) =>
                      setNewAnnotation((a) => ({ ...a, text: e.target.value }))
                    }
                    placeholder="Annotation text"
                    style={{
                      padding: "4px 8px",
                      border: "1px solid rgba(26,26,22,0.16)",
                      borderRadius: 6,
                      fontFamily: "inherit",
                      fontSize: 11,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newAnnotation.text || !newAnnotation.x) return;
                      setAnnotations((a) => [
                        ...a,
                        {
                          ...newAnnotation,
                          y: parseFloat(newAnnotation.y) || 0,
                          id: Date.now().toString(),
                        },
                      ]);
                      setNewAnnotation({ x: "", y: "", text: "" });
                      showToast("Annotation added");
                    }}
                    style={{
                      padding: "5px",
                      border: "1px solid #1A1A16",
                      borderRadius: 6,
                      background: "#1A1A16",
                      color: "#E8FF5A",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 11,
                    }}
                  >
                    + Add
                  </button>
                </div>
              </LSection>
              {annotations.length > 0 && (
                <LSection title="Annotations">
                  {annotations.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "5px 8px",
                        background: "#EAE7DA",
                        borderRadius: 6,
                        marginBottom: 5,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "#3E3E36" }}>
                        {a.x} → {a.text}
                      </span>
                      <button
                        onClick={() =>
                          setAnnotations((an) =>
                            an.filter((x) => x.id !== a.id),
                          )
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "rgba(26,26,22,0.28)",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </LSection>
              )}
              <LSection title="Conditional Formatting">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  <select
                    value={newRule.column}
                    onChange={(e) =>
                      setNewRule((r) => ({ ...r, column: +e.target.value }))
                    }
                    style={{
                      padding: "3px 6px",
                      border: "1px solid rgba(26,26,22,0.16)",
                      borderRadius: 6,
                      fontFamily: "inherit",
                      fontSize: 11,
                    }}
                  >
                    {data[0].slice(1).map((h, i) => (
                      <option key={i} value={i + 1}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 5 }}>
                    <select
                      value={newRule.operator}
                      onChange={(e) =>
                        setNewRule((r) => ({ ...r, operator: e.target.value }))
                      }
                      style={{
                        flex: 1,
                        padding: "3px 6px",
                        border: "1px solid rgba(26,26,22,0.16)",
                        borderRadius: 6,
                        fontFamily: "inherit",
                        fontSize: 11,
                      }}
                    >
                      {[">", "<", "="].map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={newRule.value}
                      onChange={(e) =>
                        setNewRule((r) => ({ ...r, value: +e.target.value }))
                      }
                      style={{
                        flex: 2,
                        padding: "3px 6px",
                        border: "1px solid rgba(26,26,22,0.16)",
                        borderRadius: 6,
                        fontFamily: "inherit",
                        fontSize: 11,
                      }}
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
                        border: "1px solid rgba(26,26,22,0.16)",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setConditionalRules((r) => [...r, newRule]);
                      showToast("Rule added ✓");
                    }}
                    style={{
                      padding: "4px",
                      border: "1px solid #1A1A16",
                      borderRadius: 6,
                      background: "#1A1A16",
                      color: "#E8FF5A",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 11,
                    }}
                  >
                    + Add Rule
                  </button>
                </div>
                {conditionalRules.length > 0 && (
                  <button
                    onClick={() => setConditionalRules([])}
                    style={{
                      marginTop: 8,
                      padding: "3px 8px",
                      border: "1px solid rgba(26,26,22,0.16)",
                      borderRadius: 6,
                      background: "transparent",
                      color: "#7A7A6E",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Clear all rules
                  </button>
                )}
              </LSection>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === "stats" && (
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <LSection title="Column Statistics">
                {stats.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      marginBottom: 14,
                      padding: "10px 12px",
                      background: "#F0EDE2",
                      borderRadius: 6,
                      border: "1px solid rgba(26,26,22,0.11)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#1A1A16",
                        marginBottom: 8,
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px 16px",
                      }}
                    >
                      {[
                        ["Sum", s.sum.toFixed(1)],
                        ["Avg", s.avg.toFixed(2)],
                        ["Min", s.min],
                        ["Max", s.max],
                        ["Count", s.count],
                      ].map(([l, v]) => (
                        <div
                          key={l as string}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: 12, color: "#7A7A6E" }}>
                            {l}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#2E2E27",
                            }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </LSection>
            </div>
          )}
        </div>

        {/* ── Drag handle ── */}
        <div
          onMouseDown={() => setIsDragging(true)}
          style={{
            width: 4,
            cursor: "col-resize",
            background: "rgba(26,26,22,0.14)",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,26,22,0.28)")}
          onMouseLeave={(e) => {
            if (!isDragging) e.currentTarget.style.background = "rgba(26,26,22,0.14)";
          }}
        />

        {/* ── RIGHT: Chart panel ── */}
        <div
          className="right-panel"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#14150F",
            overflow: "hidden",
          }}
        >
          {/* Chart type bar */}
          <div
            className="chart-type-bar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              background: "#1A1A16",
              borderBottom: "1px solid #26261F",
              overflowX: "auto",
              flexShrink: 0,
            }}
          >
            {CHART_TYPES.map((ct) => (
              <button
                key={ct.id}
                className={`chart-btn ${chartType === ct.id ? "active" : ""}`}
                onClick={() => setChartType(ct.id)}
                style={{
                  background: chartType === ct.id ? "#26261F" : "transparent",
                  border: `1px solid ${chartType === ct.id ? "#4A4A42" : "#22221C"}`,
                  color: chartType === ct.id ? "#FBFAF4" : "#5C5C52",
                  borderRadius: 6,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
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
          <div style={{ flex: 1, background: "#14150F", position: "relative" }}>
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
            background: "#1A1A16",
            border: "1px solid #2E2E27",
            color: "#F2F1EC",
            borderRadius: 6,
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

      {exportMenu && (
        <div
          onClick={() => setExportMenu(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
        />
      )}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
        />
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const LSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        fontFamily: "var(--gx-mono)",
        fontSize: 12,
        letterSpacing: 0,
        color: "rgba(26,26,22,0.42)",
        marginBottom: 10,
        fontWeight: 400,
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
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      marginBottom: 8,
    }}
  >
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 32,
        height: 17,
        borderRadius: 9,
        background: value ? "#1A1A16" : "rgba(26,26,22,0.12)",
        border: `1px solid ${value ? "#1A1A16" : "#d0d0d0"}`,
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: value ? 16 : 2,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: value ? "#FBFAF4" : "#aaa",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
    <span style={{ fontSize: 11, color: "#4E4E45" }}>{label}</span>
  </label>
);

export default DataChartEditor;
