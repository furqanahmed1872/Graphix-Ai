"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface ChartDef {
  query: string;
  badge: string;
  accentClass: string;
  accentHex: string;
  build: (Plotly: any, el: HTMLDivElement) => Promise<void>;
}

/* ─── Shared layout helpers ─── */
const FONT = { family: "'JetBrains Mono', 'Fira Code', monospace", size: 11 };
const TRANSPARENT = "rgba(0,0,0,0)";
const GRID = "rgba(255,255,255,0.06)";
const TICK = { color: "rgba(255,255,255,0.4)", size: 10, family: FONT.family };
const NO_BAR = { displayModeBar: false, responsive: true };

const CHARTS: ChartDef[] = [
  /* ── 1. 3-D SURFACE ─────────────────────────────────────────────── */
  {
    query: "3D revenue landscape across product lines and quarters",
    badge: "3D SURFACE",
    accentClass: "text-violet-400 border-violet-500/40 bg-violet-500/10",
    accentHex: "#a78bfa",
    build: async (Plotly, el) => {
      const size = 30;
      const z: number[][] = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => {
          const x = (i / size) * 4 - 2;
          const y = (j / size) * 4 - 2;
          return (
            Math.sin(Math.sqrt(x * x + y * y) * 2.5) *
              Math.exp(-0.18 * (x * x + y * y)) *
              60 +
            Math.sin(x * 1.8) * Math.cos(y * 1.4) * 20 +
            Math.random() * 3
          );
        }),
      );
      await Plotly.react(
        el,
        [
          {
            type: "surface",
            z,
            colorscale: [
              [0, "#1e1b4b"],
              [0.25, "#4c1d95"],
              [0.5, "#7c3aed"],
              [0.7, "#a78bfa"],
              [0.85, "#c4b5fd"],
              [1, "#ede9fe"],
            ],
            showscale: false,
            opacity: 0.95,
            contours: {
              z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#c4b5fd",
                project: { z: true },
                width: 1,
              },
            },
            lighting: {
              ambient: 0.6,
              diffuse: 0.8,
              specular: 0.4,
              roughness: 0.5,
              fresnel: 0.5,
            },
            lightposition: { x: 100, y: 200, z: 150 },
          },
        ],
        {
          paper_bgcolor: TRANSPARENT,
          scene: {
            bgcolor: TRANSPARENT,
            xaxis: {
              gridcolor: GRID,
              showbackground: false,
              tickfont: TICK,
              title: {
                text: "Product Line",
                font: { ...FONT, color: "rgba(255,255,255,0.4)" },
              },
            },
            yaxis: {
              gridcolor: GRID,
              showbackground: false,
              tickfont: TICK,
              title: {
                text: "Quarter",
                font: { ...FONT, color: "rgba(255,255,255,0.4)" },
              },
            },
            zaxis: {
              gridcolor: GRID,
              showbackground: false,
              tickfont: TICK,
              title: {
                text: "Revenue ($k)",
                font: { ...FONT, color: "rgba(255,255,255,0.4)" },
              },
            },
            camera: { eye: { x: 1.6, y: 1.6, z: 1.1 } },
          },
          margin: { t: 0, b: 0, l: 0, r: 0 },
        },
        NO_BAR,
      );
    },
  },

  /* ── 2. SANKEY FLOW ──────────────────────────────────────────────── */
  {
    query: "Customer journey funnel — sessions to revenue flow",
    badge: "SANKEY FLOW",
    accentClass: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
    accentHex: "#22d3ee",
    build: async (Plotly, el) => {
      await Plotly.react(
        el,
        [
          {
            type: "sankey",
            orientation: "h",
            arrangement: "snap",
            node: {
              pad: 18,
              thickness: 22,
              line: { color: "rgba(0,0,0,0)", width: 0 },
              label: [
                "Organic",
                "Paid",
                "Referral",
                "Direct",
                "Landing Page",
                "Product Page",
                "Cart",
                "Checkout",
                "Revenue",
              ],
              color: [
                "#22d3ee",
                "#06b6d4",
                "#0891b2",
                "#0e7490",
                "#a78bfa",
                "#7c3aed",
                "#34d399",
                "#10b981",
                "#f59e0b",
              ],
              x: [0.01, 0.01, 0.01, 0.01, 0.28, 0.28, 0.55, 0.55, 0.99],
              y: [0.1, 0.35, 0.6, 0.85, 0.2, 0.65, 0.3, 0.7, 0.5],
            },
            link: {
              source: [0, 0, 1, 1, 2, 3, 4, 4, 5, 5, 6, 7],
              target: [4, 5, 4, 5, 4, 5, 6, 7, 6, 7, 8, 8],
              value: [
                3200, 800, 1800, 400, 900, 600, 2100, 1800, 600, 700, 3900,
                1300,
              ],
              color: [
                "rgba(34,211,238,0.2)",
                "rgba(34,211,238,0.12)",
                "rgba(6,182,212,0.2)",
                "rgba(6,182,212,0.12)",
                "rgba(8,145,178,0.18)",
                "rgba(14,116,144,0.18)",
                "rgba(167,139,250,0.22)",
                "rgba(167,139,250,0.18)",
                "rgba(124,58,237,0.2)",
                "rgba(124,58,237,0.18)",
                "rgba(52,211,153,0.25)",
                "rgba(245,158,11,0.2)",
              ],
            },
          },
        ],
        {
          paper_bgcolor: TRANSPARENT,
          font: { color: "rgba(255,255,255,0.6)", ...FONT },
          margin: { t: 10, b: 10, l: 10, r: 10 },
        },
        NO_BAR,
      );
    },
  },

  /* ── 3. CANDLESTICK + VOLUME ─────────────────────────────────────── */
  {
    query: "60-day OHLC candlestick with volume overlay",
    badge: "CANDLESTICK",
    accentClass: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    accentHex: "#34d399",
    build: async (Plotly, el) => {
      const days = 60;
      let price = 142;
      const dates: string[] = [];
      const open: number[] = [];
      const high: number[] = [];
      const low: number[] = [];
      const close: number[] = [];
      const vol: number[] = [];
      const base = new Date("2024-01-01");
      for (let i = 0; i < days; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        dates.push(d.toISOString().slice(0, 10));
        const o = price + (Math.random() - 0.5) * 3;
        const c = o + (Math.random() - 0.47) * 5;
        const h = Math.max(o, c) + Math.random() * 3;
        const l = Math.min(o, c) - Math.random() * 3;
        open.push(+o.toFixed(2));
        high.push(+h.toFixed(2));
        low.push(+l.toFixed(2));
        close.push(+c.toFixed(2));
        vol.push(Math.round(500000 + Math.random() * 1500000));
        price = c;
      }
      await Plotly.react(
        el,
        [
          {
            type: "candlestick",
            x: dates,
            open,
            high,
            low,
            close,
            name: "GRFX",
            increasing: {
              line: { color: "#34d399", width: 1.5 },
              fillcolor: "#34d399",
            },
            decreasing: {
              line: { color: "#f87171", width: 1.5 },
              fillcolor: "#f87171",
            },
            whiskerwidth: 0.3,
            xaxis: "x",
            yaxis: "y",
          },
          {
            type: "bar",
            x: dates,
            y: vol,
            name: "Volume",
            marker: {
              color: close.map((c, i) =>
                i === 0 || c >= open[i]
                  ? "rgba(52,211,153,0.25)"
                  : "rgba(248,113,113,0.25)",
              ),
            },
            xaxis: "x",
            yaxis: "y2",
          },
        ],
        {
          paper_bgcolor: TRANSPARENT,
          plot_bgcolor: TRANSPARENT,
          font: { color: "rgba(255,255,255,0.5)", ...FONT },
          margin: { t: 10, b: 48, l: 60, r: 12 },
          showlegend: false,
          xaxis: {
            rangeslider: { visible: false },
            gridcolor: GRID,
            tickfont: TICK,
            type: "date",
          },
          yaxis: {
            gridcolor: GRID,
            tickfont: TICK,
            title: {
              text: "Price ($)",
              font: { ...FONT, color: "rgba(255,255,255,0.3)", size: 10 },
            },
            domain: [0.28, 1],
          },
          yaxis2: {
            gridcolor: "rgba(255,255,255,0.03)",
            tickfont: { ...TICK, size: 9 },
            title: {
              text: "Volume",
              font: { ...FONT, color: "rgba(255,255,255,0.3)", size: 9 },
            },
            domain: [0, 0.22],
          },
        },
        NO_BAR,
      );
    },
  },

  /* ── 4. RADAR / SPIDER ──────────────────────────────────────────── */
  {
    query: "Competitive benchmarking across 7 product dimensions",
    badge: "RADAR",
    accentClass: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    accentHex: "#fbbf24",
    build: async (Plotly, el) => {
      const dims = [
        "Performance",
        "Scalability",
        "UX",
        "Integrations",
        "Security",
        "Support",
        "Price",
      ];
      const closeArr = <T,>(a: T[]) => [...a, a[0]];
      await Plotly.react(
        el,
        [
          {
            type: "scatterpolar",
            r: closeArr([92, 78, 88, 95, 80, 70, 65]),
            theta: closeArr(dims),
            fill: "toself",
            fillcolor: "rgba(251,191,36,0.12)",
            line: { color: "#fbbf24", width: 2.5 },
            name: "Graphix",
            marker: { color: "#fbbf24", size: 6 },
          },
          {
            type: "scatterpolar",
            r: closeArr([70, 85, 60, 72, 88, 90, 75]),
            theta: closeArr(dims),
            fill: "toself",
            fillcolor: "rgba(99,102,241,0.12)",
            line: { color: "#818cf8", width: 2, dash: "dot" },
            name: "Competitor A",
            marker: { color: "#818cf8", size: 5 },
          },
          {
            type: "scatterpolar",
            r: closeArr([58, 65, 80, 60, 70, 55, 90]),
            theta: closeArr(dims),
            fill: "toself",
            fillcolor: "rgba(236,72,153,0.1)",
            line: { color: "#f472b6", width: 2, dash: "dash" },
            name: "Competitor B",
            marker: { color: "#f472b6", size: 5 },
          },
        ],
        {
          paper_bgcolor: TRANSPARENT,
          polar: {
            bgcolor: TRANSPARENT,
            radialaxis: {
              visible: true,
              range: [0, 100],
              gridcolor: "rgba(255,255,255,0.08)",
              tickfont: TICK,
              tickcolor: "transparent",
            },
            angularaxis: {
              gridcolor: "rgba(255,255,255,0.1)",
              tickfont: { ...FONT, size: 10.5, color: "rgba(255,255,255,0.6)" },
              linecolor: "rgba(255,255,255,0.1)",
            },
          },
          showlegend: true,
          legend: {
            orientation: "h",
            y: -0.08,
            font: { ...FONT, size: 10, color: "rgba(255,255,255,0.5)" },
          },
          margin: { t: 20, b: 50, l: 50, r: 50 },
        },
        NO_BAR,
      );
    },
  },

  /* ── 5. ANIMATED SCATTER BUBBLE ─────────────────────────────────── */
  {
    query: "Market bubble map — size = ARR, color = growth rate",
    badge: "BUBBLE MAP",
    accentClass: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    accentHex: "#fb7185",
    build: async (Plotly, el) => {
      const n = 55;
      const rand = (a: number, b: number) => a + Math.random() * (b - a);
      const x = Array.from({ length: n }, () => rand(5, 95));
      const y = Array.from({ length: n }, () => rand(10, 90));
      const size = Array.from({ length: n }, () => rand(8, 48));
      const color = Array.from({ length: n }, () => rand(-20, 80));
      const labels = Array.from({ length: n }, (_, i) => `Company ${i + 1}`);
      await Plotly.react(
        el,
        [
          {
            type: "scatter",
            mode: "markers+text",
            x,
            y,
            text: labels.map((l, i) => (size[i] > 35 ? l : "")),
            textfont: {
              size: 8.5,
              color: "rgba(255,255,255,0.7)",
              family: FONT.family,
            },
            textposition: "middle center",
            marker: {
              size,
              sizemode: "diameter",
              color,
              colorscale: [
                [0, "#dc2626"],
                [0.35, "#f97316"],
                [0.6, "#facc15"],
                [0.8, "#34d399"],
                [1, "#22d3ee"],
              ],
              showscale: true,
              colorbar: {
                thickness: 10,
                len: 0.75,
                tickfont: TICK,
                title: {
                  text: "Growth %",
                  font: { ...FONT, size: 9, color: "rgba(255,255,255,0.4)" },
                  side: "right",
                },
                outlinewidth: 0,
                bgcolor: "rgba(0,0,0,0)",
              },
              opacity: 0.82,
              line: { color: "rgba(255,255,255,0.15)", width: 1 },
            },
            hovertemplate:
              "<b>%{text}</b><br>NRR: %{x:.0f}%<br>CAC Payback: %{y:.0f}mo<br>ARR: $%{marker.size:.0f}M<extra></extra>",
          },
        ],
        {
          paper_bgcolor: TRANSPARENT,
          plot_bgcolor: TRANSPARENT,
          font: { color: "rgba(255,255,255,0.5)", ...FONT },
          margin: { t: 12, b: 48, l: 50, r: 60 },
          showlegend: false,
          xaxis: {
            title: {
              text: "Net Revenue Retention (%)",
              font: { ...FONT, size: 10, color: "rgba(255,255,255,0.35)" },
            },
            gridcolor: GRID,
            tickfont: TICK,
            zeroline: false,
          },
          yaxis: {
            title: {
              text: "CAC Payback (months)",
              font: { ...FONT, size: 10, color: "rgba(255,255,255,0.35)" },
            },
            gridcolor: GRID,
            tickfont: TICK,
            zeroline: false,
          },
        },
        NO_BAR,
      );
    },
  },
];

/* ─── Plotly wrapper component ─────────────────────────────────────────── */
function PlotlyChart({
  chart,
  animating,
}: {
  chart: ChartDef;
  animating: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    setReady(false);
    let cancelled = false;
    import("plotly.js-dist-min").then(({ default: Plotly }) => {
      if (cancelled || !ref.current) return;
      chart.build(Plotly, ref.current).then(() => {
        if (!cancelled) setReady(true);
      });
    });
    return () => {
      cancelled = true;
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (ref.current) Plotly.purge(ref.current);
      });
    };
  }, [chart]);

  return (
    <div
      ref={ref}
      className="w-full h-full transition-all duration-500"
      style={{
        opacity: animating || !ready ? 0 : 1,
        transform: animating
          ? "scale(0.97) translateY(8px)"
          : "scale(1) translateY(0)",
        transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
      }}
    />
  );
}

/* ─── Main export ──────────────────────────────────────────────────────── */
export default function LiveDemoSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  /* Intersection observer for entrance animation */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Auto-rotate every 6s */
  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % CHARTS.length);
        setAnimating(false);
      }, 440);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const switchTo = (i: number) => {
    if (i === activeIdx) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveIdx(i);
      setAnimating(false);
    }, 340);
  };

  const chart = CHARTS[activeIdx];

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="relative overflow-hidden py-24 bg-[#111212]"
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-cyan-600/8 blur-[100px]" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* ── Header ── */}
        <div
          className="text-center mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/[0.08] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-cyan-400">
              Live demo
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Charts that make people{" "}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              stop scrolling
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-light">
            Type a prompt. Get a publication-ready chart in seconds. Export,
            share, embed.
          </p>
        </div>

        {/* ── Tab strip ── */}
        <div
          className="flex justify-center gap-2 flex-wrap mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition:
              "opacity 0.6s ease 0.15s, transform 0.6s cubic-bezier(.22,1,.36,1) 0.15s",
          }}
        >
          {CHARTS.map((c, i) => (
            <button
              key={i}
              onClick={() => switchTo(i)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase font-mono border transition-all duration-200 cursor-pointer ${
                i === activeIdx
                  ? c.accentClass
                  : "border-white/10 text-white/25 hover:text-white/50 hover:border-white/20"
              }`}
            >
              {c.badge}
            </button>
          ))}
        </div>

        {/* ── Main card ── */}
        <div
          className="rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          style={{
            background: "#111212",
            opacity: visible ? 1 : 0,
            transform: visible
              ? "scale(1) translateY(0)"
              : "scale(0.97) translateY(24px)",
            transition:
              "opacity 0.75s ease 0.25s, transform 0.75s cubic-bezier(.22,1,.36,1) 0.25s",
          }}
        >
          {/* Mac titlebar */}
          <div className="flex items-center gap-0 px-5 h-11 border-b border-white/[0.05] bg-white/[0.02]">
            <div className="flex gap-1.5 mr-4">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div
                  key={c}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 h-7 max-w-xs flex-1 rounded-md bg-white/[0.03] border border-white/[0.06] px-3">
                <span className="text-[8px] text-white/15">●</span>
                <span className="font-mono text-[10px] text-white/25">
                  graphix.ai/app
                </span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-white/15 tracking-wider">
              Graphix — Chart Editor
            </span>
          </div>

          {/* Prompt bar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.01]">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300"
              style={{
                background: chart.accentHex,
                boxShadow: `0 0 8px ${chart.accentHex}80`,
              }}
            />
            <p
              className="font-mono text-[12px] text-white/45 flex-1 transition-opacity duration-300"
              style={{ opacity: animating ? 0 : 1 }}
            >
              <span className="text-white/15">→ </span>
              {chart.query}
            </p>
            <span
              className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-md border ${chart.accentClass}`}
            >
              {chart.badge}
            </span>
          </div>

          {/* Chart area */}
          <div className="h-[420px] px-3 py-4 relative">
            {/* Subtle inner glow behind chart */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20 rounded-xl"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, ${chart.accentHex}18, transparent 70%)`,
              }}
            />
            <PlotlyChart chart={chart} animating={animating} />
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-white/[0.01]">
            <div className="flex gap-4">
              {["PNG", "SVG", "CSV", "JSON"].map((fmt) => (
                <span
                  key={fmt}
                  className="font-mono text-[9px] text-white/20 font-bold tracking-widest uppercase hover:text-white/50 cursor-pointer transition-colors"
                >
                  ↓ {fmt}
                </span>
              ))}
            </div>
            <Link
              href="/app"
              // Instead of "hidden sm:flex", use:
              className=" items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Build yours free <span className="text-base leading-none">→</span>
            </Link>
          </div>
        </div>

        {/* ── Dot pagination ── */}
        <div className="flex justify-center gap-2 mt-6">
          {CHARTS.map((_, i) => (
            <button
              key={i}
              onClick={() => switchTo(i)}
              className="h-1.5 rounded-full border-none cursor-pointer transition-all duration-300 p-0"
              style={{
                width: i === activeIdx ? 20 : 6,
                background:
                  i === activeIdx ? "#22d3ee" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* ── Stats row ── */}
        <div
          className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto text-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease 0.5s",
          }}
        >
          {[
            { val: "40+", label: "Chart types" },
            { val: "<2s", label: "Render time" },
            { val: "∞", label: "Customization" },
          ].map(({ val, label }) => (
            <div key={label} className="group">
              <div className="text-3xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors duration-300">
                {val}
              </div>
              <div className="text-white/35 text-xs font-mono tracking-widest uppercase mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
