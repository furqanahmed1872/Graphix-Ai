"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ChartEditor from "@/components/main-app/ChartEditor";
import { useAppStore } from "@/store/appStore";

declare global {
  interface Window {
    Plotly: any;
  }
}

const CYAN = "#06b6d4";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Chart types supported by the ExcelChartEditor panel
const PANEL_SUPPORTED_TYPES = new Set([
  "bar",
  "hbar",
  "stacked",
  "line",
  "area",
  "scatter",
  "bubble",
  "pie",
  "donut",
  "histogram",
  "box",
  "violin",
  "heatmap",
  "radar",
  "funnel",
  "waterfall",
  "treemap",
  "sunburst",
  "scatter3d",
  "surface3d",
  "candlestick",
]);

// ── Plotly CDN ────────────────────────────────────────────────
function usePlotlyReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.Plotly) {
      setReady(true);
      return;
    }
    const ex = document.querySelector(
      "script[data-plotly]",
    ) as HTMLScriptElement | null;
    if (ex) {
      ex.addEventListener("load", () => setReady(true));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.plot.ly/plotly-2.27.0.min.js";
    s.dataset.plotly = "1";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

// ── Detect chart type ID (matches panel CHART_TYPES ids) ─────
function detectPanelChartType(traces: any[]): string | null {
  if (!traces?.length) return null;
  const t = traces[0];
  const type = (t.type || "").toLowerCase();
  const mode = (t.mode || "").toLowerCase();

  if (type === "pie") return t.hole > 0 ? "donut" : "pie";
  if (type === "bar") return t.orientation === "h" ? "hbar" : "bar";
  if (type === "scatter") {
    if (mode.includes("lines") && t.fill) return "area";
    if (mode.includes("lines")) return "line";
    return "scatter";
  }
  if (type === "histogram") return "histogram";
  if (type === "box") return "box";
  if (type === "violin") return "violin";
  if (type === "heatmap") return "heatmap";
  if (type === "scatterpolar") return "radar";
  if (type === "funnel") return "funnel";
  if (type === "waterfall") return "waterfall";
  if (type === "treemap") return "treemap";
  if (type === "sunburst") return "sunburst";
  if (type === "scatter3d") return "scatter3d";
  if (type === "surface") return "surface3d";
  if (type === "candlestick") return "candlestick";
  return null; // unsupported in panel
}

// ── Label for display ─────────────────────────────────────────
function detectChartLabel(traces: any[]): string {
  if (!traces?.length) return "CHART";
  const t = traces[0];
  const type = (t.type || "").toLowerCase();
  const mode = (t.mode || "").toLowerCase();
  if (type === "pie") return t.hole ? "DONUT" : "PIE";
  if (type === "bar") return t.orientation === "h" ? "H·BAR" : "BAR";
  if (type === "scatter") {
    if (
      mode.includes("lines") &&
      (t.fill === "tonexty" || t.fill === "tozeroy")
    )
      return "AREA";
    if (mode.includes("lines")) return "LINE";
    return "SCATTER";
  }
  const m: Record<string, string> = {
    heatmap: "HEATMAP",
    histogram: "HIST",
    box: "BOX",
    violin: "VIOLIN",
    scatter3d: "3D",
    surface: "SURFACE",
    funnel: "FUNNEL",
    waterfall: "WATERFALL",
    candlestick: "CANDLE",
    contour: "CONTOUR",
    scatterpolar: "RADAR",
    barpolar: "RADAR",
    sunburst: "SUNBURST",
    treemap: "TREEMAP",
    icicle: "ICICLE",
    densitymapbox: "MAP",
    choropleth: "MAP",
  };
  return (m[type] ?? type.toUpperCase()) || "CHART";
}

function typeColor(label: string): string {
  const m: Record<string, string> = {
    BAR: "#06b6d4",
    "H·BAR": "#06b6d4",
    LINE: "#8b5cf6",
    AREA: "#8b5cf6",
    SCATTER: "#f59e0b",
    PIE: "#ec4899",
    DONUT: "#ec4899",
    "3D": "#10b981",
    SURFACE: "#10b981",
    HEATMAP: "#f97316",
    CONTOUR: "#f97316",
    HIST: "#06b6d4",
    CANDLE: "#eab308",
    RADAR: "#a855f7",
    SUNBURST: "#ec4899",
    TREEMAP: "#14b8a6",
    FUNNEL: "#f59e0b",
    WATERFALL: "#06b6d4",
  };
  return m[label] ?? "#94a3b8";
}

// ── Plotly mini preview — ALL chart types ─────────────────────
function PlotlyMini({ chartConfig }: { chartConfig: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = usePlotlyReady();

  useEffect(() => {
    if (!ready || !ref.current || !chartConfig?.data?.length) return;
    const origLayout = chartConfig.layout || {};
    const traces = chartConfig.data;

    const is3D = traces.some((t: any) =>
      [
        "scatter3d",
        "surface",
        "mesh3d",
        "cone",
        "streamtube",
        "isosurface",
        "volume",
      ].includes(t.type),
    );
    const isHeat = traces.some((t: any) =>
      ["heatmap", "contour", "histogram2d", "histogram2dcontour"].includes(
        t.type,
      ),
    );
    const isPolar = traces.some((t: any) =>
      ["scatterpolar", "barpolar", "scatterpolargl"].includes(t.type),
    );
    const isGeo = traces.some((t: any) =>
      [
        "choropleth",
        "scattergeo",
        "scattermapbox",
        "densitymapbox",
        "choroplethmapbox",
      ].includes(t.type),
    );

    const clean = traces.map((t: any) => {
      const c: any = { ...t };
      if (!isHeat) {
        c.showscale = false;
        c.colorbar = undefined;
      }
      if (!isHeat && c.marker) c.marker = { ...c.marker, line: undefined };
      return c;
    });

    const base: any = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: isHeat ? "#0f0f0f" : "rgba(0,0,0,0)",
      margin: { l: 0, r: 0, t: 0, b: 0 },
      showlegend: false,
      autosize: true,
      font: { size: 9, color: "rgba(255,255,255,0.3)" },
    };

    if (is3D) {
      const sc = origLayout.scene || {};
      base.scene = {
        ...sc,
        xaxis: {
          ...sc.xaxis,
          showticklabels: false,
          title: "",
          gridcolor: "rgba(255,255,255,0.06)",
        },
        yaxis: {
          ...sc.yaxis,
          showticklabels: false,
          title: "",
          gridcolor: "rgba(255,255,255,0.06)",
        },
        zaxis: {
          ...sc.zaxis,
          showticklabels: false,
          title: "",
          gridcolor: "rgba(255,255,255,0.06)",
        },
        camera: { eye: { x: 1.6, y: 1.6, z: 1.0 } },
        bgcolor: "rgba(0,0,0,0)",
      };
    } else if (isPolar) {
      base.polar = {
        ...origLayout.polar,
        bgcolor: "rgba(0,0,0,0)",
        radialaxis: { visible: false },
        angularaxis: { gridcolor: "rgba(255,255,255,0.08)" },
      };
    } else if (isGeo) {
      base.geo = {
        ...origLayout.geo,
        bgcolor: "rgba(0,0,0,0)",
        showframe: false,
        showcoastlines: true,
        coastlinecolor: "rgba(255,255,255,0.15)",
        showland: true,
        landcolor: "rgba(255,255,255,0.05)",
        projection: { type: "natural earth" },
      };
    } else {
      base.xaxis = {
        visible: false,
        fixedrange: true,
        showgrid: false,
        zeroline: false,
      };
      base.yaxis = {
        visible: false,
        fixedrange: true,
        showgrid: false,
        zeroline: false,
      };
      Object.keys(origLayout).forEach((k) => {
        if (/^[xy]axis[2-9]/.test(k))
          base[k] = {
            visible: false,
            fixedrange: true,
            showgrid: false,
            zeroline: false,
          };
      });
    }
    if (isHeat) {
      base.xaxis = { visible: false, fixedrange: true };
      base.yaxis = { visible: false, fixedrange: true };
    }

    try {
      window.Plotly.react(ref.current, clean, base, {
        displayModeBar: false,
        responsive: true,
        staticPlot: !is3D,
      });
    } catch {}
  }, [ready, chartConfig]);

  if (!ready)
    return (
      <div
        style={{
          width: "100%",
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            border: "2px solid rgba(6,182,212,0.2)",
            borderTopColor: "#06b6d4",
            borderRadius: "50%",
            animation: "gcSpin 0.8s linear infinite",
          }}
        />
      </div>
    );
  return (
    <div
      ref={ref}
      style={{ width: "100%", height: 160, pointerEvents: "none" }}
    />
  );
}

// ── Small icon button ─────────────────────────────────────────
function ActionBtn({
  onClick,
  title,
  active = false,
  danger = false,
  loading = false,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  active?: boolean;
  danger?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backdropFilter: "blur(8px)",
        padding: 0,
        flexShrink: 0,
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.5 : 1,
        transition: "all 0.15s",
        border: `1px solid ${active ? "rgba(6,182,212,0.4)" : danger && hov ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.12)"}`,
        background: active
          ? "rgba(6,182,212,0.18)"
          : danger && hov
            ? "rgba(239,68,68,0.15)"
            : hov
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.45)",
        color: active
          ? CYAN
          : danger
            ? hov
              ? "#ef4444"
              : "rgba(255,255,255,0.4)"
            : hov
              ? "#fff"
              : "rgba(255,255,255,0.4)",
      }}
    >
      {children}
    </button>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        background: "rgba(20,20,28,0.96)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "10px 20px",
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        whiteSpace: "nowrap",
        animation: "gcIn 0.2s ease both",
      }}
    >
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GRAPH CARD
// ─────────────────────────────────────────────────────────────
export default function GraphCard({
  graph,
  index = 0,
}: {
  graph: any;
  index?: number;
}) {
  const router = useRouter();
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  const [star, setStar] = useState<boolean>(!!graph.starred);
  const [shared, setShared] = useState<boolean>(
    !!graph.shared || !!graph.shareToken,
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [starLoading, setStarLoading] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "loading" | "copied">(
    "idle",
  );
  const [deleteState, setDeleteState] = useState<"idle" | "deleting">("idle");
  const [showDeleteConf, setShowDeleteConf] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plotRef = useRef<any>(null);

  const { token, toggleStarChart, markChartShared, removeSavedChart } =
    useAppStore();

  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 50 + 40);
    return () => clearTimeout(t);
  }, [index]);
  useEffect(() => {
    setStar(!!graph.starred);
  }, [graph.starred]);
  useEffect(() => {
    setShared(!!graph.shared || !!graph.shareToken);
  }, [graph.shared, graph.shareToken]);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  };

  const hasPlotly =
    Array.isArray(graph.chartConfig?.data) && graph.chartConfig.data.length > 0;
  const chartLabel = hasPlotly
    ? detectChartLabel(graph.chartConfig.data)
    : (graph.tag ?? "CHART").toUpperCase();
  const typeClr = typeColor(chartLabel);
  const chartTitle =
    graph.chartConfig?.layout?.title?.text ||
    (typeof graph.chartConfig?.layout?.title === "string"
      ? graph.chartConfig.layout.title
      : null) ||
    graph.title ||
    graph.prompt ||
    "Untitled Chart";
  const fakeMsg = hasPlotly
    ? {
        id: graph.id,
        from: "ai" as const,
        content: graph.chartConfig,
        status: "success",
      }
    : null;

  // ── Star — persists to DB ─────────────────────────────────────
  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (starLoading || !token) return;
    setStarLoading(true);
    const next = !star;
    setStar(next);
    toggleStarChart(graph.id);
    try {
      const res = await fetch(`${API}/api/charts/${graph.id}/star`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        setStar(!next);
        toggleStarChart(graph.id);
      }
    } catch {
      setStar(!next);
      toggleStarChart(graph.id);
    } finally {
      setStarLoading(false);
    }
  };

  // ── Share ─────────────────────────────────────────────────────
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shareState !== "idle" || !token) return;
    setShareState("loading");
    try {
      let tok = graph.shareToken;
      if (!tok) {
        const r = await fetch(`${API}/api/charts/${graph.id}/share`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        tok = d.shareToken;
        markChartShared(graph.id, tok);
        setShared(true);
      }
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${tok}`,
      );
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      setShareState("idle");
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteState === "deleting") return;
    setShowDeleteConf(true);
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteTimer.current = setTimeout(() => setShowDeleteConf(false), 5000);
  };
  const confirmDelete = async () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    setShowDeleteConf(false);
    setDeleteState("deleting");
    try {
      const r = await fetch(`${API}/api/charts/${graph.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error);
      }
      removeSavedChart(graph.id);
    } catch {
      setDeleteState("idle");
    }
  };

  // ── Open in panel — checks type support first ─────────────────
  const handleOpenInPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const panelType = hasPlotly
      ? detectPanelChartType(graph.chartConfig.data)
      : null;
    if (!panelType || !PANEL_SUPPORTED_TYPES.has(panelType)) {
      showToast(
        `⚠ "${chartLabel}" charts are not yet supported in the Data Editor`,
      );
      return;
    }
    sessionStorage.setItem(
      "graphix_panel_chart",
      JSON.stringify({
        chartConfig: graph.chartConfig,
        title: chartTitle,
        chartId: graph.id,
      }),
    );
    router.push("/panel");
  };

  const isDeleting = deleteState === "deleting";
  const cardBorder = hov
    ? "rgba(6,182,212,0.3)"
    : star
      ? "rgba(6,182,212,0.18)"
      : "rgba(255,255,255,0.07)";
  const cardShadow = hov
    ? "0 0 0 1px rgba(6,182,212,0.12), 0 8px 32px rgba(0,0,0,0.5)"
    : "0 1px 3px rgba(0,0,0,0.4)";

  return (
    <>
      <style>{`
        @keyframes gcSpin  { to{transform:rotate(360deg)} }
        @keyframes gcIn    { from{opacity:0;transform:translateY(12px) scale(0.98)} to{opacity:1;transform:none} }
        @keyframes gcPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {toastMsg && <Toast msg={toastMsg} />}

      <div
        style={{
          opacity: vis ? 1 : 0,
          animation: vis
            ? `gcIn 0.4s cubic-bezier(0.22,1,0.36,1) ${index * 0.04}s both`
            : "none",
        }}
      >
        <div
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: hov
              ? "rgba(255,255,255,0.025)"
              : "rgba(255,255,255,0.015)",
            border: `1px solid ${cardBorder}`,
            boxShadow: cardShadow,
            transition: "border-color 0.25s, box-shadow 0.25s, background 0.2s",
            opacity: isDeleting ? 0.35 : 1,
          }}
        >
          {/* Top accent stripe */}
          <div
            style={{
              height: 2,
              flexShrink: 0,
              background: star
                ? `linear-gradient(90deg,${typeClr},${typeClr}55,transparent)`
                : hov
                  ? `linear-gradient(90deg,${typeClr}44,transparent)`
                  : "transparent",
              transition: "background 0.3s",
            }}
          />

          {/* Preview */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
              overflow: "hidden",
              background:
                "linear-gradient(180deg,rgba(255,255,255,0.015) 0%,transparent 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)",
                backgroundSize: "20px 20px",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {hasPlotly ? (
              <PlotlyMini chartConfig={graph.chartConfig} />
            ) : (
              <div
                style={{
                  height: 160,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1.5"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.1)",
                    letterSpacing: "0.1em",
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  NO PREVIEW
                </span>
              </div>
            )}

            {/* Type badge */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 4,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(0,0,0,0.72)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${typeClr}44`,
                  borderRadius: 6,
                  padding: "3px 8px",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: typeClr,
                    boxShadow: `0 0 6px ${typeClr}`,
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: typeClr,
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  {chartLabel}
                </span>
              </div>
              {star && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.72)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(250,204,21,0.4)",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="#facc15"
                    stroke="#facc15"
                    strokeWidth={1}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 4,
                display: "flex",
                gap: 4,
                opacity: hov ? 1 : 0,
                transform: hov ? "translateY(0)" : "translateY(-4px)",
                transition: "opacity 0.18s, transform 0.18s",
                pointerEvents: hov ? "auto" : "none",
              }}
            >
              <ActionBtn
                onClick={handleStar}
                title={star ? "Unstar" : "Star"}
                active={star}
                loading={starLoading}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill={star ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </ActionBtn>
              <ActionBtn
                onClick={handleShare}
                title={shareState === "copied" ? "Copied!" : "Share"}
                active={shared || shareState === "copied"}
                loading={shareState === "loading"}
              >
                {shareState === "copied" ? (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                )}
              </ActionBtn>
              {/* Open in Data Editor */}
              <ActionBtn
                onClick={handleOpenInPanel}
                title="Open in Data Editor"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </ActionBtn>
              {/* Open in Chart Editor */}
              <ActionBtn
                onClick={(e) => {
                  e.stopPropagation();
                  fakeMsg && setEditorOpen(true);
                }}
                title="Open in Chart Editor"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </ActionBtn>
              <ActionBtn
                onClick={handleDelete}
                title="Delete"
                danger
                loading={isDeleting}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </ActionBtn>
            </div>

            {/* Center hover — opens chart editor */}
            {hasPlotly && hov && !showDeleteConf && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  fakeMsg && setEditorOpen(true);
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.15)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    background: "rgba(6,182,212,0.9)",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Open Chart Editor
                </div>
              </div>
            )}

            {/* Delete confirm */}
            {showDeleteConf && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  background: "rgba(0,0,0,0.88)",
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  borderRadius: 13,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    Delete this chart?
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    This cannot be undone
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setShowDeleteConf(false)}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.6)",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "6px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      background: "#dc2626",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Frosted footer */}
          <div
            style={{
              padding: "12px 14px 13px",
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: hov ? "#fff" : "rgba(255,255,255,0.9)",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {chartTitle}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.25)",
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {(graph.views ?? 0).toLocaleString()}
                </span>
                {graph.trend && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: graph.up !== false ? "#10b981" : "#f87171",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {graph.trend}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.18)",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {graph.updated ?? ""}
              </span>
            </div>
            {shareState === "copied" && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: CYAN,
                    animation: "gcPulse 1s ease infinite",
                  }}
                />
                <span style={{ fontSize: 10, color: CYAN, fontWeight: 600 }}>
                  Link copied to clipboard
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasPlotly && editorOpen && fakeMsg && (
        <ChartEditor
          message={fakeMsg}
          divRef={plotRef}
          onClose={() => setEditorOpen(false)}
          existingChartId={graph.id}
        />
      )}
    </>
  );
}
