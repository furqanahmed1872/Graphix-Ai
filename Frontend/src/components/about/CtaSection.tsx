import Link from "next/link";

interface CtaSectionProps {
  headline?: string;
  subtext?: string;
  btnLabel?: string;
}

export default function CtaSection({
  headline = "Join 12,000+ teams.",
  subtext = "If you've ever wished your data could just explain itself — that's exactly what we built.",
  btnLabel = "Start for Free →",
}: CtaSectionProps) {
  return (
    <section
      className="relative border-t  border-[#1e2227] px-12 py-28 text-center overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.034) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.034) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="relative z-10">
        <div className="inline-block bg-[#00d4c8] text-[#090b0e] font-syne font-extrabold text-[clamp(1.8rem,5vw,4rem)] px-7 py-2.5 leading-tight mb-5">
          {headline}
        </div>
        <p className="text-[#6b7280] text-[1rem] max-w-[460px] mx-auto leading-[1.7] mb-11">
          {subtext}
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#00d4c8] text-[#090b0e] font-syne font-bold text-[0.82rem] uppercase tracking-widest px-9 py-4 hover:opacity-85 transition-opacity duration-200"
        >
          {btnLabel}
        </Link>
      </div>
    </section>
  );
}
