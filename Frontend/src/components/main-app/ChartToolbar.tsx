"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface PlotlyHTMLElement extends HTMLDivElement {
  data?: any[];
  layout?: any;
}

const PALETTES = [
  {
    id: "ocean",
    label: "Ocean",
    colors: ["#38bdf8", "#818cf8", "#34d399", "#f472b6", "#fb923c", "#a78bfa"],
  },
  {
    id: "fire",
    label: "Fire",
    colors: ["#f97316", "#ef4444", "#eab308", "#f43f5e", "#fb923c", "#fbbf24"],
  },
  {
    id: "forest",
    label: "Forest",
    colors: ["#4ade80", "#86efac", "#6ee7b7", "#a3e635", "#34d399", "#bef264"],
  },
  {
    id: "galaxy",
    label: "Galaxy",
    colors: ["#a78bfa", "#c084fc", "#818cf8", "#e879f9", "#7dd3fc", "#f0abfc"],
  },
  {
    id: "mono",
    label: "Mono",
    colors: ["#f8fafc", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"],
  },
  {
    id: "neon",
    label: "Neon",
    colors: ["#00ff88", "#00e5ff", "#ff00c8", "#ffe600", "#ff4400", "#8800ff"],
  },
] as const;

const CONVERT_TYPES = [
  {
    id: "bar",
    label: "Bar",
    icon: (
      <svg
        width="13"
        height="13"
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
        width="13"
        height="13"
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
    id: "pie",
    label: "Pie",
    icon: (
      <svg
        width="13"
        height="13"
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
    id: "scatter",
    label: "Scatter",
    icon: (
      <svg
        width="13"
        height="13"
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
        width="13"
        height="13"
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
    id: "histogram",
    label: "Histo",
    icon: (
      <svg
        width="13"
        height="13"
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
] as const;

const EXPORT_FORMATS = ["PNG", "SVG", "JPEG"] as const;

type Palette = (typeof PALETTES)[number];
type ConvertType = (typeof CONVERT_TYPES)[number];

interface ChartToolbarProps {
  divRef: React.RefObject<PlotlyHTMLElement | null>;
  cardRef: React.RefObject<HTMLDivElement | null>;
  message: any;
  onOpenEditor: () => void;
}

function PortalPopup({
  anchorRef,
  open,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.left - 10 });
  }, [open, anchorRef]);
  if (!open || !pos) return null;
  return createPortal(
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[99999] min-w-[200px] pointer-events-auto bg-white border border-neutral-200 rounded-xl p-3 shadow-lg"
      style={{
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        transform: "translate(-100%, -50%)",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

function Tip({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ top: r.top + r.height / 2, left: r.left - 8 });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos &&
        createPortal(
          <div
            className="fixed pointer-events-none z-[99999] px-2 py-1 text-xs rounded-md bg-neutral-800 text-white whitespace-nowrap"
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              transform: "translate(-100%, -50%)",
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </div>
  );
}

function Divider() {
  return <div className="w-6 h-px bg-white/10 flex-shrink-0 my-0.5" />;
}

function PopLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-neutral-400 text-[0.65rem] tracking-wider uppercase mb-2 px-0.5">
      {children}
    </div>
  );
}

function TBtn({
  active,
  onClick,
  children,
  label,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Tip label={label}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40 ${active ? "bg-white text-neutral-900 shadow-sm border border-white/20" : "text-white/40 hover:text-white hover:bg-white/10 border border-transparent"}`}
      >
        {children}
      </button>
    </Tip>
  );
}

export default function ChartToolbar({
  divRef,
  cardRef,
  message,
  onOpenEditor,
}: ChartToolbarProps) {
  const [activePalette, setActivePalette] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [gridOn, setGridOn] = useState(true);
  const [legendOn, setLegendOn] = useState(true);
  const [bgDark, setBgDark] = useState(false);
  const [labelOn, setLabelOn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeConvert, setActiveConvert] = useState<string | null>(null);

  const convertBtnRef = useRef<HTMLDivElement>(null);
  const paletteBtnRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => {
    setShowPalette(false);
    setShowExport(false);
    setShowConvert(false);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const inside = [convertBtnRef, paletteBtnRef, exportBtnRef].some(
        (r) => r.current && r.current.contains(e.target as Node),
      );
      if (!inside) closeAll();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [closeAll]);

  const applyPalette = (palette: Palette) => {
    if (!divRef.current || !("Plotly" in window)) return;
    setActivePalette(palette.id);
    setShowPalette(false);
    (divRef.current.data ?? []).forEach((trace: any, i: number) => {
      const c = palette.colors[i % palette.colors.length];
      const update: any =
        trace.type === "pie"
          ? { "marker.colors": [[...palette.colors]] }
          : { "marker.color": [c], "line.color": [c] };
      window.Plotly.restyle(divRef.current!, update, [i]);
    });
  };

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

  const toggleBg = () => {
    if (!cardRef.current) return;
    const n = !bgDark;
    setBgDark(n);
    if (n) {
      cardRef.current.style.background = "#ffffff";
      cardRef.current.style.borderColor = "#111212";
      if (divRef.current && "Plotly" in window) {
        window.Plotly.relayout(divRef.current, {
          "xaxis.tickfont": { color: "#666" },
          "yaxis.tickfont": { color: "#666" },
          "xaxis.gridcolor": "rgba(0,0,0,0.08)",
          "yaxis.gridcolor": "rgba(0,0,0,0.08)",
          "font.color": "#333",
        } as any);
      }
    } else {
      cardRef.current.style.background = "black";
      cardRef.current.style.borderColor = "#e5e7eb";
      if (divRef.current && "Plotly" in window) {
        window.Plotly.relayout(divRef.current, {
          "xaxis.tickfont": { color: "rgba(255,255,255,0.5)" },
          "yaxis.tickfont": { color: "rgba(255,255,255,0.5)" },
          "xaxis.gridcolor": "rgba(255,255,255,0.08)",
          "yaxis.gridcolor": "rgba(255,255,255,0.08)",
          "font.color": "rgba(255,255,255,0.7)",
        } as any);
      }
    }
  };

  const toggleLabels = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    const n = !labelOn;
    setLabelOn(n);
    (divRef.current.data ?? []).forEach((trace: any, i: number) => {
      const isPie = trace.type === "pie" || trace.type === "donut";
      if (isPie) {
        window.Plotly.restyle(
          divRef.current!,
          { textinfo: n ? "label+percent" : "none" } as any,
          [i],
        );
      } else {
        if (n) {
          const vals = (trace.y ?? []).map((v: any) =>
            v !== null && v !== undefined ? String(v) : "",
          );
          window.Plotly.restyle(
            divRef.current!,
            {
              text: vals,
              texttemplate: "%{y}",
              textposition: "outside",
              textfont: { size: 10, color: "#555" },
              cliponaxis: false,
            } as any,
            [i],
          );
        } else {
          window.Plotly.restyle(
            divRef.current!,
            { text: [null], texttemplate: "", textposition: "none" } as any,
            [i],
          );
        }
      }
    });
  };

  const convertChart = (type: ConvertType) => {
    if (!divRef.current || !("Plotly" in window)) return;
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
      window.Plotly.restyle(divRef.current!, u, [i]);
    });
  };

  const download = async (fmt: (typeof EXPORT_FORMATS)[number]) => {
    if (!divRef.current || !("Plotly" in window)) return;
    setDownloading(true);
    setShowExport(false);
    try {
      const title = message.content?.layout?.title?.text || "chart";
      await window.Plotly.downloadImage(divRef.current, {
        format: fmt.toLowerCase() as any,
        width: 1400,
        height: 800,
        filename: title.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const resetZoom = () => {
    if (!divRef.current || !("Plotly" in window)) return;
    window.Plotly.relayout(divRef.current, {
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    } as any);
  };

  const currentPalette =
    PALETTES.find((p) => p.id === activePalette) ?? PALETTES[0];

  return (
    <div className="absolute -right-14 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-0.5 bg-[#111212] border border-white/8 rounded-xl px-1 py-1.5 shadow-sm">
      {/* ── OPEN EDITOR — the money button ── */}
      <Tip label="Open in editor">
        <button
          onClick={onOpenEditor}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 group relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.08))",
            border: "1px solid rgba(6,182,212,0.35)",
            boxShadow: "0 0 12px rgba(6,182,212,0.15)",
          }}
        >
          {/* Glow pulse */}
          <span
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(6,182,212,0.2), transparent)",
            }}
          />
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
          </svg>
        </button>
      </Tip>

      <Divider />

      {/* Convert chart type */}
      <div ref={convertBtnRef}>
        <TBtn
          active={showConvert}
          label="Convert chart type"
          onClick={() => {
            closeAll();
            setShowConvert((v) => !v);
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 16V4m0 0L3 8m4-4 4 4" />
            <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
          </svg>
        </TBtn>
        <PortalPopup anchorRef={convertBtnRef as any} open={showConvert}>
          <PopLabel>Switch Chart Type</PopLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {CONVERT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => convertChart(type)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs rounded-lg transition-all border ${activeConvert === type.id ? "bg-neutral-900 text-white border-neutral-900" : "text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"}`}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </PortalPopup>
      </div>

      {/* Color palette */}
      <div ref={paletteBtnRef}>
        <Tip label="Color palette">
          <button
            onClick={() => {
              closeAll();
              setShowPalette((v) => !v);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all border ${showPalette ? "bg-white/15 border-white/20" : "border-transparent hover:bg-white/10"}`}
          >
            <div className="grid grid-cols-2 gap-[2.5px]">
              {currentPalette.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-[7px] h-[7px] rounded-sm"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </button>
        </Tip>
        <PortalPopup anchorRef={paletteBtnRef as any} open={showPalette}>
          <PopLabel>Color Palette</PopLabel>
          <div className="flex flex-col gap-1.5">
            {PALETTES.map((palette) => (
              <button
                key={palette.id}
                onClick={() => applyPalette(palette)}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-all border ${activePalette === palette.id ? "bg-neutral-50 border-neutral-300" : "bg-white border-neutral-100 hover:bg-neutral-50"}`}
              >
                <div className="flex gap-0.5">
                  {palette.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span
                  className={`text-xs font-medium ${activePalette === palette.id ? "text-neutral-900" : "text-neutral-500"}`}
                >
                  {palette.label}
                </span>
                {activePalette === palette.id && (
                  <span className="ml-auto text-neutral-900 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </PortalPopup>
      </div>

      <Divider />

      <TBtn
        active={gridOn}
        label={gridOn ? "Hide grid" : "Show grid"}
        onClick={toggleGrid}
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
      </TBtn>

      <TBtn
        active={legendOn}
        label={legendOn ? "Hide legend" : "Show legend"}
        onClick={toggleLegend}
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
          <line x1="3" y1="18" x2="9" y2="18" />
          <circle cx="6" cy="18" r="2" fill="currentColor" />
          <line x1="12" y1="6" x2="21" y2="6" />
          <line x1="12" y1="12" x2="21" y2="12" />
          <line x1="12" y1="18" x2="21" y2="18" />
        </svg>
      </TBtn>

      <TBtn
        active={labelOn}
        label={labelOn ? "Hide labels" : "Show labels"}
        onClick={toggleLabels}
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
      </TBtn>

      <TBtn
        active={bgDark}
        label={bgDark ? "Light background" : "Dark background"}
        onClick={toggleBg}
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
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </TBtn>

      <Divider />

      <TBtn active={false} label="Reset zoom & pan" onClick={resetZoom}>
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
      </TBtn>

      <div ref={exportBtnRef}>
        <TBtn
          active={showExport}
          label="Export chart"
          onClick={() => {
            closeAll();
            setShowExport((v) => !v);
          }}
          disabled={downloading}
        >
          {downloading ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </TBtn>
        <PortalPopup anchorRef={exportBtnRef as any} open={showExport}>
          <PopLabel>Export As</PopLabel>
          <div className="flex flex-col gap-1">
            {EXPORT_FORMATS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => download(fmt)}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-100 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-200 transition-all"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {fmt}
              </button>
            ))}
          </div>
        </PortalPopup>
      </div>
    </div>
  );
}
