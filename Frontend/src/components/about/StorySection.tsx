"use client";

import { useState, useRef, useCallback } from "react";

const TimelineIcons = {
  seed: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 24 C14 24 6 18 6 11 C6 7.13 9.13 4 13 4 C14 4 14.5 4.1 14.5 4.1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 24 C14 24 22 18 22 11 C22 7.13 18.87 4 15 4 C14 4 13.5 4.1 13.5 4.1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="24"
        x2="14"
        y2="12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="10" r="2" fill={color} opacity="0.3" />
    </svg>
  ),
  bolt: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M16 3 L8 15 H14 L12 25 L20 13 H14 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.15"
      />
    </svg>
  ),
  brain: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M10 20 C7 20 5 18 5 15.5 C5 14 5.8 12.7 7 12 C6.5 11.3 6 10.2 6 9 C6 6.8 7.8 5 10 5 C10.7 5 11.3 5.2 11.9 5.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 20 C21 20 23 18 23 15.5 C23 14 22.2 12.7 21 12 C21.5 11.3 22 10.2 22 9 C22 6.8 20.2 5 18 5 C17.3 5 16.7 5.2 16.1 5.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.9 5.5 C12.5 5.2 13.2 5 14 5 C14.8 5 15.5 5.2 16.1 5.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="5"
        x2="14"
        y2="20"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <circle
        cx="14"
        cy="14"
        r="2.5"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  ),
  grid: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect
        x="4"
        y="4"
        width="8"
        height="8"
        rx="1.5"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.1"
      />
      <rect
        x="16"
        y="4"
        width="8"
        height="8"
        rx="1.5"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.1"
      />
      <rect
        x="4"
        y="16"
        width="8"
        height="8"
        rx="1.5"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.1"
      />
      <rect
        x="16"
        y="16"
        width="8"
        height="8"
        rx="1.5"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="18"
        y1="20"
        x2="22"
        y2="20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="18"
        x2="20"
        y2="22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  table: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect
        x="3"
        y="5"
        width="22"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth="1.5"
      />
      <line x1="3" y1="11" x2="25" y2="11" stroke={color} strokeWidth="1.5" />
      <line x1="11" y1="11" x2="11" y2="23" stroke={color} strokeWidth="1" />
      <line x1="19" y1="11" x2="19" y2="23" stroke={color} strokeWidth="1" />
      <rect
        x="3"
        y="5"
        width="22"
        height="6"
        rx="2"
        fill={color}
        fillOpacity="0.15"
      />
    </svg>
  ),
  rocket: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 3 C14 3 20 6 20 14 L17 17 L11 17 L8 14 C8 6 14 3 14 3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.1"
      />
      <circle cx="14" cy="12" r="2.5" stroke={color} strokeWidth="1.5" />
      <path
        d="M11 17 L9 21 L11 20 L12 22 L14 17"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M17 17 L19 21 L17 20 L16 22 L14 17"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M8 14 L5 15 L7 17 L8 16"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M20 14 L23 15 L21 17 L20 16"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const timeline = [
  {
    year: "2021",
    quarter: "Q4",
    title: "The beginning",
    description:
      "Graphix started as a simple question: why is data visualization still so hard? A weekend project turned into an obsession.",
    accent: "#00d4c8",
    icon: TimelineIcons.seed,
    details:
      "Two founders, one laptop, and a mission. No funding. No office. Just a belief that there had to be a better way.",
  },
  {
    year: "2022",
    quarter: "Q2",
    title: "First prototype",
    description:
      "80 chart types. No AI yet. Just pure Plotly and a dream. Early users called it 'unexpectedly fast'.",
    accent: "#8b5cf6",
    icon: TimelineIcons.bolt,
    details:
      "We showed it to 10 data scientists. 9 of them said 'this is nice.' The 10th said 'I'd actually use this.' That was enough.",
  },
  {
    year: "2023",
    quarter: "Q1",
    title: "AI integration",
    description:
      "We added natural language. Suddenly, you could just describe what you wanted to see. The response was overwhelming.",
    accent: "#f59e0b",
    icon: TimelineIcons.brain,
    details:
      "The first time someone typed 'show me sales by region' and got a perfect grouped bar chart — we knew we were onto something.",
  },
  {
    year: "2024",
    quarter: "Q3",
    title: "Dashboard launch",
    description:
      "Saved charts, personal workspace, activity feed. Graphix became a place to keep your work, not just generate it.",
    accent: "#ec4899",
    icon: TimelineIcons.grid,
    details:
      "Users had been asking for a way to save charts for months. We listened. The dashboard was born.",
  },
  {
    year: "2025",
    quarter: "Q1",
    title: "Excel editor",
    description:
      "Full spreadsheet with formulas, conditional formatting, live charts. The panel changed everything.",
    accent: "#10b981",
    icon: TimelineIcons.table,
    details:
      "We realized not everyone wants to chat with AI. Some people want to type =SUM and see their chart update in real time. So we built both.",
  },
  {
    year: "2026",
    quarter: "Now",
    title: "149+ chart types",
    description:
      "From 80 to 149+. 3D surfaces, parallel coordinates, candlesticks. The most comprehensive charting library anywhere.",
    accent: "#00d4c8",
    icon: TimelineIcons.rocket,
    details:
      "We didn't stop. Every week, new chart types. Every month, new features. This is just the beginning.",
  },
];

const milestones = [
  { count: "80 → 149+", label: "Chart types", color: "#00d4c8" },
  { count: "12K+", label: "Teams", color: "#8b5cf6" },
  { count: "<3s", label: "Generation", color: "#f59e0b" },
  { count: "100%", label: "No-code", color: "#ec4899" },
];

export default function StorySection() {
  const [activeTimeline, setActiveTimeline] = useState(null);
  const [hoveredYear, setHoveredYear] = useState(null);

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

      {/* STATIC BLOBS — radial-gradient, no blur filter */}
      <div
        className="absolute top-20 right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
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
              Our Story
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0]" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight">
            From a weekend project
            <br />
            <span className="relative inline-block mt-3 group">
              <span className="absolute -inset-3 bg-[#00d4c8] -z-10 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
              <span className="text-white px-4 inline-block group-hover:scale-105 transition-transform duration-300">
                to 12,000+ teams
              </span>
            </span>
          </h2>

          <div className="w-16 h-px bg-[#00d4c8]/30 mx-auto mt-8" />
          <p className="mt-6 text-[#6b6b6b] max-w-2xl mx-auto">
            What started as frustration with existing tools became a mission to
            build something better. Here's how we got here — and where we're
            going.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mb-32">
          {/* Vertical connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00d4c8] via-[#8b5cf6] to-[#ec4899] opacity-30" />

          <div className="space-y-16">
            {timeline.map((item, idx) => (
              <div
                key={item.year}
                className={`relative flex flex-col md:flex-row gap-8 group cursor-pointer ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                onMouseEnter={() => setActiveTimeline(idx)}
                onMouseLeave={() => setActiveTimeline(null)}
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-10 transition-all duration-300 group-hover:scale-150"
                  style={{
                    backgroundColor: item.accent,
                    boxShadow:
                      activeTimeline === idx
                        ? `0 0 20px ${item.accent}`
                        : "none",
                  }}
                />

                {/* Year side */}
                <div className="md:w-1/2 md:pr-12 text-right">
                  <div className="flex items-center justify-end gap-3 mb-2">
                    <span
                      className="text-3xl font-black transition-colors duration-300"
                      style={{
                        color: activeTimeline === idx ? item.accent : "#d0d0d0",
                      }}
                    >
                      {item.year}
                    </span>
                    <span className="text-xs font-mono text-[#8b8b8b]">
                      {item.quarter}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-12 h-px bg-[#e8e8e8] mt-3" />
                  </div>
                </div>

                {/* Content side */}
                <div className="md:w-1/2 md:pl-12">
                  <div
                    className={`p-6 rounded-2xl transition-all duration-300 ${
                      activeTimeline === idx ? "bg-white/50 shadow-sm" : ""
                    }`}
                    style={{
                      borderLeft: `3px solid ${activeTimeline === idx ? item.accent : "transparent"}`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* SVG icon instead of emoji */}
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor:
                            activeTimeline === idx
                              ? `${item.accent}15`
                              : "#f5f4f3",
                        }}
                      >
                        {item.icon(
                          activeTimeline === idx ? item.accent : "#9b9b9b",
                        )}
                      </div>
                      <span
                        className="text-lg font-bold transition-colors duration-300"
                        style={{
                          color:
                            activeTimeline === idx ? item.accent : "#1a1a1a",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    <p className="text-[#6b6b6b] text-sm leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Grid expand — no max-h thrash */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateRows:
                          activeTimeline === idx ? "1fr" : "0fr",
                        opacity: activeTimeline === idx ? 1 : 0,
                        transition:
                          "grid-template-rows 0.28s ease, opacity 0.28s ease",
                      }}
                    >
                      <div style={{ overflow: "hidden" }}>
                        <p className="text-[#8b8b8b] text-xs leading-relaxed pt-3 border-t border-[#e8e8e8]">
                          {item.details}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone counters */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <div className="text-[0.6rem] text-[#8b8b8b] tracking-[0.2em] uppercase mb-2">
              By the numbers
            </div>
            <h3 className="text-2xl font-bold text-black">
              The journey in data
            </h3>
            <div className="w-12 h-px bg-[#00d4c8]/30 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {milestones.map((milestone, idx) => (
              <div
                key={milestone.label}
                className="text-center group cursor-pointer p-6 rounded-2xl transition-all duration-300 hover:bg-white/50"
                onMouseEnter={() => setHoveredYear(idx)}
                onMouseLeave={() => setHoveredYear(null)}
              >
                <div
                  className="text-3xl md:text-4xl font-black transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: hoveredYear === idx ? milestone.color : "#1a1a1a",
                  }}
                >
                  {milestone.count}
                </div>
                <div
                  className="text-[0.65rem] uppercase tracking-wider mt-2 transition-colors duration-300"
                  style={{
                    color: hoveredYear === idx ? milestone.color : "#8b8b8b",
                  }}
                >
                  {milestone.label}
                </div>
                <div
                  className="h-px mx-auto mt-3 transition-all duration-300"
                  style={{
                    width: hoveredYear === idx ? "3rem" : "2rem",
                    opacity: hoveredYear === idx ? 1 : 0,
                    backgroundColor: milestone.color,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* The future section */}
        <div className="relative max-w-4xl mx-auto text-center mb-32">
          <div className="absolute -top-10 -left-10 text-8xl text-[#00d4c8]/10 font-serif">
            "
          </div>
          <div className="absolute -bottom-10 -right-10 text-8xl text-[#00d4c8]/10 font-serif">
            "
          </div>

          <div className="relative z-10">
            {/* Badge — no backdrop-blur, no animate-pulse */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e8e8] bg-white/70 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8]" />
              <span className="text-[0.55rem] tracking-[0.15em] text-[#8b8b8b] uppercase">
                What's next
              </span>
            </div>

            <p className="text-2xl md:text-3xl font-light text-black leading-relaxed">
              We're just getting started.
              <br />
              <span className="font-bold bg-gradient-to-r from-[#00d4c8] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
                More chart types. Faster generation. Deeper insights.
              </span>
              <br />
              The best version of Graphix hasn't been built yet.
            </p>

            <div className="flex justify-center gap-2 mt-8">
              <div className="w-8 h-px bg-[#00d4c8]/30" />
              <div className="w-12 h-px bg-[#00d4c8]" />
              <div className="w-8 h-px bg-[#00d4c8]/30" />
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button className="px-6 py-2.5 bg-[#00d4c8] text-black text-sm font-medium rounded-lg hover:bg-[#00e0d8] transition-all hover:scale-105">
                Join the journey →
              </button>
              <button className="px-6 py-2.5 border border-[#d0d0d0] text-[#6b6b6b] text-sm rounded-lg hover:border-[#00d4c8] hover:text-[#00d4c8] transition-all">
                See roadmap
              </button>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="mt-20 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-[#00d4c8] to-transparent" />
            <div className="text-[0.55rem] text-[#c0c0c0] tracking-[0.3em] uppercase">
              Ongoing
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
