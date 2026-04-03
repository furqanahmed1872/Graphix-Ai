import SectionTag from "@/components/ui/SectionTag";

const team = [
  {
    initials: "AR",
    name: "Amir Rao",
    role: "Co-Founder & CEO",
    bio: "Former data engineer tired of writing the same pipeline for the fifth time. Believes in products so simple they feel like magic.",
  },
  {
    initials: "SK",
    name: "Sara Kim",
    role: "Co-Founder & CTO",
    bio: "ML researcher turned builder. Wrote the first NLP parser in a single weekend. Still the fastest coder on the team.",
  },
  {
    initials: "LM",
    name: "Leo Martins",
    role: "Head of Design",
    bio: "Spent a decade at information design studios. Cares deeply about the space between two words on a chart axis.",
  },
  {
    initials: "NP",
    name: "Nadia Petrov",
    role: "Head of Product",
    bio: "Talks to users every single day. Has a spreadsheet tracking every feature request ever received. 847 rows and counting.",
  },
];

export default function TeamSection() {
  return (
    <section className="px-12 py-24">
      <div className="w-full my-5 h-6 bg-[repeating-linear-gradient(-45deg,black_0px,white_5px,transparent_5px,transparent_10px)]"></div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end my-14 gap-4">
        <div>
          <SectionTag label="The Team" />
          <h2 className="font-syne font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight text-white">
            The people behind
            <br />
            the pixels.
          </h2>
        </div>
        <p className="text-[#6b7280] text-[0.87rem] leading-[1.65] max-w-[240px] lg:text-right">
          18 humans. 4 time zones. 1 obsession with making data beautiful.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1e2227] border border-[#1e2227]">
        {team.map((m) => (
          <div
            key={m.name}
            className="bg-[#131619] p-7 hover:bg-[#161a1e] transition-colors duration-200"
          >
            {/* Avatar */}
            <div className="w-[52px] h-[52px] border border-[#1e2227] bg-[rgba(0,212,200,0.1)] rounded-full flex items-center justify-center font-syne font-extrabold text-[1rem] text-[#00d4c8] mb-5">
              {m.initials}
            </div>
            <p className="font-syne font-bold text-[0.95rem] text-white mb-0.5">
              {m.name}
            </p>
            <p className="text-[0.75rem] text-[#00d4c8] mb-2.5">{m.role}</p>
            <p className="text-[#6b7280] text-[0.8rem] leading-[1.65]">
              {m.bio}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
