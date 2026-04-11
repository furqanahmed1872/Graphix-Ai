"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const team = {
  name: "The Continental",
  founded: "2021",
  origin:
    "We build tools for the people who actually use data — not the suits who just collect it.",
  members: "4",
  motto: "If it's not useful at 2am, it's not done.",
};

const teamMembers = [
  {
    role: "Vision",
    emoji: "🎯",
    description: "The one who says 'but why?' until it actually makes sense.",
    energy: "Obsessive clarity",
  },
  {
    role: "Code",
    emoji: "⚡",
    description: "Turns chaos into structure. Sleeps only after it compiles.",
    energy: "Quiet intensity",
  },
  {
    role: "Design",
    emoji: "🎨",
    description: "Makes complex feel obvious. Hates bad kerning.",
    energy: "Intentional minimalism",
  },
  {
    role: "Data",
    emoji: "📊",
    description:
      "Sees stories where others see numbers. Never trusts a single source.",
    energy: "Healthy skepticism",
  },
];

const antiValues = [
  {
    label: "No investors",
    detail: "We answer to users. Not quarterly reports.",
    emoji: "🚫",
  },
  {
    label: "No meetings",
    detail: "4 people. 0 standups. Everything in writing.",
    emoji: "📵",
  },
  {
    label: "No egos",
    detail: "Best idea wins. Doesn't matter who had it.",
    emoji: "🪞",
  },
  {
    label: "No locked doors",
    detail: "Export your data. Leave anytime. We'll wait.",
    emoji: "🚪",
  },
];

const whatWeArent = [
  "Not a unicorn",
  "Not a rocketship",
  "Not a family",
  "Just changing the world",
  "and making charts that don't suck",
];

export default function TeamSection() {
  const [hoveredAnti, setHoveredAnti] = useState<number | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Mouse glow via direct DOM mutation — zero re-renders
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
    }
  }, []);

  // Rotating text + cursor blink — these are low-frequency (500ms / 2000ms), fine as state
  useEffect(() => {
    const textTimer = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % whatWeArent.length);
    }, 2000);
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => {
      clearInterval(textTimer);
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

      {/* STATIC BLOBS — radial-gradient, no blur filter repaint */}
      <div
        className="absolute top-40 right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-40 left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(17,18,18,0.06) 0%, transparent 70%)",
        }}
      />

      {/* MOUSE-FOLLOW GLOW — DOM mutation only, no setState */}
      <div
        ref={glowRef}
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none z-0"
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
        {/* Header */}
        <div className="text-center mb-20">
          {/* Badge — no backdrop-blur, no animate-pulse */}
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#e8e8e8] rounded-full bg-white/70 shadow-sm mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8]" />
            <span className="text-[0.6rem] tracking-[0.15em] text-[#8b8b8b] uppercase font-medium">
              Who We Are
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0]" />
          </div>
        </div>

        {/* Massive name */}
        <div className="text-center mb-8">
          <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-black text-black tracking-tighter leading-[0.9]">
            {team.name}
          </h1>
        </div>

        {/* Rotating "We are" text */}
        <div className="text-center mb-20">
          <div className="text-[0.55rem] text-[#8b8b8b] tracking-[0.3em] uppercase mb-3">
            We are
          </div>
          <div className="text-2xl md:text-3xl font-light text-black/60 font-mono">
            {whatWeArent[displayIndex]}
            <span
              className="inline-block w-2 h-6 bg-[#00d4c8] ml-1 align-middle"
              style={{
                opacity: showCursor ? 1 : 0,
                transition: "opacity 0.1s",
              }}
            />
          </div>
        </div>

        {/* Team members */}
        <div className="mb-28">
          <div className="text-center mb-10">
            <div className="text-[0.55rem] text-[#8b8b8b] tracking-[0.3em] uppercase mb-2">
              The humans
            </div>
            <div className="w-8 h-px bg-[#00d4c8]/30 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {teamMembers.map((member) => (
              <div
                key={member.role}
                className="group p-5 rounded-xl transition-all duration-200 hover:bg-white/40 cursor-default"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block">
                    {member.emoji}
                  </span>
                  <span className="text-sm font-bold text-black/40 group-hover:text-[#00d4c8] transition-colors duration-200">
                    {member.role}
                  </span>
                </div>
                <p className="text-sm text-black leading-relaxed mb-2">
                  {member.description}
                </p>
                <div className="text-[0.6rem] text-[#8b8b8b] font-mono">
                  {member.energy}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-values */}
        <div className="mb-28">
          <div className="text-center mb-10">
            <div className="text-[0.55rem] text-[#8b8b8b] tracking-[0.3em] uppercase mb-2">
              What you won't find here
            </div>
            <div className="w-8 h-px bg-[#00d4c8]/30 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {antiValues.map((item, idx) => (
              <div
                key={item.label}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredAnti(idx)}
                onMouseLeave={() => setHoveredAnti(null)}
              >
                <div className="text-center p-5 rounded-xl transition-all duration-200 group-hover:bg-white/30">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">
                    {item.emoji}
                  </div>
                  <div
                    className="text-sm font-bold transition-colors duration-200"
                    style={{ color: hoveredAnti === idx ? "#00d4c8" : "#000" }}
                  >
                    {item.label}
                  </div>
                  <div className="text-[0.6rem] text-[#8b8b8b] mt-2 leading-relaxed">
                    {item.detail}
                  </div>
                  <div
                    className="w-6 h-px bg-[#00d4c8] mx-auto mt-3 transition-opacity duration-200"
                    style={{ opacity: hoveredAnti === idx ? 1 : 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manifesto quote */}
        <div className="relative max-w-3xl mx-auto text-center mb-24">
          <div className="absolute -top-6 -left-6 text-6xl text-[#00d4c8]/10 font-serif">
            "
          </div>
          <div className="absolute -bottom-6 -right-6 text-6xl text-[#00d4c8]/10 font-serif">
            "
          </div>
          <div className="relative">
            <p className="text-xl md:text-2xl font-light text-black leading-relaxed">
              {team.origin}
            </p>
            <div className="flex justify-center gap-1 mt-6">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#00d4c8]/20" />
              ))}
            </div>
          </div>
        </div>

        {/* Raw stats */}
        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto text-center mb-16">
          {[
            [team.founded, "Born"],
            [team.members, "Humans"],
            ["0", "Investors"],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-black">{val}</div>
              <div className="text-[0.55rem] text-[#8b8b8b] tracking-wider uppercase mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* The one rule */}
        <div className="text-center">
          <div className="inline-block border-t border-[#e8e8e8] pt-6">
            <div className="text-[0.55rem] text-[#8b8b8b] tracking-[0.3em] uppercase mb-2">
              The only rule
            </div>
            <p className="text-sm text-black/70 font-mono">{team.motto}</p>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="mt-20 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-gradient-to-r from-transparent to-[#00d4c8]/30" />
            <div className="w-1 h-1 rounded-full bg-[#00d4c8]/50" />
            <div className="w-4 h-px bg-gradient-to-l from-transparent to-[#00d4c8]/30" />
          </div>
        </div>
      </div>

      {/* Decorative bottom-right */}
      <div className="absolute bottom-10 right-10 w-32 h-32 opacity-20 pointer-events-none">
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
