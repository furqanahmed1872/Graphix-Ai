import SectionTag from "@/components/ui/SectionTag";

const values = [
  {
    icon: "◈",
    title: "Radical Simplicity",
    desc: "Every feature we remove is a decision we're proud of. Complexity is the enemy of understanding — we design by subtraction.",
  },
  {
    icon: "⬡",
    title: "Precision First",
    desc: "Beautiful charts that lie are worse than ugly ones that tell the truth. Accuracy is non-negotiable — aesthetics serve clarity.",
  },
  {
    icon: "◎",
    title: "Speed as a Feature",
    desc: "A chart you wait ten minutes for breaks your thinking. We obsess over latency because insight delayed is insight lost.",
  },
  {
    icon: "▲",
    title: "Built for Humans",
    desc: "We write for the person who typed their first SQL query last week and the data scientist who's forgotten more than we know.",
  },
  {
    icon: "◻",
    title: "Open by Default",
    desc: "We believe data wants to move freely. Our export tools, APIs, and integrations are first-class citizens — not afterthoughts.",
  },
  {
    icon: "✦",
    title: "Relentless Craft",
    desc: "We care about the 2px alignment no one consciously notices but everyone feels. That level of care compounds into something special.",
  },
];

export default function ValuesSection() {
  return (
    <section
      className="px-12 py-23 border-b border-[#1e2227]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.034) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.034) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <SectionTag label="What We Stand For" />
      <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight text-white mb-14">
        Principles that shape
        <br />
        every pixel we ship.
      </h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e2227] border border-[#1e2227]"
      >
        {values.map((v) => (
          <div
            key={v.title}
            className="bg-[#131619] p-9 hover:bg-[#161a1e] transition-colors duration-200 group"
          >
            <div className="w-11 h-11 border border-[#00d4c8] flex items-center justify-center text-[#00d4c8] text-xl mb-5">
              {v.icon}
            </div>
            <h3 className="font-syne font-bold text-[1rem] text-white mb-2.5">
              {v.title}
            </h3>
            <p className="text-[#6b7280] text-[0.84rem] leading-[1.7]">
              {v.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
