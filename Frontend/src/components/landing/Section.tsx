"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartDef {
  query: string;
  title: string;
  build: (Plotly: any, el: HTMLDivElement) => Promise<void>;
}

interface PlotlyChartProps {
  chartIndex: number;
  animating: boolean;
}

interface HeroSectionProps {
  onLaunch?: () => void;
}

// ─── Keyframes ───────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes hs-fade-up   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hs-fade-down { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hs-fade-in   { from{opacity:0} to{opacity:1} }
  @keyframes hs-scale-in  { from{opacity:0;transform:scale(0.94) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes hs-slide-r   { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes hs-slide-l   { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes hs-word      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hs-dot-pop   { 0%{opacity:0;transform:scale(0)} 65%{transform:scale(1.3)} 100%{opacity:1;transform:scale(1)} }

  @keyframes bg-scrolling {
    0%   { background-position: 0 0; }
    100% { background-position: 50px 50px; }
  }

  /* All animated children hidden until .hs-go is applied */
  .hs-root [data-anim] { opacity: 0; }

  /* Headline */
  .hs-root.hs-go [data-anim="headline"]  { animation: hs-fade-up  .65s cubic-bezier(.22,1,.36,1) .05s forwards; }

  /* Subtext */
  .hs-root.hs-go [data-anim="subtext"]   { animation: hs-fade-up  .6s  cubic-bezier(.22,1,.36,1) .22s forwards; }

  /* Whole card */
  .hs-root.hs-go [data-anim="card"]      { animation: hs-scale-in .85s cubic-bezier(.22,1,.36,1) .35s forwards; }

  /* Traffic lights */
  .hs-root.hs-go [data-anim="d0"]        { animation: hs-dot-pop  .4s  cubic-bezier(.34,1.56,.64,1) .52s forwards; }
  .hs-root.hs-go [data-anim="d1"]        { animation: hs-dot-pop  .4s  cubic-bezier(.34,1.56,.64,1) .59s forwards; }
  .hs-root.hs-go [data-anim="d2"]        { animation: hs-dot-pop  .4s  cubic-bezier(.34,1.56,.64,1) .66s forwards; }

  /* URL bar */
  .hs-root.hs-go [data-anim="urlbar"]    { animation: hs-fade-in  .5s  cubic-bezier(.22,1,.36,1) .70s forwards; }

  /* Window tabs */
  .hs-root.hs-go [data-anim="t0"]        { animation: hs-fade-down .4s cubic-bezier(.22,1,.36,1) .74s forwards; }
  .hs-root.hs-go [data-anim="t1"]        { animation: hs-fade-down .4s cubic-bezier(.22,1,.36,1) .80s forwards; }
  .hs-root.hs-go [data-anim="t2"]        { animation: hs-fade-down .4s cubic-bezier(.22,1,.36,1) .86s forwards; }

  /* Sidebar */
  .hs-root.hs-go [data-anim="hist-lbl"]  { animation: hs-fade-in  .4s ease                       .76s forwards; }
  .hs-root.hs-go [data-anim="hist-a"]    { animation: hs-slide-r  .45s cubic-bezier(.22,1,.36,1)  .82s forwards; }
  .hs-root.hs-go [data-anim="hi0"]       { animation: hs-fade-up  .4s  cubic-bezier(.22,1,.36,1)  .88s forwards; }
  .hs-root.hs-go [data-anim="hi1"]       { animation: hs-fade-up  .4s  cubic-bezier(.22,1,.36,1)  .93s forwards; }
  .hs-root.hs-go [data-anim="hi2"]       { animation: hs-fade-up  .4s  cubic-bezier(.22,1,.36,1)  .98s forwards; }
  .hs-root.hs-go [data-anim="hi3"]       { animation: hs-fade-up  .4s  cubic-bezier(.22,1,.36,1) 1.03s forwards; }
  .hs-root.hs-go [data-anim="sb-stats"]  { animation: hs-fade-in  .5s  ease                      1.10s forwards; }

  /* Main pane */
  .hs-root.hs-go [data-anim="main-msg"]  { animation: hs-slide-l  .5s  cubic-bezier(.22,1,.36,1)  .84s forwards; }
  .hs-root.hs-go [data-anim="chart-hdr"] { animation: hs-fade-down .45s cubic-bezier(.22,1,.36,1)  .92s forwards; }
  .hs-root.hs-go [data-anim="chart-body"]{ animation: hs-fade-up  .65s cubic-bezier(.22,1,.36,1)  .98s forwards; }
  .hs-root.hs-go [data-anim="input-bar"] { animation: hs-fade-up  .5s  cubic-bezier(.22,1,.36,1) 1.08s forwards; }

  @keyframes itemIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes ping   { 75%,100%{transform:scale(2);opacity:0} }
`;

// ─────────────────────────────────────────────────────────────────────────────

const HISTORY: string[] = [
  "Revenue Q4 2024",
  "User growth YoY",
  "Sales funnel",
  "Weekly activity",
];

const CHARTS: ChartDef[] = [
  {
    query: "radial chart",
    title: "Wind-Rose Distribution",
    build: (Plotly, el) => {
      const cats = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"];
      return Plotly.react(
        el,
        [
          {
            type: "barpolar",
            r: [28, 18, 34, 20, 14, 24, 30, 22],
            theta: cats,
            name: "Q4 2024",
            marker: {
              color: cats.map((_, i) => `hsl(207, 90%, ${55 + i * 3}%)`),
              line: { color: "rgba(255,255,255,0.18)", width: 1 },
            },
            base: 0,
          },
          {
            type: "barpolar",
            r: [14, 28, 18, 30, 22, 16, 20, 28],
            theta: cats,
            name: "Q3 2024",
            marker: {
              color: "hsla(262, 80%, 65%, 0.65)",
              line: { color: "hsla(262, 80%, 65%, 0.4)", width: 1 },
            },
            base: 0,
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#64748b",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          polar: {
            bgcolor: "rgba(30,41,59,0.06)",
            radialaxis: {
              visible: true,
              range: [0, 40],
              gridcolor: "rgba(148,163,184,0.12)",
              linecolor: "rgba(148,163,184,0.18)",
              tickfont: { size: 8, color: "#475569" },
              ticksuffix: "k",
            },
            angularaxis: {
              gridcolor: "rgba(148,163,184,0.10)",
              linecolor: "rgba(148,163,184,0.18)",
              tickfont: { size: 11, color: "#64748b" },
            },
          },
          legend: {
            font: { size: 10, color: "#64748b" },
            bgcolor: "rgba(15,23,42,0.85)",
            bordercolor: "rgba(148,163,184,0.12)",
            borderwidth: 1,
            x: 1.05,
            y: 1,
          },
          margin: { t: 20, b: 20, l: 30, r: 90 },
          showlegend: true,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "bar chart — monthly revenue",
    title: "Monthly Revenue",
    build: (Plotly, el) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return Plotly.react(
        el,
        [
          {
            type: "bar",
            x: months,
            y: [42, 55, 38, 70, 65, 80, 74, 90, 68, 85, 95, 110],
            name: "2024",
            marker: {
              color: months.map((_, i) => `hsl(221, 83%, ${50 + i * 2}%)`),
              line: { color: "rgba(30,58,138,0.3)", width: 0.5 },
            },
            hovertemplate: "<b>%{x}</b><br>$%{y}M<extra></extra>",
          },
          {
            type: "bar",
            x: months,
            y: [30, 40, 28, 55, 50, 62, 58, 72, 55, 68, 78, 90],
            name: "2023",
            marker: {
              color: "hsla(200, 90%, 60%, 0.65)",
              line: { color: "hsla(200, 90%, 60%, 0.4)", width: 0.5 },
            },
            hovertemplate: "<b>%{x}</b><br>$%{y}M<extra></extra>",
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#64748b",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          barmode: "group",
          bargap: 0.18,
          bargroupgap: 0.06,
          xaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
          },
          yaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
            ticksuffix: "M",
          },
          legend: {
            font: { size: 10, color: "#64748b" },
            bgcolor: "rgba(15,23,42,0.85)",
            bordercolor: "rgba(148,163,184,0.12)",
            borderwidth: 1,
            orientation: "h",
            x: 0,
            y: 1.08,
          },
          margin: { t: 36, b: 32, l: 44, r: 16 },
          showlegend: true,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "3D scatter — sales data",
    title: "3D Sales Scatter",
    build: (Plotly, el) => {
      const n = 80;
      const x = Array.from({ length: n }, () => Math.random() * 100);
      const y = Array.from({ length: n }, () => Math.random() * 100);
      const z = x.map((v, i) => v * 0.45 + y[i] * 0.35 + Math.random() * 18);
      return Plotly.react(
        el,
        [
          {
            type: "scatter3d",
            mode: "markers",
            x,
            y,
            z,
            marker: {
              size: z.map((v) => 3.5 + v / 30),
              color: z,
              colorscale: [
                [0, "rgb(59,130,246)"],
                [0.4, "rgb(99,102,241)"],
                [0.7, "rgb(139,92,246)"],
                [1, "rgb(34,197,94)"],
              ],
              opacity: 0.88,
              line: { color: "rgba(255,255,255,0.12)", width: 0.4 },
            },
            hovertemplate:
              "x: %{x:.1f}<br>y: %{y:.1f}<br>z: %{z:.1f}<extra></extra>",
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#64748b",
            size: 9,
            family: "'JetBrains Mono', monospace",
          },
          scene: {
            xaxis: {
              backgroundcolor: "transparent",
              gridcolor: "rgba(148,163,184,0.09)",
              zerolinecolor: "rgba(148,163,184,0.12)",
              tickfont: { size: 8 },
              title: { text: "Revenue", font: { size: 9, color: "#475569" } },
            },
            yaxis: {
              backgroundcolor: "transparent",
              gridcolor: "rgba(148,163,184,0.09)",
              zerolinecolor: "rgba(148,163,184,0.12)",
              tickfont: { size: 8 },
              title: { text: "Volume", font: { size: 9, color: "#475569" } },
            },
            zaxis: {
              backgroundcolor: "transparent",
              gridcolor: "rgba(148,163,184,0.09)",
              zerolinecolor: "rgba(148,163,184,0.12)",
              tickfont: { size: 8 },
              title: { text: "Score", font: { size: 9, color: "#475569" } },
            },
            bgcolor: "transparent",
            camera: { eye: { x: 1.5, y: 1.5, z: 1.0 } },
          },
          margin: { t: 0, b: 0, l: 0, r: 0 },
          showlegend: false,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "line chart — user growth",
    title: "User Growth Over Time",
    build: (Plotly, el) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return Plotly.react(
        el,
        [
          {
            type: "scatter",
            mode: "lines+markers",
            x: months,
            y: [12, 19, 28, 35, 42, 58, 65, 72, 80, 91, 105, 120],
            name: "Active Users",
            line: {
              color: "#3b82f6",
              width: 2.8,
              shape: "spline",
              smoothing: 1.2,
            },
            fill: "tozeroy",
            fillcolor: "rgba(59,130,246,0.12)",
            marker: {
              color: "#fff",
              size: 6,
              line: { color: "#3b82f6", width: 2 },
            },
            hovertemplate: "<b>%{x}</b><br>%{y}K users<extra></extra>",
          },
          {
            type: "scatter",
            mode: "lines+markers",
            x: months,
            y: [8, 13, 18, 22, 30, 40, 45, 52, 60, 70, 82, 95],
            name: "New Signups",
            line: {
              color: "#8b5cf6",
              width: 2.4,
              shape: "spline",
              smoothing: 1.2,
            },
            fill: "tozeroy",
            fillcolor: "rgba(139,92,246,0.10)",
            marker: {
              color: "#fff",
              size: 5,
              line: { color: "#8b5cf6", width: 2 },
            },
            hovertemplate: "<b>%{x}</b><br>%{y}K signups<extra></extra>",
          },
          {
            type: "scatter",
            mode: "lines",
            x: months,
            y: [5, 8, 10, 13, 12, 18, 20, 20, 20, 21, 23, 25],
            name: "Churned",
            line: {
              color: "#f43f5e",
              width: 1.6,
              shape: "spline",
              dash: "dot",
            },
            hovertemplate: "<b>%{x}</b><br>%{y}K churned<extra></extra>",
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#64748b",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          xaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
          },
          yaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            linecolor: "rgba(148,163,184,0.12)",
            tickfont: { size: 9 },
            zeroline: false,
            ticksuffix: "K",
          },
          legend: {
            font: { size: 10, color: "#64748b" },
            bgcolor: "rgba(15,23,42,0.85)",
            bordercolor: "rgba(148,163,184,0.12)",
            borderwidth: 1,
            orientation: "h",
            x: 0,
            y: 1.1,
          },
          margin: { t: 36, b: 32, l: 44, r: 16 },
          showlegend: true,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
  {
    query: "heatmap — weekly activity",
    title: "Weekly Activity Heatmap",
    build: (Plotly, el) => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const hrs = ["6am", "9am", "12pm", "3pm", "6pm", "9pm", "12am"];
      const peak: Record<string, number> = {
        Mon: 0.8,
        Tue: 0.9,
        Wed: 1.0,
        Thu: 0.95,
        Fri: 0.85,
        Sat: 0.45,
        Sun: 0.35,
      };
      const hrW = [0.4, 0.9, 1.0, 0.95, 0.7, 0.5, 0.25];
      const z = hrs.map((_, hi) =>
        days.map((d) =>
          Math.round(peak[d] * hrW[hi] * (55 + Math.random() * 45)),
        ),
      );
      return Plotly.react(
        el,
        [
          {
            type: "heatmap",
            z,
            x: days,
            y: hrs,
            colorscale: [
              [0, "rgb(241,245,249)"],
              [0.2, "rgb(165,180,252)"],
              [0.45, "rgb(99,102,241)"],
              [0.7, "rgb(34,197,94)"],
              [1, "rgb(22,163,74)"],
            ],
            showscale: true,
            colorbar: {
              thickness: 10,
              tickfont: { size: 8, color: "#64748b" },
              outlinecolor: "transparent",
              bgcolor: "transparent",
            },
            hoverongaps: false,
            hovertemplate: "%{x} %{y}<br>%{z} events<extra></extra>",
            xgap: 3,
            ygap: 3,
          },
        ],
        {
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#64748b",
            size: 10,
            family: "'JetBrains Mono', monospace",
          },
          xaxis: {
            tickfont: { size: 10 },
            linecolor: "rgba(148,163,184,0.12)",
            side: "bottom",
          },
          yaxis: {
            tickfont: { size: 9 },
            linecolor: "rgba(148,163,184,0.12)",
            autorange: "reversed",
          },
          margin: { t: 16, b: 36, l: 46, r: 68 },
          showlegend: false,
          transition: { duration: 700, easing: "cubic-in-out" },
        },
        { displayModeBar: false, responsive: true },
      );
    },
  },
];

function PlotlyChart({ chartIndex, animating }: PlotlyChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    import("plotly.js-dist-min").then(({ default: Plotly }) => {
      Plotly.purge(ref.current!);
      CHARTS[chartIndex].build(Plotly, ref.current!);
    });
  }, [chartIndex]);

  useEffect(
    () => () => {
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (ref.current) Plotly.purge(ref.current);
      });
    },
    [],
  );

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        opacity: animating ? 0 : 1,
        transform: animating
          ? "scale(0.97) translateY(6px)"
          : "scale(1) translateY(0)",
        transition:
          "opacity 0.42s ease, transform 0.42s cubic-bezier(0.16,1,0.3,1)",
      }}
    />
  );
}

export default function HeroSection({ onLaunch }: HeroSectionProps) {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [go, setGo] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Inject keyframes once
  useEffect(() => {
    const ID = "hs-kf";
    if (document.getElementById(ID)) return;
    const s = document.createElement("style");
    s.id = ID;
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
  }, []);

  // IntersectionObserver → double rAF → add .hs-go (no flash)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
          obs.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveIdx((i: number) => (i + 1) % CHARTS.length);
        setAnimating(false);
      }, 450);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const chart = CHARTS[activeIdx];

  return (
    <>
      <section
        ref={sectionRef}
        className={`hs-root relative w-full flex flex-col justify-center overflow-hidden${go ? " hs-go" : ""}`}
        style={{
          paddingTop: "4.5rem",
          paddingBottom: "4.5rem",
          /* ── Animated scrolling grid background ── */
          backgroundColor: "#d4d4d4",
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC")`,
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          animation: "bg-scrolling 0.92s linear infinite",
        }}
      >
        {/* ── Headline ── */}
        <div className="relative z-10 text-center mb-10 md:mb-16 px-4">
          <h2
            data-anim="headline"
            className="text-6xl bg-cyan-600/70 text-black p-3 rounded-lg tracking-tighter font-bold w-fit mx-auto"
          >
            Type once. Understand everything.
          </h2>

          <p
            data-anim="subtext"
            className="mt-4 md:mt-6 text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto"
          >
            Describe your data in plain English — Graph AI instantly turns it
            into beautiful, accurate charts.
          </p>
        </div>

        {/* ── APP PREVIEW CARD ── */}
        <div
          data-anim="card"
          className="relative z-10 w-full mx-auto max-w-[960px] px-4"
        >
          {/* Card shadow */}
          <div
            className="absolute -inset-px rounded-[22px] pointer-events-none"
            style={{
              boxShadow:
                "0 2px 1px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.10), 0 32px 64px rgba(0,0,0,0.07)",
              borderRadius: 22,
              zIndex: -1,
            }}
          />

          {/* Card */}
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ background: "#fafafa", borderColor: "rgba(0,0,0,0.08)" }}
            >
              <div
                data-anim="d0"
                className="w-3 h-3 rounded-full bg-[#ff5f57]"
              />
              <div
                data-anim="d1"
                className="w-3 h-3 rounded-full bg-[#febc2e]"
              />
              <div
                data-anim="d2"
                className="w-3 h-3 rounded-full bg-[#28c840]"
              />

              <div
                data-anim="urlbar"
                className="flex-1 h-6 rounded-md ml-3 flex items-center gap-1.5 px-3 border"
                style={{ background: "#fff", borderColor: "rgba(0,0,0,0.1)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span className="font-mono text-[0.67rem] text-zinc-400">
                  graphy.ai/app
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1">
                {["Workspace", "Charts", "Export"].map((t, i) => (
                  <span
                    key={t}
                    data-anim={`t${i}`}
                    className="font-mono text-[0.65rem] px-2.5 py-0.5 rounded-md transition-colors"
                    style={{
                      color: i === 0 ? "#18181b" : "#a1a1aa",
                      background: i === 0 ? "rgba(0,0,0,0.06)" : "transparent",
                      border:
                        i === 0
                          ? "1px solid rgba(0,0,0,0.09)"
                          : "1px solid transparent",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex" style={{ height: 500 }}>
              {/* Sidebar */}
              <div
                className="w-[190px] shrink-0 border-r p-3 flex flex-col gap-0.5"
                style={{
                  background: "#fafafa",
                  borderColor: "rgba(0,0,0,0.07)",
                }}
              >
                <div
                  data-anim="hist-lbl"
                  className="font-mono text-[0.58rem] text-zinc-400 tracking-[0.18em] uppercase mb-2.5 px-1"
                >
                  History
                </div>

                <div
                  data-anim="hist-a"
                  key={activeIdx}
                  className="px-2.5 py-2 rounded-lg font-mono text-[0.7rem] flex items-center gap-2 overflow-hidden"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.09)",
                    color: "#18181b",
                    animation: "itemIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-zinc-800" />
                  <span className="truncate">{chart.query}</span>
                </div>

                {HISTORY.map((t, i) => (
                  <div
                    key={i}
                    data-anim={`hi${i}`}
                    className="px-2.5 py-1.5 font-mono text-[0.68rem] rounded-lg truncate cursor-pointer text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    {t}
                  </div>
                ))}

                <div
                  data-anim="sb-stats"
                  className="mt-auto pt-3 border-t border-zinc-100 space-y-2"
                >
                  {[
                    { label: "Charts", val: "142" },
                    { label: "Exports", val: "38" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between px-1"
                    >
                      <span className="font-mono text-[0.6rem] text-zinc-400">
                        {s.label}
                      </span>
                      <span className="font-mono text-[0.68rem] text-zinc-600">
                        {s.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col p-4 gap-3 min-w-0 overflow-hidden bg-white">
                {/* User message bubble */}
                <div data-anim="main-msg" className="flex justify-end">
                  <div
                    key={`msg-${activeIdx}`}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-mono text-[0.76rem] max-w-xs"
                    style={{
                      background: "rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      color: "#3f3f46",
                      animation: "itemIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-zinc-400 shrink-0"
                    >
                      <circle
                        cx="6"
                        cy="5"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M2 11c0-2.2 1.8-4 4-4s4 1.8 4 4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    {chart.query}
                  </div>
                </div>

                {/* Chart card */}
                <div
                  data-anim="chart-body"
                  className="rounded-xl border flex-1 flex flex-col overflow-hidden min-h-0"
                  style={{
                    background: "#fff",
                    borderColor: "rgba(0,0,0,0.08)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,1), 0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Chart header */}
                  <div
                    data-anim="chart-hdr"
                    className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                    style={{
                      borderColor: "rgba(0,0,0,0.07)",
                      background: "#fafafa",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex w-2 h-2">
                        <span
                          className="absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-40"
                          style={{
                            animation:
                              "ping 2s cubic-bezier(0,0,0.2,1) infinite",
                          }}
                        />
                        <span className="relative inline-flex rounded-full w-2 h-2 bg-zinc-500" />
                      </span>
                      <span
                        key={`ttl-${activeIdx}`}
                        className="font-mono text-[0.7rem] text-zinc-500 tracking-wide"
                        style={{
                          animation:
                            "itemIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
                        }}
                      >
                        {chart.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {["SVG", "CSV", "PNG"].map((fmt) => (
                        <button
                          key={fmt}
                          className="px-2 py-0.5 rounded font-mono text-[0.63rem] transition-colors cursor-pointer"
                          style={{
                            color: fmt === "PNG" ? "#18181b" : "#a1a1aa",
                            background:
                              fmt === "PNG"
                                ? "rgba(0,0,0,0.06)"
                                : "transparent",
                            border: `1px solid ${fmt === "PNG" ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.05)"}`,
                          }}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart area */}
                  <div className="flex-1 min-h-0 p-1">
                    <PlotlyChart chartIndex={activeIdx} animating={animating} />
                  </div>
                </div>

                {/* Input bar */}
                <div
                  data-anim="input-bar"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 border shrink-0"
                  style={{
                    background: "#fafafa",
                    borderColor: "rgba(0,0,0,0.09)",
                  }}
                >
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors border border-zinc-200 bg-white">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <rect
                        x="1"
                        y="1"
                        width="12"
                        height="12"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M4 7h6M7 4v6"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[0.64rem] text-zinc-400 border border-zinc-200 bg-white hover:text-zinc-600 transition-colors shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle
                        cx="5"
                        cy="5"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M5 3v2l1.5 1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Chart Type
                  </button>

                  <input
                    readOnly
                    placeholder='Describe a chart… e.g "Monthly sales for 2024"'
                    className="flex-1 bg-transparent outline-none font-mono text-[0.74rem] text-zinc-400 placeholder:text-zinc-300 min-w-0"
                  />

                  <button className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-zinc-900 hover:bg-zinc-700 transition-colors border-none cursor-pointer">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M1 6h10M7 2l4 4-4 4"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
