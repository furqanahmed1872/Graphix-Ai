// components/Sidebar.tsx
"use client";
import { useAppStore } from "@/store/appStore";

import { useState, useEffect } from "react";

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

// Save collapsed state whenever it changes


export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onClose,
  onDelete,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("graphix_sidebar_collapsed");
    return saved ? JSON.parse(saved) : true; // default to collapsed
  });


  
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "graphix_sidebar_collapsed",
        JSON.stringify(collapsed),
      );
    }
  }, [collapsed]);

  const user = useAppStore((s) => s.user);
  const workspaceLabel = user ? `${user.firstName}'s Workspace` : "Workspace";



const handleDelete = (id: string) => {
  onDelete(id); // Just notify parent to show toast
};

  return (
    <>
      {/* ── Only the truly irreplaceable styles ── */}

      <aside
        className={`
          sb-aside
          relative flex flex-col flex-shrink-0 h-dvh z-10
          max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:shadow-2xl
          transition-[width,min-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? "collapsed w-[60px] min-w-[60px]" : "w-[248px] min-w-[248px]"}
        `}
        style={{
          background: "#09090b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Noise */}
        <div className="sb-noise absolute inset-0 pointer-events-none z-0" />

        {/* Subtle cyan gradient line */}
        <div
          className="absolute top-0 right-0 bottom-0 w-px pointer-events-none z-0"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(6,182,212,0.12) 40%, rgba(6,182,212,0.06) 70%, transparent)",
          }}
        />

        {/* Collapse toggle button */}
        <button
          className={`
            sb-toggle
            absolute top-1/2 -right-[11px] -translate-y-1/2
            w-[22px] h-[22px] rounded-full
            bg-[#18181b] border border-white/10
            flex items-center justify-center cursor-pointer z-20
            transition-colors duration-150
            hover:bg-[#06b6d4] hover:border-[#06b6d4] hover:text-black
            hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]
            text-white/35
          `}
          onClick={() => {
            const newState = !collapsed;
            setCollapsed(newState);
            localStorage.setItem(
              "graphix_sidebar_collapsed",
              JSON.stringify(newState),
            );
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header */}
          <div
            className="flex-shrink-0 px-3 pb-3 border-b border-white/[0.05]"
            style={{ paddingTop: "max(1.1rem, env(safe-area-inset-top))" }}
          >
            <div className="flex items-center justify-between">
              {/* Logo + title */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden"
                  style={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #0e0e10, #18181b)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    boxShadow:
                      "0 0 16px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <img
                    src="/logo.png"
                    alt=""
                    className="h-5 brightness-0 invert"
                  />
                </div>

                <div className="sb-label min-w-0">
                  <p
                    className="text-[15px] font-extrabold leading-none mb-[3px] text-white"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Graphix AI
                  </p>
                  <span
                    className="text-[9px] uppercase tracking-[0.1em] text-white/22 block"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    v2.0 · Studio
                  </span>
                </div>
              </div>

              {/* Close btn (mobile) */}
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className={`
                  sb-label flex-shrink-0 flex items-center justify-center
                  rounded-lg w-[30px] h-[30px]
                  bg-white/[0.03] border border-white/[0.06]
                  text-white/25 transition-all duration-150
                  hover:bg-white/[0.07] hover:text-white/70
                `}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            className="flex-1 sb-scroll overflow-y-auto overflow-x-hidden flex flex-col gap-px"
            style={{ padding: collapsed ? "12px 8px" : "12px 8px" }}
          >
            {/* New conversation button */}
            <div className="relative sb-tip-trigger mb-2.5">
              <button
                onClick={onNew}
                className={`
                  new-btn w-full flex items-center rounded-lg
                  transition-all duration-150 touch-manipulation
                  min-h-[38px]
                  ${collapsed ? "justify-center gap-0 px-0" : "justify-start gap-[9px] px-[10px]"}
                `}
                style={{
                  background: "rgba(6,182,212,0.06)",
                  border: "1px solid rgba(6,182,212,0.18)",
                  color: "#22d3ee",
                }}
              >
                <span className="flex items-center justify-center flex-shrink-0 w-5 h-5">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>

                <span
                  className="sb-label text-[11px] font-semibold tracking-[0.02em]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  New conversation
                </span>

                {!collapsed && (
                  <svg
                    className="sb-label ml-auto flex-shrink-0"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "rgba(34,211,238,0.4)" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {collapsed && <span className="sb-tip">New conversation</span>}
            </div>

            {/* Divider */}
            {!collapsed ? (
              <div className="flex items-center gap-2 px-1 pt-0.5 pb-2">
                <span className="flex-1 h-px bg-white/[0.05]" />
                <span
                  className="text-[9px] uppercase tracking-[0.12em] text-white/[0.18]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Recent
                </span>
                <span className="flex-1 h-px bg-white/[0.05]" />
              </div>
            ) : (
              <div className="h-px mx-1 my-1 bg-white/[0.05]" />
            )}

            {/* Empty state */}
            {conversations.map((conv, i) => {
              const isActive = conv.id === activeId;
              const initials = conv.title
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={conv.id}
                  className="relative sb-tip-trigger group" // Changed conv-in to group
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <button
                    onClick={() => onSelect(conv.id)}
                    className={`
          w-full text-left flex items-center rounded-lg
          transition-all duration-100 touch-manipulation
          min-h-[38px]
          ${collapsed ? "justify-center gap-0 px-0" : "justify-start gap-[9px] px-[10px]"}
        `}
                    style={{
                      background: isActive
                        ? "rgba(6,182,212,0.07)"
                        : "transparent",
                      border: `1px solid ${isActive ? "rgba(6,182,212,0.18)" : "transparent"}`,
                      boxShadow: isActive
                        ? "0 0 16px rgba(6,182,212,0.06)"
                        : "none",
                    }}
                  >
                    {isActive && (
                      <div
                        className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-[2px]"
                        style={{
                          background: "#06b6d4",
                          boxShadow: "0 0 8px rgba(6,182,212,0.6)",
                        }}
                      />
                    )}

                    {collapsed ? (
                      <span
                        className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center flex-shrink-0 text-[9px] font-bold tracking-[0.03em]"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          background: isActive
                            ? "rgba(6,182,212,0.15)"
                            : "rgba(255,255,255,0.05)",
                          border: `1px solid ${isActive ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.06)"}`,
                          color: isActive ? "#22d3ee" : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {initials || String(i + 1).padStart(2, "0")}
                      </span>
                    ) : (
                      <>
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${isActive ? "dot-glow" : ""}`}
                          style={{
                            background: isActive
                              ? "#06b6d4"
                              : "rgba(255,255,255,0.15)",
                          }}
                        />
                        <span
                          className="flex-1 truncate text-xs transition-colors"
                          style={{
                            fontWeight: isActive ? 500 : 400,
                            color: isActive
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(255,255,255,0.38)",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {conv.title}
                        </span>
                        <span
                          className="text-[9px] text-white/[0.12] flex-shrink-0"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Delete Button - Hover only */}
                  {!collapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(conv.id);
                      }}
                      className="delete-btn absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                      title="Delete conversation"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 2 2" />
                      </svg>
                    </button>
                  )}

                  {collapsed && <span className="sb-tip">{conv.title}</span>}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="flex-shrink-0 border-t border-white/[0.05]"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div
              className={`
                flex items-center
                ${collapsed ? "justify-center gap-0 py-[10px] px-0" : "justify-start gap-[10px] py-[10px] px-[10px]"}
              `}
            >
              <div className="relative sb-tip-trigger">
                <div className="flex items-center justify-center flex-shrink-0 rounded-lg w-[30px] h-[30px] bg-white/[0.04] border border-white/[0.07]">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                {collapsed && <span className="sb-tip">Free plan</span>}
              </div>

              <div className="sb-label min-w-0">
                <span className="block text-[11px] font-semibold text-white/60 leading-none mb-[3px] tracking-[-0.01em]">
                  {workspaceLabel}
                </span>
                <span
                  className="block text-[9px] uppercase tracking-[0.1em] text-white/20"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Free plan
                </span>
              </div>

              {!collapsed && (
                <div className="ml-auto flex-shrink-0 sb-label w-[7px] h-[7px] rounded-full bg-[#06b6d4] shadow-[0_0_0_3px_rgba(6,182,212,0.15),0_0_8px_rgba(6,182,212,0.4)]" />
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
