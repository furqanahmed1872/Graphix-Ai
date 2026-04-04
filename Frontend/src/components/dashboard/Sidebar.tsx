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

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "…";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const w = open ? (collapsed ? 52 : 215) : 0;

  // ── Real badge counts ─────────────────────────────────────────
  const totalGraphs = savedCharts.length;
  const favouritesCount = savedCharts.filter((c) => c.starred).length;
  // shared = has a shareToken (set by the API) or shared flag
  const sharedCount = savedCharts.filter(
    (c) => c.shared || !!c.shareToken,
  ).length;

  function getBadge(id: string): string | null {
    if (id === "graphs") return totalGraphs > 0 ? String(totalGraphs) : null;
    if (id === "favourites")
      return favouritesCount > 0 ? String(favouritesCount) : null;
    if (id === "shared") return sharedCount > 0 ? String(sharedCount) : null;
    return null;
  }

  return (
    <aside
      className="flex-shrink-0 flex flex-col bg-[#111212] border-r border-white/[0.08] overflow-hidden transition-all duration-[270ms] ease-in-out"
      style={{ width: w, minWidth: w }}
    >
      <div
        className="flex flex-col h-full"
        style={{ width: collapsed ? 52 : 215 }}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b border-white/[0.08] min-h-[52px] px-3 py-[15px] ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && (
            <span className="text-white font-extrabold text-[15px] tracking-tight">
              Graphix
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex flex-col gap-[3.5px] p-1 text-white/35 cursor-pointer bg-transparent border-none"
          >
            <span className="w-[13px] h-[1.5px] bg-current block" />
            <span className="w-[13px] h-[1.5px] bg-current block" />
            <span className="w-[9px] h-[1.5px] bg-current block" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-[6px] py-[5px] overflow-y-auto">
          {NAV_DATA.map((grp: any) => (
            <div key={grp.group} className="mb-0.5">
              {!collapsed && (
                <div className="text-white/20 text-[9px] font-bold tracking-[0.14em] uppercase px-2 pt-[10px] pb-[5px]">
                  {grp.group}
                </div>
              )}
              {grp.items.map((item: { id: string; label: string }) => {
                const active = tab === item.id;
                const badge = getBadge(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-[5px] text-left cursor-pointer border transition-colors duration-150
                      ${collapsed ? "justify-center px-0 py-[9px]" : "gap-[9px] px-[9px] py-[7px]"}
                      ${
                        active
                          ? "bg-white/[0.07] border-white/[0.1] text-white"
                          : "border-transparent text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                      }`}
                  >
                    <NavIcon id={item.id} active={active} />
                    {!collapsed && (
                      <>
                        <span
                          className={`flex-1 text-[12.5px] font-medium truncate ${active ? "text-white" : ""}`}
                        >
                          {item.label}
                        </span>
                        {badge && (
                          <span
                            className="text-[9px] font-bold px-[5px] py-[1px] rounded-[4px] leading-[1.4]"
                            style={{
                              background: active
                                ? "rgba(6,182,212,0.18)"
                                : "rgba(255,255,255,0.08)",
                              color: active
                                ? "#06b6d4"
                                : "rgba(255,255,255,0.35)",
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
            </div>
          ))}
        </nav>

        {/* User footer */}
        {!collapsed && (
          <div className="border-t border-white/[0.08] px-3 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-[28px] h-[28px] rounded-[5px] flex items-center justify-center text-[10px] font-extrabold flex-shrink-0"
                style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-semibold truncate m-0">
                  {fullName}
                </p>
                <p className="text-white/30 text-[9px] uppercase tracking-wide m-0">
                  {subscription?.plan ?? "free"} plan
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left text-[11px] text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer px-0 py-0.5"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Nav icon map ──────────────────────────────────────────────
function NavIcon({ id, active }: { id: string; active: boolean }) {
  const color = active ? "#06b6d4" : "rgba(255,255,255,0.35)";
  const icons: Record<string, string> = {
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
  const d = icons[id] || "M4 6h16M4 12h16M4 18h16";
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}
