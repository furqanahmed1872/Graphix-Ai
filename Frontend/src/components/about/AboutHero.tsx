import SectionTag from "@/components/ui/SectionTag";

const stats = [
  { num: "12K+", label: "Teams using Graphix" },
  { num: "96+", label: "Chart types supported" },
  { num: "2021", label: "Year founded" },
  { num: "4.9★", label: "Average user rating" },
];

export default function AboutHero() {
  return (
    <section
      className="w-full flex flex-col justify-center items-center py-30 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.034) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.034) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        animation: "fadeUp 0.5s ease both"
      }}
    >
      <SectionTag label="About Graphix" />

      <h1
        className="font-syne text-center font-extrabold text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-tight text-white"
        style={{  }}
      >
        We built the{" "}
        <em
          className="not-italic"
          style={{ color: "transparent", WebkitTextStroke: "1.5px #00d4c8" }}
        >
          visualization
        </em>
        <br />
        layer for "data".
      </h1>

      <p className="mt-7 max-w-[500px] text-[#6b7280] text-base text-center leading-[1.75]">
        A small team obsessed with one idea — that understanding your data
        should never require an engineering degree or a week of setup.
      </p>

      <div className="w-1/2 my-5 h-6 bg-[repeating-linear-gradient(-45deg,black_0px,white_5px,transparent_5px,transparent_10px)]"></div>
      {/* Stats */}
      <div className="flex flex-wrap gap-x-12 gap-y-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="font-syne font-extrabold text-[2.2rem] text-[#00d4c8] leading-none">
              {s.num}
            </span>
            <span className="text-[0.76rem] text-[#6b7280] tracking-[0.04em]">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
