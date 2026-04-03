"use client";

import { useState } from "react";

// ── Ico ──────────────────────────────────────────────────────
export function Ico({
  d,
  size = 16,
  stroke = "currentColor",
  fill = "none",
  sw = 1.75,
}: {
  d: string;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

// ── Chip ─────────────────────────────────────────────────────
export function Chip({
  children,
  cyan = false,
}: {
  children: React.ReactNode;
  cyan?: boolean;
}) {
  return (
    <span
      className={`inline-block px-2 py-[2px] text-[10px] font-bold tracking-[0.07em] uppercase rounded-[3px] border ${
        cyan
          ? "bg-[rgba(0,212,200,0.18)] text-[#00d4c8] border-[rgba(0,212,200,0.35)]"
          : "bg-white/[0.08] text-white/35 border-white/[0.12]"
      }`}
    >
      {children}
    </span>
  );
}

// ── Btn ──────────────────────────────────────────────────────
export function Btn({
  children,
  onClick,
  variant = "fill",
  size = "md",
  style: sx,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "fill" | "ghost" | "outline";
  size?: "sm" | "md";
  style?: React.CSSProperties;
}) {
  const base =
    "inline-flex items-center gap-1.5 cursor-pointer font-bold tracking-[0.05em] uppercase rounded-[3px] border transition-all duration-150";

  const sizes = {
    sm: "text-[11px] px-[14px] py-[7px]",
    md: "text-[12px] px-5 py-[9px]",
  };

  const variants = {
    fill: "bg-[#00d4c8] text-[#111212] border-[#00d4c8] hover:opacity-90",
    outline:
      "bg-transparent text-[#00d4c8] border-[rgba(0,212,200,0.35)] hover:border-[#00d4c8]",
    ghost:
      "bg-transparent text-white/35 border-white/[0.12] hover:text-white/60",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
      style={sx}
    >
      {children}
    </button>
  );
}

// ── FieldInput ───────────────────────────────────────────────
export function FieldInput({
  value,
  onChange,
  placeholder,
  mono = false,
  style: sx,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  mono?: boolean;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`w-full bg-transparent outline-none rounded-[3px] text-white text-[13px] px-[13px] py-[10px] transition-colors box-border border ${
        focused ? "border-[#00d4c8]" : "border-white/[0.12]"
      } ${mono ? "font-mono" : "font-sans"}`}
      style={sx}
    />
  );
}

// ── FieldTextarea ────────────────────────────────────────────
export function FieldTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  mono = false,
  style: sx,
}: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  mono?: boolean;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`w-full bg-transparent outline-none resize-y rounded-[3px] text-white text-[13px] leading-[1.7] px-[13px] py-[10px] transition-colors box-border border ${
        focused ? "border-[#00d4c8]" : "border-white/[0.12]"
      } ${mono ? "font-mono" : "font-sans"}`}
      style={sx}
    />
  );
}

// ── FieldLabel ───────────────────────────────────────────────
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-white/35 text-[10px] font-bold tracking-[0.1em] uppercase">
      {children}
    </span>
  );
}

// ── SectionCard ──────────────────────────────────────────────
export function SectionCard({
  children,
  style: sx,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="border border-white/[0.12] rounded-[6px] overflow-hidden"
      style={sx}
    >
      {children}
    </div>
  );
}

// ── SectionHead ──────────────────────────────────────────────
export function SectionHead({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-white/[0.08]">
      <span className="text-white font-bold text-[14px]">{title}</span>
      {right}
    </div>
  );
}

// ── StripeDivider ────────────────────────────────────────────
export function StripeDivider() {
  return (
    <div className="w-full my-5 h-2 bg-[repeating-linear-gradient(-45deg,black_0px,white_3px,transparent_3px,transparent_5px)]" />
  );
}

// ── BackBtn ──────────────────────────────────────────────────
export function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[#00d4c8] text-[11px] font-semibold tracking-[0.06em] uppercase mb-[22px] p-0 bg-transparent border-none cursor-pointer hover:opacity-75 transition-opacity"
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back to Dashboard
    </button>
  );
}

// ── SuccessBanner ────────────────────────────────────────────
export function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[9px] bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.35)] rounded-[6px] px-[15px] py-[11px]">
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00d4c8"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
      {children}
    </div>
  );
}

// ── DataTable ────────────────────────────────────────────────
export function DataTable({ rows }: { rows: (string | number)[][] }) {
  return (
    <div className="border border-white/[0.12] rounded-[5px] overflow-hidden">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-white/[0.08]">
            {rows[0].map((h, i) => (
              <th
                key={i}
                className={`text-left px-[14px] py-[10px] font-bold text-[#00d4c8] border-b border-white/[0.08] ${
                  i < rows[0].length - 1 ? "border-r border-white/[0.08]" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, ri) => (
            <tr
              key={ri}
              className={
                ri < rows.length - 2 ? "border-b border-white/[0.08]" : ""
              }
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-[14px] py-[9px] text-white/55 ${
                    ci < row.length - 1 ? "border-r border-white/[0.08]" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Stepper ──────────────────────────────────────────────────
export function Stepper({
  steps,
  current,
}: {
  steps: [string, string][];
  current: number;
}) {
  return (
    <div className="flex items-center mb-7">
      {steps.map(([n, l], i) => (
        <div key={n} className="flex items-center">
          <div className="flex items-center gap-[7px]">
            <div
              className={`w-[26px] h-[26px] rounded-[4px] flex items-center justify-center text-[11px] font-extrabold transition-all duration-200 border-[1.5px] ${
                current >= Number(n)
                  ? "bg-[#00d4c8] border-[#00d4c8] text-[#111212]"
                  : "bg-transparent border-white/[0.12] text-white/35"
              }`}
            >
              {n}
            </div>
            <span
              className={`text-[12px] font-semibold ${
                current >= Number(n) ? "text-white" : "text-white/35"
              }`}
            >
              {l}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-9 h-[1.5px] mx-[10px] rounded-[1px] ${
                current > i + 1 ? "bg-[#00d4c8]" : "bg-white/[0.08]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── MiniStepper ──────────────────────────────────────────────
export function MiniStepper({
  steps,
  current,
}: {
  steps: [string, string][];
  current: string;
}) {
  const ci = steps.findIndex((s) => s[0] === current);
  return (
    <div className="flex items-center gap-2 mb-[26px] text-[12px]">
      {steps.map(([id, label], i) => {
        const active = current === id;
        const past = ci > i;
        return (
          <div key={id} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-[3px] flex items-center justify-center text-[10px] font-extrabold border-[1.5px] ${
                  active || past
                    ? "bg-[#00d4c8] border-[#00d4c8] text-[#111212]"
                    : "bg-transparent border-white/[0.12] text-white/35"
                }`}
              >
                {past ? "✓" : i + 1}
              </div>
              <span
                className={
                  active ? "text-white font-semibold" : "text-white/35"
                }
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-[22px] h-[1.5px] rounded-[1px] ${
                  past ? "bg-[#00d4c8]" : "bg-white/[0.08]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── ActionCard ───────────────────────────────────────────────
export function ActionCard({
  icon,
  label,
  sub,
  cta,
  onClick,
  primary = false,
}: {
  icon: string;
  label: string;
  sub: string;
  cta: string;
  onClick: () => void;
  primary?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      className={`flex flex-col items-center gap-[9px] text-center rounded-[6px] px-[14px] py-5 cursor-pointer border transition-all duration-200 w-full ${
        hov && primary
          ? "bg-[rgba(0,212,200,0.08)] border-[#00d4c8]"
          : hov
            ? "bg-transparent border-white/20"
            : "bg-transparent border-white/[0.08]"
      }`}
    >
      {/* Icon box */}
      <div
        className={`w-[42px] h-[42px] rounded-[6px] flex items-center justify-center border ${
          primary
            ? "bg-[rgba(0,212,200,0.18)] border-[rgba(0,212,200,0.35)] text-[#00d4c8]"
            : "bg-white/[0.08] border-white/[0.08] text-white/55"
        }`}
      >
        <Ico d={icon} size={18} />
      </div>

      {/* Label + sub */}
      <div>
        <div className="text-white font-bold text-[13px] mb-[3px]">{label}</div>
        <div className="text-white/35 text-[12px]">{sub}</div>
      </div>

      {/* CTA */}
      <div
        className={`text-[#00d4c8] text-[10px] font-bold tracking-[0.07em] uppercase transition-opacity duration-150 ${
          hov ? "opacity-100" : "opacity-0"
        }`}
      >
        {cta} →
      </div>
    </button>
  );
}
