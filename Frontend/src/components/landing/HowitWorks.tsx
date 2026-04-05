"use client";

import { useEffect, useRef, useState } from "react";

// ── Chart groups for step 2 selector ──────────────────────────
const CHART_CATS = [
  { label: "Line & Scatter", color: "#3b82f6", count: 14 },
  { label: "Bar Charts", color: "#10b981", count: 12 },
  { label: "Pie & Bubble", color: "#ec4899", count: 8 },
  { label: "Statistical", color: "#f59e0b", count: 9 },
  { label: "Histograms", color: "#8b5cf6", count: 8 },
  { label: "3D Charts", color: "#a855f7", count: 9 },
  { label: "Financial", color: "#f97316", count: 8 },
  { label: "Contour & Heat", color: "#06b6d4", count: 7 },
];

const DEMO_PROMPT = "Show Q4 sales by region as a grouped bar chart";

// ─── Step visual components ───────────────────────────────────

function StepPrompt({ active }: { active: boolean }) {
  const [typed, setTyped] = useState("");
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (!active) {
      setTyped("");
      return;
    }
    let i = 0;
    const blink = setInterval(() => setCursor((c) => !c), 530);
    const type = setInterval(() => {
      i++;
      setTyped(DEMO_PROMPT.slice(0, i));
      if (i >= DEMO_PROMPT.length) clearInterval(type);
    }, 38);
    return () => {
      clearInterval(type);
      clearInterval(blink);
    };
  }, [active]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div
            key={c}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#9ca3af",
            marginLeft: 8,
          }}
        >
          graphix.ai/app
        </span>
      </div>
      <div style={{ padding: "18px 16px" }}>
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            fontFamily: "monospace",
            marginBottom: 10,
          }}
        >
          What do you want to visualize?
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              padding: "10px 12px",
              background: "#f3f4f6",
              borderRadius: 7,
              fontFamily: "monospace",
              fontSize: 12,
              color: "#111827",
              minHeight: 40,
              display: "flex",
              alignItems: "center",
            }}
          >
            {typed}
            {active && (
              <span
                style={{
                  width: 2,
                  height: 14,
                  background: "#06b6d4",
                  display: "inline-block",
                  marginLeft: 1,
                  opacity: cursor ? 1 : 0,
                  transition: "opacity 0.1s",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#111827",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 6h10M7 2l4 4-4 4"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}
        >
          {["📎 Attach CSV", "🎨 Chart type", "✦ AI picks best"].map((hint) => (
            <span
              key={hint}
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: "#9ca3af",
                padding: "3px 7px",
                background: "#f3f4f6",
                borderRadius: 4,
              }}
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSelector({ active }: { active: boolean }) {
  const [highlighted, setHighlighted] = useState(-1);

  useEffect(() => {
    if (!active) {
      setHighlighted(-1);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      setHighlighted(i % CHART_CATS.length);
      i++;
      if (i >= CHART_CATS.length + 1) clearInterval(id);
    }, 280);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}
        >
          Select chart type
        </span>
        <span
          style={{ fontFamily: "monospace", fontSize: 9, color: "#9ca3af" }}
        >
          80+ types · 10 categories
        </span>
      </div>
      <div
        style={{
          padding: "10px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
        }}
      >
        {CHART_CATS.map((cat, i) => (
          <div
            key={cat.label}
            style={{
              padding: "8px 10px",
              borderRadius: 7,
              border: `1px solid ${i === highlighted ? cat.color + "50" : "#e5e7eb"}`,
              background: i === highlighted ? cat.color + "08" : "#fafafa",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i === highlighted ? cat.color : "#d1d5db",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: i === highlighted ? "#111" : "#6b7280",
                  transition: "color 0.2s",
                }}
              >
                {cat.label}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#9ca3af",
                  fontFamily: "monospace",
                }}
              >
                {cat.count} types
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepProcessing({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const STEPS = [
    {
      icon: "◈",
      label: "Parsing intent",
      detail: "Understanding your request",
    },
    {
      icon: "⬡",
      label: "Selecting chart",
      detail: "Grouped Bar → optimal match",
    },
    {
      icon: "σ",
      label: "Mapping data",
      detail: "x: Region · y: Revenue · group: Quarter",
    },
    { icon: "✦", label: "Rendering", detail: "Applying style & interactions" },
  ];

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    setStep(0);
    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), 500 + i * 900);
    });
  }, [active]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#06b6d4",
            display: "inline-block",
            animation: active ? "hiw-pulse 1.2s ease infinite" : "none",
          }}
        />
        <span
          style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}
        >
          AI is working…
        </span>
      </div>
      <div style={{ padding: 4 }}>
        {STEPS.map((s, i) => {
          const done = step > i + 1,
            current = step === i + 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: current ? "rgba(6,182,212,0.04)" : "transparent",
                borderRadius: 7,
                transition: "background 0.3s",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: done ? "#06b6d4" : current ? "#06b6d4" : "#d1d5db",
                  transition: "color 0.3s",
                  flexShrink: 0,
                }}
              >
                {done ? "✓" : s.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: done || current ? "#111" : "#9ca3af",
                    transition: "color 0.3s",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    fontFamily: "monospace",
                  }}
                >
                  {s.detail}
                </div>
              </div>
              {current && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#06b6d4",
                    animation: "hiw-pulse 1s ease infinite",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            height: 4,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(step / STEPS.length) * 100}%`,
              background: "linear-gradient(90deg, #06b6d4, #0891b2)",
              borderRadius: 999,
              transition: "width 0.7s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <span
            style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace" }}
          >
            Generating chart
          </span>
          <span
            style={{
              fontSize: 9,
              color: "#06b6d4",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            {Math.round((step / STEPS.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function StepResult({ active }: { active: boolean }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active || !plotRef.current) {
      setReady(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (cancelled || !plotRef.current) return;
        Plotly.react(
          plotRef.current,
          [
            {
              x: ["North", "South", "East", "West"],
              y: [67, 44, 58, 51],
              z: [82, 56, 71, 63],
              type: "scatter3d",
              mode: "markers",
              name: "Q3",
              marker: {
                size: 12,
                color: "#06b6d4",
                opacity: 0.9,
                line: {
                  color: "#ffffff",
                  width: 2,
                },
              },
            },
            {
              x: ["North", "South", "East", "West"],
              y: [82, 56, 71, 63],
              z: [95, 68, 84, 76],
              type: "scatter3d",
              mode: "markers",
              name: "Q4",
              marker: {
                size: 14,
                color: "#a855f7",
                opacity: 0.9,
                line: {
                  color: "#ffffff",
                  width: 2,
                },
              },
            },
          ],
          {
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#374151", size: 10, family: "DM Mono" },
            margin: { t: 8, b: 8, l: 8, r: 8 },
            showlegend: true,
            legend: {
              orientation: "h",
              y: -0.15,
              x: 0.5,
              xanchor: "center",
              font: { size: 9 },
            },
            scene: {
              camera: {
                eye: { x: 1.8, y: 1.8, z: 1.3 },
              },
              xaxis: {
                title: { text: "Region", font: { size: 9 } },
                gridcolor: "rgba(0,0,0,0.1)",
                showbackground: true,
                backgroundcolor: "rgba(249,250,251,0.5)",
                tickfont: { size: 9 },
              },
              yaxis: {
                title: { text: "Q3 Sales", font: { size: 9 } },
                gridcolor: "rgba(0,0,0,0.1)",
                showbackground: true,
                backgroundcolor: "rgba(249,250,251,0.5)",
                tickfont: { size: 9 },
              },
              zaxis: {
                title: { text: "Q4 Sales", font: { size: 9 } },
                gridcolor: "rgba(0,0,0,0.1)",
                showbackground: true,
                backgroundcolor: "rgba(249,250,251,0.5)",
                tickfont: { size: 9 },
              },
            },
          },
          { displayModeBar: false, responsive: true },
        ).then(() => {
          if (!cancelled) setReady(true);
        });
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [active]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}
        >
          Q4 Sales by Region — 3D Scatter
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {["PNG", "SVG", "CSV"].map((f) => (
            <span
              key={f}
              style={{
                fontSize: 8,
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#9ca3af",
                letterSpacing: "0.08em",
              }}
            >
              ↓{f}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          height: 200,
          padding: 8,
          opacity: ready ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {!ready && (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 44,
            left: 0,
            right: 0,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid rgba(6,182,212,0.2)",
              borderTopColor: "#06b6d4",
              borderRadius: "50%",
              animation: "hiw-spin 0.8s linear infinite",
            }}
          />
        </div>
      )}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #e5e7eb",
          background: "rgba(6,182,212,0.03)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: "#06b6d4", fontSize: 12 }}>✦</span>
        <span
          style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}
        >
          North & Q4 show strongest growth (+22%) — potential expansion target
        </span>
      </div>
    </div>
  );
}
// ─── Step definitions ──────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    tag: "Input",
    color: "#06b6d4",
    headline: "Type what you want to see",
    body: "Write a plain-English request, drop a CSV, or paste raw data. No SQL, no formulas, no setup. Graphix understands your intent.",
    extras: ["Natural language", "CSV / JSON upload", "Paste raw data"],
    component: StepPrompt,
  },
  {
    num: "02",
    tag: "Selection",
    color: "#a855f7",
    headline: "Pick a chart type — or let AI choose",
    body: "Browse 80+ chart types across 10 categories. Or skip it entirely — Graphix AI selects the most effective visualization for your data automatically.",
    extras: ["80+ chart types", "10 categories", "AI auto-selection"],
    component: StepSelector,
  },
  {
    num: "03",
    tag: "Processing",
    color: "#10b981",
    headline: "AI parses, maps and renders",
    body: "Graphix maps every dimension of your data to an optimal visual encoding and generates a fully interactive chart in under 3 seconds.",
    extras: ["< 3 second render", "Auto axis labels", "Smart color selection"],
    component: StepProcessing,
  },
  {
    num: "04",
    tag: "Output",
    color: "#f59e0b",
    headline: "Interact, edit, and export",
    body: "Zoom, hover, rotate 3D charts. Open the visual editor to tweak colors, fonts, and layout. Export as PNG, SVG, or CSV in one click.",
    extras: [
      "Full chart editor",
      "Export PNG · SVG · CSV",
      "Save to dashboard",
    ],
    component: StepResult,
  },
];

// ─── Main ──────────────────────────────────────────────────────
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVis, setHeaderVis] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHeaderVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      let fired = false;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!fired) {
              fired = true;
              return;
            }
            if (e.isIntersecting) setActiveStep(i);
          });
        },
        { rootMargin: "-30% 0px -50% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <style>{`
        @keyframes hiw-spin  { to { transform: rotate(360deg); } }
        @keyframes hiw-pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes hiw-up    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <section
        id="how-it-works"
        style={{
          background: "#111212",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.04) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "96px 24px 80px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            ref={headerRef}
            style={{
              textAlign: "center",
              marginBottom: 72,
              opacity: headerVis ? 1 : 0,
              transform: headerVis ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                border: "1px solid rgba(6,182,212,0.2)",
                background: "rgba(6,182,212,0.05)",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "rgba(6,182,212,0.8)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                How it works
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 14px",
              }}
            >
              From prompt to chart.
              <br />
              <span style={{ color: "rgba(6,182,212,0.65)" }}>
                Four steps, under a minute.
              </span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.35)",
                maxWidth: 420,
                margin: "0 auto",
                lineHeight: 1.7,
                fontFamily: "monospace",
              }}
            >
              No code. No config. No learning curve. Scroll through each step to
              see it live.
            </p>
          </div>

          {/* Step nav pills */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: 60,
              flexWrap: "wrap",
            }}
          >
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: `1px solid ${i === activeStep ? s.color + "60" : "rgba(255,255,255,0.08)"}`,
                  background: i === activeStep ? s.color + "12" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    color:
                      i === activeStep ? s.color : "rgba(255,255,255,0.25)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.num}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: i === activeStep ? "#fff" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {s.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((s, i) => {
              const Comp = s.component;
              const isActive = activeStep === i;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 48,
                    padding: "64px 0",
                    borderTop:
                      i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "center",
                  }}
                >
                  {/* Text side */}
                  <div style={{ order: isEven ? 1 : 2, padding: "0 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 20,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? s.color : "rgba(255,255,255,0.2)",
                          letterSpacing: "0.1em",
                          transition: "color 0.3s",
                        }}
                      >
                        {s.num}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: isActive
                            ? s.color + "18"
                            : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? s.color + "40" : "rgba(255,255,255,0.08)"}`,
                          color: isActive ? s.color : "rgba(255,255,255,0.25)",
                          transition: "all 0.3s",
                          fontFamily: "monospace",
                        }}
                      >
                        {s.tag}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.025em",
                        lineHeight: 1.2,
                        marginBottom: 14,
                      }}
                    >
                      {s.headline}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.75,
                        marginBottom: 24,
                      }}
                    >
                      {s.body}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {s.extras.map((e) => (
                        <div
                          key={e}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: s.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.5)",
                              fontFamily: "monospace",
                            }}
                          >
                            {e}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual side */}
                  <div style={{ order: isEven ? 2 : 1, position: "relative" }}>
                    {/* Glow behind card */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        width: 200,
                        height: 200,
                        borderRadius: "50%",
                        background: s.color,
                        opacity: isActive ? 0.06 : 0,
                        filter: "blur(60px)",
                        transition: "opacity 0.5s",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        opacity: isActive ? 1 : 0.35,
                        transform: isActive ? "scale(1)" : "scale(0.97)",
                        transition: "opacity 0.5s ease, transform 0.5s ease",
                      }}
                    >
                      <Comp active={isActive} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
