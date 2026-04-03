import Link from "next/link";
import GraphPanel from "./GraphPanel";

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthCardProps) {
  return (
    <main className="min-h-screen bg-[#090b0e] flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">
        <GraphPanel />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <span className="font-syne font-extrabold text-[1.05rem] border border-white px-3 py-1 text-white tracking-wide hover:bg-white hover:text-[#090b0e] transition-all duration-200">
            Graphix
          </span>
        </Link>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <h2 className="font-syne font-extrabold text-[2.6rem] leading-[1.05] tracking-tight text-white mb-3">
            Turn your data into
            <br />
            <span className="text-white/20">instant insight.</span>
          </h2>
          <p className="text-[#6b7280] text-[0.95rem] leading-relaxed max-w-[380px]">
            96+ chart types. Natural language queries. Zero engineering
            overhead. Join 12,000+ teams already seeing the difference.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/">
            <span className="font-syne font-extrabold text-[1.05rem] border border-white px-3 py-1 text-white tracking-wide">
              Graphix
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-10">
            <h1 className="font-syne font-extrabold text-[2rem] text-white leading-tight tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-[#6b7280] text-[0.88rem] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}

          {/* Footer */}
          <p className="text-[#6b7280] text-[0.82rem] mt-8">
            {footerText}{" "}
            <Link
              href={footerLinkHref}
              className="text-[#00d4c8] hover:opacity-75 transition-opacity font-medium"
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
