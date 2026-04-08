"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Chart groups for step 2 selector ──────────────────────────
const CHART_CATS = [
  { label: "Line & Scatter", color: "#3b82f6", count: 14 },
  { label: "Bar Charts", color: "#10b981", count: 12 },
  { label: "Pie & Bubble", color: "#ec4899", count: 8 },
  { label: "Statistical", color: "#f59e0b", count: 9 },
  { label: "Histograms", color: "#8b5cf6", count: 8 },
  { label: "3D Charts", color: "#a855f7", count: 9 },
  { label: "Financial", color: "#f97316", count: 8 },
  { label: "Contour & Heat", color: "#06b6d4", count: 7 },
];

const DEMO_PROMPT = "Show Q4 sales by region as a grouped bar chart";

// ─── Step visual components ───────────────────────────────────

function StepPrompt({ active }: { active: boolean }) {
  const [typed, setTyped] = useState("");
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (!active) {
      setTyped("");
      return;
    }
    let i = 0;
    const blink = setInterval(() => setCursor((c) => !c), 530);
    const type = setInterval(() => {
      i++;
      setTyped(DEMO_PROMPT.slice(0, i));
      if (i >= DEMO_PROMPT.length) clearInterval(type);
    }, 38);
    return () => {
      clearInterval(type);
      clearInterval(blink);
    };
  }, [active]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div
            key={c}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#9ca3af",
            marginLeft: 8,
          }}
        >
          graphix.ai/app
        </span>
      </div>
      <div style={{ padding: "18px 16px" }}>
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            fontFamily: "monospace",
            marginBottom: 10,
          }}
        >
          What do you want to visualize?
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              padding: "10px 12px",
              background: "#f3f4f6",
              borderRadius: 7,
              fontFamily: "monospace",
              fontSize: 12,
              color: "#111827",
              minHeight: 40,
              display: "flex",
              alignItems: "center",
            }}
          >
            {typed}
            {active && (
              <span
                style={{
                  width: 2,
                  height: 14,
                  background: "#06b6d4",
                  display: "inline-block",
                  marginLeft: 1,
                  opacity: cursor ? 1 : 0,
                  transition: "opacity 0.1s",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#111827",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 6h10M7 2l4 4-4 4"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}
        >
          {["📎 Attach CSV", "🎨 Chart type", "✦ AI picks best"].map((hint) => (
            <span
              key={hint}
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: "#9ca3af",
                padding: "3px 7px",
                background: "#f3f4f6",
                borderRadius: 4,
              }}
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSelector({ active }: { active: boolean }) {
  const [highlighted, setHighlighted] = useState(-1);

  useEffect(() => {
    if (!active) {
      setHighlighted(-1);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      setHighlighted(i % CHART_CATS.length);
      i++;
      if (i >= CHART_CATS.length + 1) clearInterval(id);
    }, 280);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}
        >
          Select chart type
        </span>
        <span
          style={{ fontFamily: "monospace", fontSize: 9, color: "#9ca3af" }}
        >
          140+ types · 16 categories
        </span>
      </div>
      <div
        style={{
          padding: "10px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
        }}
      >
        {CHART_CATS.map((cat, i) => (
          <div
            key={cat.label}
            style={{
              padding: "8px 10px",
              borderRadius: 7,
              border: `1px solid ${i === highlighted ? cat.color + "50" : "#e5e7eb"}`,
              background: i === highlighted ? cat.color + "08" : "#fafafa",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i === highlighted ? cat.color : "#d1d5db",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: i === highlighted ? "#111" : "#6b7280",
                  transition: "color 0.2s",
                }}
              >
                {cat.label}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#9ca3af",
                  fontFamily: "monospace",
                }}
              >
                {cat.count} types
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepProcessing({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const STEPS = [
    {
      icon: "◈",
      label: "Parsing intent",
      detail: "Understanding your request",
    },
    {
      icon: "⬡",
      label: "Selecting chart",
      detail: "Grouped Bar → optimal match",
    },
    {
      icon: "σ",
      label: "Mapping data",
      detail: "x: Region · y: Revenue · group: Quarter",
    },
    { icon: "✦", label: "Rendering", detail: "Applying style & interactions" },
  ];

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    setStep(0);
    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), 500 + i * 900);
    });
  }, [active]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#06b6d4",
            display: "inline-block",
            animation: active ? "hiw-pulse 1.2s ease infinite" : "none",
          }}
        />
        <span
          style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}
        >
          AI is working…
        </span>
      </div>
      <div style={{ padding: 4 }}>
        {STEPS.map((s, i) => {
          const done = step > i + 1,
            current = step === i + 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: current ? "rgba(6,182,212,0.04)" : "transparent",
                borderRadius: 7,
                transition: "background 0.3s",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: done || current ? "#06b6d4" : "#d1d5db",
                  transition: "color 0.3s",
                  flexShrink: 0,
                }}
              >
                {done ? "✓" : s.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: done || current ? "#111" : "#9ca3af",
                    transition: "color 0.3s",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    fontFamily: "monospace",
                  }}
                >
                  {s.detail}
                </div>
              </div>
              {current && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#06b6d4",
                    animation: "hiw-pulse 1s ease infinite",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            height: 4,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(step / STEPS.length) * 100}%`,
              background: "linear-gradient(90deg, #06b6d4, #0891b2)",
              borderRadius: 999,
              transition: "width 0.7s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <span
            style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace" }}
          >
            Generating chart
          </span>
          <span
            style={{
              fontSize: 9,
              color: "#06b6d4",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            {Math.round((step / STEPS.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}




// ─── Types ────────────────────────────────────────────────────
type ChartType = "bar" | "line" | "scatter" | "area" | "pie" | "radar";
type Tab = "type" | "style" | "axes" | "export";

// ─── Palettes ─────────────────────────────────────────────────
const PALETTES = [
  {
    id: "aurora",
    name: "Aurora",
    colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"],
    accent: "#6366f1",
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: ["#06b6d4", "#0891b2", "#0e7490", "#155e75"],
    accent: "#06b6d4",
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#f43f5e", "#fb923c", "#fbbf24", "#a3e635"],
    accent: "#f43f5e",
  },
  {
    id: "forest",
    name: "Forest",
    colors: ["#10b981", "#34d399", "#6ee7b7", "#059669"],
    accent: "#10b981",
  },
  {
    id: "neon",
    name: "Neon",
    colors: ["#a855f7", "#ec4899", "#06b6d4", "#84cc16"],
    accent: "#a855f7",
  },
  {
    id: "fire",
    name: "Fire",
    colors: ["#ef4444", "#f97316", "#eab308", "#84cc16"],
    accent: "#ef4444",
  },
];

const CHART_TYPES: {
  id: ChartType;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: "radar", label: "Radar", icon: "✦✦✦", desc: "Multi-dimension" },
  { id: "bar", label: "Bar", icon: "▊▊▊", desc: "Compare categories" },
  { id: "line", label: "Line", icon: "∿∿∿", desc: "Show trends over time" },
  { id: "scatter", label: "Scatter", icon: "∴∴∴", desc: "Find correlations" },
  { id: "area", label: "Area", icon: "▟▟▟", desc: "Cumulative totals" },
  { id: "pie", label: "Pie", icon: "◔◑◕", desc: "Part-to-whole" },
];

const THEMES = [
  { id: "dark", label: "Dark", bg: "#0d0d14", plot: "#0d0d14" },
  { id: "midnight", label: "Midnight", bg: "#040818", plot: "#040818" },
  { id: "slate", label: "Slate", bg: "#0f172a", plot: "#0f172a" },
  { id: "light", label: "Light", bg: "#ffffff", plot: "#f8fafc" },
];

// ─── Raw data per chart type ───────────────────────────────────
const REGIONS = ["North", "South", "East", "West", "Central"];
const Q3 = [67, 44, 58, 51, 73];
const Q4 = [82, 56, 71, 63, 91];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const TREND_A = [30, 48, 35, 62, 55, 78];
const TREND_B = [20, 32, 40, 28, 55, 45];

function buildTraces(
  chartType: ChartType,
  palette: (typeof PALETTES)[0],
  showGrid: boolean,
  opacity: number,
  barMode: "group" | "stack",
  smooth: boolean,
  markerSize: number,
) {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");

  if (chartType === "bar") {
    return [
      {
        x: REGIONS,
        y: Q3,
        type: "bar" as const,
        name: "Q3 2024",
        marker: {
          color: palette.colors[0] + alpha,
          line: { color: palette.colors[0], width: 1.5 },
        },
      },
      {
        x: REGIONS,
        y: Q4,
        type: "bar" as const,
        name: "Q4 2024",
        marker: {
          color: palette.colors[1] + alpha,
          line: { color: palette.colors[1], width: 1.5 },
        },
      },
    ];
  }

  if (chartType === "line") {
    const shape = smooth ? ("spline" as const) : ("linear" as const);
    return [
      {
        x: MONTHS,
        y: TREND_A,
        type: "scatter" as const,
        mode: "lines+markers" as const,
        name: "Product A",
        line: { color: palette.colors[0], width: 2.5, shape },
        marker: { color: palette.colors[0], size: markerSize },
      },
      {
        x: MONTHS,
        y: TREND_B,
        type: "scatter" as const,
        mode: "lines+markers" as const,
        name: "Product B",
        line: {
          color: palette.colors[1],
          width: 2.5,
          shape,
          dash: "dot" as const,
        },
        marker: { color: palette.colors[1], size: markerSize },
      },
    ];
  }

  if (chartType === "scatter") {
    const xs = Array.from({ length: 30 }, () => Math.random() * 100);
    const ys = xs.map((x) => x * 0.8 + Math.random() * 20);
    const xs2 = Array.from({ length: 30 }, () => Math.random() * 100);
    const ys2 = xs2.map((x) => 100 - x * 0.7 + Math.random() * 20);
    return [
      {
        x: xs,
        y: ys,
        type: "scatter" as const,
        mode: "markers" as const,
        name: "Cluster A",
        marker: {
          color: palette.colors[0],
          size: markerSize + 2,
          opacity: 0.8,
        },
      },
      {
        x: xs2,
        y: ys2,
        type: "scatter" as const,
        mode: "markers" as const,
        name: "Cluster B",
        marker: {
          color: palette.colors[1],
          size: markerSize + 2,
          opacity: 0.8,
        },
      },
    ];
  }

  if (chartType === "area") {
    const shape = smooth ? ("spline" as const) : ("linear" as const);
    return [
      {
        x: MONTHS,
        y: TREND_A,
        type: "scatter" as const,
        mode: "lines" as const,
        fill: "tozeroy" as const,
        name: "Revenue",
        line: { color: palette.colors[0], width: 2, shape },
        fillcolor: palette.colors[0] + "40",
      },
      {
        x: MONTHS,
        y: TREND_B,
        type: "scatter" as const,
        mode: "lines" as const,
        fill: "tozeroy" as const,
        name: "Costs",
        line: { color: palette.colors[1], width: 2, shape },
        fillcolor: palette.colors[1] + "40",
      },
    ];
  }

  if (chartType === "pie") {
    return [
      {
        labels: REGIONS,
        values: Q4,
        type: "pie" as const,
        hole: 0.45,
        marker: { colors: palette.colors.concat(["#94a3b8", "#475569"]) },
        textfont: { color: "#fff", size: 11 },
        hoverinfo: "label+percent" as const,
      },
    ];
  }

  if (chartType === "radar") {
    const cats = ["Speed", "Scale", "Cost", "UX", "Support", "Reliability"];
    return [
      {
        type: "scatterpolar" as const,
        r: [85, 72, 60, 90, 78, 88],
        theta: cats,
        fill: "toself" as const,
        name: "Product A",
        fillcolor: palette.colors[0] + "30",
        line: { color: palette.colors[0], width: 2 },
        marker: { color: palette.colors[0], size: 6 },
      },
      {
        type: "scatterpolar" as const,
        r: [65, 88, 75, 70, 90, 65],
        theta: cats,
        fill: "toself" as const,
        name: "Product B",
        fillcolor: palette.colors[1] + "30",
        line: { color: palette.colors[1], width: 2 },
        marker: { color: palette.colors[1], size: 6 },
      },
    ];
  }

  return [];
}

function buildLayout(
  chartType: ChartType,
  theme: (typeof THEMES)[0],
  palette: (typeof PALETTES)[0],
  showGrid: boolean,
  showLegend: boolean,
  barMode: "group" | "stack",
  xLabel: string,
  yLabel: string,
  title: string,
) {
  const gridColor =
    theme.id === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)";
  const tickColor = theme.id === "light" ? "#64748b" : "rgba(255,255,255,0.35)";
  const textColor = theme.id === "light" ? "#1e293b" : "rgba(255,255,255,0.8)";

  const base: Record<string, unknown> = {
    paper_bgcolor: theme.bg,
    plot_bgcolor: theme.plot,
    font: { family: "monospace", color: tickColor, size: 10 },
    margin: { t: title ? 36 : 16, b: 44, l: 52, r: 16 },
    showlegend: showLegend,
    legend: {
      font: { size: 10, color: textColor },
      bgcolor:
        theme.id === "light" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.4)",
      bordercolor: palette.accent + "30",
      borderwidth: 1,
      x: 1,
      xanchor: "right" as const,
      y: 1,
    },
    title: title
      ? {
          text: title,
          font: { size: 13, color: textColor, family: "monospace" },
          x: 0.5,
          y: 0.97,
        }
      : undefined,
  };

  if (chartType === "radar") {
    base.polar = {
      bgcolor: theme.plot,
      angularaxis: {
        color: tickColor,
        gridcolor: gridColor,
        linecolor: gridColor,
      },
      radialaxis: {
        color: tickColor,
        gridcolor: showGrid ? gridColor : "transparent",
        linecolor: "transparent",
        range: [0, 100],
      },
    };
    return base;
  }

  if (chartType === "pie") {
    return base;
  }

  base.barmode = barMode;
  base.xaxis = {
    title: xLabel
      ? { text: xLabel, font: { size: 10, color: tickColor } }
      : undefined,
    gridcolor: showGrid ? gridColor : "transparent",
    linecolor: gridColor,
    tickfont: { size: 9, color: tickColor },
    zeroline: false,
  };
  base.yaxis = {
    title: yLabel
      ? { text: yLabel, font: { size: 10, color: tickColor } }
      : undefined,
    gridcolor: showGrid ? gridColor : "transparent",
    linecolor: "transparent",
    tickfont: { size: 9, color: tickColor },
    zeroline: false,
  };

  return base;
}

// ─── Main component ────────────────────────────────────────────
 function StepChartEditor({ active }: { active: boolean }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("type");
  const [chartType, setChartType] = useState<ChartType>("radar");
  const [selectedPalette, setSelectedPalette] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [barMode, setBarMode] = useState<"group" | "stack">("group");
  const [opacity, setOpacity] = useState(0.92);
  const [markerSize, setMarkerSize] = useState(7);
  const [smooth, setSmooth] = useState(true);
  const [xLabel, setXLabel] = useState("Region");
  const [yLabel, setYLabel] = useState("Revenue ($K)");
  const [chartTitle, setChartTitle] = useState("");

  const renderChart = useCallback(async () => {
    if (!plotRef.current) return;
    try {
      const { default: Plotly } = await import("plotly.js-dist-min");
      const palette = PALETTES[selectedPalette];
      const theme = THEMES[selectedTheme];
      const traces = buildTraces(
        chartType,
        palette,
        showGrid,
        opacity,
        barMode,
        smooth,
        markerSize,
      );
      const layout = buildLayout(
        chartType,
        theme,
        palette,
        showGrid,
        showLegend,
        barMode,
        xLabel,
        yLabel,
        chartTitle,
      );
      await Plotly.react(plotRef.current, traces as never, layout as never, {
        responsive: true,
        displayModeBar: false,
        staticPlot: false,
      });
      setReady(true);
    } catch (err) {
      console.error(err);
    }
  }, [
    chartType,
    selectedPalette,
    selectedTheme,
    showGrid,
    showLegend,
    barMode,
    opacity,
    markerSize,
    smooth,
    xLabel,
    yLabel,
    chartTitle,
  ]);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }
    const t = setTimeout(renderChart, 300);
    return () => clearTimeout(t);
  }, [active, renderChart]);

  const palette = PALETTES[selectedPalette];
  const theme = THEMES[selectedTheme];

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "type", label: "Type", icon: "◈" },
    { id: "style", label: "Style", icon: "◐" },
    { id: "axes", label: "Axes", icon: "⊞" },
    { id: "export", label: "Export", icon: "↗" },
  ];

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .chart-tab-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.18s;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.3);
          width: 100%;
          text-align: left;
          white-space: nowrap;
        }
        .chart-tab-btn:hover { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.05); }
        .chart-tab-btn.active { color: #fff; background: rgba(255,255,255,0.08); }
        .chart-type-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          cursor: pointer;
          transition: all 0.18s;
          width: 100%;
          text-align: left;
        }
        .chart-type-btn:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
        .chart-type-btn.active { border-color: var(--p-accent); background: var(--p-bg); }
        .palette-btn {
          padding: 8px;
          border-radius: 8px;
          border: 1.5px solid transparent;
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.18s;
          width: 100%;
        }
        .palette-btn:hover { background: rgba(255,255,255,0.06); }
        .palette-btn.active { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.08); }
        .theme-btn {
          flex: 1;
          padding: 6px;
          border-radius: 6px;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.18s;
          text-align: center;
        }
        .theme-btn.active { border-color: rgba(255,255,255,0.3); }
        .ctrl-label {
          font-size: 9px;
          font-family: monospace;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .toggle-row:last-child { border-bottom: none; }
        .toggle-label {
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          font-family: monospace;
        }
        .toggle-track {
          width: 32px;
          height: 17px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
          flex-shrink: 0;
        }
        .toggle-thumb {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          top: 2px;
          transition: left 0.2s;
        }
        .axis-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: rgba(255,255,255,0.8);
          font-family: monospace;
          font-size: 11px;
          padding: 7px 10px;
          outline: none;
          transition: border-color 0.18s;
          box-sizing: border-box;
        }
        .axis-input:focus { border-color: rgba(255,255,255,0.25); }
        .range-slider {
          width: 100%;
          accent-color: var(--p-accent, #06b6d4);
        }
        .export-btn {
          width: 100%;
          padding: 9px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.05em;
        }
        .export-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #fff; }
        .export-btn.primary { background: var(--p-accent, #06b6d4); border-color: var(--p-accent, #06b6d4); color: #fff; }
        .export-btn.primary:hover { opacity: 0.9; }
        .section-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 10px 0; }
        .seg-btn {
          flex: 1;
          padding: 5px;
          border-radius: 5px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-family: monospace;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
        }
        .seg-btn.active { background: rgba(255,255,255,0.1); color: #fff; }
      `}</style>

      <div
        style={{
          background: "#0d0d14",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          fontFamily: "monospace",
          // CSS var for palette accent
          ["--p-accent" as string]: palette.accent,
          ["--p-bg" as string]: palette.accent + "14",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            padding: "11px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
            }}
          >
            CHART EDITOR
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: palette.accent,
                opacity: 0.8,
              }}
            />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
              {palette.name}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", height: 400 }}>
          {/* Sidebar */}
          <div
            style={{
              width: 185,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Tab nav */}
            <div
              style={{
                padding: "8px 8px 0",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`chart-tab-btn${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span style={{ fontSize: 12 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="section-divider" style={{ margin: "8px 0" }} />

            {/* Tab content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 8px 12px",
                scrollbarWidth: "none",
              }}
            >
              {activeTab === "type" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ctrl-label">CHART TYPE</span>
                  {CHART_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      className={`chart-type-btn${chartType === ct.id ? " active" : ""}`}
                      onClick={() => setChartType(ct.id)}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color:
                            chartType === ct.id
                              ? palette.accent
                              : "rgba(255,255,255,0.25)",
                          fontFamily: "monospace",
                          letterSpacing: "0.05em",
                          flexShrink: 0,
                        }}
                      >
                        {ct.icon}
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                              chartType === ct.id
                                ? "#fff"
                                : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {ct.label}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "rgba(255,255,255,0.2)",
                          }}
                        >
                          {ct.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "style" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <span className="ctrl-label">COLOR PALETTE</span>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {PALETTES.map((pal, i) => (
                        <button
                          key={pal.id}
                          className={`palette-btn${selectedPalette === i ? " active" : ""}`}
                          onClick={() => setSelectedPalette(i)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color:
                                  selectedPalette === i
                                    ? "#fff"
                                    : "rgba(255,255,255,0.45)",
                              }}
                            >
                              {pal.name}
                            </span>
                            {selectedPalette === i && (
                              <span style={{ fontSize: 9, color: pal.accent }}>
                                ● active
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 3 }}>
                            {pal.colors.map((c) => (
                              <div
                                key={c}
                                style={{
                                  flex: 1,
                                  height: 16,
                                  borderRadius: 3,
                                  background: c,
                                }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="ctrl-label">THEME</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {THEMES.map((th, i) => (
                        <button
                          key={th.id}
                          className={`theme-btn${selectedTheme === i ? " active" : ""}`}
                          onClick={() => setSelectedTheme(i)}
                          style={{
                            background: th.bg,
                            borderColor:
                              selectedTheme === i
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(255,255,255,0.08)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 8,
                              color:
                                selectedTheme === i
                                  ? "#fff"
                                  : "rgba(255,255,255,0.3)",
                              fontFamily: "monospace",
                              display: "block",
                            }}
                          >
                            {th.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="ctrl-label">
                      OPACITY — {Math.round(opacity * 100)}%
                    </span>
                    <input
                      type="range"
                      className="range-slider"
                      min="30"
                      max="100"
                      value={Math.round(opacity * 100)}
                      onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                    />
                  </div>

                  {(chartType === "line" || chartType === "scatter") && (
                    <div>
                      <span className="ctrl-label">
                        MARKER SIZE — {markerSize}px
                      </span>
                      <input
                        type="range"
                        className="range-slider"
                        min="3"
                        max="16"
                        value={markerSize}
                        onChange={(e) => setMarkerSize(Number(e.target.value))}
                      />
                    </div>
                  )}

                  {chartType === "bar" && (
                    <div>
                      <span className="ctrl-label">BAR MODE</span>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 7,
                          padding: 3,
                        }}
                      >
                        {(["group", "stack"] as const).map((m) => (
                          <button
                            key={m}
                            className={`seg-btn${barMode === m ? " active" : ""}`}
                            onClick={() => setBarMode(m)}
                          >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(chartType === "line" || chartType === "area") && (
                    <div className="toggle-row">
                      <span className="toggle-label">Smooth curves</span>
                      <div
                        className="toggle-track"
                        style={{
                          background: smooth
                            ? palette.accent
                            : "rgba(255,255,255,0.1)",
                        }}
                        onClick={() => setSmooth(!smooth)}
                      >
                        <div
                          className="toggle-thumb"
                          style={{ left: smooth ? 16 : 2 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "axes" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div>
                    <span className="ctrl-label">CHART TITLE</span>
                    <input
                      className="axis-input"
                      placeholder="Add a title…"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="ctrl-label">X-AXIS LABEL</span>
                    <input
                      className="axis-input"
                      placeholder="e.g. Region"
                      value={xLabel}
                      onChange={(e) => setXLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="ctrl-label">Y-AXIS LABEL</span>
                    <input
                      className="axis-input"
                      placeholder="e.g. Revenue ($K)"
                      value={yLabel}
                      onChange={(e) => setYLabel(e.target.value)}
                    />
                  </div>
                  <div className="section-divider" />
                  <div>
                    <span className="ctrl-label">DISPLAY</span>
                    <div className="toggle-row">
                      <span className="toggle-label">Show grid</span>
                      <div
                        className="toggle-track"
                        style={{
                          background: showGrid
                            ? palette.accent
                            : "rgba(255,255,255,0.1)",
                        }}
                        onClick={() => setShowGrid(!showGrid)}
                      >
                        <div
                          className="toggle-thumb"
                          style={{ left: showGrid ? 16 : 2 }}
                        />
                      </div>
                    </div>
                    <div className="toggle-row">
                      <span className="toggle-label">Show legend</span>
                      <div
                        className="toggle-track"
                        style={{
                          background: showLegend
                            ? palette.accent
                            : "rgba(255,255,255,0.1)",
                        }}
                        onClick={() => setShowLegend(!showLegend)}
                      >
                        <div
                          className="toggle-thumb"
                          style={{ left: showLegend ? 16 : 2 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "export" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <span className="ctrl-label">EXPORT AS</span>
                  {[
                    { fmt: "PNG", icon: "🖼", desc: "High-res raster" },
                    { fmt: "SVG", icon: "✦", desc: "Vector · scalable" },
                    { fmt: "JPEG", icon: "◼", desc: "Compressed raster" },
                    { fmt: "JSON", icon: "{ }", desc: "Raw chart data" },
                  ].map(({ fmt, icon, desc }) => (
                    <button
                      key={fmt}
                      className={`export-btn${fmt === "PNG" ? " primary" : ""}`}
                      onClick={async () => {
                        if (!plotRef.current) return;
                        const { default: Plotly } =
                          await import("plotly.js-dist-min");
                        if (fmt === "PNG")
                          Plotly.downloadImage(plotRef.current as never, {
                            format: "png",
                            filename: "graphix-chart",
                            width: 1200,
                            height: 800,
                          });
                        if (fmt === "SVG")
                          Plotly.downloadImage(plotRef.current as never, {
                            format: "svg",
                            filename: "graphix-chart",
                            width: 1200,
                            height: 800,
                          });
                        if (fmt === "JPEG")
                          Plotly.downloadImage(plotRef.current as never, {
                            format: "jpeg",
                            filename: "graphix-chart",
                            width: 1200,
                            height: 800,
                          });
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>
                          {fmt}
                        </div>
                        <div style={{ fontSize: 9, opacity: 0.5 }}>{desc}</div>
                      </div>
                    </button>
                  ))}
                  <div className="section-divider" />
                  <div
                    style={{
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.3)",
                        marginBottom: 4,
                      }}
                    >
                      EMBED CODE
                    </div>
                    <code
                      style={{
                        fontSize: 9,
                        color: palette.accent,
                        lineHeight: 1.6,
                        display: "block",
                        wordBreak: "break-all",
                      }}
                    >
                      {`<iframe src="graphix.ai/embed/ch_${Math.random().toString(36).slice(2, 8)}" />`}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: theme.bg,
              minWidth: 0,
            }}
          >
            {/* Preview topbar */}
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: palette.accent,
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.1em",
                  }}
                >
                  LIVE PREVIEW
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "monospace",
                    marginRight: 4,
                  }}
                >
                  {chartType.toUpperCase()} · {palette.name.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Plot */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <div
                ref={plotRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: ready ? 1 : 0,
                  transition: "opacity 0.4s ease",
                  animation: ready ? "fadeIn 0.4s ease" : "none",
                }}
              />
              {!ready && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      border: `2px solid ${palette.accent}30`,
                      borderTopColor: palette.accent,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.2)",
                      fontFamily: "monospace",
                    }}
                  >
                    Rendering…
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "9px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: palette.accent, fontSize: 12 }}>✦</span>
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.2)",
                fontFamily: "monospace",
              }}
            >
              All changes update live · no save needed
            </span>
          </div>
          <span
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.15)",
              fontFamily: "monospace",
            }}
          >
            6 chart types · 6 palettes · 4 themes
          </span>
        </div>
      </div>
    </>
  );
}
// ─── Step definitions ──────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    tag: "Input",
    color: "#06b6d4",
    headline: "Type what you want to see",
    body: "Write a plain-English request, drop a CSV, or paste raw data. No SQL, no formulas, no setup. Graphix understands your intent.",
    extras: ["Natural language", "CSV / JSON upload", "Paste raw data"],
    component: StepPrompt,
  },
  {
    num: "02",
    tag: "Selection",
    color: "#a855f7",
    headline: "Pick a chart type — or let AI choose",
    body: "Browse 140+ chart types across 16 categories. Or skip it entirely — Graphix AI selects the most effective visualization for your data automatically.",
    extras: ["140+ chart types", "16 categories", "AI auto-selection"],
    component: StepSelector,
  },
  {
    num: "03",
    tag: "Processing",
    color: "#10b981",
    headline: "AI parses, maps and renders",
    body: "Graphix maps every dimension of your data to an optimal visual encoding and generates a fully interactive chart in under 3 seconds.",
    extras: ["< 3 second render", "Auto axis labels", "Smart color selection"],
    component: StepProcessing,
  },
  {
    num: "04",
    tag: "Editing",
    color: "#f59e0b",
    headline: "Customize with the visual editor",
    body: "Fine-tune every aspect of your chart with our powerful visual editor. Change chart types, swap color palettes, adjust axes, add annotations, and export in any format — all with live preview.",
    extras: [
      "Full chart editor",
      "12 color palettes",
      "Export PNG · SVG · JPEG",
    ],
    component: StepChartEditor,
  },
];

// ─── Main ──────────────────────────────────────────────────────
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVis, setHeaderVis] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHeaderVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      let fired = false;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!fired) {
              fired = true;
              return;
            }
            if (e.isIntersecting) setActiveStep(i);
          });
        },
        { rootMargin: "-30% 0px -50% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <style>{`
        @keyframes hiw-spin  { to { transform: rotate(360deg); } }
        @keyframes hiw-pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes hiw-up    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* ── RESPONSIVE STEP GRID ── */
        .hiw-step-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .hiw-inner-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 96px 24px 80px;
          position: relative;
        }

        @media (max-width: 767px) {
          .hiw-step-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 36px 0 !important;
          }
          /* Always show text first, visual second on mobile */
          .hiw-text-side { order: 1 !important; }
          .hiw-visual-side { order: 2 !important; }
          .hiw-inner-wrap {
            padding: 56px 16px 48px !important;
          }
          .hiw-step-nav {
            gap: 6px !important;
          }
          .hiw-step-nav button {
            padding: 5px 10px !important;
            font-size: 10px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .hiw-step-grid {
            gap: 28px !important;
          }
          .hiw-inner-wrap {
            padding: 72px 20px 60px !important;
          }
        }
      `}</style>

      <section
        id="how-it-works"
        style={{
          background: "#111212",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.04) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div className="hiw-inner-wrap">
          {/* Header */}
          <div
            ref={headerRef}
            style={{
              textAlign: "center",
              marginBottom: 72,
              opacity: headerVis ? 1 : 0,
              transform: headerVis ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                border: "1px solid rgba(6,182,212,0.2)",
                background: "rgba(6,182,212,0.05)",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "rgba(6,182,212,0.8)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                How it works
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 14px",
              }}
            >
              From prompt to chart.
              <br />
              <span style={{ color: "rgba(6,182,212,0.65)" }}>
                Four steps, under a minute.
              </span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.35)",
                maxWidth: 420,
                margin: "0 auto",
                lineHeight: 1.7,
                fontFamily: "monospace",
              }}
            >
              No code. No config. No learning curve. Scroll through each step to
              see it live.
            </p>
          </div>

          {/* Step nav pills */}
          <div
            className="hiw-step-nav"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: 60,
              flexWrap: "wrap",
            }}
          >
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: `1px solid ${i === activeStep ? s.color + "60" : "rgba(255,255,255,0.08)"}`,
                  background: i === activeStep ? s.color + "12" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    color:
                      i === activeStep ? s.color : "rgba(255,255,255,0.25)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.num}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: i === activeStep ? "#fff" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {s.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((s, i) => {
              const Comp = s.component;
              const isActive = activeStep === i;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="hiw-step-grid"
                  style={{
                    borderTop:
                      i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    padding: "64px 0",
                  }}
                >
                  {/* Text side */}
                  <div
                    className="hiw-text-side"
                    style={{ order: isEven ? 1 : 2, padding: "0 16px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 20,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? s.color : "rgba(255,255,255,0.2)",
                          letterSpacing: "0.1em",
                          transition: "color 0.3s",
                        }}
                      >
                        {s.num}
                      </span>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          background: isActive
                            ? s.color + "18"
                            : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? s.color + "40" : "rgba(255,255,255,0.08)"}`,
                          color: isActive ? s.color : "rgba(255,255,255,0.25)",
                          transition: "all 0.3s",
                          fontFamily: "monospace",
                        }}
                      >
                        {s.tag}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.025em",
                        lineHeight: 1.2,
                        marginBottom: 14,
                      }}
                    >
                      {s.headline}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.75,
                        marginBottom: 24,
                      }}
                    >
                      {s.body}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {s.extras.map((e) => (
                        <div
                          key={e}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: s.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.5)",
                              fontFamily: "monospace",
                            }}
                          >
                            {e}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual side */}
                  <div
                    className="hiw-visual-side"
                    style={{ order: isEven ? 2 : 1 }}
                  >
                    <div
                      style={{
                        opacity: isActive ? 1 : 0.4,
                        transform: isActive ? "scale(1)" : "scale(0.97)",
                        transition: "all 0.4s ease",
                      }}
                    >
                      <Comp active={isActive} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
