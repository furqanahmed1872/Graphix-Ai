import SectionTag from "@/components/ui/SectionTag";

export default function MissionSection() {
  return (
    <section className="bg-white border-t border-b border-[#1e2227] px-12 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Text */}
        <div>
          <SectionTag label="Our Mission" />
          <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight text-black/40 mb-4">
            Data fluency for
            <br />
            <span className="text-[#00d4c8]">everyone.</span>
          </h2>
          <p className="text-[#6b7280] text-[0.97rem] leading-[1.8] max-w-[560px]">
            We believe the gap between raw data and genuine insight shouldn't
            require a PhD to bridge. Graphix exists to collapse that gap
            entirely — so a founder, marketer, scientist, or student can look at
            numbers and immediately see the story they're trying to tell.
          </p>
          <p className="text-[#6b7280] text-[0.97rem] leading-[1.8] max-w-[560px] mt-5">
            No code. No SQL. No waiting on your data team. Just language and
            clarity.
          </p>
        </div>

        {/* ── GRAPH VISUAL ── */}
        <div className="relative h-[360px] bg-[#0d1014] overflow-hidden border-x-16 border-t-16 p-x-5 border-black/40 bg-white">
          <style>{`
    @keyframes wave1 {
      0%   { d: path("M0,180 C80,140 160,220 240,180 S380,120 500,160 L500,360 L0,360 Z"); }
      50%  { d: path("M0,200 C80,160 160,240 240,160 S380,100 500,140 L500,360 L0,360 Z"); }
      100% { d: path("M0,180 C80,140 160,220 240,180 S380,120 500,160 L500,360 L0,360 Z"); }
    }
    @keyframes wave2 {
      0%   { d: path("M0,200 C80,240 160,160 240,200 S380,240 500,200 L500,360 L0,360 Z"); }
      50%  { d: path("M0,220 C80,180 160,260 240,220 S380,180 500,220 L500,360 L0,360 Z"); }
      100% { d: path("M0,200 C80,240 160,160 240,200 S380,240 500,200 L500,360 L0,360 Z"); }
    }
    @keyframes wave3 {
      0%   { d: path("M0,240 C80,200 160,280 240,240 S380,200 500,240 L500,360 L0,360 Z"); }
      50%  { d: path("M0,260 C80,220 160,300 240,260 S380,220 500,260 L500,360 L0,360 Z"); }
      100% { d: path("M0,240 C80,200 160,280 240,240 S380,200 500,240 L500,360 L0,360 Z"); }
    }
    .wave1 { animation: wave1 6s ease-in-out infinite; }
    .wave2 { animation: wave2 5s ease-in-out infinite 0.8s; }
    .wave3 { animation: wave3 4s ease-in-out infinite 1.6s; }
  `}</style>

          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 500 360"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="w1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4c8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00d4c8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="w2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4c8" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#00d4c8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="w3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4c8" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#00d4c8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Wave 3 — deepest, most transparent */}
            <path
              className="wave3"
              fill="url(#w3)"
              d="M0,240 C80,200 160,280 240,240 S380,200 500,240 L500,360 L0,360 Z"
            />

            {/* Wave 2 — mid */}
            <path
              className="wave2"
              fill="url(#w2)"
              d="M0,200 C80,240 160,160 240,200 S380,240 500,200 L500,360 L0,360 Z"
            />

            {/* Wave 1 — top, brightest */}
            <path
              className="wave1"
              fill="url(#w1)"
              d="M0,180 C80,140 160,220 240,180 S380,120 500,160 L500,360 L0,360 Z"
            />

            {/* Top stroke line */}
            <path
              className="wave1"
              fill="none"
              stroke="#00d4c8"
              strokeWidth="2"
              d="M0,180 C80,140 160,220 240,180 S380,120 500,160"
              strokeLinecap="round"
            />
          </svg>

          {/* Label overlay */}
          <div className="absolute top-6 left-6">
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-black/40 mb-1">
              Data Flow
            </p>
            <p className="font-syne font-bold text-[1.4rem] text-black/40 leading-none">
              12,000+ <span className="text-[#00d4c8]">teams</span>
            </p>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4c8] animate-pulse" />
            <span className="text-[0.6rem] uppercase tracking-widest text-[#6b7280]">
              Live
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
