"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Type definitions
interface Value {
  id: string;
  number: string;
  title: string;
  short: string;
  description: string;
  accent: string;
  icon: string;
  iconBg: string;
  stat: string;
  statValue: string;
  statUnit: string;
  longForm: string;
  quote: string;
  quoteAuthor: string;
}

interface Indicator {
  label: string;
  value: number;
  color: string;
  metric: string;
}

const values: Value[] = [
  {
    id: "brutalist",
    number: "001",
    title: "Brutalist simplicity",
    short: "Strip everything that doesn't matter.",
    description:
      "Every button, every toggle, every chart type exists for one reason only: to make data easier to understand. If it doesn't serve that purpose, it doesn't belong.",
    accent: "#00d4c8",
    icon: "◆",
    iconBg: "▣",
    stat: "0 distractions",
    statValue: "0",
    statUnit: "distractions",
    longForm:
      "We believe the best interface is the one you don't notice. No blinking elements, no auto-playing animations, no pop-ups. Just you, your data, and the clearest possible path from question to answer. Every feature is scrutinized: 'Does this help someone understand their data faster?' If the answer is no, it's cut.",
    quote: "Simplicity is the ultimate sophistication.",
    quoteAuthor: "— da Vinci",
  },
  {
    id: "obsession",
    number: "002",
    title: "User obsession",
    short: "Build for the person who just wants an answer.",
    description:
      "We build for the person who just wants an answer. Not the person with 10 years of SQL experience.",
    accent: "#8b5cf6",
    icon: "●",
    iconBg: "○",
    stat: "12K+ teams",
    statValue: "12K",
    statUnit: "teams and counting",
    longForm:
      "Every feature is tested by real users. We watch, we listen, we iterate. The person using Graphix at 11pm on a Sunday deserves the same experience as the data scientist at a Fortune 500. We don't build for the hypothetical user. We build for the human sitting at their desk, frustrated, trying to make sense of numbers.",
    quote: "The user is not broken. The tool is.",
    quoteAuthor: "— our mantra",
  },
  {
    id: "speed",
    number: "003",
    title: "Ship fast",
    short: "Speed is a feature. Fast generation. Fast iteration.",
    description:
      "Speed is a feature. Fast generation. Fast iteration. Fast fixes. We don't let perfect be the enemy of shipped.",
    accent: "#f59e0b",
    icon: "▲",
    iconBg: "△",
    stat: "<3s generation",
    statValue: "<3",
    statUnit: "seconds avg",
    longForm:
      "Weekly releases. Daily improvements. We ship when it's ready, not when it's perfect — because perfect doesn't exist, but better does. Every week. We've optimized every step of the pipeline: CSV parsing, AI calls, chart rendering. A chart should appear before you finish asking for it.",
    quote: "Done is better than perfect. Then iterate.",
    quoteAuthor: "— ship culture",
  },
  {
    id: "open",
    number: "004",
    title: "Open by default",
    short: "No lock-in. No dark patterns.",
    description:
      "No lock-in. No dark patterns. Export your work anytime. Your data is yours — we're just the canvas.",
    accent: "#ec4899",
    icon: "■",
    iconBg: "□",
    stat: "4 export formats",
    statValue: "4",
    statUnit: "formats + JSON",
    longForm:
      "PNG, SVG, JPEG, JSON — take it all. We don't trap you. If you leave someday, we'll help you pack. But something tells us you'll stay. Your data never touches our training models. Your charts are yours. We're not building a walled garden — we're building a tool that respects you.",
    quote: "Your data is yours. Always.",
    quoteAuthor: "— zero exceptions",
  },
];

const valueIndicators: Indicator[] = [
  { label: "Clarity", value: 100, color: "#00d4c8", metric: "10/10" },
  { label: "Speed", value: 100, color: "#f59e0b", metric: "<3s" },
  { label: "Privacy", value: 100, color: "#ec4899", metric: "100%" },
  { label: "Accessibility", value: 100, color: "#8b5cf6", metric: "Free" },
];

// Memoized noise texture
const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' fill='black'/%3E%3C/svg%3E")`;

export default function ValuesSection(): JSX.Element {
  const [activeValue, setActiveValue] = useState<number>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hoveredIndicator, setHoveredIndicator] = useState<number | null>(null);

  // Refs for RAF throttling
  const rafRef = useRef<number>();
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout>();

  // Optimized mouse move handler with RAF
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setMousePosition(mouseRef.current);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Auto-rotate through values
    intervalRef.current = setInterval(() => {
      setActiveValue((prev) => (prev + 1) % values.length);
    }, 8000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentValue: Value = values[activeValue];

  // Memoized glow style using transform instead of left/top
  const glowStyle = useMemo(
    () => ({
      transform: `translate3d(${mousePosition.x - 300}px, ${mousePosition.y - 300}px, 0)`,
      willChange: "transform",
    }),
    [mousePosition.x, mousePosition.y],
  );

  // Memoized circle circumference for SVG
  const circleCircumference = useMemo(() => 2 * Math.PI * 48, []);
  const strokeDasharray = useMemo(
    () => `${currentValue ? 301 : 0} 301`,
    [currentValue],
  );

  // Handlers
  const handleExpandToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleValueChange = useCallback((index: number) => {
    setActiveValue(index);
  }, []);

  return (
    <div className="relative w-full bg-[#111212] overflow-hidden">
      {/* BLACK NOISE TEXTURE - Static */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.08]"
        style={{
          backgroundImage: NOISE_TEXTURE,
          backgroundRepeat: "repeat",
        }}
      />

      {/* SUBTLE GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f8] via-[#f5f4f3] to-[#efeeed] z-0" />

      {/* FLOATING ORBS - Added will-change */}
      <div className="absolute top-40 right-20 w-96 h-96 rounded-full bg-[#111212]/8 blur-3xl pointer-events-none will-change-transform" />
      <div className="absolute bottom-40 left-20 w-[500px] h-[500px] rounded-full bg-[#111212]/5 blur-3xl pointer-events-none will-change-transform" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#00d4c8]/3 blur-3xl pointer-events-none will-change-transform" />

      {/* MOUSE-FOLLOW GLOW - Optimized with transform */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-[#00d4c8]/5 blur-3xl pointer-events-none z-0"
        style={{
          ...glowStyle,
          transition: "transform 0.05s linear",
        }}
      />

      {/* Top left - The Continental - Reduced transition duration */}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#e8e8e8] rounded-full bg-white/50 backdrop-blur-sm shadow-sm mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8] animate-pulse" />
              <span className="text-[0.6rem] tracking-[0.15em] text-[#8b8b8b] uppercase font-medium">
                Core Values
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0]" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight leading-[1.1]">
              Four principles.
              <br />
              <span className="relative inline-block mt-3 group">
                <span className="absolute -inset-3 bg-[#00d4c8] -z-10 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                <span className="text-white px-4 inline-block group-hover:scale-105 transition-transform duration-300">
                  Zero compromises.
                </span>
              </span>
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <div className="w-16 h-px bg-[#00d4c8]/30 mb-6" />
            <p className="text-[#6b6b6b] text-base leading-relaxed">
              These aren't marketing words. They're the filter for every
              decision — from which features we build to how we respond to
              support tickets at 2am.
            </p>
          </div>
        </div>

        {/* Featured value - carousel style */}
        <div className="mb-32">
          <div
            className="relative rounded-3xl p-10 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${currentValue.accent}08, transparent)`,
              borderLeft: `4px solid ${currentValue.accent}`,
            }}
          >
            {/* Animated number background */}
            <div className="absolute top-8 right-8 text-8xl font-black opacity-5 pointer-events-none">
              {currentValue.number}
            </div>

            <div className="flex flex-wrap gap-8">
              {/* Icon column */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="text-5xl transition-all duration-200 animate-pulse"
                  style={{ color: currentValue.accent }}
                >
                  {currentValue.icon}
                </div>
                <div
                  className="text-xl opacity-30"
                  style={{ color: currentValue.accent }}
                >
                  {currentValue.iconBg}
                </div>
              </div>

              {/* Content column */}
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
                  <div>
                    <div
                      className="text-sm font-mono mb-2 tracking-wider"
                      style={{ color: currentValue.accent }}
                    >
                      VALUE {currentValue.number}
                    </div>
                    <h3
                      className="text-3xl md:text-4xl font-bold transition-colors duration-200"
                      style={{ color: currentValue.accent }}
                    >
                      {currentValue.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-black">
                      {currentValue.statValue}
                    </div>
                    <div className="text-[0.6rem] text-[#8b8b8b] uppercase tracking-wider">
                      {currentValue.statUnit}
                    </div>
                  </div>
                </div>

                <p className="text-xl font-light text-black/80 mb-4 italic">
                  "{currentValue.short}"
                </p>

                <p className="text-[#6b6b6b] text-base leading-relaxed mb-6">
                  {currentValue.description}
                </p>

                {/* Expandable long form */}
                <button
                  onClick={() => handleExpandToggle(currentValue.id)}
                  className="text-[0.65rem] uppercase tracking-wider mb-4 transition-all duration-200 flex items-center gap-2"
                  style={{ color: currentValue.accent }}
                >
                  {expandedId === currentValue.id
                    ? "− Read less"
                    : "+ Read more"}
                  <span
                    className={`inline-block transition-transform duration-200 ${expandedId === currentValue.id ? "rotate-90" : ""}`}
                  >
                    →
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedId === currentValue.id
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p
                    className="text-[#8b8b8b] text-sm leading-relaxed pl-4 border-l-2 mb-4"
                    style={{ borderLeftColor: currentValue.accent }}
                  >
                    {currentValue.longForm}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className="font-serif italic"
                      style={{ color: currentValue.accent }}
                    >
                      {currentValue.quote}
                    </span>
                    <span className="text-[0.55rem] text-[#8b8b8b]">
                      {currentValue.quoteAuthor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8 pt-4 border-t border-[#e8e8e8]">
              {values.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleValueChange(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeValue === idx
                      ? "w-8"
                      : "w-4 bg-[#d0d0d0] hover:bg-[#8b8b8b]"
                  }`}
                  style={{
                    backgroundColor:
                      activeValue === idx ? currentValue.accent : undefined,
                  }}
                  aria-label={`Go to value ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Value indicators - radar/gauge style */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <div className="text-[0.6rem] text-[#8b8b8b] tracking-[0.2em] uppercase mb-2">
              Our scorecard
            </div>
            <h3 className="text-2xl font-bold text-black">
              We hold ourselves accountable
            </h3>
            <div className="w-12 h-px bg-[#00d4c8]/30 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {valueIndicators.map((indicator, idx) => {
              const radius = 48;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset =
                circumference - (indicator.value / 100) * circumference;

              return (
                <div
                  key={indicator.label}
                  className="text-center group cursor-pointer"
                  onMouseEnter={() => setHoveredIndicator(idx)}
                  onMouseLeave={() => setHoveredIndicator(null)}
                >
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        fill="none"
                        stroke="#e8e8e8"
                        strokeWidth="6"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        fill="none"
                        stroke={indicator.color}
                        strokeWidth="6"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div
                        className="text-xl font-bold transition-all duration-200"
                        style={{
                          color:
                            hoveredIndicator === idx
                              ? indicator.color
                              : "#1a1a1a",
                        }}
                      >
                        {indicator.metric}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium transition-colors duration-200`}
                    style={{
                      color:
                        hoveredIndicator === idx ? indicator.color : "#6b6b6b",
                    }}
                  >
                    {indicator.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Values grid - minimal row layout */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <div className="text-[0.6rem] text-[#8b8b8b] tracking-[0.2em] uppercase mb-2">
              In practice
            </div>
            <h3 className="text-2xl font-bold text-black">
              How it shows up daily
            </h3>
            <div className="w-12 h-px bg-[#00d4c8]/30 mx-auto mt-4" />
          </div>

          <div className="space-y-3">
            {values.map((value) => (
              <div
                key={value.id}
                className="group flex items-center gap-6 p-4 rounded-xl transition-all duration-200 hover:bg-white/50"
              >
                <div
                  className="w-16 text-lg font-mono font-bold transition-all duration-200 group-hover:scale-110"
                  style={{ color: value.accent }}
                >
                  {value.number}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-black">{value.title}</div>
                  <div className="text-[0.7rem] text-[#8b8b8b]">
                    {value.short}
                  </div>
                </div>
                <div
                  className="text-2xl opacity-30 group-hover:opacity-100 transition-all duration-200"
                  style={{ color: value.accent }}
                >
                  {value.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final manifesto block */}
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="absolute -top-10 -left-10 text-8xl text-[#00d4c8]/10 font-serif">
            "
          </div>
          <div className="absolute -bottom-10 -right-10 text-8xl text-[#00d4c8]/10 font-serif">
            "
          </div>

          <div className="relative z-10 py-8">
            <p className="text-2xl md:text-3xl font-light text-black leading-relaxed">
              We don't expect you to take our word for it.
              <br />
              <span className="font-bold bg-gradient-to-r from-[#00d4c8] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
                Build something. Export it. Leave if you want.
              </span>
              <br />
              You'll come back. The data always does.
            </p>

            <div className="flex justify-center gap-2 mt-8">
              <div className="w-8 h-px bg-[#00d4c8]/30" />
              <div className="w-12 h-px bg-[#00d4c8]" />
              <div className="w-8 h-px bg-[#00d4c8]/30" />
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="mt-20 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-[#00d4c8] to-transparent" />
            <div className="text-[0.55rem] text-[#c0c0c0] tracking-[0.3em] uppercase">
              Rooted
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
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

      {/* Top right */}
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
