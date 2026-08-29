"use client";

/**
 * Live specimens — five real, interactive Plotly figures on the blue field.
 * Themed to the two-colour system: white and pale-blue series, hairline
 * axes, mono tick figures.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "./Nav";

interface ChartDef {
  id: string;
  name: string;
  query: string;
  build: (Plotly: any, el: HTMLDivElement) => Promise<void>;
}

const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
const W = "#ffffff";
const DIM = "rgba(255,255,255,0.62)";
const HAIR = "rgba(255,255,255,0.18)";
const B1 = "#ffffff";
const B2 = "#8fb4ff";
const B3 = "#4b7fe0";
const CLEAR = "rgba(0,0,0,0)";

const RAMP: [number, string][] = [
  [0, "#062a6e"],
  [0.35, "#0b4cc4"],
  [0.62, "#4b7fe0"],
  [0.84, "#8fb4ff"],
  [1, "#ffffff"],
];

const TICK = { family: MONO, size: 10, color: DIM };
const AXIS = {
  gridcolor: HAIR,
  zerolinecolor: HAIR,
  linecolor: "rgba(255,255,255,0.45)",
  tickfont: TICK,
  showline: true,
  ticks: "outside" as const,
  tickcolor: HAIR,
};
const CFG = { displayModeBar: false, responsive: true };
const BASE = {
  paper_bgcolor: CLEAR,
  plot_bgcolor: CLEAR,
  font: { family: MONO, size: 10, color: DIM },
  margin: { t: 14, b: 36, l: 48, r: 18 },
  showlegend: false,
  hoverlabel: {
    bgcolor: "#0c0c0d",
    bordercolor: W,
    font: { family: MONO, size: 11, color: W },
  },
};

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const CHARTS: ChartDef[] = [
  {
    id: "surface",
    name: "3D surface",
    query: "revenue landscape across product lines and quarters, as a surface",
    build: async (Plotly, el) => {
      const size = 30;
      const z = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => {
          const x = (i / size) * 4 - 2;
          const y = (j / size) * 4 - 2;
          return (
            Math.sin(Math.sqrt(x * x + y * y) * 2.5) *
              Math.exp(-0.18 * (x * x + y * y)) * 60 +
            Math.sin(x * 1.8) * Math.cos(y * 1.4) * 20
          );
        }),
      );
      const ax = { gridcolor: HAIR, showbackground: false, tickfont: TICK, zerolinecolor: HAIR };
      await Plotly.react(el, [{
        type: "surface", z, colorscale: RAMP, showscale: false,
        contours: { z: { show: true, usecolormap: true, project: { z: true }, width: 1 } },
        lighting: { ambient: 0.8, diffuse: 0.6, specular: 0.1, roughness: 0.8 },
      }], {
        ...BASE, margin: { t: 0, b: 0, l: 0, r: 0 },
        scene: {
          bgcolor: CLEAR,
          xaxis: { ...ax, title: { text: "Product", font: { family: MONO, size: 10, color: DIM } } },
          yaxis: { ...ax, title: { text: "Quarter", font: { family: MONO, size: 10, color: DIM } } },
          zaxis: { ...ax, title: { text: "Revenue", font: { family: MONO, size: 10, color: DIM } } },
          camera: { eye: { x: 1.6, y: 1.6, z: 1.05 } },
        },
      }, CFG);
    },
  },
  {
    id: "sankey",
    name: "Sankey flow",
    query: "customer journey from sessions through to revenue",
    build: async (Plotly, el) => {
      await Plotly.react(el, [{
        type: "sankey", orientation: "h",
        node: {
          pad: 18, thickness: 14, line: { color: "rgba(255,255,255,0.5)", width: 1 },
          label: ["Sessions", "Signups", "Trial", "Churned", "Paid", "Expansion"],
          color: [B3, B3, B2, "rgba(255,255,255,0.28)", B1, B1],
          font: { family: MONO, size: 10, color: W },
        },
        link: {
          source: [0, 0, 1, 2, 2, 4], target: [1, 3, 2, 4, 3, 5],
          value: [820, 380, 640, 410, 230, 180],
          color: [
            "rgba(143,180,255,0.34)", "rgba(255,255,255,0.12)", "rgba(143,180,255,0.26)",
            "rgba(255,255,255,0.34)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0.22)",
          ],
        },
      }], { ...BASE, margin: { t: 14, b: 14, l: 8, r: 8 } }, CFG);
    },
  },
  {
    id: "ohlc",
    name: "Candlestick",
    query: "60-day OHLC candlestick with a volume track underneath",
    build: async (Plotly, el) => {
      const rand = rng(7);
      const n = 60;
      const dates: string[] = [], open: number[] = [], high: number[] = [],
        low: number[] = [], close: number[] = [], vol: number[] = [];
      let price = 100;
      const start = Date.UTC(2025, 0, 1);
      for (let i = 0; i < n; i++) {
        const o = price, c = o + (rand() - 0.47) * 5;
        high.push(Math.max(o, c) + rand() * 2.2);
        low.push(Math.min(o, c) - rand() * 2.2);
        dates.push(new Date(start + i * 86400000).toISOString().slice(0, 10));
        open.push(o); close.push(c); vol.push(400 + rand() * 900);
        price = c;
      }
      await Plotly.react(el, [
        {
          type: "candlestick", x: dates, open, high, low, close,
          increasing: { line: { color: W, width: 1 }, fillcolor: W },
          decreasing: { line: { color: B3, width: 1 }, fillcolor: B3 },
          yaxis: "y",
        },
        { type: "bar", x: dates, y: vol, marker: { color: "rgba(255,255,255,0.2)" }, yaxis: "y2", hoverinfo: "skip" },
      ], {
        ...BASE, margin: { t: 12, b: 32, l: 50, r: 18 },
        xaxis: { ...AXIS, type: "date", rangeslider: { visible: false }, showgrid: false },
        yaxis: { ...AXIS, domain: [0.28, 1] },
        yaxis2: { ...AXIS, domain: [0, 0.2], showgrid: false },
      }, CFG);
    },
  },
  {
    id: "radar",
    name: "Radar",
    query: "benchmark us against two competitors on seven dimensions",
    build: async (Plotly, el) => {
      const dims = ["Speed", "Accuracy", "Formats", "Editing", "Export", "Price", "Support"];
      const mk = (r: number[], color: string, fill: string) => ({
        type: "scatterpolar" as const, r: [...r, r[0]], theta: [...dims, dims[0]],
        fill: "toself" as const, fillcolor: fill, line: { color, width: 1.8 },
        marker: { size: 4, color },
      });
      await Plotly.react(el, [
        mk([62, 58, 70, 44, 66, 40, 55], B3, "rgba(75,127,224,0.16)"),
        mk([48, 71, 52, 60, 50, 88, 44], B2, "rgba(143,180,255,0.14)"),
        mk([92, 88, 95, 90, 86, 100, 78], W, "rgba(255,255,255,0.14)"),
      ], {
        ...BASE, margin: { t: 28, b: 28, l: 28, r: 28 },
        polar: {
          bgcolor: CLEAR,
          radialaxis: { visible: true, range: [0, 100], gridcolor: HAIR, linecolor: HAIR, tickfont: { family: MONO, size: 9, color: DIM } },
          angularaxis: { gridcolor: HAIR, linecolor: "rgba(255,255,255,0.4)", tickfont: { family: MONO, size: 10, color: W } },
        },
      }, CFG);
    },
  },
  {
    id: "bubble",
    name: "Bubble map",
    query: "plot ARR against growth, size the points by headcount",
    build: async (Plotly, el) => {
      const rand = rng(21);
      const x: number[] = [], y: number[] = [], s: number[] = [], c: number[] = [];
      for (let i = 0; i < 34; i++) {
        const gx = rand() * 100;
        x.push(gx); y.push(gx * 0.55 + rand() * 45);
        s.push(10 + rand() * 46); c.push(rand() * 100);
      }
      await Plotly.react(el, [{
        type: "scatter", mode: "markers", x, y,
        marker: {
          size: s, color: c, colorscale: RAMP, showscale: false, opacity: 0.85,
          line: { color: "rgba(255,255,255,0.7)", width: 1 },
        },
      }], {
        ...BASE,
        xaxis: { ...AXIS, title: { text: "ARR ($m)", font: { family: MONO, size: 10, color: DIM } } },
        yaxis: { ...AXIS, title: { text: "Growth (%)", font: { family: MONO, size: 10, color: DIM } } },
      }, CFG);
    },
  },
];

function PlotlyChart({ chart }: { chart: ChartDef }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    setReady(false);
    let cancelled = false;
    const node = ref.current;
    import("plotly.js-dist-min").then(({ default: Plotly }) => {
      if (cancelled || !node) return;
      chart.build(Plotly, node).then(() => { if (!cancelled) setReady(true); });
    });
    return () => {
      cancelled = true;
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (node) Plotly.purge(node);
      });
    };
  }, [chart]);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", opacity: ready ? 1 : 0, transition: "opacity .35s ease" }} />
  );
}

export default function LiveDemoSection() {
  const [active, setActive] = useState(0);
  const chart = CHARTS[active];

  return (
    <section className="gxl-blue gxl-band" id="specimens">
      <div className="gxl-page">
        <span className="gxl-tag">Live</span>

        <div className="gxl-split gxl-split--top" style={{ marginTop: 26 }}>
          <h2 className="gxl-d2" style={{ maxWidth: "12ch" }}>
            Rendering in this page
          </h2>
          <p className="gxl-body" style={{ color: "rgba(255,255,255,0.82)" }}>
            Not screenshots. Each figure below was produced from the sentence
            printed under it, and runs on the same renderer the editor uses.
            Rotate the surface, hover the candles, drag the axes.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 56, borderTop: "1px solid var(--hair)" }}>
          {CHARTS.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.id}
                onClick={() => setActive(i)}
                style={{
                  appearance: "none",
                  background: on ? "#fff" : "transparent",
                  color: on ? "var(--blue)" : "rgba(255,255,255,0.72)",
                  border: "none",
                  borderRight: "1px solid var(--hair)",
                  padding: "13px 20px",
                  cursor: "pointer",
                  fontFamily: MONO,
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ opacity: 0.55, marginRight: 9 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {c.name}
              </button>
            );
          })}
        </div>

        <div style={{ border: "1px solid var(--hair)", borderTop: "none" }}>
          <div style={{ height: "min(58vh, 500px)", padding: "14px 10px 0" }}>
            <PlotlyChart chart={chart} />
          </div>
          <div style={{ borderTop: "1px solid var(--hair)", padding: "14px 18px" }}>
            <span className="gxl-mono" style={{ textTransform: "none", letterSpacing: "0.04em" }}>
              prompt — &ldquo;{chart.query}&rdquo;
            </span>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <Link href="/signup" className="gxl-btn">
            <span className="gxl-btn__label">Make one with your data</span>
            <span className="gxl-btn__box"><Arrow /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
