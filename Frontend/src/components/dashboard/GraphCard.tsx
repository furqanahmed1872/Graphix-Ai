"use client";

import { useState, useEffect, useRef } from "react";
import { CYAN, W08, W20, C08 } from "@/lib/Tokens";
import { IC } from "@/lib/Tokens";
import { Ico } from "./UIKit";
import ChartEditor from "@/components/main-app/ChartEditor";

declare global {
  interface Window {
    Plotly: any;
  }
}

// ── Load Plotly once per page ─────────────────────────────────
function usePlotlyReady(cb: () => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Plotly) {
      cb();
      return;
    }
    const existing = document.getElementById("plotly-cdn");
    if (existing) {
      existing.addEventListener("load", cb);
      return () => existing.removeEventListener("load", cb);
    }
    const s = document.createElement("script");
    s.id = "plotly-cdn";
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js";
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  }, []);
}

// ── Detect chart type label from traces ───────────────────────
function detectChartType(data: any[]): string {
  if (!data?.length) return "CHART";
  const t = data[0];
  const type = (t.type || "").toLowerCase();
  const mode = (t.mode || "").toLowerCase();
  if (type === "scatter3d") return "3D SCATTER";
  if (type === "surface") return "SURFACE";
  if (type === "mesh3d") return "3D MESH";
  if (type === "pie") return t.hole ? "DONUT" : "PIE";
  if (type === "funnel") return "FUNNEL";
  if (type === "waterfall") return "WATERFALL";
  if (type === "heatmap") return "HEATMAP";
  if (type === "contour") return "CONTOUR";
  if (type === "histogram") return "HISTOGRAM";
  if (type === "histogram2dcontour") return "HIST 2D";
  if (type === "box") return "BOX";
  if (type === "violin") return "VIOLIN";
  if (type === "candlestick") return "CANDLESTICK";
  if (type === "bar") return "BAR";
  if (type === "scatter" && mode.includes("lines") && t.fill) return "AREA";
  if (type === "scatter" && mode.includes("lines")) return "LINE";
  if (type === "scatter") return "SCATTER";
  return type.toUpperCase() || "CHART";
}

// ── Mini Plotly preview ───────────────────────────────────────
function PlotlyMini({ chartConfig }: { chartConfig: Record<string, any> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(
    typeof window !== "undefined" && !!window.Plotly,
  );

  usePlotlyReady(() => setReady(true));

  useEffect(() => {
    if (!ready || !ref.current) return;
    try {
      const rawData: any[] = chartConfig.data ?? [];
      if (!rawData.length) return;

      const types = rawData.map((t: any) => (t.type || "").toLowerCase());

      // 3D charts need WebGL (non-static)
      const is3D = types.some((t) =>
        [
          "scatter3d",
          "surface",
          "mesh3d",
          "cone",
          "streamtube",
          "isosurface",
          "volume",
        ].includes(t),
      );

      // contour + heatmap also need canvas rendering — staticPlot breaks them
      const needsCanvas =
        is3D ||
        types.some((t) =>
          ["contour", "heatmap", "histogram2dcontour"].includes(t),
        );

      // Strip UI chrome but preserve visual data
      const data = rawData.map((trace: any) => {
        const t = (trace.type || "").toLowerCase();
        const isHeatmapTrace = [
          "heatmap",
          "contour",
          "histogram2dcontour",
        ].includes(t);
        const cleaned: any = {
          ...trace,
          hoverinfo: "none",
          text: undefined,
          texttemplate: undefined,
          textposition: undefined,
          showscale: false,
          colorbar: undefined,
        };
        if (!isHeatmapTrace) {
          cleaned.marker = trace.marker
            ? { ...trace.marker, showscale: false, colorbar: undefined }
            : undefined;
        }
        return cleaned;
      });

      const base: any = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { t: 0, b: 0, l: 0, r: 0, pad: 0 },
        showlegend: false,
        height: 150,
        title: "",
        annotations: [],
      };

      const isHeatmapLike = types.some((t) =>
        ["contour", "heatmap", "histogram2dcontour"].includes(t),
      );

      if (is3D) {
        const origScene = chartConfig.layout?.scene ?? {};
        base.scene = {
          ...origScene,
          bgcolor: "rgba(0,0,0,0)",
          xaxis: {
            ...(origScene.xaxis ?? {}),
            showticklabels: false,
            title: "",
            showgrid: true,
            zeroline: false,
            gridcolor: "rgba(255,255,255,0.08)",
          },
          yaxis: {
            ...(origScene.yaxis ?? {}),
            showticklabels: false,
            title: "",
            showgrid: true,
            zeroline: false,
            gridcolor: "rgba(255,255,255,0.08)",
          },
          zaxis: {
            ...(origScene.zaxis ?? {}),
            showticklabels: false,
            title: "",
            showgrid: true,
            zeroline: false,
            gridcolor: "rgba(255,255,255,0.08)",
          },
          camera: { eye: { x: 1.6, y: 1.6, z: 1.0 } },
          aspectmode: "cube",
        };
      } else if (isHeatmapLike) {
        // heatmap/contour MUST have a solid background — transparent = invisible
        base.paper_bgcolor = "#0f0f0f";
        base.plot_bgcolor = "#0f0f0f";
        base.xaxis = {
          visible: false,
          fixedrange: true,
          showgrid: false,
          zeroline: false,
          showline: false,
        };
        base.yaxis = {
          visible: false,
          fixedrange: true,
          showgrid: false,
          zeroline: false,
          showline: false,
        };
        base.margin = { t: 0, b: 0, l: 0, r: 0, pad: 0 };
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

      window.Plotly.react(ref.current, data, base, {
        displayModeBar: false,
        responsive: true,
        // staticPlot=true breaks canvas-based charts (contour, heatmap, 3D)
        staticPlot: !needsCanvas,
      });
    } catch {}
  }, [ready, chartConfig]);

  if (!ready) {
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
  }

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: 150, pointerEvents: "none" }}
    />
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
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  const [star, setStar] = useState(graph.starred);
  const [editorOpen, setEditorOpen] = useState(false);
  const plotRef = useRef<any>(null);

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
    (graph.title !== "Untitled Chart" ? graph.title : null) ||
    graph.prompt?.slice(0, 40) ||
    "Untitled Chart";

  const fakeMessage = hasPlotly
    ? {
        id: graph.id,
        from: "ai" as const,
        content: {
          data: graph.chartConfig.data,
          layout: {
            ...(graph.chartConfig.layout ?? {}),
            title: { text: chartTitle },
          },
        },
        status: "success" as const,
      }
    : null;

  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 55 + 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <>
      <style>{`@keyframes gcSpin{to{transform:rotate(360deg)}}`}</style>

      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => hasPlotly && setEditorOpen(true)}
        style={{
          border: `1px solid ${hov ? CYAN : W08}`,
          borderRadius: 8,
          overflow: "hidden",
          cursor: hasPlotly ? "pointer" : "default",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          opacity: vis ? 1 : 0,
          transform: vis ? "none" : "translateY(12px)",
          transition:
            "opacity 0.35s ease, transform 0.35s ease, border-color 0.2s",
          background: "#111212",
        }}
      >
        {/* top accent */}
        <div
          style={{
            height: 2,
            background: hov
              ? `linear-gradient(90deg,${CYAN},transparent)`
              : "transparent",
            transition: "background 0.3s",
            flexShrink: 0,
          }}
        />

        {/* ── PREVIEW ── */}
        <div
          style={{
            position: "relative",
            background: hov ? C08 : "rgba(255,255,255,0.015)",
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

          {/* star button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStar((s: boolean) => !s);
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 3,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              border: `1px solid ${star ? CYAN : "rgba(255,255,255,0.1)"}`,
              borderRadius: 6,
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <Ico
              d={IC.star}
              size={11}
              fill={star ? CYAN : "none"}
              stroke={star ? CYAN : "rgba(255,255,255,0.4)"}
            />
          </button>
        </div>

        {/* ── FOOTER: title + type ── */}
        <div
          style={{
            padding: "10px 12px 11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            borderTop: `1px solid ${W08}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 12,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {chartTitle}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 6px",
              borderRadius: 3,
              flexShrink: 0,
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.25)",
              color: "#06b6d4",
              fontFamily: "monospace",
            }}
          >
            {chartType}
          </span>
        </div>

        {/* ── HOVER OVERLAY ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hov ? 1 : 0,
            transition: "opacity 0.18s",
            pointerEvents: hov ? "auto" : "none",
            bottom: 43,
          }}
        >
          <div
            style={{
              background: CYAN,
              color: "#111212",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "8px 18px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="12"
              height="12"
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
      </div>

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
