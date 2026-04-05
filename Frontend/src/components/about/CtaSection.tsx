"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const fullText = "try it. break it. love it.";

const StatIcons = {
  chart: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="2"
        y="12"
        width="4"
        height="8"
        rx="1"
        fill="#00d4c8"
        fillOpacity="0.3"
        stroke="#00d4c8"
        strokeWidth="1.2"
      />
      <rect
        x="9"
        y="7"
        width="4"
        height="13"
        rx="1"
        fill="#00d4c8"
        fillOpacity="0.3"
        stroke="#00d4c8"
        strokeWidth="1.2"
      />
      <rect
        x="16"
        y="3"
        width="4"
        height="17"
        rx="1"
        fill="#00d4c8"
        fillOpacity="0.3"
        stroke="#00d4c8"
        strokeWidth="1.2"
      />
    </svg>
  ),
  free: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8.5" stroke="#00d4c8" strokeWidth="1.2" />
      <path
        d="M11 6v2M11 14v2"
        stroke="#00d4c8"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8 9.5C8 8.1 9.3 7 11 7s3 1.1 3 2.5c0 1.3-1 2-2 2.5L11 12.5"
        stroke="#00d4c8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="11" cy="15" r="0.7" fill="#00d4c8" />
    </svg>
  ),
  door: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="4"
        y="2"
        width="14"
        height="18"
        rx="1.5"
        stroke="#00d4c8"
        strokeWidth="1.2"
      />
      <path
        d="M14 2v18"
        stroke="#00d4c8"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <circle cx="13" cy="11" r="1.2" fill="#00d4c8" />
      <path
        d="M14 11h4l-1.5-1.5M17.5 11 16 12.5"
        stroke="#00d4c8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  export: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 3v11M7.5 10.5 11 14l3.5-3.5"
        stroke="#00d4c8"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15v3a1 1 0 001 1h12a1 1 0 001-1v-3"
        stroke="#00d4c8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const stats = [
  {
    value: "149+",
    label: "chart types",
    detail: "from bar to 3D surface",
    icon: StatIcons.chart,
  },
  {
    value: "$0",
    label: "forever",
    detail: "no hidden tiers",
    icon: StatIcons.free,
  },
  {
    value: "0",
    label: "signup required",
    detail: "just open and go",
    icon: StatIcons.door,
  },
  {
    value: "4",
    label: "export formats",
    detail: "PNG · SVG · JPEG · JSON",
    icon: StatIcons.export,
  },
];

export default function CtaSection() {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Mouse glow via direct DOM mutation — zero re-renders
  const glowRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${e.clientX - 400}px, ${e.clientY - 400}px, 0)`;
    }
  }, []);

  // Typing effect + cursor blink — low-frequency, fine as state
  useEffect(() => {
    let i = 0;
    const typeTimer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(typeTimer);
      }
    }, 80);

    const cursorTimer = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);

    return () => {
      clearInterval(typeTimer);
      clearInterval(cursorTimer);
    };
  }, []);

  return (
    <div
      className="relative w-full bg-[#111212] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* STATIC GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f8] via-[#f5f4f3] to-[#efeeed] z-0" />

      {/* STATIC BLOBS — radial-gradient, no blur-3xl, no animate-pulse */}
      <div
        className="absolute top-20 right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
        }}
      />

      {/* MOUSE-FOLLOW GLOW — DOM mutation only, no setState */}
      <div
        ref={glowRef}
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.07) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)",
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center">
        {/* Badge — no backdrop-blur, no animate-ping, no animate-pulse */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-[#e8e8e8] rounded-full bg-white/70 shadow-sm group hover:border-[#00d4c8]/50 transition-all duration-200">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8]" />
            <span className="text-[0.6rem] tracking-[0.15em] text-[#8b8b8b] uppercase font-medium group-hover:text-[#00d4c8] transition-colors duration-200">
              Ready when you are
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8]/30" />
          </div>
        </div>

        {/* Main headline */}
        <h2 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-black tracking-tighter leading-[1.05] text-center max-w-6xl mx-auto mb-6">
          Stop reading.
          <br />
          <span className="relative inline-block mt-6 group">
            <span className="absolute -inset-4 bg-[#00d4c8] -z-10 transform -rotate-2 group-hover:rotate-0 transition-transform duration-300" />
            <span className="absolute -inset-4 bg-gradient-to-r from-[#00d4c8] to-[#8b5cf6] -z-10 transform rotate-2 group-hover:rotate-0 transition-all duration-300 opacity-0 group-hover:opacity-100" />
            <span className="text-white px-6 inline-block group-hover:scale-105 transition-transform duration-300">
              Start charting.
            </span>
          </span>
        </h2>

        {/* Static divider dots — no animate-pulse */}
        <div className="flex justify-center gap-1 mb-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-[#00d4c8]/30" />
          ))}
        </div>

        {/* Typed line */}
        <div className="text-center mb-16">
          <div className="text-[0.55rem] text-[#8b8b8b] tracking-[0.3em] uppercase mb-3">
            Just
          </div>
          <div className="text-2xl md:text-3xl font-mono text-black/70">
            {typedText}
            <span
              className="inline-block w-0.5 h-7 bg-[#00d4c8] ml-1 align-middle"
              style={{
                opacity: cursorVisible ? 1 : 0,
                transition: "opacity 0.1s",
              }}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
          <Link
            href="/app"
            className="group relative px-12 py-5 bg-[#00d4c8] text-black font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#00d4c8]/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              Generate your first chart
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 z-10 flex items-center justify-center text-black gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Generate your first chart
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Link>

          <Link
            href="/panel"
            className="group relative px-12 py-5 border-2 border-black text-black font-bold text-lg rounded-xl hover:bg-black hover:text-white transition-all duration-200 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Open Excel editor
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
          </Link>
        </div>

        {/* Stats grid — SVG icons, no emojis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="group text-center p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/40"
              onMouseEnter={() => setHoveredStat(idx) }
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                {stat.icon}
              </div>
              <div
                className="text-2xl font-bold transition-all duration-200"
                style={{
                  color: hoveredStat === idx ? "#00d4c8" : "#000",
                  transform: hoveredStat === idx ? "scale(1.1)" : "scale(1)",
                }}
              >
                {stat.value}
              </div>
              <div className="text-[0.6rem] font-bold text-black/60 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
              <div
                className="text-[0.55rem] text-[#8b8b8b] mt-2 transition-opacity duration-200"
                style={{ opacity: hoveredStat === idx ? 1 : 0 }}
              >
                {stat.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom line */}
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#00d4c8]/30" />
            <div className="w-16 h-px bg-[#00d4c8]" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#00d4c8]/30" />
          </div>
          <p className="text-[0.55rem] text-[#8b8b8b] tracking-[0.2em] uppercase">
            No email required. No "schedule a demo." Just a tool that works.
          </p>
          <div className="mt-4 text-[0.5rem] text-[#c0c0c0] tracking-wider">
            Built by The Continental • Est. 2021
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-200">
          <div className="text-[0.5rem] text-[#8b8b8b] tracking-[0.2em] uppercase">
            Get started
          </div>
          <div className="w-px h-6 bg-gradient-to-b from-[#00d4c8] to-transparent" />
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
