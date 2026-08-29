"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Chart groups for step 2 selector ──────────────────────────
const CHART_CATS = [
  { label: "Line & Scatter", color: "#3b82f6", count: 14 },
  { label: "Bar Charts", color: "#E8FF5A", count: 12 },
  { label: "Pie & Bubble", color: "#FF8A5B", count: 8 },
  { label: "Statistical", color: "#6ED4C8", count: 9 },
  { label: "Histograms", color: "#8b5cf6", count: 8 },
  { label: "3D Charts", color: "#B8A6F2", count: 9 },
  { label: "Financial", color: "#FF6B8A", count: 8 },
  { label: "Contour & Heat", color: "#9BE564", count: 7 },
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
        background: "#F4F2EA",
        borderRadius: 10,
        border: "1px solid rgba(26,26,22,0.14)",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 14px",
          background: "#EAE7DA",
          borderBottom: "1px solid rgba(26,26,22,0.14)",
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
            fontFamily: "var(--gx-mono)",
            fontSize: 10,
            color: "#8A8A7C",
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
            color: "#8A8A7C",
            fontFamily: "var(--gx-mono)",
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
              fontFamily: "var(--gx-mono)",
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
                  background: "var(--gx-accent)",
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
                fontSize: 12,
                fontFamily: "var(--gx-mono)",
                color: "#8A8A7C",
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
        background: "#F4F2EA",
        borderRadius: 10,
        border: "1px solid rgba(26,26,22,0.14)",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#EAE7DA",
          borderBottom: "1px solid rgba(26,26,22,0.14)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontFamily: "var(--gx-mono)", fontSize: 10, color: "#6E6E62" }}
        >
          Select chart type
        </span>
        <span
          style={{ fontFamily: "var(--gx-mono)", fontSize: 12, color: "#8A8A7C" }}
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
              border: `1px solid ${i === highlighted ? cat.color + "50" : "rgba(26,26,22,0.14)"}`,
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
                background: i === highlighted ? cat.color : "rgba(26,26,22,0.20)",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: i === highlighted ? "#1A1A16" : "#6E6E62",
                  transition: "color 0.2s",
                }}
              >
                {cat.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#8A8A7C",
                  fontFamily: "var(--gx-mono)",
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
    { icon: "◇", label: "Rendering", detail: "Applying style & interactions" },
  ];
  const TOTAL = STEPS.length;

  /* The timers used to leak: nothing cleared them, so toggling `active` while
     scrolling stacked overlapping sequences that fought over `step`. The run
     also ended on the last item, which left "Rendering" on screen forever
     instead of ever reaching a finished state. */
  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setStep(0);
      for (let i = 0; i <= TOTAL; i++) {
        // one extra tick past the last row so it lands on "complete"
        timers.push(setTimeout(() => setStep(i + 1), 500 + i * 900));
      }
    };
    run();
    const loop = setInterval(run, 500 + (TOTAL + 1) * 900 + 2200);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, [active, TOTAL]);

  const complete = step > TOTAL;

  return (
    <div
      style={{
        background: "#F4F2EA",
        borderRadius: 10,
        border: "1px solid rgba(26,26,22,0.14)",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#EAE7DA",
          borderBottom: "1px solid rgba(26,26,22,0.14)",
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
            background: "var(--gx-accent)",
            display: "inline-block",
            animation:
              active && !complete ? "hiw-pulse 1.2s ease infinite" : "none",
          }}
        />
        <span
          style={{ fontFamily: "var(--gx-mono)", fontSize: 10, color: "#6E6E62" }}
        >
          {complete ? "Chart ready" : "Working…"}
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
                background: current ? "rgba(232,255,90,0.10)" : "transparent",
                borderRadius: 0,
                transition: "background 0.3s",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: done || current ? "var(--gx-accent-ink)" : "rgba(26,26,22,0.20)",
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
                    color: done || current ? "#1A1A16" : "#8A8A7C",
                    transition: "color 0.3s",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#8A8A7C",
                    fontFamily: "var(--gx-mono)",
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
                    background: "var(--gx-accent)",
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
          borderTop: "1px solid rgba(26,26,22,0.14)",
          background: "#EAE7DA",
        }}
      >
        <div
          style={{
            height: 4,
            background: "rgba(26,26,22,0.14)",
            borderRadius: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(step / STEPS.length) * 100}%`,
              background: "var(--gx-accent)",
              borderRadius: 0,
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
            style={{ fontSize: 12, color: "#8A8A7C", fontFamily: "var(--gx-mono)" }}
          >
            Generating chart
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--gx-accent)",
              fontFamily: "var(--gx-mono)",
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
/* The palette picker in the editor demo. First entry is the site palette so
   the default state matches the rest of the page; the others are deliberate
   families rather than stock framework hues. */
const PALETTES = [
  {
    id: "graphix",
    name: "Graphix",
    colors: ["#E8FF5A", "#FF8A5B", "#6ED4C8", "#B8A6F2"],
    accent: "#E8FF5A",
  },
  {
    id: "ember",
    name: "Ember",
    colors: ["#FF6B3D", "#FF9E4F", "#FFC96B", "#E8DF8A"],
    accent: "#FF6B3D",
  },
  {
    id: "tide",
    name: "Tide",
    colors: ["#3FA9B8", "#5FC7C0", "#8FE0C4", "#C2F0D8"],
    accent: "#3FA9B8",
  },
  {
    id: "moss",
    name: "Moss",
    colors: ["#4F7A22", "#7A9E33", "#A8C246", "#D2E07A"],
    accent: "#7A9E33",
  },
  {
    id: "dusk",
    name: "Dusk",
    colors: ["#5B4B8A", "#8A6FB0", "#B99CD1", "#E0C7E8"],
    accent: "#8A6FB0",
  },
  {
    id: "mono",
    name: "Mono",
    colors: ["#E8FF5A", "#F2F1EC", "#8A8A82", "#57574F"],
    accent: "#E8FF5A",
  },
];

const CHART_TYPES: {
  id: ChartType;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: "radar", label: "Radar", icon: "◈◈◈", desc: "Multi-dimension" },
  { id: "bar", label: "Bar", icon: "▊▊▊", desc: "Compare categories" },
  { id: "line", label: "Line", icon: "∿∿∿", desc: "Show trends over time" },
  { id: "scatter", label: "Scatter", icon: "∴∴∴", desc: "Find correlations" },
  { id: "area", label: "Area", icon: "▟▟▟", desc: "Cumulative totals" },
  { id: "pie", label: "Pie", icon: "◔◑◕", desc: "Part-to-whole" },
];

const THEMES = [
  { id: "dark", label: "Dark", bg: "#0C0C0A", plot: "#0C0C0A" },
  { id: "ink", label: "Ink", bg: "#14150F", plot: "#14150F" },
  { id: "slate", label: "Slate", bg: "#16161A", plot: "#16161A" },
  { id: "paper", label: "Paper", bg: "#F4F2EA", plot: "#F4F2EA" },
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
    font: { family: "DM Mono, monospace", color: tickColor, size: 10 },
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
          font: { size: 13, color: textColor, family: "DM Mono, monospace" },
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
          font-family: var(--gx-mono);
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
          font-family: var(--gx-mono);
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
          font-family: var(--gx-mono);
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
          font-family: var(--gx-mono);
          font-size: 11px;
          padding: 7px 10px;
          outline: none;
          transition: border-color 0.18s;
          box-sizing: border-box;
        }
        .axis-input:focus { border-color: rgba(255,255,255,0.25); }
        .range-slider {
          width: 100%;
          accent-color: var(--p-accent, #E8FF5A);
        }
        .export-btn {
          width: 100%;
          padding: 9px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          font-family: var(--gx-mono);
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
        .export-btn.primary { background: var(--gx-accent); border-color: var(--gx-accent); color: var(--gx-accent-ink); font-weight: 500; }
        .export-btn.primary:hover { opacity: 0.9; }
        .section-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 10px 0; }
        .seg-btn {
          flex: 1;
          padding: 5px;
          border-radius: 5px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-family: var(--gx-mono);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
        }
        .seg-btn.active { background: rgba(255,255,255,0.1); color: #fff; }
      `}</style>

      <div
        style={{
          background: "#14150F",
          borderRadius: 0,
          border: "1px solid var(--gx-line)",
          overflow: "hidden",
          boxShadow: "none",
          fontFamily: "var(--gx-mono)",
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
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
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
                          fontFamily: "var(--gx-mono)",
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
                            fontSize: 12,
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
                              <span style={{ fontSize: 12, color: pal.accent }}>
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
                              fontSize: 11,
                              color:
                                selectedTheme === i
                                  ? "#fff"
                                  : "rgba(255,255,255,0.3)",
                              fontFamily: "var(--gx-mono)",
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
                        <div style={{ fontSize: 12, opacity: 0.5 }}>{desc}</div>
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
                        fontSize: 12,
                        color: "rgba(255,255,255,0.3)",
                        marginBottom: 4,
                      }}
                    >
                      EMBED CODE
                    </div>
                    <code
                      style={{
                        fontSize: 12,
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
                    fontSize: 12,
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
                    fontSize: 12,
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "var(--gx-mono)",
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
                      fontFamily: "var(--gx-mono)",
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
            
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.2)",
                fontFamily: "var(--gx-mono)",
              }}
            >
              All changes update live · no save needed
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.15)",
              fontFamily: "var(--gx-mono)",
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
    color: "var(--gx-accent)",
    headline: "Type what you want to see",
    body: "Write a plain-English request, drop a CSV, or paste raw data. No SQL and no formulas.",
    extras: ["Natural language", "CSV / JSON upload", "Paste raw data"],
    component: StepPrompt,
  },
  {
    num: "02",
    tag: "Selection",
    color: "var(--gx-accent)",
    headline: "Pick a chart type, or let Graphix choose",
    body: "Browse the full catalogue, or skip the step and let Graphix pick the encoding that fits your data.",
    extras: ["140+ chart types", "16 categories", "AI auto-selection"],
    component: StepSelector,
  },
  {
    num: "03",
    tag: "Processing",
    color: "var(--gx-accent)",
    headline: "AI parses, maps and renders",
    body: "Every dimension of your data is mapped to a visual encoding, then rendered as a fully interactive chart in under three seconds.",
    extras: ["< 3 second render", "Auto axis labels", "Smart color selection"],
    component: StepProcessing,
  },
  {
    num: "04",
    tag: "Editing",
    color: "var(--gx-accent)",
    headline: "Customize with the visual editor",
    body: "Change chart types, swap palettes, adjust axes and add annotations, with the preview redrawing as you go.",
    extras: [
      "Full chart editor",
      "12 color palettes",
      "Export PNG · SVG · JPEG",
    ],
    component: StepChartEditor,
  },
];

/* Each row drives its own demo. Previously a single scroll-spy picked one
   "active" step and the other three sat frozen — fine when they were dimmed
   to 40%, obviously broken now that they're all at full strength. */
function StepRow({
  step,
  isLast,
}: {
  step: (typeof STEPS)[number];
  isLast: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "-12% 0px -12% 0px", threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Comp = step.component;

  return (
    <article
      ref={ref}
      className={`hiw-step${inView ? " is-active" : ""}${isLast ? " is-last" : ""}`}
    >
      <div className="hiw-rail">
        <span className="hiw-rail-num">{step.num}</span>
      </div>

      <div className="hiw-copy">
        <h3
          style={{
            fontFamily: "var(--gx-display)",
            fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)",
            fontWeight: 400,
            color: "var(--gx-fg)",
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            margin: "0 0 14px",
          }}
        >
          {step.headline}
        </h3>
        <p
          style={{
            fontSize: 16,
            color: "var(--gx-fg-muted)",
            lineHeight: 1.6,
            margin: "0 0 22px",
            maxWidth: 400,
          }}
        >
          {step.body}
        </p>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            borderTop: "1px solid var(--gx-line)",
          }}
        >
          {step.extras.map((e) => (
            <li
              key={e}
              style={{
                fontFamily: "var(--gx-mono)",
                fontSize: 13,
                color: "var(--gx-fg-faint)",
                padding: "9px 0",
                borderBottom: "1px solid var(--gx-line)",
              }}
            >
              {e}
            </li>
          ))}
        </ul>
      </div>

      <div className="hiw-visual">
        <Comp active={inView} />
      </div>
    </article>
  );
}

// ─── Main ──────────────────────────────────────────────────────
export default function HowItWorks() {
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


  return (
    <>
      <style>{`
        @keyframes hiw-spin  { to { transform: rotate(360deg); } }
        @keyframes hiw-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

        .hiw-inner-wrap {
          max-width: 1160px;
          margin: 0 auto;
          padding: 96px 24px 88px;
          position: relative;
        }

        /* Rail | copy | visual. No alternating sides — the eye keeps one path. */
        .hiw-step {
          display: grid;
          grid-template-columns: 72px minmax(0, 0.85fr) minmax(0, 1.15fr);
          gap: 0 40px;
          padding: 56px 0;
          border-top: 1px solid var(--gx-line);
          align-items: start;
        }
        .hiw-step:first-child { border-top: none; }

        /* The rail: a serif numeral with a hairline running to the next step */
        .hiw-rail {
          position: relative;
          align-self: stretch;
          display: flex;
          justify-content: center;
        }
        .hiw-rail-num {
          font-family: var(--gx-display);
          font-weight: 400;
          font-size: 34px;
          line-height: 1;
          color: var(--gx-fg-faint);
          transition: color 0.35s ease;
          position: relative;
          z-index: 1;
          background: var(--gx-bg);
          padding-bottom: 12px;
        }
        .hiw-step.is-active .hiw-rail-num { color: var(--gx-accent); }
        .hiw-rail::after {
          content: "";
          position: absolute;
          top: 6px; bottom: -56px; left: 50%;
          width: 1px;
          background: var(--gx-line);
        }
        .hiw-step.is-last .hiw-rail::after { display: none; }

        .hiw-copy { padding-top: 2px; }
        .hiw-visual { min-width: 0; }

        @media (max-width: 900px) {
          .hiw-step {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 44px 0;
          }
          .hiw-rail { justify-content: flex-start; }
          .hiw-rail::after { display: none; }
          .hiw-rail-num { font-size: 26px; padding-bottom: 0; }
          .hiw-inner-wrap { padding: 64px 18px 56px; }
        }
      `}</style>

      <section
        id="how-it-works"
        style={{
          background: "#0C0C0A",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <span
                style={{ height: 1, width: 32, background: "var(--gx-line-strong)" }}
              />
              <span
                style={{
                  fontFamily: "var(--gx-mono)",
                  fontSize: 12,
                  color: "var(--gx-fg-faint)",
                }}
              >
                01 / how it works
              </span>
              <span
                style={{ height: 1, width: 32, background: "var(--gx-line-strong)" }}
              />
            </div>
            <h2
              style={{
                fontFamily: "var(--gx-display)",
                fontSize: "clamp(2.4rem, 4.8vw, 3.8rem)",
                fontWeight: 400,
                color: "var(--gx-fg)",
                letterSpacing: "-0.015em",
                lineHeight: 1.08,
                margin: "0 0 18px",
              }}
            >
              From prompt to chart in{" "}
              <span style={{ fontStyle: "italic" }}>four steps.</span>
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--gx-fg-muted)",
                maxWidth: 440,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Scroll through each step to
              see it live.
            </p>
          </div>

          {/* Steps — no tab strip: the rail and the scroll position already
              say where you are, a third indicator was just noise. */}
          <div>
            {STEPS.map((s, i) => (
              <StepRow key={i} step={s} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
