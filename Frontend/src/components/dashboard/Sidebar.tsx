"use client";

import { NAV as NAV_DATA } from "@/lib/Data";
import { useAppStore } from "@/store/appStore";

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  tab: string;
  onTab: (tab: string) => void;
}

// ── SVG icon paths (same set as /app sidebar) ─────────────────
const ICONS: Record<string, string> = {
  dashboard:
    "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  graphs:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  shared:
    "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
  favourites:
    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  templates:
    "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  billing:
    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  help: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

function NavIcon({ id, active }: { id: string; active: boolean }) {
  const d = ICONS[id] || "M4 6h16M4 12h16M4 18h16";
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#06b6d4" : "rgba(255,255,255,0.3)"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, transition: "stroke 0.15s" }}
    >
      <path d={d} />
    </svg>
  );
}

export default function Sidebar({
  open,
  collapsed,
  setCollapsed,
  tab,
  onTab,
}: SidebarProps) {
  const user = useAppStore((s) => s.user);
  const subscription = useAppStore((s) => s.subscription);
  const savedCharts = useAppStore((s) => s.savedCharts);
  const logout = useAppStore((s) => s.logout);

const initials = user
  ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim() || "…"
  : "…";
const fullName = user
  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
  : "";
  const planLabel = subscription?.plan ?? "free";

  const totalGraphs = savedCharts.length;
  const favouritesCount = savedCharts.filter((c) => c.starred).length;
  const sharedCount = savedCharts.filter(
    (c) => c.shared || !!c.shareToken,
  ).length;

  function getBadge(id: string): string | null {
    if (id === "graphs" && totalGraphs > 0) return String(totalGraphs);
    if (id === "favourites" && favouritesCount > 0)
      return String(favouritesCount);
    if (id === "shared" && sharedCount > 0) return String(sharedCount);
    return null;
  }

  const w = open ? (collapsed ? 56 : 220) : 0;

  return (
    <>
      {/* Keyframe for active glow dot */}
      <style>{`
        @keyframes sb-glow {
          0%, 100% { box-shadow: 0 0 4px rgba(6,182,212,0.4); }
          50%       { box-shadow: 0 0 10px rgba(6,182,212,0.8); }
        }
        .sb-active-dot { animation: sb-glow 2.4s ease-in-out infinite; }
        .sb-nav-btn { background: transparent; border: none; cursor: pointer; width: 100%; text-align: left; }
        .sb-nav-btn:focus-visible { outline: 2px solid rgba(6,182,212,0.5); outline-offset: 2px; border-radius: 8px; }
      `}</style>

      <aside
        style={{
          flexShrink: 0,
          width: w,
          minWidth: w,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a10",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
          transition:
            "width 0.27s cubic-bezier(0.4,0,0.2,1), min-width 0.27s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
        }}
      >
        {/* Subtle radial glow top */}
        <div
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 140,
            background:
              "radial-gradient(ellipse at center, rgba(6,182,212,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Inner column — fixed width so content doesn't reflow during transition */}
        <div
          style={{
            width: collapsed ? 56 : 220,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* ── Logo header ─────────────────────────── */}
          <div
            style={{
              minHeight: 52,
              display: "flex",
              alignItems: "center",
              padding: collapsed ? "0 10px" : "0 14px",
              justifyContent: collapsed ? "center" : "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}
          >
            {/* Logo + wordmark — hidden when collapsed */}
            {!collapsed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                {/* Icon box — same as /app sidebar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "linear-gradient(135deg, #0e0e10, #18181b)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    boxShadow:
                      "0 0 14px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="/logo.png"
                    alt=""
                    style={{ height: 16, filter: "brightness(0) invert(1)" }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
                    }}
                  >
                    Graphix
                  </p>
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.2)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "'DM Mono', monospace",
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    v2.0 · Dashboard
                  </span>
                </div>
              </div>
            )}

            {/* Collapsed: just show mini icon */}
            {collapsed && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "linear-gradient(135deg, #0e0e10, #18181b)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  boxShadow: "0 0 14px rgba(6,182,212,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/logo.png"
                  alt=""
                  style={{ height: 14, filter: "brightness(0) invert(1)" }}
                />
              </div>
            )}

            {/* Collapse toggle — only shown when expanded */}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 5px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3.5,
                  color: "rgba(255,255,255,0.25)",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 13,
                    height: 1.5,
                    background: "currentColor",
                    display: "block",
                    borderRadius: 1,
                  }}
                />
                <span
                  style={{
                    width: 13,
                    height: 1.5,
                    background: "currentColor",
                    display: "block",
                    borderRadius: 1,
                  }}
                />
                <span
                  style={{
                    width: 9,
                    height: 1.5,
                    background: "currentColor",
                    display: "block",
                    borderRadius: 1,
                  }}
                />
              </button>
            )}
          </div>

          {/* Collapsed expand button */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{
                margin: "10px auto 4px",
                width: 34,
                height: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 7,
                cursor: "pointer",
                color: "rgba(255,255,255,0.25)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 1.5,
                  background: "currentColor",
                  display: "block",
                  borderRadius: 1,
                }}
              />
              <span
                style={{
                  width: 12,
                  height: 1.5,
                  background: "currentColor",
                  display: "block",
                  borderRadius: 1,
                }}
              />
              <span
                style={{
                  width: 8,
                  height: 1.5,
                  background: "currentColor",
                  display: "block",
                  borderRadius: 1,
                }}
              />
            </button>
          )}

          {/* ── Nav ─────────────────────────────────── */}
          <nav
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: collapsed ? "8px 6px" : "8px 8px",
            }}
          >
            {NAV_DATA.map((grp: any) => (
              <div key={grp.group} style={{ marginBottom: 2 }}>
                {/* Group label — hidden when collapsed */}
                {!collapsed && (
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.18)",
                      padding: "10px 8px 5px",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {grp.group}
                  </div>
                )}

                {grp.items.map((item: { id: string; label: string }) => {
                  const active = tab === item.id;
                  const badge = getBadge(item.id);

                  return (
                    <button
                      key={item.id}
                      className="sb-nav-btn"
                      onClick={() => onTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: collapsed ? 0 : 9,
                        justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? "9px 0" : "7px 9px",
                        borderRadius: 8,
                        marginBottom: 1,
                        transition: "background 0.15s, border-color 0.15s",
                        border: active
                          ? "1px solid rgba(6,182,212,0.2)"
                          : "1px solid transparent",
                        background: active
                          ? "rgba(6,182,212,0.08)"
                          : "transparent",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background =
                            "rgba(255,255,255,0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                        }
                      }}
                    >
                      {/* Active left accent bar */}
                      {active && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "25%",
                            height: "50%",
                            width: 2,
                            borderRadius: 2,
                            background: "#06b6d4",
                            boxShadow: "0 0 6px rgba(6,182,212,0.6)",
                          }}
                        />
                      )}

                      <NavIcon id={item.id} active={active} />

                      {!collapsed && (
                        <>
                          <span
                            style={{
                              flex: 1,
                              fontSize: 12.5,
                              fontWeight: active ? 600 : 400,
                              color: active ? "#fff" : "rgba(255,255,255,0.45)",
                              letterSpacing: active ? "-0.01em" : "normal",
                              transition: "color 0.15s",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.label}
                          </span>

                          {badge && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 4,
                                lineHeight: 1.4,
                                fontFamily: "'DM Mono', monospace",
                                background: active
                                  ? "rgba(6,182,212,0.2)"
                                  : "rgba(255,255,255,0.07)",
                                color: active
                                  ? "#06b6d4"
                                  : "rgba(255,255,255,0.3)",
                                border: active
                                  ? "1px solid rgba(6,182,212,0.25)"
                                  : "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}

                {/* Subtle divider between groups */}
                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.04)",
                    margin: collapsed ? "6px 10px" : "6px 8px",
                  }}
                />
              </div>
            ))}
          </nav>

          {/* ── User footer ──────────────────────────── */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              padding: collapsed ? "12px 0" : "12px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flexShrink: 0,
              alignItems: collapsed ? "center" : "stretch",
            }}
          >
            {collapsed ? (
              /* Collapsed: avatar only */
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(6,182,212,0.15)",
                  border: "1px solid rgba(6,182,212,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#06b6d4",
                  cursor: "default",
                  userSelect: "none",
                }}
                title={fullName}
              >
                {initials}
              </div>
            ) : (
              <>
                {/* User row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    minWidth: 0,
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "rgba(6,182,212,0.15)",
                      border: "1px solid rgba(6,182,212,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#06b6d4",
                      flexShrink: 0,
                      userSelect: "none",
                    }}
                  >
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#fff",
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fullName}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 9,
                        color: "rgba(255,255,255,0.28)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {planLabel} plan
                    </p>
                  </div>
                </div>

                {/* Sign out */}
                <button
                  onClick={logout}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.22)",
                    textAlign: "left",
                    padding: 0,
                    transition: "color 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.55)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.22)")
                  }
                >
                  Sign out →
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
