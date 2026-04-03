"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  { label: "Charts / mo", value: "∞", unit: "unlimited", pct: 100 },
  { label: "Chart types", value: "70+", unit: "all types", pct: 95 },
  { label: "CSV uploads", value: "∞", unit: "unlimited", pct: 100 },
  { label: "Exports", value: "∞", unit: "SVG · PNG · CSV", pct: 100 },
  { label: "Workspaces", value: "3", unit: "per account", pct: 60 },
  { label: "Collaborators", value: "5", unit: "per workspace", pct: 50 },
];

const TICKER_ITEMS = [
  "CHARTS/MO → ∞",
  "PRICE → $0.00",
  "CSV UPLOADS → UNLIMITED",
  "EXPORT FORMATS → ALL",
  "CHART TYPES → 70+",
  "HIDDEN FEES → NULL",
  "FREE FOREVER → TRUE",
  "SIGN UP → 30 SEC",
];

export default function PricingSection() {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        @keyframes bg-scrolling {
          0%   { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes free-pop {
          0%   { opacity: 0; transform: scale(0.7) rotate(-4deg); }
          60%  { transform: scale(1.08) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(-1.5deg); }
        }
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        .free-stamp { animation: free-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
      `}</style>

      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#d4d4d4",
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC")`,
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          animation: "bg-scrolling 0.92s linear infinite",
        }}
      >
        <div ref={sectionRef} className="relative max-w-7xl mx-auto px-6 py-20">
          {/* ── Header ── */}
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{
                border: "1px solid rgba(6,182,212,0.25)",
                background: "rgba(6,182,212,0.06)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px] text-cyan-400/80 tracking-[0.2em] uppercase">
                Pricing
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-cyan-400 tracking-tighter bg-black w-fit mx-auto p-2 rounded-lg leading-none mb-4">
              Plans that scale with your data.
            </h2>
            <p className="font-mono text-sm max-w-lg mx-auto text-neutral-700">
              Start free. Upgrade when you need it. No hidden fees, ever.
            </p>
          </div>

          {/* ── Creative free block ── */}
          <div className="max-w-4xl mx-auto">
            {/* App-style chart card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{
                  background: "#fafafa",
                  borderColor: "rgba(0,0,0,0.08)",
                }}
              >
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div
                  className="flex-1 h-6 rounded-md ml-3 flex items-center gap-1.5 px-3 border"
                  style={{
                    background: "#fff",
                    borderColor: "rgba(0,0,0,0.1)",
                    maxWidth: 220,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <span className="font-mono text-[0.67rem] text-zinc-400">
                    graphy.ai/pricing
                  </span>
                </div>
                {/* Beta badge */}
                <div
                  className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50 animate-ping" />
                    <span className="relative rounded-full w-1.5 h-1.5 bg-cyan-400" />
                  </span>
                  <span className="font-mono text-[9px] text-cyan-500 tracking-widest uppercase">
                    Beta — Everything Free
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* LEFT — bar chart of features */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="font-mono text-[10px] text-zinc-400 tracking-[0.15em] uppercase mb-0.5">
                          Current Plan · Beta
                        </p>
                        <p className="font-mono text-sm font-bold text-zinc-800">
                          Feature Allocation
                        </p>
                      </div>
                      <div className="font-mono text-[9px] text-zinc-400 text-right">
                        <div>100%</div>
                        <div className="mt-1 text-cyan-500 font-bold">
                          ↑ all unlocked
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {FEATURES.map((f, i) => (
                        <div
                          key={f.label}
                          className="group cursor-default"
                          onMouseEnter={() => setHovered(i)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[11px] text-zinc-500 group-hover:text-zinc-800 transition-colors">
                              {f.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className="font-mono text-[11px] font-bold transition-colors"
                                style={{
                                  color: hovered === i ? "#06b6d4" : "#18181b",
                                }}
                              >
                                {f.value}
                              </span>
                              <span className="font-mono text-[9px] text-zinc-400 hidden sm:block">
                                {f.unit}
                              </span>
                            </div>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: "rgba(0,0,0,0.06)" }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 9999,
                                width: animated ? `${f.pct}%` : "0%",
                                transition: `width 0.8s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.08}s, background 0.2s ease`,
                                background:
                                  hovered === i
                                    ? "#06b6d4"
                                    : f.pct === 100
                                      ? "linear-gradient(90deg, #06b6d4, #0891b2)"
                                      : "linear-gradient(90deg, #64748b, #94a3b8)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between">
                      {["0%", "25%", "50%", "75%", "100%"].map((l) => (
                        <span
                          key={l}
                          className="font-mono text-[8px] text-zinc-300"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT — stamp + terminal + CTA */}
                  <div className="flex flex-col items-center gap-5 md:w-52 shrink-0">
                    {/* The $0 stamp */}
                    <div className="relative">
                      <div
                        className={animated ? "free-stamp" : "opacity-0"}
                        style={{
                          width: 160,
                          height: 160,
                          borderRadius: 16,
                          background: "#000",
                          border: "3px solid #06b6d4",
                          boxShadow:
                            "0 0 0 6px rgba(6,182,212,0.08), 0 0 40px rgba(6,182,212,0.15)",
                          transform: "rotate(-1.5deg)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 900,
                            fontSize: 52,
                            color: "#06b6d4",
                            lineHeight: 1,
                            letterSpacing: "-0.04em",
                          }}
                        >
                          $0
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "rgba(6,182,212,0.6)",
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                          }}
                        >
                          forever
                        </span>
                        <div
                          style={{
                            marginTop: 6,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "rgba(6,182,212,0.12)",
                            border: "1px solid rgba(6,182,212,0.2)",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 9,
                              color: "#06b6d4",
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                            }}
                          >
                            BETA ACCESS
                          </span>
                        </div>
                      </div>
                      {/* Corner tick marks */}
                      {[
                        "-top-1 -left-1 border-t-2 border-l-2 rounded-tl",
                        "-top-1 -right-1 border-t-2 border-r-2 rounded-tr",
                        "-bottom-1 -left-1 border-b-2 border-l-2 rounded-bl",
                        "-bottom-1 -right-1 border-b-2 border-r-2 rounded-br",
                      ].map((cls, i) => (
                        <div
                          key={i}
                          className={`absolute w-3 h-3 ${cls} border-cyan-400/40`}
                        />
                      ))}
                    </div>

                    {/* Terminal */}
                    <div
                      className="w-full rounded-xl p-3 font-mono text-[10px] leading-5"
                      style={{
                        background: "#0f0f0f",
                        border: "1px solid rgba(6,182,212,0.15)",
                      }}
                    >
                      <div className="text-zinc-500 mb-1">
                        $ graphy --plan beta
                      </div>
                      <div className="text-cyan-400">
                        ✓ price: <span className="text-white">$0.00/mo</span>
                      </div>
                      <div className="text-cyan-400">
                        ✓ charts: <span className="text-white">unlimited</span>
                      </div>
                      <div className="text-cyan-400">
                        ✓ exports:{" "}
                        <span className="text-white">all formats</span>
                      </div>
                      <div className="text-zinc-500 flex items-center gap-1 mt-0.5">
                        <span>$ </span>
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
                      href="/dashboard"
                      className="w-full py-3 rounded-xl font-mono hover:cursor-pointer text-sm font-bold text-center tracking-wide transition-all hover:scale-[1.03] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                        color: "#000",
                        boxShadow: "0 0 24px rgba(6,182,212,0.3)",
                      }}
                    >
                      Start free
                    </Link>
                    <p className="font-mono text-[9px] text-zinc-400 text-center">
                      No card required · 30 sec setup
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Scrolling data ticker ── */}
            <div
              className="mt-5 rounded-xl overflow-hidden py-2.5"
              style={{
                background: "#000",
                border: "1px solid rgba(6,182,212,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  animation: "ticker-scroll 18s linear infinite",
                  width: "max-content",
                }}
              >
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                  <span
                    key={i}
                    className="font-mono text-[11px] text-cyan-400/70 tracking-widest whitespace-nowrap px-6 flex items-center gap-6"
                  >
                    {item}
                    <span className="text-cyan-400/20">◆</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p
            className="font-mono text-center text-[11px] mt-10"
            style={{ color: "rgba(0,0,0,0.3)" }}
          >
            All plans include SSL encryption · GDPR compliant · Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}
