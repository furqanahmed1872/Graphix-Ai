"use client";

import { useEffect, useRef, useState } from "react";
import ChartToolbar from "./ChartToolbar";
import ChartEditor from "./ChartEditor";

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 640;

const PALETTE = [
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

function stableColor(i: number) {
  return PALETTE[i % PALETTE.length];
}

// Derive a stable offset from chart data so each chart gets a distinct starting color.
// Uses trace name + data length + first y value so it's deterministic per chart.
function getPaletteOffset(data: any[]): number {
  try {
    const name = data[0]?.name || "";
    const firstY = data[0]?.y?.[0] ?? data[0]?.x?.[0] ?? 0;
    const len = data[0]?.y?.length ?? data[0]?.x?.length ?? 1;
    let hash = len + Math.round(Math.abs(Number(firstY)));
    for (let k = 0; k < name.length; k++) hash += name.charCodeAt(k);
    return hash % PALETTE.length;
  } catch {
    return 0;
  }
}

function paletteColor(traceIndex: number, offset: number) {
  return PALETTE[(traceIndex + offset) % PALETTE.length];
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

function preprocessTraces(
  data: any[],
  layout: any,
): { data: any[]; layout: any } {
  if (!data?.length) return { data, layout };
  const chartType = detectType(data);
  const mobile = isMobile();
  const offset = getPaletteOffset(data);

  // ── Line / Area / Scatter ────────────────────────────────────────────────
  if (chartType === "line" || chartType === "area" || chartType === "scatter") {
    return {
      data: data.map((trace, i) => {
        // Always override with our palette — ignore server-sent colors entirely
        const clr = paletteColor(i, offset);
        return {
          ...trace,
          type: "scatter",
          mode:
            trace.mode ||
            (chartType === "scatter" ? "markers" : "lines+markers"),
          marker: {
            ...(trace.marker || {}),
            color: trace.marker?.color || clr, // ← fallback only
            size: mobile
              ? 6
              : trace.marker?.size || (chartType === "scatter" ? 9 : 7),
            opacity: 0.9,
            line: { color: "rgba(255,255,255,0.15)", width: 1 },
          },
          line: {
            ...(trace.line || {}),
            color: trace.line?.color || clr, // ← fallback only
            width: mobile ? 1.5 : trace.line?.width || 2.5,
          },
          fillcolor: trace.fill
            ? (trace.line?.color || trace.marker?.color || clr) + "22"
            : undefined,
        };
      }),
      layout,
    };
  }

  // ── Heatmap ───────────────────────────────────────────────────────────────
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

  // ── Waterfall ─────────────────────────────────────────────────────────────
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

  // ── Radar ─────────────────────────────────────────────────────────────────
  if (chartType === "radar") {
    return {
      data: data.map((trace, i) => {
        const clr = paletteColor(i, offset);
        return {
          ...trace,
          type: "scatterpolar",
          fill: trace.fill || "toself",
          marker: { color: clr, size: 5 },
          line: { color: clr, width: 2 },
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

  // ── Everything else (bar, pie, donut, histogram, box, violin, funnel…) ───
  return {
    data: data.map((trace, i) => {
      const clr = paletteColor(i, offset);
      const isPie = trace.type === "pie" || trace.type === "donut";

      // Single-trace bar: color each bar with a different palette color
      const isBar = trace.type === "bar";
      const isSingleTrace = data.length === 1;
      const barColors =
        isBar && isSingleTrace
          ? (trace.x || trace.y || []).map((_: any, idx: number) =>
              paletteColor(idx, offset),
            )
          : undefined;

      return {
        ...trace,
        marker: {
          ...(trace.marker || {}),
          color: isPie ? PALETTE : barColors || trace.marker?.color || clr,
          size: mobile
            ? Math.min(trace.marker?.size || 6, 5)
            : trace.marker?.size || 7,
          line: { color: "rgba(255,255,255,0.1)", width: isPie ? 2 : 1 },
        },
        line: {
          ...(trace.line || {}),
          color: trace.line?.color || clr,
          width: mobile ? 1.5 : trace.line?.width || 2.5,
        },
        fillcolor: trace.fill ? (trace.line?.color || clr) + "22" : undefined,
      };
    }),
    layout,
  };
}

function buildLayout(baseLayout: any, chartType: string) {
  const mobile = isMobile();
  const isRadar = chartType === "radar";
  const isHeatmap = chartType === "heatmap";
  const base: any = {
    ...baseLayout,
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    title: undefined,
    font: {
      color: "rgba(255,255,255,0.45)",
      size: mobile ? 10 : 11,
      family: "DM Mono, monospace",
    },
    legend: {
      ...(baseLayout.legend || {}),
      bgcolor: "rgba(0,0,0,0.5)",
      bordercolor: "rgba(255,255,255,0.07)",
      borderwidth: 1,
      font: { size: mobile ? 10 : 11, color: "rgba(255,255,255,0.6)" },
      orientation: "h",
      x: 0.5,
      y: isRadar ? -0.15 : -0.22,
      xanchor: "center",
      yanchor: "top",
    },
    margin: mobile
      ? { t: 10, l: 46, r: 12, b: 80 }
      : { t: 10, l: 55, r: 24, b: 72 },
    hovermode: "closest",
  };
  if (!isRadar) {
    base.xaxis = {
      ...(baseLayout.xaxis || {}),
      tickangle: mobile ? -40 : isHeatmap ? -30 : 0,
      tickfont: { size: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)" },
      gridcolor: "rgba(255,255,255,0.04)",
      linecolor: "rgba(255,255,255,0.06)",
      zerolinecolor: "rgba(255,255,255,0.06)",
      showgrid: !isHeatmap,
      automargin: true,
    };
    base.yaxis = {
      ...(baseLayout.yaxis || {}),
      tickfont: { size: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)" },
      gridcolor: "rgba(255,255,255,0.04)",
      linecolor: "rgba(255,255,255,0.06)",
      zerolinecolor: "rgba(255,255,255,0.06)",
      showgrid: !isHeatmap,
      automargin: true,
    };
  }
  if (isRadar) {
    base.polar = {
      ...(baseLayout.polar || {}),
      bgcolor: "rgba(0,0,0,0)",
      radialaxis: {
        visible: true,
        gridcolor: "rgba(255,255,255,0.07)",
        tickfont: { size: 9, color: "rgba(255,255,255,0.3)" },
        ...(baseLayout.polar?.radialaxis || {}),
      },
      angularaxis: {
        gridcolor: "rgba(255,255,255,0.07)",
        tickfont: { size: mobile ? 9 : 10, color: "rgba(255,255,255,0.4)" },
        ...(baseLayout.polar?.angularaxis || {}),
      },
    };
  }
  return base;
}

// ─── Premium Hover Tooltip ────────────────────────────────────────────────────
interface TooltipData {
  label: string;
  value: string | number;
  seriesName: string;
  color: string;
  prevValue?: number | null;
}

function PremiumTooltip({
  dataRef,
  tooltipRef,
}: {
  dataRef: React.RefObject<TooltipData | null>;
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
      <style>{`@keyframes ttIn { from { opacity:0; transform:scale(0.93) translateY(4px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
      <div
        id="tt-inner"
        style={{
          background: "#ffffff",
          borderRadius: 14,
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.07)",
          overflow: "hidden",
          fontFamily: "'Inter','DM Sans',system-ui,sans-serif",
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  from: "user" | "ai";
  content: string | any;
  status?: "loading" | "success" | "error";
  hasFile?: boolean;
  fileName?: string;
}
interface ChatAreaProps {
  messages: Message[];
}
interface PlotlyHTMLElement extends HTMLDivElement {
  data?: any[];
  layout?: any;
  on(event: string, handler: (data: any) => void): void;
  removeAllListeners?(event: string): void;
}
interface ChartBlockProps {
  message: Message;
}

// ─── ChatArea ─────────────────────────────────────────────────────────────────
export default function ChatArea({ messages }: ChatAreaProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 md:gap-5 px-2 md:px-4 py-4 md:py-5">
      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          style={{ animation: `fadeUp 0.25s ease ${idx * 30}ms both` }}
        >
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
          {msg.from === "user" ? (
            <div className="flex justify-end">
              <div
                className="max-w-[85%] sm:max-w-[72%] px-4 py-2.5 rounded-2xl rounded-tr-sm"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                {msg.hasFile && (
                  <div
                    className="mb-1.5 flex items-center gap-1.5 text-[11px]"
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "monospace",
                    }}
                  >
                    <span>📎</span>
                    <span className="truncate max-w-[160px]">
                      {msg.fileName || "Attached file"}
                    </span>
                  </div>
                )}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                >
                  {msg.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <ChartBlock message={msg} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── ChartBlock ───────────────────────────────────────────────────────────────
function ChartBlock({ message }: ChartBlockProps) {
  const divRef = useRef<PlotlyHTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const rendered = useRef(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);

  // Check if message is text error/response
  const isTextResponse =
    message.content?.error ||
    (typeof message.content === "string" && message.status === "success");

  // ── Pure DOM tooltip helpers ─────────────────────────────────────────────
  const showTooltip = (mx: number, my: number, data: TooltipData) => {
    const el = tooltipRef.current;
    if (!el) return;

    const CARD_W = 210;
    const CARD_H = 120;
    const GAP = 12;

    const cardRect = cardRef.current?.getBoundingClientRect();
    const rx = cardRect ? mx - cardRect.left : mx;
    const ry = cardRect ? my - cardRect.top : my;

    let left = rx - CARD_W - GAP;
    let top = ry - CARD_H / 2;

    if (left < 8) left = rx + GAP;
    if (cardRect && left + CARD_W > cardRect.width - 8)
      left = cardRect.width - CARD_W - 8;
    if (top < 8) top = 8;
    if (cardRect && top + CARD_H > cardRect.height - 8)
      top = cardRect.height - CARD_H - 8;

    el.style.left = left + "px";
    el.style.top = top + "px";
    el.style.display = "block";

    const bar = el.querySelector("#tt-bar") as HTMLElement;
    const dot = el.querySelector("#tt-dot") as HTMLElement;
    const name = el.querySelector("#tt-name") as HTMLElement;
    const val = el.querySelector("#tt-val") as HTMLElement;
    const delta = el.querySelector("#tt-delta") as HTMLElement;
    const label = el.querySelector("#tt-label") as HTMLElement;

    if (bar) bar.style.background = data.color;
    if (dot) dot.style.background = data.color;
    if (name) name.textContent = data.seriesName;

    const n = Number(data.value);
    let valStr: string;
    if (!isNaN(n)) {
      if (Math.abs(n) >= 1_000_000)
        valStr = (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
      else if (Math.abs(n) >= 1_000)
        valStr = (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
      else valStr = n % 1 === 0 ? n.toLocaleString() : n.toFixed(2);
    } else {
      valStr = String(data.value);
    }
    if (val) val.textContent = valStr;

    if (label) label.textContent = data.label;

    if (delta) {
      const hasDelta = data.prevValue != null && data.prevValue !== 0;
      if (hasDelta) {
        const pct = ((n - data.prevValue!) / Math.abs(data.prevValue!)) * 100;
        const pos = pct >= 0;
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
  };

  const hideTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  };

  // ── Track mouse and reposition tooltip ───────────────────────────────────
  useEffect(() => {
    let lastData: TooltipData | null = null;
    const track = (e: MouseEvent) => {
      if (tooltipRef.current?.style.display !== "none" && lastData) {
        showTooltip(e.clientX, e.clientY, lastData);
      }
    };
    (tooltipRef as any)._setData = (d: TooltipData) => {
      lastData = d;
    };
    window.addEventListener("mousemove", track, { passive: true });
    return () => window.removeEventListener("mousemove", track);
  }, []);

  useEffect(() => {
    if (message.status !== "success" || rendered.current || !divRef.current)
      return;
    if (isTextResponse) return;

    const tryRender = () => {
      if (!("Plotly" in window)) {
        setTimeout(tryRender, 100);
        return;
      }
      if (rendered.current || !divRef.current) return;
      rendered.current = true;
      try {
        const rawData = message.content?.data || [];
        const rawLayout = message.content?.layout || {};
        const chartType = detectType(rawData);
        const { data, layout: processedLayout } = preprocessTraces(
          rawData,
          rawLayout,
        );
        const layout = buildLayout(processedLayout, chartType);

        // 3D chart types: keep native Plotly hoverlabel and interaction intact
        const is3D = chartType === "scatter3d" || chartType === "surface";

        if (!is3D) {
          // Suppress native Plotly tooltip for all 2D chart types
          layout.hoverlabel = {
            bgcolor: "rgba(0,0,0,0)",
            bordercolor: "rgba(0,0,0,0)",
            font: { color: "rgba(0,0,0,0)", size: 1 },
          };
        }

        window.Plotly.newPlot(divRef.current, data, layout, {
          responsive: true,
          displayModeBar: false,
          scrollZoom: false,
        });

        if (!is3D) {
          divRef.current!.on("plotly_hover", (eventData: any) => {
            const pt = eventData?.points?.[0];
            if (!pt) return;

            const traceIdx = pt.curveNumber ?? 0;
            const ptIdx = pt.pointNumber ?? pt.pointIndex ?? 0;
            const traceColor = pt.data?.marker?.color;
            const color =
              typeof traceColor === "string"
                ? traceColor
                : Array.isArray(traceColor)
                  ? traceColor[ptIdx] || stableColor(traceIdx)
                  : pt.data?.line?.color || stableColor(traceIdx);

            // pie / donut expose pt.label + pt.value instead of pt.x / pt.y
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

            const tooltipData: TooltipData = {
              label: xVal,
              value: val,
              seriesName: pt.data?.name || "Value",
              color: typeof color === "string" ? color : stableColor(traceIdx),
              prevValue,
            };

            (tooltipRef as any)._setData?.(tooltipData);
            const e = eventData.event as MouseEvent;
            showTooltip(e.clientX, e.clientY, tooltipData);
          });

          divRef.current!.on("plotly_unhover", hideTooltip);
        }
      } catch (e) {
        console.error("Plotly render error:", e);
        if (divRef.current) {
          divRef.current.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;font-size:13px;gap:8px;padding:24px;text-align:center;"><span>⚠</span><span>Chart render failed — try a different chart type.</span></div>`;
        }
      }
    };
    tryRender();
  }, [message.status, message.content, isTextResponse]);

  useEffect(() => {
    const onResize = () => {
      if (divRef.current && "Plotly" in window && rendered.current) {
        const chartType = detectType(message.content?.data || []);
        window.Plotly.relayout(
          divRef.current,
          buildLayout(message.content?.layout || {}, chartType),
        );
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [message.content]);

  if (message.status === "loading") {
    return (
      <div className="flex flex-col items-start gap-3 py-5 px-2">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                background: "rgba(6,182,212,0.6)",
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            fontFamily: "monospace",
          }}
        >
          Generating visualization…
        </p>
      </div>
    );
  }

  if (message.status === "error") {
    return (
      <div
        className="p-4 text-sm rounded-xl"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#f87171",
        }}
      >
        ⚠ {message.content}
      </div>
    );
  }

  if (isTextResponse && message.status === "success") {
    const text = message.content?.error || message.content;
    return (
      <div
        className="p-4 text-sm rounded-xl"
        style={{
          background: "rgba(255,255,255,0.035)",
          border: "1px solid red",
          color: "red",
        }}
      >
        {text}
      </div>
    );
  }

  const chartTitle =
    message.content?.layout?.title?.text ||
    (typeof message.content?.layout?.title === "string"
      ? message.content.layout.title
      : "Chart");
  const chartType = detectType(message.content?.data || []);

  return (
    <>
      {editorOpen && (
        <ChartEditor
          message={message}
          divRef={divRef}
          onClose={() => setEditorOpen(false)}
        />
      )}

      <div
        ref={cardRef}
        className="rounded-2xl overflow-visible w-full"
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: "#06b6d4",
                boxShadow: "0 0 6px rgba(6,182,212,0.5)",
              }}
            />
            <span
              className="text-xs font-medium truncate"
              style={{
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "-0.01em",
              }}
            >
              {chartTitle}
            </span>
            <span
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.22)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {chartType}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                if (!divRef.current || !("Plotly" in window)) return;
                window.Plotly.downloadImage(divRef.current, {
                  format: "png",
                  width: 1400,
                  height: 800,
                  filename: chartTitle
                    .replace(/[^a-z0-9]/gi, "_")
                    .toLowerCase(),
                });
              }}
              className="sm:hidden text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide"
              style={{
                background: "rgba(6,182,212,0.15)",
                color: "#22d3ee",
                border: "1px solid rgba(6,182,212,0.2)",
              }}
            >
              PNG
            </button>
            {(["SVG", "CSV", "PNG"] as const).map((fmt, i) => (
              <button
                key={fmt}
                onClick={() => {
                  if (!divRef.current || !("Plotly" in window)) return;
                  window.Plotly.downloadImage(divRef.current, {
                    format: fmt.toLowerCase() as any,
                    width: 1400,
                    height: 800,
                    filename: chartTitle
                      .replace(/[^a-z0-9]/gi, "_")
                      .toLowerCase(),
                  });
                }}
                className="hidden sm:block text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide transition-all"
                style={
                  i === 2
                    ? {
                        background: "rgba(6,182,212,0.12)",
                        color: "#22d3ee",
                        border: "1px solid rgba(6,182,212,0.18)",
                      }
                    : {
                        color: "rgba(255,255,255,0.3)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (i !== 2) {
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.65)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (i !== 2) {
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.3)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "transparent";
                  }
                }}
              >
                {fmt}
              </button>
            ))}
            <button
              onClick={() => setToolbarOpen((v) => !v)}
              className="sm:hidden w-7 h-7 flex items-center justify-center rounded-lg ml-1 transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
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
                <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plotly chart */}
        <div
          ref={divRef}
          className="w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] px-1 sm:px-2"
        />

        {/* Mobile toolbar */}
        {toolbarOpen && (
          <div
            className="sm:hidden px-3 py-2.5 rounded-b-2xl"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <MobileToolbarInline
              divRef={divRef}
              cardRef={cardRef}
              message={message}
              onOpenEditor={() => {
                setToolbarOpen(false);
                setTimeout(() => setEditorOpen(true), 0);
              }}
              onClose={() => setToolbarOpen(false)}
            />
          </div>
        )}

        <div className="hidden sm:block">
          <ChartToolbar
            divRef={divRef}
            cardRef={cardRef}
            message={message}
            onOpenEditor={() => setEditorOpen(true)}
          />
        </div>

        {/* Premium tooltip — absolute inside card */}
        <PremiumTooltip dataRef={{ current: null }} tooltipRef={tooltipRef} />
      </div>
    </>
  );
}

// ─── MobileToolbarInline ──────────────────────────────────────────────────────
function MobileToolbarInline({
  divRef,
  cardRef,
  message,
  onOpenEditor,
  onClose,
}: {
  divRef: React.RefObject<PlotlyHTMLElement | null>;
  cardRef: React.RefObject<HTMLDivElement | null>;
  message: any;
  onOpenEditor: () => void;
  onClose: () => void;
}) {
  const [gridOn, setGridOn] = useState(true);
  const [legendOn, setLegendOn] = useState(true);

  const toggleGrid = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    const n = !gridOn;
    setGridOn(n);
    window.Plotly.relayout(divRef.current, {
      "xaxis.showgrid": n,
      "yaxis.showgrid": n,
      "xaxis.zeroline": n,
      "yaxis.zeroline": n,
    } as any);
  };
  const toggleLegend = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    const n = !legendOn;
    setLegendOn(n);
    window.Plotly.relayout(divRef.current, { showlegend: n } as any);
  };
  const resetZoom = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    window.Plotly.relayout(divRef.current, {
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    } as any);
  };

  const actions = [
    { label: "Edit", onClick: onOpenEditor, accent: true, active: false },
    {
      label: gridOn ? "Grid ✓" : "Grid",
      onClick: toggleGrid,
      active: gridOn,
      accent: false,
    },
    {
      label: legendOn ? "Legend ✓" : "Legend",
      onClick: toggleLegend,
      active: legendOn,
      accent: false,
    },
    { label: "Reset", onClick: resetZoom, active: false, accent: false },
  ];

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
          style={
            a.accent
              ? {
                  background: "rgba(6,182,212,0.15)",
                  color: "#22d3ee",
                  border: "1px solid rgba(6,182,212,0.2)",
                }
              : a.active
                ? {
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }
          }
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
