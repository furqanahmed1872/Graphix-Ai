// components/ui/shared.tsx
import { cn } from "@/components/utils"; // ← your tailwind-merge / clsx helper
import { ReactNode } from "react";

export const GRID_OVERLAY = `
  bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
  bg-[size:32px_32px]
`;

export function PageWrapper({
  children,
  className,
  overlaySize = "32px",
}: {
  children: ReactNode;
  className?: string;
  overlaySize?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 text-white relative overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className={cn(
            GRID_OVERLAY,
            `bg-[size:${overlaySize}_${overlaySize}]`,
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/5 to-transparent animate-pulse-slow" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}) {
  return (
    <span
      className={cn(
        `bg-clip-text text-white font-bold`,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl transition-all duration-300",
        hover &&
          "hover:border-cyan-500/40 hover:shadow-cyan-900/20 hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  centered = true,
  className,
}: {
  title: any; // allow string or ReactNode
  description?: string;
  children: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("py-16 lg:py-24", className)}>
      <div className={cn("max-w-7xl mx-auto px-6", centered && "text-center")}>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          {title}
        </h2>
        {description && (
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
