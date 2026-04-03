interface SectionTagProps {
  label: string;
}

export default function SectionTag({ label }: SectionTagProps) {
  return (
    <div className="inline-flex items-center gap-2 border border-[#1e2227] rounded-full px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-[#00d4c8] w-fit mb-6">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00d4c8]" />
      {label}
    </div>
  );
}
