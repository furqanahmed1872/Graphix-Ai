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

// ── Plotly CDN loader ─────────────────────────────────────────
function usePlotlyReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.Plotly) {
      setReady(true);
      return;
    }
    const existing = document.querySelector(
      "script[data-plotly]",
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
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

// ── Chart type detector ───────────────────────────────────────
function detectChartType(traces: any[]): string {
  if (!traces?.length) return "CHART";
  const t = traces[0];
  const type = (t.type || "").toLowerCase();
  const mode = (t.mode || "").toLowerCase();
  if (type === "pie") return t.hole ? "DONUT" : "PIE";
  if (type === "bar") return t.orientation === "h" ? "H-BAR" : "BAR";
  if (type === "scatter") {
    if (
      mode.includes("lines") &&
      (t.fill === "tonexty" || t.fill === "tozeroy")
    )
      return "AREA";
    if (mode.includes("lines")) return "LINE";
    return "SCATTER";
  }
  const labels: Record<string, string> = {
    heatmap: "HEATMAP",
    histogram: "HISTOGRAM",
    box: "BOX",
    violin: "VIOLIN",
    scatter3d: "3D",
    surface: "SURFACE",
    funnel: "FUNNEL",
    waterfall: "WATERFALL",
    candlestick: "CANDLE",
  };
  return (labels[type] ?? type.toUpperCase()) || "CHART";
}

// ── Plotly mini preview ───────────────────────────────────────
function PlotlyMini({ chartConfig }: { chartConfig: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = usePlotlyReady();

  useEffect(() => {
    if (!ready || !ref.current || !chartConfig?.data?.length) return;
    const origLayout = chartConfig.layout || {};
    const traces = chartConfig.data;
    const is3D = traces.some((t: any) =>
      ["scatter3d", "surface", "mesh3d"].includes(t.type),
    );
    const isHeatmapLike = traces.some((t: any) =>
      ["heatmap", "contour"].includes(t.type),
    );

    const cleanTraces = traces.map((t: any) => ({
      ...t,
      showscale: false,
      colorbar: undefined,
      marker: ["heatmap", "contour"].includes(t.type)
        ? t.marker
        : t.marker
          ? { ...t.marker, line: undefined }
          : undefined,
    }));

    const base: any = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: isHeatmapLike ? "#0f0f0f" : "rgba(0,0,0,0)",
      margin: { l: 0, r: 0, t: 0, b: 0 },
      showlegend: false,
      autosize: true,
    };

    if (is3D) {
      const s = origLayout.scene || {};
      base.scene = {
        ...s,
        xaxis: {
          ...(s.xaxis ?? {}),
          showticklabels: false,
          title: "",
          showgrid: true,
          zeroline: false,
          gridcolor: "rgba(255,255,255,0.08)",
        },
        yaxis: {
          ...(s.yaxis ?? {}),
          showticklabels: false,
          title: "",
          showgrid: true,
          zeroline: false,
          gridcolor: "rgba(255,255,255,0.08)",
        },
        zaxis: {
          ...(s.zaxis ?? {}),
          showticklabels: false,
          title: "",
          showgrid: true,
          zeroline: false,
          gridcolor: "rgba(255,255,255,0.08)",
        },
        camera: { eye: { x: 1.6, y: 1.6, z: 1.0 } },
        aspectmode: "cube",
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
      base.polar = {
        bgcolor: "rgba(0,0,0,0)",
        radialaxis: { visible: false },
        angularaxis: { visible: false },
      };
    }

    try {
      window.Plotly.react(ref.current, cleanTraces, base, {
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
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            border: "2px solid rgba(6,182,212,0.25)",
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
      style={{ width: "100%", height: 150, pointerEvents: "none" }}
    />
  );
}

// ── Icon button ───────────────────────────────────────────────
function IconBtn({
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
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={loading}
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        border: `1px solid ${active ? CYAN : danger ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
        background: active
          ? "rgba(6,182,212,0.12)"
          : danger
            ? "rgba(239,68,68,0.08)"
            : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        color: active ? CYAN : danger ? "#ef4444" : "rgba(255,255,255,0.5)",
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.15s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

// ── GraphCard ─────────────────────────────────────────────────
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
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const deleteToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plotRef = useRef<any>(null);

  const { token, toggleStarChart, markChartShared, removeSavedChart } =
    useAppStore();

  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 55 + 60);
    return () => clearTimeout(t);
  }, [index]);

  // Keep in sync when parent re-renders
  useEffect(() => {
    setStar(!!graph.starred);
  }, [graph.starred]);
  useEffect(() => {
    setShared(!!graph.shared || !!graph.shareToken);
  }, [graph.shared, graph.shareToken]);

  const hasPlotly =
    Array.isArray(graph.chartConfig?.data) && graph.chartConfig.data.length > 0;

  const chartType = hasPlotly
    ? detectChartType(graph.chartConfig.data)
    : (graph.tag ?? "CHART").toUpperCase();

  const chartTitle =
    graph.chartConfig?.layout?.title?.text ||
    (typeof graph.chartConfig?.layout?.title === "string"
      ? graph.chartConfig.layout.title
      : null) ||
    graph.title ||
    graph.prompt ||
    "Untitled Chart";

  const chartSubtitle = graph.chartConfig?.layout?._subtitle || "";
  const annotations: string[] = Array.isArray(
    graph.chartConfig?.layout?._annotations,
  )
    ? graph.chartConfig.layout._annotations
    : [];

  const fakeMessage = hasPlotly
    ? {
        id: graph.id,
        from: "ai" as const,
        content: graph.chartConfig,
        status: "success",
      }
    : null;

  // ── Star ─────────────────────────────────────────────────────
  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (starLoading || !token) return;
    setStarLoading(true);
    const newStar = !star;
    setStar(newStar);
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
        setStar(!newStar);
        toggleStarChart(graph.id);
      }
    } catch {
      setStar(!newStar);
      toggleStarChart(graph.id);
    } finally {
      setStarLoading(false);
    }
  };

  // ── Share → copy public link ──────────────────────────────────
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shareState !== "idle" || !token) return;
    setShareState("loading");
    try {
      // If already has a token stored locally, just copy it
      const existingToken = graph.shareToken;
      let shareToken = existingToken;

      if (!shareToken) {
        const res = await fetch(`${API}/api/charts/${graph.id}/share`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Share failed");
        shareToken = data.shareToken;
        // Update Zustand so sidebar count and shared page update immediately
        markChartShared(graph.id, shareToken);
        setShared(true);
      }

      const shareUrl = `${window.location.origin}/share/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2500);
    } catch (err) {
      console.error("Share error:", err);
      setShareState("idle");
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteState === "deleting") return;
    // Show toast
    setShowDeleteToast(true);
    if (deleteToastTimer.current) clearTimeout(deleteToastTimer.current);
    deleteToastTimer.current = setTimeout(
      () => setShowDeleteToast(false),
      4000,
    );
  };

  const confirmDelete = async () => {
    if (deleteToastTimer.current) clearTimeout(deleteToastTimer.current);
    setShowDeleteToast(false);
    setDeleteState("deleting");
    try {
      const res = await fetch(`${API}/api/charts/${graph.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      removeSavedChart(graph.id);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteState("idle");
    }
  };

  // ── Open in /app ─────────────────────────────────────────────
  const handleOpenInApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Store the chart config in sessionStorage so /app can pick it up
    sessionStorage.setItem(
      "graphix_open_chart",
      JSON.stringify(graph.chartConfig),
    );
    router.push("/app");
  };

  return (
    <>
      <style>{`
        @keyframes gcSpin { to { transform: rotate(360deg); } }
        @keyframes gcFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
      `}</style>

      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          opacity: vis ? 1 : 0,
          animation: vis ? "gcFadeUp 0.35s ease both" : "none",
          background: "#18181b",
          border: `1px solid ${hov ? "rgba(6,182,212,0.22)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 10,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: hov ? "0 4px 24px rgba(6,182,212,0.08)" : "none",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 2,
            flexShrink: 0,
            background: star
              ? `linear-gradient(90deg,${CYAN},transparent)`
              : shared
                ? `linear-gradient(90deg,rgba(6,182,212,0.3),transparent)`
                : hov
                  ? `linear-gradient(90deg,rgba(6,182,212,0.15),transparent)`
                  : "transparent",
            transition: "background 0.3s",
          }}
        />

        {/* Preview area */}
        <div
          style={{
            position: "relative",
            background: hov
              ? "rgba(6,182,212,0.04)"
              : "rgba(255,255,255,0.015)",
            transition: "background 0.2s",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {hasPlotly ? (
            <PlotlyMini chartConfig={graph.chartConfig} />
          ) : (
            <div
              style={{
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.5"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
          )}

          {/* Type badge */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 3,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 5,
              padding: "2px 7px",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
            }}
          >
            {chartType}
          </div>

          {/* Action buttons — top right overlay */}
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 3,
              display: "flex",
              gap: 4,
              opacity: hov ? 1 : 0,
              transition: "opacity 0.15s",
              pointerEvents: hov ? "auto" : "none",
            }}
          >
            {/* Star */}
            <IconBtn
              onClick={handleStar}
              title={star ? "Remove from favourites" : "Add to favourites"}
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
            </IconBtn>

            {/* Share / copy link */}
            <IconBtn
              onClick={handleShare}
              title={
                shared ? "Copy share link again" : "Create & copy share link"
              }
              active={shared || shareState === "copied"}
              loading={shareState === "loading"}
            >
              {shareState === "copied" ? (
                <svg
                  width="10"
                  height="10"
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
                  width="10"
                  height="10"
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
            </IconBtn>

            {/* Open in app */}
            <IconBtn onClick={handleOpenInApp} title="Open in chart builder">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </IconBtn>

            {/* Delete */}
            <IconBtn
              onClick={handleDelete}
              title="Delete chart"
              danger
              loading={deleteState === "deleting"}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </IconBtn>
          </div>

          {/* Delete confirm banner */}
          {/* Delete confirmation toast */}
          {/* Delete confirmation overlay on card */}
          {showDeleteToast && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                borderRadius: 10,
                animation: "gcFadeUp 0.18s ease both",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
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
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Delete this chart?
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 3,
                  }}
                >
                  This cannot be undone
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowDeleteToast(false)}
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
                    background: "#ef4444",
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

          {/* Open-in-editor hover overlay */}
          {hasPlotly && hov && (
            <div
              onClick={() => fakeMessage && setEditorOpen(true)}
              style={{
                position: "absolute",
                inset: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
                cursor: "pointer",
                // Only show in center, don't block the top-right buttons
                paddingTop: 40,
              }}
            >
              <div
                style={{
                  background: CYAN,
                  color: "#111",
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "7px 16px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
                </svg>
                Open in Editor
              </div>
            </div>
          )}
        </div>

        {/* Card footer */}
        <div
          style={{
            padding: "10px 13px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            flex: 1,
          }}
        >
          {/* Title + shared indicator */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {chartTitle}
            </p>
            {shared && (
              <span
                style={{
                  fontSize: 8,
                  padding: "2px 5px",
                  borderRadius: 4,
                  flexShrink: 0,
                  background: "rgba(6,182,212,0.12)",
                  border: "1px solid rgba(6,182,212,0.25)",
                  color: CYAN,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                SHARED
              </span>
            )}
          </div>

          {/* Subtitle */}
          {chartSubtitle && (
            <p
              style={{
                margin: 0,
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {chartSubtitle}
            </p>
          )}

          {/* Annotation labels */}
          {annotations.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 2,
              }}
            >
              {annotations.slice(0, 3).map((label, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 9,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.18)",
                    color: "rgba(6,182,212,0.75)",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>
              ))}
              {annotations.length > 3 && (
                <span
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.2)",
                    padding: "1px 4px",
                  }}
                >
                  +{annotations.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Share copied toast */}
          {shareState === "copied" && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 10,
                color: CYAN,
                fontWeight: 600,
              }}
            >
              ✓ Link copied to clipboard
            </p>
          )}

          {/* Meta: views + updated */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 3,
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
              {graph.views ?? 0}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              {graph.updated ?? ""}
            </span>
          </div>
        </div>
      </div>

      {/* ChartEditor portal */}
      {/* ChartEditor portal */}
      {hasPlotly && editorOpen && fakeMessage && (
        <ChartEditor
          message={fakeMessage}
          divRef={plotRef}
          onClose={() => setEditorOpen(false)}
          existingChartId={graph.id}
        />
      )}
    </>
  );
}
