"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Plotly: any;
  }
}

const GROUPS = [
  {
    label: "Finance",
    color: "#10b981",
    templates: [
      {
        name: "Line Multi",
        type: "scatter",
        mode: "lines+markers",
        colors: ["#10b981", "#ef4444", "#6366f1"],
      },
      {
        name: "Bar P&L",
        type: "bar",
        barmode: "relative",
        colors: ["#10b981", "#ef4444"],
      },
      {
        name: "Line Rev",
        type: "scatter",
        mode: "lines+markers",
        colors: ["#10b981", "#6366f1"],
      },
      {
        name: "Area Cash",
        type: "scatter",
        mode: "lines",
        fill: "tozeroy",
        colors: ["#10b981"],
      },
    ],
  },
  {
    label: "Students",
    color: "#6366f1",
    templates: [
      {
        name: "Bar Score",
        type: "bar",
        colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"],
      },
      {
        name: "Scatter",
        type: "scatter",
        mode: "markers",
        colors: ["#6366f1", "#ec4899", "#10b981"],
      },
      { name: "Histogram", type: "histogram", colors: ["#6366f1"] },
      { name: "Box Plot", type: "box", colors: ["#6366f1", "#8b5cf6"] },
    ],
  },
  {
    label: "Science",
    color: "#06b6d4",
    templates: [
      {
        name: "Scatter",
        type: "scatter",
        mode: "markers",
        colors: ["#06b6d4", "#f59e0b", "#ef4444"],
      },
      {
        name: "Line Exp",
        type: "scatter",
        mode: "lines+markers",
        colors: ["#06b6d4", "#10b981"],
      },
      {
        name: "Area Fill",
        type: "scatter",
        mode: "lines",
        fill: "tozeroy",
        colors: ["#06b6d4"],
      },
      {
        name: "Violin",
        type: "violin",
        colors: ["#06b6d4", "#0ea5e9", "#38bdf8"],
      },
    ],
  },
  {
    label: "Business",
    color: "#f59e0b",
    templates: [
      {
        name: "Grouped",
        type: "bar",
        barmode: "group",
        colors: ["#f59e0b", "#ef4444", "#6366f1"],
      },
      {
        name: "Stacked",
        type: "bar",
        barmode: "stack",
        colors: ["#f59e0b", "#10b981", "#06b6d4"],
      },
      {
        name: "Donut KPI",
        type: "pie",
        hole: 0.55,
        colors: ["#f59e0b", "#1e293b"],
      },
      {
        name: "H-Bar",
        type: "bar",
        orientation: "h",
        colors: ["#f59e0b", "#fbbf24", "#fde68a"],
      },
    ],
  },
  {
    label: "Marketing",
    color: "#ec4899",
    templates: [
      {
        name: "Stacked",
        type: "bar",
        barmode: "stack",
        colors: ["#ec4899", "#f472b6", "#fb7185", "#fda4af"],
      },
      {
        name: "Pie Share",
        type: "pie",
        hole: 0,
        colors: ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],
      },
      {
        name: "Bar Growth",
        type: "bar",
        colors: ["#ec4899", "#f472b6", "#fb7185"],
      },
      {
        name: "Line Trend",
        type: "scatter",
        mode: "lines",
        colors: ["#ec4899"],
      },
    ],
  },
];

type Template = {
  name: string;
  type: string;
  colors: string[];
  hole?: number;
  mode?: string;
  fill?: string;
  barmode?: string;
  orientation?: string;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (w < 1 || h < 1) return;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawMiniChart(
  canvas: HTMLCanvasElement,
  tpl: Template,
  progress: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width,
    H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pad = 5;
  const cW = W - pad * 2;
  const cH = H - pad * 2;
  const p = Math.min(progress, 1);

  const bars = [0.4, 0.72, 0.55, 0.88, 0.63, 0.79];
  const line = [0.3, 0.5, 0.42, 0.68, 0.58, 0.82, 0.74];
  const pie = [0.35, 0.25, 0.2, 0.12, 0.08];

  ctx.globalAlpha = 0.95;

  if (tpl.type === "bar" || tpl.type === "waterfall") {
    const n = bars.length;
    const bW = (cW / n) * 0.62;
    const gap = cW / n;
    bars.forEach((v, i) => {
      const x = pad + i * gap + (gap - bW) / 2;
      const h = cH * v * p;
      const clr = tpl.colors[i % tpl.colors.length] || "#6366f1";
      ctx.fillStyle = clr;
      roundRect(ctx, x, pad + cH - h, bW, h, 1.5);
    });
  } else if (tpl.type === "scatter" || tpl.type === "histogram") {
    if (tpl.fill === "tozeroy") {
      const pts = line.map((v, i) => ({
        x: pad + (i / (line.length - 1)) * cW,
        y: pad + cH - cH * v * p,
      }));
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pad + cH);
      pts.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(pts[pts.length - 1].x, pad + cH);
      ctx.closePath();
      ctx.fillStyle = (tpl.colors[0] || "#6366f1") + "44";
      ctx.fill();
      ctx.beginPath();
      pts.forEach((pt, i) =>
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y),
      );
      ctx.strokeStyle = tpl.colors[0] || "#6366f1";
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.stroke();
    } else if (tpl.mode === "markers") {
      const dots = [
        [0.15, 0.7],
        [0.35, 0.3],
        [0.55, 0.8],
        [0.45, 0.5],
        [0.75, 0.6],
        [0.25, 0.9],
        [0.65, 0.25],
      ];
      dots.forEach(([sx, sy], i) => {
        ctx.beginPath();
        ctx.arc(pad + sx * cW, pad + cH - sy * cH * p, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = tpl.colors[i % tpl.colors.length] || "#6366f1";
        ctx.fill();
      });
    } else {
      const pts = line.map((v, i) => ({
        x: pad + (i / (line.length - 1)) * cW,
        y: pad + cH - cH * v * p,
      }));
      ctx.beginPath();
      pts.forEach((pt, i) =>
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y),
      );
      ctx.strokeStyle = tpl.colors[0] || "#6366f1";
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.stroke();
      if (tpl.mode?.includes("markers")) {
        pts.forEach((pt, i) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = tpl.colors[i % tpl.colors.length] || "#6366f1";
          ctx.fill();
        });
      }
    }
  } else if (tpl.type === "pie") {
    const cx = W / 2,
      cy = H / 2;
    const r = Math.min(W, H) / 2 - pad;
    const inner = tpl.hole ? r * tpl.hole : 0;
    let start = -Math.PI / 2;
    pie.forEach((slice, i) => {
      const end = start + slice * 2 * Math.PI * p;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = tpl.colors[i % tpl.colors.length] || "#6366f1";
      ctx.fill();
      start = end;
    });
    if (inner > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, inner, 0, Math.PI * 2);
      ctx.fillStyle = "#09090b";
      ctx.fill();
    }
  } else if (tpl.type === "box") {
    const n = Math.min(tpl.colors.length, 3) || 2;
    const bw = (cW / n) * 0.48;
    for (let i = 0; i < n; i++) {
      const cx = pad + (i + 0.5) * (cW / n);
      const q1 = cH * 0.28,
        q3 = cH * 0.68,
        med = cH * 0.5;
      const wLow = cH * 0.15,
        wHigh = cH * 0.82;
      const clr = tpl.colors[i] || "#6366f1";
      ctx.strokeStyle = clr;
      ctx.lineWidth = 1.2;
      const bx = cx - bw / 2,
        by = pad + cH - q3 * p,
        bh = (q3 - q1) * p;
      ctx.fillStyle = clr + "33";
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.beginPath();
      ctx.moveTo(bx, pad + cH - med * p);
      ctx.lineTo(bx + bw, pad + cH - med * p);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, pad + cH - q1 * p);
      ctx.lineTo(cx, pad + cH - wLow * p);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, pad + cH - q3 * p);
      ctx.lineTo(cx, pad + cH - wHigh * p);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 3, pad + cH - wLow * p);
      ctx.lineTo(cx + 3, pad + cH - wLow * p);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 3, pad + cH - wHigh * p);
      ctx.lineTo(cx + 3, pad + cH - wHigh * p);
      ctx.stroke();
    }
  } else if (tpl.type === "violin") {
    const n = Math.min(tpl.colors.length, 3) || 2;
    for (let i = 0; i < n; i++) {
      const cx = pad + (i + 0.5) * (cW / n);
      const maxW = (cW / n) * 0.38;
      const clr = tpl.colors[i] || "#06b6d4";
      ctx.beginPath();
      for (let yi = 0; yi <= 1; yi += 0.025) {
        const bell = Math.exp(-Math.pow((yi - 0.5) * 4, 2)) * maxW * p;
        const py = pad + cH - yi * cH;
        yi === 0 ? ctx.moveTo(cx, py) : ctx.lineTo(cx + bell, py);
      }
      for (let yi = 1; yi >= 0; yi -= 0.025) {
        const bell = Math.exp(-Math.pow((yi - 0.5) * 4, 2)) * maxW * p;
        const py = pad + cH - yi * cH;
        ctx.lineTo(cx - bell, py);
      }
      ctx.closePath();
      ctx.fillStyle = clr + "55";
      ctx.fill();
      ctx.strokeStyle = clr;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function MiniChart({ tpl, animate }: { tpl: Template; animate: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    cancelAnimationFrame(rafRef.current);

    if (animate) {
      startRef.current = Date.now();
      const run = () => {
        const elapsed = (Date.now() - startRef.current) / 700;
        const ease = (x: number) =>
          x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        drawMiniChart(canvas, tpl, ease(Math.min(elapsed, 1)));
        if (elapsed < 1) rafRef.current = requestAnimationFrame(run);
      };
      rafRef.current = requestAnimationFrame(run);
    } else {
      drawMiniChart(canvas, tpl, 1);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, tpl]);

  useEffect(() => {
    if (ref.current) drawMiniChart(ref.current, tpl, 1);
  }, []);

  return (
    <canvas ref={ref} width={58} height={42} style={{ display: "block" }} />
  );
}

// ── Generator functions with full ChartEditor conversion logic ─────────────────────

function generateBoxData(sourceTraces: any[], palette: string[]) {
  return sourceTraces.map((trace: any, i: number) => {
    const rawY: number[] =
      trace.y?.map(Number).filter((n: number) => !isNaN(n)) || [];
    const syntheticY =
      rawY.length >= 4
        ? rawY
        : [10, 15, 13, 17, 14, 12, 18, 11, 16, 13, 15, 14, 19, 12, 17];
    return {
      type: "box",
      name: trace.name || `Series ${i + 1}`,
      y: syntheticY,
      marker: { color: palette[i % palette.length] },
      boxmean: true,
    };
  });
}

function generateViolinData(sourceTraces: any[], palette: string[]) {
  return sourceTraces.map((trace: any, i: number) => {
    const rawY: number[] =
      trace.y?.map(Number).filter((n: number) => !isNaN(n)) || [];
    const syntheticY =
      rawY.length >= 5
        ? rawY
        : Array.from({ length: 30 }, () => Math.random() * 20 + 5);
    return {
      type: "violin",
      name: trace.name || `Series ${i + 1}`,
      y: syntheticY,
      marker: { color: palette[i % palette.length] },
      box: { visible: true },
      meanline: { visible: true },
    };
  });
}

function generateHistogramData(sourceTraces: any[], palette: string[]) {
  return sourceTraces.map((trace: any, i: number) => {
    const rawX: number[] =
      trace.y?.map(Number).filter((n: number) => !isNaN(n)) ||
      trace.x?.map(Number).filter((n: number) => !isNaN(n)) ||
      [];
    const syntheticX =
      rawX.length >= 5
        ? rawX
        : Array.from({ length: 50 }, () => Math.random() * 20 + i * 5);
    return {
      type: "histogram",
      name: trace.name || `Series ${i + 1}`,
      x: syntheticX,
      marker: { color: palette[i % palette.length] },
      opacity: 0.8,
    };
  });
}

function generateHeatmapData(sourceTraces: any[]) {
  // Only reuse source if it is ALREADY a properly structured heatmap with a z matrix
  const isRealHeatmap =
    sourceTraces[0]?.type === "heatmap" &&
    sourceTraces[0]?.z &&
    Array.isArray(sourceTraces[0].z[0]);

  if (isRealHeatmap) return sourceTraces;

  // Generate a clean, visually correct 7x5 heatmap with realistic values
  const xLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const yLabels = [
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5",
    "Week 6",
    "Week 7",
  ];
  // Use sine/cosine so it looks like a real pattern not pure random
  const z = yLabels.map((_, r) =>
    xLabels.map((_, c) =>
      Math.round(
        50 + 35 * Math.sin(r * 0.8 + c * 0.5) + 15 * Math.cos(r * 0.4),
      ),
    ),
  );
  return [
    {
      type: "heatmap",
      z,
      x: xLabels,
      y: yLabels,
      colorscale: "Viridis",
      showscale: true,
    },
  ];
}

function generateFunnelData(
  sourceTraces: any[],
  palette: string[],
  stacked: boolean = false,
) {
  if (stacked) {
    return sourceTraces.map((trace: any, i: number) => ({
      type: "funnel",
      name: trace.name || `Stage ${i + 1}`,
      y: trace.x || ["Awareness", "Interest", "Desire", "Action"],
      x: trace.y || [500 - i * 80, 400 - i * 60, 300 - i * 50, 200 - i * 40],
      marker: { color: palette[i % palette.length] },
    }));
  }
  const trace0 = sourceTraces[0] || {};
  const rawX = trace0.x || [];
  const rawY = (trace0.y || []).map(Number);

  // Check if x values are string labels (not numeric years/coords)
  const xHasStringLabels =
    rawX.length > 0 &&
    rawX.some((v: any) => typeof v === "string" && isNaN(Number(v)));

  // Only use source data if it has real string labels AND a manageable number of stages (<=10)
  if (xHasStringLabels && rawX.length <= 10 && rawY.length > 0) {
    const barColors = rawX.map(
      (_: any, i: number) => palette[i % palette.length],
    );
    return [
      {
        type: "funnel",
        name: trace0.name || "Funnel",
        y: rawX.map(String),
        x: rawY,
        marker: { color: barColors },
        textinfo: "value+percent initial",
      },
    ];
  }

  // Fallback: use demo funnel data
  const demoY = [
    "Awareness",
    "Interest",
    "Consideration",
    "Intent",
    "Purchase",
  ];
  const demoX = [1000, 720, 480, 280, 120];
  const barColors = demoY.map(
    (_: any, i: number) => palette[i % palette.length],
  );
  return [
    {
      type: "funnel",
      name: "Funnel",
      y: demoY,
      x: demoX,
      marker: { color: barColors },
      textinfo: "value+percent initial",
    },
  ];
}

function generateWaterfallData(sourceTraces: any[], palette: string[]) {
  const trace0 = sourceTraces[0] || {};
  const x: string[] = trace0.x || ["Start", "Q1", "Q2", "Q3", "Q4", "Total"];
  const y: number[] = (trace0.y || [100, 20, -15, 35, -10, 130]).map(Number);
  return [
    {
      type: "waterfall",
      name: trace0.name || "Waterfall",
      x,
      y,
      measure: y.map((_, i) =>
        i === 0 || i === y.length - 1 ? "absolute" : "relative",
      ),
      connector: { line: { color: "rgb(63,63,63)" } },
      increasing: { marker: { color: palette[1] || "#10b981" } },
      decreasing: { marker: { color: "#ef4444" } },
      totals: { marker: { color: palette[0] || "#3b82f6" } },
    },
  ];
}

function buildPieData(rawData: any[], pal: string[], hole?: number) {
  if (rawData.length === 0) return [];
  // If already pie data, just update
  if (rawData[0]?.type === "pie") {
    return rawData.map((t: any) => ({
      ...t,
      type: "pie",
      hole: hole || 0,
      marker: { ...t.marker, colors: pal },
    }));
  }
  const labels: string[] = [];
  const values: number[] = [];
  rawData.forEach((trace: any, i: number) => {
    const name = trace.name || `Series ${i + 1}`;
    const vals: number[] = trace.y || trace.values || trace.r || [];
    const total = Array.isArray(vals)
      ? vals.reduce((s: number, v: any) => s + (Number(v) || 0), 0)
      : Number(vals) || 0;
    labels.push(name);
    values.push(total);
  });
  return [
    {
      type: "pie",
      labels,
      values,
      hole: hole || 0,
      marker: { colors: pal },
      textinfo: "label+percent",
      hoverinfo: "label+value+percent",
    },
  ];
}

function applyTemplate(tpl: Template) {
  if (!window.Plotly) return;
  const chartDiv = document.getElementById("main-chart-div");
  if (!chartDiv || !(chartDiv as any).data) return;

  // Always use original data so conversions start from clean source
  const src: any[] = JSON.parse(
    JSON.stringify(
      (window as any).__graphixOriginalData || (chartDiv as any).data,
    ),
  );
  const baseLayout: any = {
    ...((window as any).__graphixOriginalLayout || (chartDiv as any).layout),
  };
  const pal =
    tpl.colors.length > 0
      ? tpl.colors
      : ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  let newData: any[];

  // Route to the correct generator based on chart type
  switch (tpl.type) {
    case "pie":
      newData = buildPieData(src, pal, tpl.hole || 0);
      break;
    case "waterfall":
      newData = generateWaterfallData(src, pal);
      break;
    case "funnel":
      newData = generateFunnelData(src, pal, false);
      break;
    case "box":
      newData = generateBoxData(src, pal);
      break;
    case "violin":
      newData = generateViolinData(src, pal);
      break;
    case "heatmap":
      newData = generateHeatmapData(src);
      break;
    case "histogram":
      newData = generateHistogramData(src, pal);
      break;
    case "scatter":
    case "bar":
    default: {
      // bar / scatter / line / area - standard conversions
      newData = src.map((t: any, i: number) => {
        const clr = pal[i % pal.length];
        const base: any = {
          ...t,
          type:
            tpl.type === "scatter" || tpl.type === "bar" ? tpl.type : "scatter",
          name: t.name || `Series ${i + 1}`,
          marker: { ...(t.marker || {}), color: clr },
          line: { ...(t.line || {}), color: clr },
        };

        // Apply mode for scatter plots
        if (tpl.mode) {
          base.mode = tpl.mode;
        } else if (base.type === "scatter") {
          base.mode = "lines";
        } else {
          delete base.mode;
        }

        // Apply fill for area charts
        if (tpl.fill) {
          base.fill = tpl.fill;
          base.fillcolor = clr + "33";
        } else {
          delete base.fill;
        }

        // Apply orientation for horizontal bars
        if (tpl.orientation) {
          base.orientation = tpl.orientation;
        } else {
          delete base.orientation;
        }

        // Clean up incompatible fields
        delete base.hole;
        delete base.labels;
        delete base.values;

        return base;
      });
      break;
    }
  }

  const newLayout = { ...baseLayout };

  // Set barmode for bar charts
  if (tpl.barmode) {
    newLayout.barmode = tpl.barmode;
  } else if (tpl.type === "bar") {
    newLayout.barmode = "group";
  }

  // Remove standard axes for chart types that don't use them
  if (tpl.type === "pie" || tpl.type === "funnel" || tpl.type === "heatmap") {
    delete newLayout.xaxis;
    delete newLayout.yaxis;
  }

  window.Plotly.react(chartDiv, newData, newLayout, {
    responsive: true,
    displayModeBar: false,
  });
  (window as any).__graphixCurrentData = newData;
  (window as any).__graphixCurrentLayout = newLayout;
}

export default function ChartTemplatePanel() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  // Clear active template when chart is reset or new AI response arrives
  useEffect(() => {
    const handler = () => setActiveKey(null);
    window.addEventListener("graphix-reset-template", handler);
    window.addEventListener("graphix-new-chart", handler);
    return () => {
      window.removeEventListener("graphix-reset-template", handler);
      window.removeEventListener("graphix-new-chart", handler);
    };
  }, []);

  return (
    <div
      className="flex flex-col overflow-y-auto flex-shrink-0"
      style={{
        width: 92,
        background: "#09090b",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        scrollbarWidth: "none",
      }}
    >
      <div
        className="px-2 pt-3 pb-1 text-center sticky top-0 z-10"
        style={{ background: "#09090b" }}
      >
        <span
          style={{
            fontSize: 8,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.18)",
            fontFamily: "DM Mono,monospace",
          }}
        >
          Templates
        </span>
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} className="mb-1">
          {/* Group label */}
          <div className="flex items-center gap-1.5 px-2 py-1">
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: group.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 8,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: group.color,
                fontFamily: "DM Mono,monospace",
                opacity: 0.85,
              }}
            >
              {group.label}
            </span>
          </div>

          {group.templates.map((tpl, ti) => {
            const key = `${group.label}-${ti}`;
            const isActive = activeKey === key;
            const isHover = hoverKey === key;

            return (
              <button
                key={key}
                title={tpl.name}
                onClick={() => {
                  setActiveKey(key);
                  applyTemplate(tpl as Template);
                }}
                onMouseEnter={() => setHoverKey(key)}
                onMouseLeave={() => setHoverKey(null)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "calc(100% - 12px)",
                  margin: "0 6px 3px",
                  padding: "4px 4px 3px",
                  borderRadius: 8,
                  background: isActive
                    ? "rgba(255,255,255,0.08)"
                    : isHover
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? group.color + "66" : isHover ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {/* Canvas preview */}
                <div
                  style={{
                    width: 60,
                    height: 44,
                    borderRadius: 5,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MiniChart
                    tpl={tpl as Template}
                    animate={isHover || isActive}
                  />
                </div>
                <span
                  style={{
                    fontSize: 8,
                    marginTop: 3,
                    color: isActive ? group.color : "rgba(255,255,255,0.3)",
                    fontFamily: "DM Mono,monospace",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {tpl.name}
                </span>
              </button>
            );
          })}

          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.04)",
              margin: "4px 8px 4px",
            }}
          />
        </div>
      ))}
    </div>
  );
}
