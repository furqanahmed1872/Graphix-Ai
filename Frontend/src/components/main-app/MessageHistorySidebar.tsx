"use client";
import { useState } from "react";

interface Message {
  id: string;
  from: "user" | "ai";
  content: any;
  status?: string;
}

function ChartTypeIcon({ type }: { type: string }) {
  const t = (type || "").toLowerCase();
  if (t === "bar") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
    </svg>
  );
  if (t === "line" || t === "scatter") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 17 9 11 13 15 21 7"/>
    </svg>
  );
  if (t === "pie" || t === "donut") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  );
  if (t.includes("3d") || t === "surface" || t === "scatter3d") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  );
  // default
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}

function detectTypeName(content: any): string {
  const traces = content?.data || [];
  if (!traces.length) return "chart";
  const t = traces[0];
  const type = (t.type || "").toLowerCase();
  const mode = (t.mode || "").toLowerCase();
  if (type === "pie") return t.hole ? "donut" : "pie";
  if (type === "scatter" && mode.includes("lines") && t.fill) return "area";
  if (type === "scatter" && mode.includes("lines")) return "line";
  if (type === "scatter" && mode.includes("markers")) return "scatter";
  return type || "chart";
}

export default function MessageHistorySidebar({
  messages,
  selectedAiId,
  onSelectAiId,
}: {
  messages: Message[];
  selectedAiId: string | null;
  onSelectAiId: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Only AI messages that have chart data (not errors, not loading)
  const chartMsgs = messages.filter(
    m => m.from === "ai" && m.status === "success" && m.content?.data
  );

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-dvh transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        width: collapsed ? 44 : 220,
        background: "#09090b",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-2 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", height: 48 }}
      >
        {!collapsed && (
          <span
            className="text-[9px] uppercase tracking-widest font-semibold px-1 flex-1"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "DM Mono, monospace" }}
          >
            Charts
          </span>
        )}
        {!collapsed && chartMsgs.length > 0 && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full mr-1 font-bold"
            style={{
              background: "rgba(6,182,212,0.12)",
              color: "rgba(6,182,212,0.7)",
              fontFamily: "DM Mono, monospace",
            }}
          >
            {chartMsgs.length}
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-7 h-7 flex items-center justify-center rounded-lg ml-auto transition-colors"
          style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <svg
            width="9" height="9" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Chart list */}
      <div
        className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1.5"
        style={{ scrollbarWidth: "none" }}
      >
        {collapsed ? (
          // Collapsed — dots
          <div className="flex flex-col items-center gap-2 pt-2">
            {chartMsgs.map((m) => {
              const isSelected = m.id === selectedAiId;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectAiId(m.id)}
                  style={{
                    width: isSelected ? 8 : 6,
                    height: isSelected ? 8 : 6,
                    borderRadius: "50%",
                    background: isSelected ? "#06b6d4" : "rgba(255,255,255,0.18)",
                    boxShadow: isSelected ? "0 0 6px rgba(6,182,212,0.5)" : "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
        ) : (
          chartMsgs.map((m, i) => {
            const isSelected = m.id === selectedAiId;
            const title =
              m.content?.layout?.title?.text ||
              (typeof m.content?.layout?.title === "string" ? m.content.layout.title : null) ||
              `Chart ${i + 1}`;
            const typeName = detectTypeName(m.content);

            return (
              <button
                key={m.id}
                onClick={() => onSelectAiId(m.id)}
                className="w-full text-left px-2.5 py-2 rounded-lg transition-all"
                style={{
                  background: isSelected ? "rgba(6,182,212,0.09)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isSelected ? "rgba(6,182,212,0.25)" : "rgba(255,255,255,0.05)"}`,
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: isSelected ? "#06b6d4" : "rgba(255,255,255,0.25)" }}>
                    <ChartTypeIcon type={typeName} />
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-wider font-semibold"
                    style={{
                      color: isSelected ? "rgba(6,182,212,0.7)" : "rgba(255,255,255,0.2)",
                      fontFamily: "DM Mono, monospace",
                    }}
                  >
                    #{i + 1} · {typeName}
                  </span>
                  {isSelected && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "#06b6d4", boxShadow: "0 0 4px rgba(6,182,212,0.6)" }}
                    />
                  )}
                </div>
                <p
                  className="text-[11px] leading-snug"
                  style={{
                    color: isSelected ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {title}
                </p>
              </button>
            );
          })
        )}

        {!collapsed && chartMsgs.length === 0 && (
          <p
            className="text-center pt-6 text-[10px]"
            style={{ color: "rgba(255,255,255,0.15)", fontFamily: "DM Mono, monospace" }}
          >
            No charts yet
          </p>
        )}
      </div>

      {/* Footer */}
      {!collapsed && chartMsgs.length > 0 && (
        <div
          className="px-3 py-2 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontFamily: "DM Mono, monospace" }}>
            {chartMsgs.length} chart{chartMsgs.length !== 1 ? "s" : ""} · click to view
          </span>
        </div>
      )}
    </aside>
  );
}
