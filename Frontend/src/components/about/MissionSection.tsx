"use client";

import { useState, useRef, useCallback } from "react";

const principles = [
  {
    number: "01",
    title: "Clarity over complexity",
    description:
      "Every pixel, every label, every chart type exists for one reason: to make data easier to understand. Nothing more.",
    accent: "#00d4c8",
    stat: "149+ types",
    statLabel: "each one intentional",
  },
  {
    number: "02",
    title: "Speed is a feature",
    description:
      "Charts in under 3 seconds. No loading spinners. No 'AI is thinking...' We optimized every step.",
    accent: "#8b5cf6",
    stat: "<3s",
    statLabel: "average generation",
  },
  {
    number: "03",
    title: "Own your work",
    description:
      "Your charts, your dashboard, your data. We don't lock you in — export PNG, SVG, JSON anytime.",
    accent: "#f59e0b",
    stat: "4 formats",
    statLabel: "PNG · SVG · JPEG · JSON",
  },
  {
    number: "04",
    title: "No gatekeeping",
    description:
      "No SQL required. No engineering degree. No $50/month plan. Data visualization should be for everyone.",
    accent: "#ec4899",
    stat: "$0",
    statLabel: "forever · no catch",
  },
];

const teamValues = [
  { label: "Brutalist simplicity", percentage: 100, color: "#00d4c8" },
  { label: "User obsession", percentage: 100, color: "#8b5cf6" },
  { label: "Ship fast", percentage: 100, color: "#f59e0b" },
  { label: "Open by default", percentage: 100, color: "#ec4899" },
];

export default function MissionSection() {
  const [hoveredPrinciple, setHoveredPrinciple] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);

  // Mouse glow via direct DOM mutation — zero re-renders
  const glowRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`;
    }
  }, []);

  return (
    <div
      className="relative w-full bg-[#111212] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* STATIC GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f8] via-[#f5f4f3] to-[#efeeed] z-0" />

      {/* STATIC BLOBS — radial-gradient, no blur filter repaint */}
      <div
        className="absolute top-40 right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-40 left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(17,18,18,0.06) 0%, transparent 70%)",
        }}
      />

      {/* MOUSE-FOLLOW GLOW — DOM mutation only, no setState */}
      <div
        ref={glowRef}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.07) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {/* Top left branding */}
      <div className="absolute top-10 left-10 z-20 group">
        <div className="text-[0.6rem] text-[#8b8b8b] tracking-[0.25em] uppercase mb-1.5 group-hover:text-[#00d4c8] transition-colors duration-200">
          A project by
        </div>
        <div className="text-xs font-serif text-black tracking-wide group-hover:tracking-wider transition-all duration-200">
          THE CONTINENTAL
        </div>
        <div className="w-6 h-px bg-[#d0d0d0] mt-2 group-hover:w-12 group-hover:bg-[#00d4c8] transition-all duration-300" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        {/* Section header */}
        <div className="text-center mb-24">
          {/* Badge — no backdrop-blur, no animate-pulse */}
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#e8e8e8] rounded-full bg-white/70 shadow-sm mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8]" />
            <span className="text-[0.6rem] tracking-[0.15em] text-[#8b8b8b] uppercase font-medium">
              Our Mission
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0]" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight">
            Make data
            <br />
            <span className="relative inline-block mt-3 group">
              <span className="absolute -inset-3 bg-[#00d4c8] -z-10 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
              <span className="text-white px-4 inline-block group-hover:scale-105 transition-transform duration-300">
                unignorably clear
              </span>
            </span>
          </h2>

          <div className="w-16 h-px bg-[#00d4c8]/30 mx-auto mt-8" />
        </div>

        {/* Principles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
          {principles.map((principle, idx) => (
            <div
              key={principle.number}
              className="group cursor-pointer relative"
              onMouseEnter={() => setHoveredPrinciple(idx)}
              onMouseLeave={() => setHoveredPrinciple(null)}
            >
              <div
                className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                  hoveredPrinciple === idx ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${principle.accent}08, transparent)`,
                }}
              />
              <div
                className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                  hoveredPrinciple === idx ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  boxShadow: `0 0 0 1px ${principle.accent}30, 0 0 30px ${principle.accent}20`,
                }}
              />

              <div className="relative p-8">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`text-6xl font-black transition-all duration-200 ${
                      hoveredPrinciple === idx
                        ? "scale-110 translate-x-1"
                        : "text-black/20"
                    }`}
                    style={{
                      color:
                        hoveredPrinciple === idx ? principle.accent : undefined,
                    }}
                  >
                    {principle.number}
                  </div>
                  <div
                    className={`text-right transition-opacity duration-200 ${hoveredPrinciple === idx ? "opacity-100" : "opacity-50"}`}
                  >
                    <div
                      className="text-xs font-bold"
                      style={{ color: principle.accent }}
                    >
                      {principle.stat}
                    </div>
                    <div className="text-[0.55rem] text-[#8b8b8b] uppercase tracking-wider">
                      {principle.statLabel}
                    </div>
                  </div>
                </div>

                <div className="relative inline-block mb-3">
                  <div
                    className="text-xl font-bold transition-colors duration-200"
                    style={{
                      color:
                        hoveredPrinciple === idx ? principle.accent : undefined,
                    }}
                  >
                    {principle.title}
                  </div>
                  <div
                    className={`absolute -bottom-1 left-0 h-px transition-all duration-300 ${
                      hoveredPrinciple === idx
                        ? "w-full opacity-100"
                        : "w-0 opacity-0"
                    }`}
                    style={{ backgroundColor: principle.accent }}
                  />
                </div>

                <p className="text-[#6b6b6b] text-sm leading-relaxed">
                  {principle.description}
                </p>

                <div
                  className={`w-12 h-px mt-6 transition-opacity duration-300 ${
                    hoveredPrinciple === idx ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundColor: principle.accent }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Values bar chart */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <div className="text-[0.6rem] text-[#8b8b8b] tracking-[0.2em] uppercase mb-2">
              Our DNA
            </div>
            <h3 className="text-2xl font-bold text-black">
              Four values, fully committed
            </h3>
            <div className="w-12 h-px bg-[#00d4c8]/30 mx-auto mt-4" />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {teamValues.map((value, idx) => (
              <div
                key={value.label}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredValue(idx)}
                onMouseLeave={() => setHoveredValue(null)}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span
                    className="transition-colors duration-200"
                    style={{
                      color:
                        hoveredValue === idx ? value.color : "rgba(0,0,0,0.7)",
                    }}
                  >
                    {value.label}
                  </span>
                  <span className="text-black/40 font-mono text-xs">
                    {value.percentage}%
                  </span>
                </div>
                <div className="h-1 bg-[#e8e8e8] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-opacity duration-300 ${
                      hoveredValue === idx ? "opacity-100" : "opacity-80"
                    }`}
                    style={{
                      width: `${value.percentage}%`,
                      backgroundColor: value.color,
                      boxShadow:
                        hoveredValue === idx
                          ? `0 0 8px ${value.color}`
                          : "none",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote block */}
        <div className="relative max-w-4xl mx-auto text-center mb-32">
          <div className="absolute -top-10 -left-10 text-8xl text-[#00d4c8]/10 font-serif">
            "
          </div>
          <div className="absolute -bottom-10 -right-10 text-8xl text-[#00d4c8]/10 font-serif">
            "
          </div>

          <div className="relative z-10">
            <p className="text-2xl md:text-3xl font-light text-black leading-relaxed">
              We're not building another BI tool.
              <br />
              We're building the visualization layer
              <br />
              <span className="font-bold bg-gradient-to-r from-[#00d4c8] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
                that should have existed from the start.
              </span>
            </p>
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-8 h-px bg-[#00d4c8]/30" />
              <div className="w-12 h-px bg-[#00d4c8]" />
              <div className="w-8 h-px bg-[#00d4c8]/30" />
            </div>
            <div className="mt-6 text-[0.55rem] text-[#c0c0c0] tracking-[0.3em] uppercase">
              — Since 2021 —
            </div>
          </div>
        </div>

        {/* Bottom stats / CTA */}
        <div className="border-t border-[#e8e8e8] pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              ["12K+", "TEAMS"],
              ["149+", "CHART TYPES"],
              ["<3s", "GENERATION"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-black">{num}</div>
                <div className="text-[0.6rem] text-[#8b8b8b] tracking-wider mt-1">
                  {label}
                </div>
                <div className="w-8 h-px bg-[#00d4c8]/30 mx-auto mt-2" />
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-[#e8e8e8]">
            <div className="text-center md:text-left">
              <div className="text-[0.6rem] text-[#8b8b8b] tracking-[0.2em] uppercase mb-2">
                Join the mission
              </div>
              <div className="text-sm text-[#6b6b6b]">
                Start telling better stories with your data
              </div>
            </div>
            <div className="flex gap-4">
              <button className="group relative px-8 py-3 bg-[#00d4c8] text-black font-medium rounded-lg overflow-hidden transition-all hover:scale-105">
                <span className="relative z-10">Start for free →</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="absolute inset-0 z-10 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Start for free →
                </span>
              </button>
              <button className="px-8 py-3 border border-[#d0d0d0] text-[#6b6b6b] text-sm rounded-lg hover:border-[#00d4c8] hover:text-[#00d4c8] transition-all">
                View demo
              </button>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="mt-20 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-[#00d4c8] to-transparent" />
            <div className="text-[0.55rem] text-[#c0c0c0] tracking-[0.3em] uppercase">
              Continue
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom-right */}
      <div className="absolute bottom-10 right-10 w-40 h-40 opacity-20 pointer-events-none">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            stroke="#00d4c8"
            strokeWidth="0.5"
            fill="none"
          />
          <rect
            x="25"
            y="25"
            width="50"
            height="50"
            stroke="#00d4c8"
            strokeWidth="0.5"
            fill="none"
          />
          <rect
            x="40"
            y="40"
            width="20"
            height="20"
            stroke="#00d4c8"
            strokeWidth="0.5"
            fill="#00d4c8"
            fillOpacity="0.1"
          />
          <circle
            cx="50"
            cy="50"
            r="8"
            stroke="#00d4c8"
            strokeWidth="0.5"
            fill="none"
          />
          <line
            x1="10"
            y1="50"
            x2="40"
            y2="50"
            stroke="#00d4c8"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <line
            x1="60"
            y1="50"
            x2="90"
            y2="50"
            stroke="#00d4c8"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <line
            x1="50"
            y1="10"
            x2="50"
            y2="40"
            stroke="#00d4c8"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <line
            x1="50"
            y1="60"
            x2="50"
            y2="90"
            stroke="#00d4c8"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      {/* Decorative top-right */}
      <div className="absolute top-10 right-10 opacity-20 pointer-events-none">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M4 28 L28 28" stroke="#00d4c8" strokeWidth="1" />
          <path
            d="M8 20 L12 12 L16 18 L20 8 L24 16"
            stroke="#00d4c8"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="20" cy="8" r="1.5" fill="#00d4c8" />
          <circle cx="12" cy="12" r="1.5" fill="#00d4c8" />
          <circle cx="16" cy="18" r="1.5" fill="#00d4c8" />
          <circle cx="24" cy="16" r="1.5" fill="#00d4c8" />
          <circle cx="8" cy="20" r="1.5" fill="#00d4c8" />
        </svg>
      </div>
    </div>
  );
}
