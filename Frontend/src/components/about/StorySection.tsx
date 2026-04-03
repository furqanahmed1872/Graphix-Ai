import SectionTag from "@/components/ui/SectionTag";

const timeline = [
  { year: "2021", short: "21", text: "Founded in a shared Notion doc between three engineers tired of BI tools.", active: false },
  { year: "2022", short: "22", text: "First 100 users. First chart that made someone cry — happy tears, we checked.", active: false },
  { year: "2023", short: "23", text: "Crossed 5,000 teams. Launched natural language CSV parsing.", active: false },
  { year: "2024 – Now", short: "24", text: "12,000+ teams. 96 chart types. Still obsessing over every pixel.", active: true },
];

export default function StorySection() {
  return (
    <section className="px-12 pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-20 items-start">
        {/* Timeline */}
        <div>
          <SectionTag label="Our Story" />
          <div className="mt-8 flex flex-col gap-0">
            {timeline.map((t, i) => (
              <div key={t.year} className="flex gap-4 relative">
                {/* Connector line */}
                {i < timeline.length - 1 && (
                  <div className="absolute left-[13px] top-8 w-px bg-[#1e2227]" style={{ height: "calc(100% + 4px)" }} />
                )}
                {/* Dot */}
                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center text-[0.6rem] font-bold text-[#00d4c8] font-syne flex-shrink-0 z-10 ${
                    t.active
                      ? "border-[#00d4c8] bg-[rgba(0,212,200,0.1)]"
                      : "border-[#1e2227] bg-[#131619]"
                  }`}
                >
                  {t.short}
                </div>
                <div>
                  <p className="text-[0.74rem] text-[#6b7280] mb-0.5">{t.year}</p>
                  <p className="text-[0.88rem] text-white leading-snug">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-6">
          <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight text-white">
            Started from a
            <br />
            <span className="text-[#00d4c8]">frustration.</span>
          </h2>
          <p className="text-[#6b7280] leading-[1.85] text-[0.97rem]">
            In 2021, our founders were building dashboards for the fifth time in
            their careers and asking the same question:{" "}
            <strong className="text-white font-medium">why is this still so hard?</strong>{" "}
            The tools available were either deeply technical or deeply ugly.
            Neither worked the way human thought actually works.
          </p>
          <p className="text-[#6b7280] leading-[1.85] text-[0.97rem]">
            They wanted something that understood plain language. Something that
            could look at a CSV and ask "what do you want to understand?" — not
            "what columns do you want to aggregate?" That gap between those two
            questions is where Graphix was born.
          </p>
          <p className="text-[#6b7280] leading-[1.85] text-[0.97rem]">
            Today we're a team of 18 spread across four time zones, united by
            the conviction that{" "}
            <strong className="text-white font-medium">
              data visualization should feel like thinking, not engineering.
            </strong>{" "}
            Every chart we ship is a small argument for that belief.
          </p>
        </div>
      </div>
    </section>
  );
}
