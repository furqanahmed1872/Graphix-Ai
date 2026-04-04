"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  { label: "Charts per month", value: "∞", unit: "unlimited", pct: 100 },
  { label: "Chart types", value: "80+", unit: "all categories", pct: 100 },
  { label: "CSV / JSON uploads", value: "∞", unit: "unlimited", pct: 100 },
  { label: "Exports", value: "∞", unit: "PNG · SVG · JPEG", pct: 100 },
  { label: "Visual editor", value: "✓", unit: "full access", pct: 100 },
  { label: "Dashboard saves", value: "∞", unit: "unlimited", pct: 100 },
  { label: "3D charts", value: "✓", unit: "all types", pct: 100 },
  { label: "Excel editor", value: "✓", unit: "full access", pct: 100 },
];

const TICKER = [
  "CHARTS/MO → ∞",
  "PRICE → $0.00",
  "CSV UPLOADS → UNLIMITED",
  "EXPORT FORMATS → ALL",
  "CHART TYPES → 80+",
  "HIDDEN FEES → NULL",
  "3D CHARTS → INCLUDED",
  "EXCEL EDITOR → FREE",
  "FREE FOREVER → TRUE",
];

export default function PricingSection() {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setAnimated(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes ticker-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes free-pop { 0%{opacity:0;transform:scale(0.7) rotate(-4deg)} 60%{transform:scale(1.08) rotate(1deg)} 100%{opacity:1;transform:scale(1) rotate(-1.5deg)} }
        @keyframes blink-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        .free-stamp { animation: free-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
      `}</style>

      <section
        id="pricing"
        className="relative overflow-hidden"
        style={{ background: "#111212" }}
      >
        {/* Subtle grid */}
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
          ref={sectionRef}
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "96px 24px 80px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 60 }}>
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
                Pricing
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
              Everything free.
              <br />
              <span style={{ color: "rgba(6,182,212,0.7)" }}>
                No catches. No limits.
              </span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.35)",
                maxWidth: 400,
                margin: "0 auto",
                lineHeight: 1.7,
                fontFamily: "monospace",
              }}
            >
              We're in beta. Every single feature is unlocked for every user,
              free.
            </p>
          </div>

          {/* Main pricing card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {/* Card header bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 24px",
                background: "#fafafa",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ display: "flex", gap: 7 }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
              </div>
              <div
                style={{ flex: 1, display: "flex", justifyContent: "center" }}
              >
                <div
                  style={{
                    padding: "3px 16px",
                    borderRadius: 6,
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "#9ca3af",
                    }}
                  >
                    graphix.ai/pricing
                  </span>
                </div>
              </div>
              {/* Beta badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(6,182,212,0.08)",
                  border: "1px solid rgba(6,182,212,0.2)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#06b6d4",
                    display: "inline-block",
                    animation: "blink-cursor 1.5s step-end infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#0891b2",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Beta — Everything Free
                </span>
              </div>
            </div>

            {/* Card body */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 0,
                flexWrap: "wrap",
              }}
            >
              {/* LEFT: feature bars */}
              <div
                style={{ flex: 1, minWidth: 280, padding: "32px 32px 28px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        color: "#9ca3af",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}
                    >
                      Current Plan · Beta
                    </p>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#111",
                      }}
                    >
                      Feature Allocation
                    </p>
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "#9ca3af",
                      textAlign: "right",
                    }}
                  >
                    <div>100%</div>
                    <div
                      style={{
                        color: "#06b6d4",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      ↑ all unlocked
                    </div>
                  </div>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {FEATURES.map((f, i) => (
                    <div
                      key={f.label}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "default" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: hovered === i ? "#111" : "#6b7280",
                            transition: "color 0.15s",
                          }}
                        >
                          {f.label}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 11,
                              fontWeight: 700,
                              color: hovered === i ? "#06b6d4" : "#111",
                              transition: "color 0.15s",
                            }}
                          >
                            {f.value}
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 9,
                              color: "#9ca3af",
                            }}
                          >
                            {f.unit}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: "rgba(0,0,0,0.06)",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 999,
                            width: animated ? `${f.pct}%` : "0%",
                            transition: `width 0.8s cubic-bezier(.22,1,.36,1) ${0.05 + i * 0.06}s`,
                            background:
                              hovered === i
                                ? "#06b6d4"
                                : "linear-gradient(90deg, #06b6d4, #0891b2)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scale labels */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                  }}
                >
                  {["0%", "25%", "50%", "75%", "100%"].map((l) => (
                    <span
                      key={l}
                      style={{
                        fontFamily: "monospace",
                        fontSize: 8,
                        color: "#d1d5db",
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT: stamp + terminal + CTA */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  padding: "32px 32px 28px",
                  width: 220,
                  flexShrink: 0,
                  borderLeft: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {/* $0 stamp */}
                <div
                  className={animated ? "free-stamp" : ""}
                  style={{
                    position: "relative",
                    width: 120,
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: "3px solid #06b6d4",
                      opacity: 0.3,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 6,
                      borderRadius: "50%",
                      border: "1.5px dashed rgba(6,182,212,0.4)",
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "#06b6d4",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: 2,
                      }}
                    >
                      Beta
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: "#111",
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      $0
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 9,
                        color: "#9ca3af",
                        marginTop: 2,
                      }}
                    >
                      /month
                    </div>
                  </div>
                  {/* Corner ticks */}
                  {[
                    "-top-2 -left-2 border-t-2 border-l-2",
                    "-top-2 -right-2 border-t-2 border-r-2",
                    "-bottom-2 -left-2 border-b-2 border-l-2",
                    "-bottom-2 -right-2 border-b-2 border-r-2",
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className={`absolute w-3 h-3 ${cls} border-cyan-400/30`}
                    />
                  ))}
                </div>

                {/* Terminal */}
                <div
                  style={{
                    width: "100%",
                    background: "#0f0f0f",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 10,
                    lineHeight: 1.7,
                    border: "1px solid rgba(6,182,212,0.15)",
                  }}
                >
                  <div style={{ color: "#6b7280" }}>$ graphix --plan beta</div>
                  <div style={{ color: "#06b6d4" }}>
                    ✓ price: <span style={{ color: "#fff" }}>$0.00/mo</span>
                  </div>
                  <div style={{ color: "#06b6d4" }}>
                    ✓ charts: <span style={{ color: "#fff" }}>unlimited</span>
                  </div>
                  <div style={{ color: "#06b6d4" }}>
                    ✓ exports:{" "}
                    <span style={{ color: "#fff" }}>all formats</span>
                  </div>
                  <div
                    style={{
                      color: "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>$</span>
                    <span
                      style={{
                        display: "inline-block",
                        width: 6,
                        height: 11,
                        background: "#06b6d4",
                        verticalAlign: "middle",
                        animation: "blink-cursor 1s step-end infinite",
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/signin"
                  style={{
                    width: "100%",
                    display: "block",
                    textAlign: "center",
                    padding: "12px 0",
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    borderRadius: 8,
                    transition: "filter 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.filter = "brightness(1.15)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                >
                  Start free →
                </Link>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#9ca3af",
                    textAlign: "center",
                  }}
                >
                  No card required · 30 sec setup
                </p>
              </div>
            </div>
          </div>

          {/* Scrolling ticker */}
          <div
            style={{
              marginTop: 32,
              borderRadius: 10,
              overflow: "hidden",
              background: "#000",
              border: "1px solid rgba(6,182,212,0.15)",
              padding: "10px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                animation: "ticker-scroll 22s linear infinite",
                width: "max-content",
              }}
            >
              {[...TICKER, ...TICKER].map((item, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "rgba(6,182,212,0.7)",
                    letterSpacing: "0.15em",
                    whiteSpace: "nowrap",
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                  }}
                >
                  {item}
                  <span style={{ color: "rgba(6,182,212,0.2)" }}>◆</span>
                </span>
              ))}
            </div>
          </div>

          <p
            style={{
              fontFamily: "monospace",
              textAlign: "center",
              fontSize: 10,
              marginTop: 20,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.12em",
            }}
          >
            SSL encrypted · GDPR compliant · No credit card required
          </p>
        </div>
      </section>
    </>
  );
}
