"use client";

import { useState, useRef, useCallback } from "react";

const stats = [
  { num: "12K+", label: "Teams using Graphix" },
  { num: "149+", label: "Chart types supported" },
  { num: "2021", label: "Year founded" },
  { num: "4.9★", label: "Average user rating" },
];

export default function AboutHero() {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  // Mouse glow: move the DOM node directly — zero re-renders
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
    }
  }, []);

  return (
    <div
      className="relative w-full min-h-screen bg-[#111212] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* SUBTLE GRADIENT OVERLAY — static, no filter cost */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f8] via-[#f5f4f3] to-[#efeeed] z-0" />

      {/* STATIC BLOBS — radial-gradient, no blur filter repaint */}
      <div
        className="absolute top-20 right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(17,18,18,0.07) 0%, transparent 70%)",
        }}
      />

      {/* MOUSE-FOLLOW GLOW — DOM mutation only, no setState, no re-render */}
      <div
        ref={glowRef}
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%)",
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        {/* Badge — no backdrop-blur */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#e8e8e8] rounded-full bg-white/70 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8]" />
            <span className="text-[0.6rem] tracking-[0.15em] text-[#8b8b8b] uppercase font-medium">
              About Graphix
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0]" />
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-[clamp(3rem,10vw,7rem)] font-bold leading-[0.95] tracking-tighter text-black">
            <span className="relative inline-block">
              WE BUILT
              <svg
                className="absolute -bottom-3 left-0 w-full"
                height="4"
                viewBox="0 0 200 4"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 2 L200 2"
                  stroke="#00d4c8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              </svg>
            </span>
            <br />
            <span className="relative inline-block mt-6 group">
              <span className="absolute -inset-3 bg-[#00d4c8] -z-10 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
              <span className="text-white px-3 inline-block group-hover:scale-105 transition-transform duration-300">
                VISUALIZATION
              </span>
            </span>
            <br />
            <span className="text-[#1a1a1a] relative inline-block mt-6">
              LAYER FOR
              <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#1a1a1a]/10" />
            </span>
            <br />
            <span className="text-[#8b8b8b] text-[0.5em] font-light tracking-[0.3em] uppercase mt-4 inline-block">
              "data"
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="max-w-md mx-auto text-center mb-24 relative">
          <div className="absolute -top-6 -left-8 text-6xl text-[#00d4c8]/10 font-serif">
            "
          </div>
          <div className="absolute -bottom-6 -right-8 text-6xl text-[#00d4c8]/10 font-serif">
            "
          </div>
          <p className="text-[#6b6b6b] text-base leading-relaxed font-light relative z-10">
            A small team obsessed with one idea — that understanding your data
            should never require an engineering degree or a week of setup.
          </p>
        </div>

        {/* Stats */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="border-t border-[#e8e8e8] pt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {stats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className="text-center group cursor-pointer relative"
                  onMouseEnter={() => setHoveredStat(idx)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div
                    className={`absolute inset-0 bg-[#00d4c8]/5 rounded-2xl transition-opacity duration-200 ${
                      hoveredStat === idx ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="relative py-4">
                    <div
                      className={`text-4xl md:text-5xl font-bold transition-all duration-200 ${
                        hoveredStat === idx
                          ? "text-[#00d4c8] scale-110"
                          : "text-black"
                      }`}
                    >
                      {stat.num}
                    </div>
                    <div
                      className={`text-[0.6rem] uppercase mt-2 transition-all duration-200 ${
                        hoveredStat === idx
                          ? "text-[#00d4c8] tracking-[0.2em]"
                          : "text-[#8b8b8b] tracking-[0.15em]"
                      }`}
                    >
                      {stat.label}
                    </div>
                    <div
                      className={`h-px bg-[#00d4c8] mx-auto mt-3 transition-all duration-300 ${
                        hoveredStat === idx
                          ? "opacity-100 w-12"
                          : "opacity-0 w-8"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div className="w-px h-8 bg-gradient-to-b from-[#00d4c8] to-transparent" />
          <div className="text-[0.55rem] text-[#c0c0c0] tracking-[0.3em] uppercase">
            SCROLL
          </div>
        </div>
      </div>

      {/* Decorative bottom-right */}
      <div className="absolute bottom-10 right-10 w-40 h-40 opacity-20 pointer-events-none">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
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
