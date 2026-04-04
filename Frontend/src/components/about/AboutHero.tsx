"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const stats = [
  { num: "12K+", label: "Teams using Graphix" },
  { num: "149+", label: "Chart types supported" },
  { num: "2021", label: "Year founded" },
  { num: "4.9★", label: "Average user rating" },
];

export default function AboutHero() {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Use refs for RAF throttling
  const rafRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Optimized mouse move handler with RAF
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setMousePosition(mouseRef.current);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Memoize static assets to prevent recreation
  const noiseTexture = useMemo(
    () =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' fill='black'/%3E%3C/svg%3E")`,
    [],
  );

  // Optimized glow style using transform instead of left/top
  const glowStyle = useMemo(
    () => ({
      transform: `translate3d(${mousePosition.x - 300}px, ${mousePosition.y - 300}px, 0)`,
      willChange: "transform",
    }),
    [mousePosition.x, mousePosition.y],
  );

  return (
    <div className="relative w-full min-h-screen bg-[#111212] overflow-hidden">
      {/* BLACK NOISE TEXTURE - memoized background */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.08]"
        style={{
          backgroundImage: noiseTexture,
          backgroundRepeat: "repeat",
        }}
      />

      {/* SUBTLE GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f8] via-[#f5f4f3] to-[#efeeed] z-0" />

      {/* FLOATING ORBS - added will-change for smoother animation */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#111212]/10 blur-3xl pointer-events-none will-change-transform" />
      <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-[#111212]/10 blur-3xl pointer-events-none will-change-transform" />

      {/* MOUSE-FOLLOW GLOW - FIXED: added missing style and optimized */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-[#111212]/5 blur-3xl pointer-events-none z-0"
        style={{
          ...glowStyle,
          transition: "transform 0.05s linear",
        }}
      />

      {/* Top left - The Continental - reduced transition duration */}
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
        {/* Tag - refined */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#e8e8e8] rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8] animate-pulse" />
            <span className="text-[0.6rem] tracking-[0.15em] text-[#8b8b8b] uppercase font-medium">
              About Graphix
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0]" />
          </div>
        </div>

        {/* Massive headline - brutalist with details */}
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

        {/* Description with quote mark detail */}
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

        {/* Stats - detailed design */}
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
                  {/* Background highlight on hover - optimized duration */}
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
                      style={{
                        willChange: hoveredStat === idx ? "transform" : "auto",
                      }}
                    >
                      {stat.num}
                    </div>
                    <div
                      className={`text-[0.6rem] uppercase tracking-wider mt-2 transition-all duration-200 ${
                        hoveredStat === idx
                          ? "text-[#00d4c8] tracking-[0.2em]"
                          : "text-[#8b8b8b] tracking-[0.15em]"
                      }`}
                    >
                      {stat.label}
                    </div>

                    {/* Decorative line under stat on hover */}
                    <div
                      className={`w-8 h-px bg-[#00d4c8] mx-auto mt-3 transition-all duration-300 ${
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

        {/* Bottom accent - detailed */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div className="w-px h-8 bg-gradient-to-b from-[#00d4c8] to-transparent" />
          <div className="text-[0.55rem] text-[#c0c0c0] tracking-[0.3em] uppercase">
            SCROLL
          </div>
        </div>
      </div>

      {/* Decorative elements - bottom right grid pattern */}
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

      {/* Top right - subtle chart icon */}
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
