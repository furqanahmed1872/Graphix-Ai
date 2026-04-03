"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ChartEditor from "./ChartEditor";
import { useAppStore } from "@/store/appStore";
import { apiSaveChart } from "@/lib/api";
declare global {
  interface Window {
    Plotly: any;
    // FIX: Per-chart storage keyed by message ID.
    // Previously a single __graphixCurrentData was shared globally — so
    // toolbar edits to chart #3 (3D) would overwrite the state for chart #1,
    // and when you selected chart #1 and said "make it red", GraphApp would
    // read chart #3's data as context and send THAT to the AI.
    __graphixChartData: Record<string, { data: any[]; layout: any }>;
  }
}

interface Message {
  id: string;
  from: "user" | "ai";
  content: any;
  status?: string;
}

const PALETTE = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
];
function stableColor(i: number) {
  return PALETTE[i % PALETTE.length];
}

function detectType(traces: any[]): string {
  if (!traces?.length) return "bar";
  const t = traces[0];
  const type = (t.type || "").toLowerCase();
  const mode = (t.mode || "").toLowerCase();
  if (type === "heatmap") return "heatmap";
  if (type === "waterfall") return "waterfall";
  if (type === "scatterpolar" || type === "barpolar") return "radar";
  if (type === "pie") return t.hole ? "donut" : "pie";
  if (type === "scatter3d") return "scatter3d";
  if (type === "surface") return "surface";
  if (type === "funnel") return "funnel";
  if (type === "bar") return "bar";
  if (type === "scatter") {
    if (
      mode.includes("lines") &&
      (t.fill === "tonexty" || t.fill === "tozeroy")
    )
      return "area";
    if (mode.includes("lines")) return "line";
    return "scatter";
  }
  if (type === "histogram") return "histogram";
  if (type === "box") return "box";
  if (type === "violin") return "violin";
  return type || "bar";
}

const PALETTE_FULL = [
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
  "#fb923c",
  "#a855f7",
  "#22d3ee",
  "#e11d48",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0284c7",
];

function getPaletteOffset(data: any[]): number {
  try {
    const name = data[0]?.name || "";
    const firstY = data[0]?.y?.[0] ?? data[0]?.x?.[0] ?? 0;
    const len = data[0]?.y?.length ?? data[0]?.x?.length ?? 1;
    let hash = len + Math.round(Math.abs(Number(firstY)));
    for (let k = 0; k < name.length; k++) hash += name.charCodeAt(k);
    return hash % PALETTE_FULL.length;
  } catch {
    return 0;
  }
}

function paletteColor(traceIndex: number, offset: number) {
  return PALETTE_FULL[(traceIndex + offset) % PALETTE_FULL.length];
}

function hasAIColor(trace: any): boolean {
  if (trace.marker?.color && trace.marker.color !== "undefined") return true;
  if (trace.line?.color && trace.line.color !== "undefined") return true;
  return false;
}

const THREED_TYPES = new Set([
  "scatter3d",
  "surface",
  "mesh3d",
  "cone",
  "streamtube",
  "isosurface",
  "volume",
]);
function is3DChart(traces: any[]): boolean {
  return (
    traces?.some((t: any) => THREED_TYPES.has((t.type || "").toLowerCase())) ??
    false
  );
}

function preprocessTraces(
  data: any[],
  layout: any,
): { data: any[]; layout: any } {
  if (!data?.length) return { data, layout };
  const chartType = detectType(data);
  const offset = getPaletteOffset(data);
  const hasCustomColors = data.some((trace) => hasAIColor(trace));

  if (chartType === "line" || chartType === "area" || chartType === "scatter") {
    return {
      data: data.map((trace, i) => {
        const clr = paletteColor(i, offset);
        return {
          ...trace,
          type: "scatter",
          mode:
            trace.mode ||
            (chartType === "scatter" ? "markers" : "lines+markers"),
          marker: {
            ...(trace.marker || {}),
            color: hasCustomColors
              ? trace.marker?.color
              : trace.marker?.color || clr,
            size: trace.marker?.size || (chartType === "scatter" ? 9 : 7),
            opacity: 0.9,
            line: { color: "rgba(255,255,255,0.15)", width: 1 },
          },
          line: {
            ...(trace.line || {}),
            color: hasCustomColors
              ? trace.line?.color
              : trace.line?.color || clr,
            width: trace.line?.width || 2.5,
          },
          fillcolor: trace.fill
            ? (trace.line?.color || trace.marker?.color || clr) + "22"
            : undefined,
        };
      }),
      layout,
    };
  }

  if (chartType === "heatmap") {
    return {
      data: [
        {
          ...data[0],
          type: "heatmap",
          colorscale: data[0].colorscale || "Viridis",
          showscale: true,
          hoverongaps: false,
        },
      ],
      layout: { ...layout, xaxis: { ...(layout.xaxis || {}), side: "bottom" } },
    };
  }

  if (chartType === "waterfall") {
    const trace = data[0];
    const yVals: number[] = trace.y || trace.values || [];
    const measure =
      trace.measure ||
      yVals.map((_: any, idx: number) =>
        idx === 0
          ? "absolute"
          : idx === yVals.length - 1
            ? "total"
            : "relative",
      );
    return {
      data: [
        {
          ...trace,
          type: "waterfall",
          measure,
          connector: {
            line: { color: "rgba(255,255,255,0.08)", width: 1, dash: "dot" },
          },
          increasing: { marker: { color: "#10b981" } },
          decreasing: { marker: { color: "#ef4444" } },
          totals: { marker: { color: "#6366f1" } },
          textposition: "outside",
          text: trace.text || undefined,
        },
      ],
      layout,
    };
  }

  if (chartType === "radar") {
    return {
      data: data.map((trace, i) => {
        const clr = paletteColor(i, offset);
        return {
          ...trace,
          type: "scatterpolar",
          fill: trace.fill || "toself",
          marker: {
            color: hasCustomColors
              ? trace.marker?.color
              : trace.marker?.color || clr,
            size: 5,
          },
          line: {
            color: hasCustomColors
              ? trace.line?.color
              : trace.line?.color || clr,
            width: 2,
          },
        };
      }),
      layout: {
        ...layout,
        polar: {
          ...(layout.polar || {}),
          radialaxis: {
            visible: true,
            range: [0, 100],
            ...(layout.polar?.radialaxis || {}),
          },
          angularaxis: { ...(layout.polar?.angularaxis || {}) },
        },
      },
    };
  }

  return {
    data: data.map((trace, i) => {
      const clr = paletteColor(i, offset);
      const isPie = trace.type === "pie" || trace.type === "donut";
      const isBar = trace.type === "bar";
      const barColors =
        isBar && data.length === 1 && !hasCustomColors
          ? (trace.x || trace.y || []).map((_: any, idx: number) =>
              paletteColor(idx, offset),
            )
          : undefined;
      const isSpecial = [
        "histogram2dcontour",
        "histogram2d",
        "contour",
        "densitymapbox",
        "choropleth",
        "scattergeo",
        "parcats",
        "parcoords",
        "sankey",
        "treemap",
        "sunburst",
        "icicle",
        "funnelarea",
        "indicator",
        "table",
        "ohlc",
        "candlestick",
        "scattermapbox",
      ].includes((trace.type || "").toLowerCase());
      if (isSpecial) return trace;
      return {
        ...trace,
        marker: {
          ...(trace.marker || {}),
          color: hasCustomColors
            ? trace.marker?.color
            : isPie
              ? PALETTE_FULL
              : barColors || trace.marker?.color || clr,
          size: trace.marker?.size || 7,
          line: { color: "rgba(255,255,255,0.1)", width: isPie ? 2 : 1 },
        },
        line: {
          ...(trace.line || {}),
          color: hasCustomColors ? trace.line?.color : trace.line?.color || clr,
          width: trace.line?.width || 2.5,
        },
        fillcolor: trace.fill ? (trace.line?.color || clr) + "22" : undefined,
      };
    }),
    layout,
  };
}

const SUBPLOT_TYPES = new Set([
  "histogram2dcontour",
  "histogram2d",
  "contour",
  "densitymapbox",
  "choropleth",
  "scattergeo",
  "parcats",
  "parcoords",
  "sankey",
  "treemap",
  "sunburst",
  "icicle",
  "funnelarea",
  "indicator",
  "table",
  "ohlc",
  "candlestick",
  "scattermapbox",
]);
function isSubplotChart(data: any[], base: any): boolean {
  return (
    Object.keys(base || {}).some((k) => /^[xy]axis[2-9]/.test(k)) ||
    (data?.some((t: any) => SUBPLOT_TYPES.has((t.type || "").toLowerCase())) ??
      false)
  );
}

function darkAxis(base: any, extra: Record<string, any> = {}) {
  return {
    ...base,
    tickfont: { size: 10, color: "rgba(255,255,255,0.3)" },
    gridcolor: "rgba(255,255,255,0.04)",
    linecolor: "rgba(255,255,255,0.06)",
    zerolinecolor: "rgba(255,255,255,0.06)",
    automargin: true,
    ...extra,
  };
}

function buildLayout(base: any, chartType?: string, rawData?: any[]) {
  const isRadar = chartType === "radar";
  const isHeatmap = chartType === "heatmap";
  if (isSubplotChart(rawData || [], base)) {
    const result: any = {
      ...base,
      autosize: true,
      title: undefined,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        color: "rgba(255,255,255,0.45)",
        size: 11,
        family: "DM Mono, monospace",
      },
    };
    Object.keys({ ...base, xaxis: 1, yaxis: 1, xaxis2: 1, yaxis2: 1 }).forEach(
      (k) => {
        if (/^[xy]axis\d*$/.test(k))
          result[k] = {
            ...(base[k] || {}),
            tickfont: { size: 10, color: "rgba(255,255,255,0.3)" },
            gridcolor: "rgba(255,255,255,0.04)",
            linecolor: "rgba(255,255,255,0.06)",
            zerolinecolor: "rgba(255,255,255,0.06)",
          };
      },
    );
    result.geo = { ...(base.geo || {}), bgcolor: "rgba(0,0,0,0)" };
    return result;
  }


  const result: any = {
    ...base,
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    title: undefined,
    font: {
      color: "rgba(255,255,255,0.45)",
      size: 11,
      family: "DM Mono, monospace",
    },
    legend: {
      ...(base.legend || {}),
      bgcolor: "rgba(0,0,0,0.5)",
      bordercolor: "rgba(255,255,255,0.07)",
      borderwidth: 1,
      font: { size: 11, color: "rgba(255,255,255,0.6)" },
      orientation: "h",
      x: 0.5,
      y: isRadar ? -0.15 : -0.22,
      xanchor: "center",
      yanchor: "top",
    },
    margin: { t: 10, l: 55, r: 24, b: 72 },
    hovermode: "closest",
  };
  if (!isRadar) {
    result.xaxis = darkAxis(base.xaxis || {}, {
      tickangle: isHeatmap ? -30 : 0,
      showgrid: !isHeatmap,
    });
    result.yaxis = darkAxis(base.yaxis || {}, { showgrid: !isHeatmap });
  }
  if (isRadar)
    result.polar = {
      ...(base.polar || {}),
      bgcolor: "rgba(0,0,0,0)",
      radialaxis: {
        visible: true,
        gridcolor: "rgba(255,255,255,0.07)",
        tickfont: { size: 9, color: "rgba(255,255,255,0.3)" },
        ...(base.polar?.radialaxis || {}),
      },
      angularaxis: {
        gridcolor: "rgba(255,255,255,0.07)",
        tickfont: { size: 10, color: "rgba(255,255,255,0.4)" },
        ...(base.polar?.angularaxis || {}),
      },
    };
  return result;
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
const CONVERT_TYPES = [
  {
    id: "bar",
    label: "Bar",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
  },
  {
    id: "line",
    label: "Line",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <polyline points="3 17 9 11 13 15 21 7" />
      </svg>
    ),
  },
  {
    id: "scatter",
    label: "Scatter",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="7" r="2" />
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    id: "area",
    label: "Area",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <polyline points="3 18 9 10 13 14 21 6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    id: "pie",
    label: "Pie",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    id: "histogram",
    label: "Histo",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="2" y="9" width="4" height="12" rx="1" />
        <rect x="7" y="5" width="4" height="16" rx="1" />
        <rect x="12" y="3" width="4" height="18" rx="1" />
        <rect x="17" y="7" width="4" height="14" rx="1" />
      </svg>
    ),
  },
];
const PALETTES_TB = [
  {
    id: "vivid",
    colors: ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"],
  },
  {
    id: "neon",
    colors: ["#00f5ff", "#bf5fff", "#ff006e", "#ffbe0b", "#00e676", "#ff4081"],
  },
  {
    id: "ocean",
    colors: ["#06b6d4", "#0ea5e9", "#38bdf8", "#0284c7", "#7dd3fc", "#bae6fd"],
  },
  {
    id: "fire",
    colors: ["#f97316", "#ef4444", "#eab308", "#f43f5e", "#fb923c", "#fbbf24"],
  },
  {
    id: "forest",
    colors: ["#4ade80", "#86efac", "#34d399", "#a3e635", "#6ee7b7", "#bef264"],
  },
  {
    id: "galaxy",
    colors: ["#a78bfa", "#c084fc", "#818cf8", "#e879f9", "#7dd3fc", "#f0abfc"],
  },
];

function Divider() {
  return (
    <div
      style={{
        width: 28,
        height: 1,
        background: "rgba(255,255,255,0.07)",
        margin: "2px auto",
      }}
    />
  );
}

function TbBtn({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: `1px solid ${active ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.07)"}`,
        background: active ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.03)",
        color: active ? "#22d3ee" : "rgba(255,255,255,0.45)",
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.color =
            "rgba(255,255,255,0.8)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.03)";
          (e.currentTarget as HTMLElement).style.color =
            "rgba(255,255,255,0.45)";
        }
      }}
    >
      {children}
    </button>
  );
}

function InlineToolbar({
  divRef,
  messageId,
  onOpenEditor,
  onResetData,
  onSaveChart,
}: {
  divRef: React.RefObject<any>;
  messageId: string;
  onOpenEditor: () => void;
  onResetData: () => void;
  onSaveChart?: () => Promise<void>;
}) {
  const [gridOn, setGridOn] = useState(true);
  const [legendOn, setLegendOn] = useState(true);
  const [labelOn, setLabelOn] = useState(false);
  const [bgLight, setBgLight] = useState(false);
  const [activeConvert, setActiveConvert] = useState<string | null>(null);
  const [activePalette, setActivePalette] = useState<string | null>(null);
  const [showPalettes, setShowPalettes] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FIX: Save toolbar edits under the specific message ID so GraphApp can
  // look up edits for chart #1 without getting contaminated by chart #3.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const syncPerChartData = useCallback(() => {
    if (!divRef.current || !messageId) return;
    if (!window.__graphixChartData) window.__graphixChartData = {};
    window.__graphixChartData[messageId] = {
      data: (divRef.current as any).data,
      layout: (divRef.current as any).layout,
    };
    (window as any).__graphixCurrentData = (divRef.current as any).data;
    (window as any).__graphixCurrentLayout = (divRef.current as any).layout;
  }, [divRef, messageId]);

  const openPopup = (which: "convert" | "palette") => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPopupPos({ top: r.top, left: r.left - 168 });
    }
    if (which === "convert") {
      setShowConvert((v) => !v);
      setShowPalettes(false);
    } else {
      setShowPalettes((v) => !v);
      setShowConvert(false);
    }
  };

  const toggleGrid = () => {
    if (!divRef.current || !window.Plotly) return;
    const n = !gridOn;
    setGridOn(n);
    window.Plotly.relayout(divRef.current, {
      "xaxis.showgrid": n,
      "yaxis.showgrid": n,
      "xaxis.zeroline": n,
      "yaxis.zeroline": n,
    } as any);
    setTimeout(syncPerChartData, 50);
  };
  const toggleLegend = () => {
    if (!divRef.current || !window.Plotly) return;
    const n = !legendOn;
    setLegendOn(n);
    window.Plotly.relayout(divRef.current, { showlegend: n } as any);
    setTimeout(syncPerChartData, 50);
  };
  const toggleLabels = () => {
    if (!divRef.current || !window.Plotly) return;
    const n = !labelOn;
    setLabelOn(n);
    (divRef.current.data ?? []).forEach((trace: any, i: number) => {
      if (n)
        window.Plotly.restyle(
          divRef.current,
          {
            text: [(trace.y ?? []).map((v: any) => String(v))],
            texttemplate: "%{y}",
            textposition: "outside",
            cliponaxis: false,
          } as any,
          [i],
        );
      else
        window.Plotly.restyle(
          divRef.current,
          { text: [null], texttemplate: "", textposition: "none" } as any,
          [i],
        );
    });
    setTimeout(syncPerChartData, 50);
  };
  const toggleBg = () => {
    if (!divRef.current || !window.Plotly) return;
    const n = !bgLight;
    setBgLight(n);
    window.Plotly.relayout(divRef.current, {
      paper_bgcolor: n ? "#ffffff" : "rgba(0,0,0,0)",
      plot_bgcolor: n ? "#ffffff" : "rgba(0,0,0,0)",
      "font.color": n ? "#333" : "rgba(255,255,255,0.45)",
      "xaxis.tickfont": { color: n ? "#666" : "rgba(255,255,255,0.3)" },
      "yaxis.tickfont": { color: n ? "#666" : "rgba(255,255,255,0.3)" },
      "xaxis.gridcolor": n ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.04)",
      "yaxis.gridcolor": n ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.04)",
    } as any);
    setTimeout(syncPerChartData, 50);
  };
  const resetZoom = () => {
    if (!divRef.current || !window.Plotly) return;
    window.Plotly.relayout(divRef.current, {
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    } as any);
  };
  const applyPalette = (pal: (typeof PALETTES_TB)[0]) => {
    if (!divRef.current || !window.Plotly) return;
    setActivePalette(pal.id);
    setShowPalettes(false);
    (divRef.current.data ?? []).forEach((trace: any, i: number) => {
      const c = pal.colors[i % pal.colors.length];
      if (trace.type === "pie")
        window.Plotly.restyle(
          divRef.current,
          { "marker.colors": [[...pal.colors]] } as any,
          [i],
        );
      else
        window.Plotly.restyle(
          divRef.current,
          { "marker.color": [c], "line.color": [c] } as any,
          [i],
        );
    });
    setTimeout(syncPerChartData, 50);
  };
  const convertChart = (type: (typeof CONVERT_TYPES)[0]) => {
    if (!divRef.current || !window.Plotly) return;
    setActiveConvert(type.id);
    setShowConvert(false);
    const typeMap: Record<string, string> = {
      bar: "bar",
      line: "scatter",
      scatter: "scatter",
      pie: "pie",
      area: "scatter",
      histogram: "histogram",
    };
    const modeMap: Record<string, string> = {
      line: "lines",
      scatter: "markers",
      area: "lines",
    };
    (divRef.current.data ?? []).forEach((_: any, i: number) => {
      const u: any = { type: [typeMap[type.id]] };
      if (modeMap[type.id]) u.mode = [modeMap[type.id]];
      if (type.id === "area") u.fill = ["tozeroy"];
      window.Plotly.restyle(divRef.current, u, [i]);
    });
    setTimeout(syncPerChartData, 50);
  };
  const download = async (fmt: string) => {
    if (!divRef.current || !window.Plotly) return;
    setDownloading(true);
    try {
      await window.Plotly.downloadImage(divRef.current, {
        format: fmt,
        width: 1400,
        height: 800,
        filename: "chart",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!onSaveChart || saving === "saving" || saving === "saved") return;
    setSaving("saving");
    try {
      await onSaveChart();
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 2500);
    } catch {
      setSaving("error");
      setTimeout(() => setSaving("idle"), 2500);
    }
  };


  
  return (
    <div
      className="my-auto"
      style={{
        width: 48,
        background: "#09090b",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 6px",
        gap: 4,
        flexShrink: 0,
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      <button
        onClick={onOpenEditor}
        title="Open in editor"
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          border: "1px solid rgba(6,182,212,0.35)",
          background:
            "linear-gradient(135deg,rgba(6,182,212,0.2),rgba(6,182,212,0.08))",
          color: "#06b6d4",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
        </svg>
      </button>
      <Divider />
      <div ref={btnRef}>
        <TbBtn
          onClick={() => openPopup("convert")}
          title="Convert chart type"
          active={showConvert}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M7 16V4m0 0L3 8m4-4 4 4" />
            <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
          </svg>
        </TbBtn>
      </div>
      <TbBtn
        onClick={() => openPopup("palette")}
        title="Color palette"
        active={showPalettes}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
        >
          {(
            PALETTES_TB.find((p) => p.id === activePalette) || PALETTES_TB[0]
          ).colors
            .slice(0, 4)
            .map((c, i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 2,
                  background: c,
                  display: "block",
                }}
              />
            ))}
        </div>
      </TbBtn>
      <Divider />
      <TbBtn
        onClick={toggleGrid}
        title={gridOn ? "Hide grid" : "Show grid"}
        active={gridOn}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </TbBtn>
      <TbBtn
        onClick={toggleLegend}
        title={legendOn ? "Hide legend" : "Show legend"}
        active={legendOn}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="9" y2="6" />
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <line x1="3" y1="12" x2="9" y2="12" />
          <circle cx="6" cy="12" r="2" fill="currentColor" />
          <line x1="12" y1="6" x2="21" y2="6" />
          <line x1="12" y1="12" x2="21" y2="12" />
        </svg>
      </TbBtn>
      <TbBtn
        onClick={toggleLabels}
        title={labelOn ? "Hide labels" : "Show labels"}
        active={labelOn}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      </TbBtn>
      <TbBtn
        onClick={toggleBg}
        title={bgLight ? "Dark bg" : "Light bg"}
        active={bgLight}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
        </svg>
      </TbBtn>
      <Divider />
      <TbBtn onClick={resetZoom} title="Reset zoom">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </TbBtn>
      <TbBtn onClick={onResetData} title="Reset to original">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
        </svg>
      </TbBtn>
      <Divider />
      {(["png", "svg", "jpeg"] as const).map((fmt) => (
        <TbBtn
          key={fmt}
          onClick={() => download(fmt)}
          title={`Download ${fmt.toUpperCase()}`}
        >
          {downloading ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <span
              style={{
                fontSize: 8,
                fontFamily: "DM Mono,monospace",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {fmt}
            </span>
          )}
        </TbBtn>
      ))}
      <TbBtn
        onClick={handleSave}
        title={
          !onSaveChart
            ? "Sign in to save"
            : saving === "saving"
              ? "Saving…"
              : saving === "saved"
                ? "Saved ✓"
                : saving === "error"
                  ? "Save failed"
                  : "Save to My Graphs"
        }
        active={saving === "saved"}
      >
        {saving === "saving" ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : saving === "saved" ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        )}
      </TbBtn>
      {(showConvert || showPalettes) && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => {
              setShowConvert(false);
              setShowPalettes(false);
            }}
          />
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: popupPos.top,
              left: popupPos.left,
              zIndex: 9999,
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: 8,
              minWidth: 160,
            }}
          >
            {showConvert && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 4,
                }}
              >
                {CONVERT_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => convertChart(ct)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      padding: "6px 4px",
                      borderRadius: 7,
                      border: `1px solid ${activeConvert === ct.id ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.08)"}`,
                      background:
                        activeConvert === ct.id
                          ? "rgba(6,182,212,0.1)"
                          : "rgba(255,255,255,0.03)",
                      color:
                        activeConvert === ct.id
                          ? "#22d3ee"
                          : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      fontSize: 9,
                      fontFamily: "DM Mono,monospace",
                    }}
                  >
                    {ct.icon}
                    <span>{ct.label}</span>
                  </button>
                ))}
              </div>
            )}
            {showPalettes && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {PALETTES_TB.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => applyPalette(pal)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 8px",
                      borderRadius: 7,
                      border: `1px solid ${activePalette === pal.id ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.06)"}`,
                      background:
                        activePalette === pal.id
                          ? "rgba(6,182,212,0.08)"
                          : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", gap: 2 }}>
                      {pal.colors.slice(0, 5).map((c, i) => (
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
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: "DM Mono,monospace",
                        textTransform: "capitalize",
                      }}
                    >
                      {pal.id}
                    </span>
                    {activePalette === pal.id && (
                      <span
                        style={{
                          marginLeft: "auto",
                          color: "#22d3ee",
                          fontSize: 10,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PremiumTooltip({
  tooltipRef,
}: {
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={tooltipRef}
      style={{
        position: "absolute",
        zIndex: 99999,
        pointerEvents: "none",
        width: 210,
        display: "none",
      }}
    >
      <style>{`@keyframes ttIn{from{opacity:0;transform:scale(0.93) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}#main-chart-div rect.bg{fill:transparent!important}`}</style>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.18),0 1.5px 6px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.07)",
          overflow: "hidden",
          fontFamily: "Inter,system-ui,sans-serif",
          animation: "ttIn 0.13s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div id="tt-bar" style={{ height: 3 }} />
        <div style={{ padding: "11px 13px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 7,
            }}
          >
            <span
              id="tt-dot"
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            <span
              id="tt-name"
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#9ca3af",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            />
          </div>
          <div
            id="tt-val"
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <span
              id="tt-delta"
              style={{
                display: "none",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 6,
                padding: "2px 7px",
              }}
            />
            <span
              id="tt-label"
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 85,
                textAlign: "right",
                marginLeft: "auto",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SingleChartArea({
  messages,
  selectedAiId,
  onSaveChart,
}: {
  messages: Message[];
  selectedAiId?: string | null;
  onSaveChart?: (
    chartConfig: { data: any[]; layout: any },
    title: string,
    prompt: string,
  ) => Promise<void>;
  }) {
  
  
  const divRef = useRef<any>(null);
  const cardRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState<Message | null>(null);
  const originalDataRef = useRef<any>(null);
  const originalLayoutRef = useRef<any>(null);
  const lastRenderedIdRef = useRef<string | null>(null);
  const lastWas3DRef = useRef<boolean>(false);

  const aiMsg = selectedAiId
    ? (messages.find((m) => m.id === selectedAiId && m.from === "ai") ??
      messages.filter((m) => m.from === "ai").at(-1))
    : messages.filter((m) => m.from === "ai").at(-1);
  
  const handleSaveCurrentChart = onSaveChart
    ? async () => {
        const perChartData = (window as any).__graphixChartData?.[
          aiMsg?.id ?? ""
        ];
        const data = perChartData?.data ?? aiMsg?.content?.data ?? [];
        const layout = perChartData?.layout ?? aiMsg?.content?.layout ?? {};
        const title =
          typeof layout.title === "string"
            ? layout.title
            : (layout.title?.text ?? "Untitled Chart");
        await onSaveChart({ data, layout }, title, title);
      }
    : undefined;

  const showTooltip = useCallback((mx: number, my: number, data: any) => {
    const el = tooltipRef.current;
    if (!el) return;
    const CARD_W = 210,
      CARD_H = 120,
      GAP = 12;
    const cardRect = cardRef.current?.getBoundingClientRect();
    const rx = cardRect ? mx - cardRect.left : mx,
      ry = cardRect ? my - cardRect.top : my;
    let left = rx - CARD_W - GAP,
      top = ry - CARD_H / 2;
    if (left < 8) left = rx + GAP;
    if (cardRect && left + CARD_W > cardRect.width - 8)
      left = cardRect.width - CARD_W - 8;
    if (top < 8) top = 8;
    if (cardRect && top + CARD_H > cardRect.height - 8)
      top = cardRect.height - CARD_H - 8;
    el.style.left = left + "px";
    el.style.top = top + "px";
    el.style.display = "block";
    const bar = el.querySelector("#tt-bar") as HTMLElement,
      dot = el.querySelector("#tt-dot") as HTMLElement,
      name = el.querySelector("#tt-name") as HTMLElement,
      val = el.querySelector("#tt-val") as HTMLElement,
      delta = el.querySelector("#tt-delta") as HTMLElement,
      label = el.querySelector("#tt-label") as HTMLElement;
    if (bar) bar.style.background = data.color;
    if (dot) dot.style.background = data.color;
    if (name) name.textContent = data.seriesName;
    const n = Number(data.value);
    const valStr = isNaN(n)
      ? String(data.value)
      : Math.abs(n) >= 1_000_000
        ? (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
        : Math.abs(n) >= 1_000
          ? (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
          : n % 1 === 0
            ? n.toLocaleString()
            : n.toFixed(2);
    if (val) val.textContent = valStr;
    if (label) label.textContent = data.label;
    if (delta) {
      const hd = data.prevValue != null && data.prevValue !== 0;
      if (hd) {
        const pct = ((n - data.prevValue) / Math.abs(data.prevValue)) * 100,
          pos = pct >= 0;
        delta.style.display = "inline-flex";
        delta.style.color = pos ? "#10b981" : "#ef4444";
        delta.style.background = pos
          ? "rgba(16,185,129,0.09)"
          : "rgba(239,68,68,0.09)";
        delta.innerHTML = `${pos ? "▲" : "▼"} ${Math.abs(pct).toFixed(2)}% <span style="font-weight:400;color:#9ca3af;font-size:10px;margin-left:2px">vs prev</span>`;
      } else {
        delta.style.display = "none";
      }
    }
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  }, []);

  useEffect(() => {
    let lastData: any = null;
    const track = (e: MouseEvent) => {
      if (tooltipRef.current?.style.display !== "none" && lastData)
        showTooltip(e.clientX, e.clientY, lastData);
    };
    (tooltipRef as any)._setData = (d: any) => {
      lastData = d;
    };
    window.addEventListener("mousemove", track, { passive: true });
    return () => window.removeEventListener("mousemove", track);
  }, [showTooltip]);

  useEffect(() => {
    if (
      !aiMsg ||
      aiMsg.status !== "success" ||
      aiMsg.content?.error ||
      !aiMsg.content?.data
    )
      return;
    setAiMessage(aiMsg);

    const tryRender = () => {
      if (!window.Plotly || !divRef.current) {
        setTimeout(tryRender, 100);
        return;
      }

      const rawData = aiMsg.content.data || [];
      const rawLayout = aiMsg.content.layout || {};
      const chartType = detectType(rawData);
      const currentIs3D = is3DChart(rawData);
      const isNewChart = lastRenderedIdRef.current !== aiMsg.id;
      const needsPurge = isNewChart && (lastWas3DRef.current || currentIs3D);

      if (needsPurge) window.Plotly.purge(divRef.current);

      const { data, layout: pl } = preprocessTraces(rawData, rawLayout);
      const layout = buildLayout(pl, chartType, rawData);
      if (!currentIs3D)
        layout.hoverlabel = {
          bgcolor: "rgba(0,0,0,0)",
          bordercolor: "rgba(0,0,0,0)",
          font: { color: "rgba(0,0,0,0)", size: 1 },
        };

      originalDataRef.current = JSON.parse(JSON.stringify(data));
      originalLayoutRef.current = JSON.parse(JSON.stringify(layout));
      (window as any).__graphixOriginalData = JSON.parse(JSON.stringify(data));
      (window as any).__graphixOriginalLayout = JSON.parse(
        JSON.stringify(layout),
      );

      window.dispatchEvent(new CustomEvent("graphix-new-chart"));
      window.Plotly.react(divRef.current, data, layout, {
        responsive: true,
        displayModeBar: false,
        scrollZoom: false,
      });

      lastRenderedIdRef.current = aiMsg.id;
      lastWas3DRef.current = currentIs3D;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // FIX: Seed per-chart store immediately on render so GraphApp always
      // reads the correct chart's data, keyed by this chart's message ID.
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (!window.__graphixChartData) window.__graphixChartData = {};
      window.__graphixChartData[aiMsg.id] = { data, layout };
      (window as any).__graphixCurrentData = data;
      (window as any).__graphixCurrentLayout = layout;

      const syncPerChart = () => {
        if (!divRef.current) return;
        if (!window.__graphixChartData) window.__graphixChartData = {};
        window.__graphixChartData[aiMsg.id] = {
          data: (divRef.current as any).data,
          layout: (divRef.current as any).layout,
        };
        (window as any).__graphixCurrentData = (divRef.current as any).data;
        (window as any).__graphixCurrentLayout = (divRef.current as any).layout;
      };
      divRef.current.on("plotly_restyle", syncPerChart);
      divRef.current.on("plotly_relayout", syncPerChart);

      if (isSubplotChart(rawData, rawLayout)) {
        const fix = () => {
          if (!divRef.current) return;
          divRef.current
            .querySelectorAll(
              "rect.bg,rect[style*='fill: rgb(255, 255, 255)'],rect[fill='white'],rect[fill='#fff'],rect[fill='#ffffff']",
            )
            .forEach((el: Element) => {
              (el as SVGRectElement).style.fill = "transparent";
            });
        };
        fix();
        setTimeout(fix, 50);
        setTimeout(fix, 200);
        const obs = new MutationObserver(fix);
        obs.observe(divRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "fill"],
        });
        setTimeout(() => obs.disconnect(), 5000);
      }

      if (!currentIs3D) {
        divRef.current.on("plotly_hover", (eventData: any) => {
          const pt = eventData?.points?.[0];
          if (!pt) return;
          const traceIdx = pt.curveNumber ?? 0,
            ptIdx = pt.pointNumber ?? pt.pointIndex ?? 0;
          const traceColor = pt.data?.marker?.color;
          const color =
            typeof traceColor === "string"
              ? traceColor
              : Array.isArray(traceColor)
                ? traceColor[ptIdx] || stableColor(traceIdx)
                : pt.data?.line?.color || stableColor(traceIdx);
          const isPieLike =
            pt.data?.type === "pie" ||
            chartType === "pie" ||
            chartType === "donut";
          const xVal = isPieLike
            ? String(pt.label ?? "")
            : pt.x !== undefined
              ? String(pt.x)
              : "";
          const val = isPieLike
            ? (pt.value ?? pt.y ?? "")
            : pt.z !== undefined
              ? pt.z
              : pt.y !== undefined
                ? pt.y
                : (pt.value ?? "");
          const yArr: number[] = pt.data?.y || [];
          const prevValue = ptIdx > 0 ? yArr[ptIdx - 1] : null;
          const td = {
            label: xVal,
            value: val,
            seriesName: pt.data?.name || "Value",
            color: typeof color === "string" ? color : stableColor(traceIdx),
            prevValue,
          };
          (tooltipRef as any)._setData?.(td);
          showTooltip(
            (eventData.event as MouseEvent).clientX,
            (eventData.event as MouseEvent).clientY,
            td,
          );
        });
        divRef.current.on("plotly_unhover", hideTooltip);
      }
    };
    tryRender();
  }, [aiMsg?.id, aiMsg?.status, aiMsg?.content, showTooltip, hideTooltip]);

  useEffect(() => {
    const onResize = () => {
      if (divRef.current && window.Plotly && aiMsg?.content?.layout)
        window.Plotly.relayout(
          divRef.current,
          buildLayout(
            aiMsg.content.layout,
            detectType(aiMsg.content.data || []),
            aiMsg.content.data || [],
          ),
        );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [aiMsg?.content]);

  const resetData = () => {
    if (!divRef.current || !window.Plotly || !originalDataRef.current) return;
    window.Plotly.react(
      divRef.current,
      originalDataRef.current,
      originalLayoutRef.current,
      { responsive: true, displayModeBar: false },
    );
    if (aiMsg?.id) {
      if (!window.__graphixChartData) window.__graphixChartData = {};
      window.__graphixChartData[aiMsg.id] = {
        data: JSON.parse(JSON.stringify(originalDataRef.current)),
        layout: JSON.parse(JSON.stringify(originalLayoutRef.current)),
      };
    }
    (window as any).__graphixCurrentData = JSON.parse(
      JSON.stringify(originalDataRef.current),
    );
    (window as any).__graphixCurrentLayout = JSON.parse(
      JSON.stringify(originalLayoutRef.current),
    );
    window.dispatchEvent(new CustomEvent("graphix-reset-template"));
  };

  const isLoading = aiMsg?.status === "loading";
  const isError = aiMsg?.status === "error";
  const isTextError = aiMsg?.content?.error;
  const chartTitle =
    aiMsg?.content?.layout?.title?.text ||
    (typeof aiMsg?.content?.layout?.title === "string"
      ? aiMsg.content.layout.title
      : "Chart");

  return (
    <>
      {editorOpen && aiMessage && (
        <ChartEditor
          message={aiMessage}
          divRef={divRef}
          onClose={() => setEditorOpen(false)}
        />
      )}
      <div style={{ flex: 1, display: "flex", minHeight: 0, minWidth: 0 }}>
        <div
          ref={cardRef}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "rgba(255,255,255,0.02)",
            margin: 12,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.07)",
            overflow: "hidden",
            minWidth: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  boxShadow: "0 0 6px rgba(6,182,212,0.5)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {chartTitle}
              </span>
              <span
                style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.22)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                {detectType(aiMsg?.content?.data || [])}
              </span>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", minHeight: 400 }}>
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  zIndex: 10,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-bounce"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "rgba(6,182,212,0.6)",
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "monospace",
                  }}
                >
                  Generating…
                </p>
              </div>
            )}
            {isError && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    padding: 16,
                    fontSize: 13,
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#f87171",
                  }}
                >
                  ⚠{" "}
                  {typeof aiMsg?.content === "string"
                    ? aiMsg.content
                    : "Error generating chart"}
                </div>
              </div>
            )}
            {isTextError && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    padding: 16,
                    fontSize: 13,
                    borderRadius: 12,
                    maxWidth: 320,
                    textAlign: "center",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,100,100,0.3)",
                    color: "rgba(255,100,100,0.8)",
                  }}
                >
                  {aiMsg?.content?.error}
                </div>
              </div>
            )}
            <div
              id="main-chart-div"
              ref={divRef}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 400,
                opacity: isLoading ? 0.2 : 1,
                transition: "opacity 0.3s",
                display: isTextError ? "none" : "block",
              }}
            />
            <PremiumTooltip tooltipRef={tooltipRef} />
          </div>
        </div>
        {aiMessage && (
          <InlineToolbar
            divRef={divRef}
            messageId={aiMessage.id}
            onOpenEditor={() => setEditorOpen(true)}
            onResetData={resetData}
            onSaveChart={handleSaveCurrentChart}
          />
        )}
      </div>
    </>
  );
}
