"use client";

import { NAV as NAV_DATA } from "@/lib/Data";
import { IC } from "@/lib/Tokens";
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
  const logout = useAppStore((s) => s.logout);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "…";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const w = open ? (collapsed ? 52 : 215) : 0;

  return (
    <aside
      className="flex-shrink-0 flex flex-col bg-[#111212] border-r border-white/[0.08] overflow-hidden transition-all duration-[270ms] ease-in-out"
      style={{ width: w, minWidth: w }}
    >
      <div
        className="flex flex-col h-full"
        style={{ width: collapsed ? 52 : 215 }}
      >
        {/* ── Logo ── */}
        <div
          className={`flex items-center border-b border-white/[0.08] min-h-[52px] px-3 py-[15px] ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <span className="text-white font-extrabold text-[15px] tracking-tight">
              Graphix
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex flex-col gap-[3.5px] p-1 text-white/35 cursor-pointer bg-transparent border-none"
            aria-label="Toggle sidebar"
          >
            <span className="w-[13px] h-[1.5px] bg-current block" />
            <span className="w-[13px] h-[1.5px] bg-current block" />
            <span className="w-[9px] h-[1.5px] bg-current block" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-[6px] py-[5px] overflow-y-auto">
          {NAV_DATA.map((grp: any) => (
            <div key={grp.group} className="mb-0.5">
              {!collapsed && (
                <div className="text-white/20 text-[9px] font-bold tracking-[0.14em] uppercase px-2 pt-[10px] pb-[5px]">
                  {grp.group}
                </div>
              )}
              {grp.items.map(
                (item: { id: string; label: string; badge?: string }) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center rounded-[5px] text-left cursor-pointer border transition-colors duration-150
                      ${collapsed ? "justify-center p-[7px]" : "gap-[9px] px-[8px] py-[7px]"}
                      ${
                        active
                          ? "bg-[rgba(0,212,200,0.18)] border-[rgba(0,212,200,0.35)] text-[#00d4c8]"
                          : "bg-transparent border-transparent text-white/55 hover:text-white/80 hover:bg-white/[0.04]"
                      }`}
                    >
                      <svg
                        width={13}
                        height={13}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0"
                      >
                        <path
                          d={
                            (IC as Record<string, string>)[item.id] ??
                            IC.dashboard
                          }
                        />
                      </svg>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-[12.5px] font-medium">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-[5px] py-[1px] rounded-[3px] ${
                                active
                                  ? "bg-[rgba(0,212,200,0.2)] text-[#00d4c8]"
                                  : "bg-white/[0.08] text-white/35"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        {!collapsed && (
          <div className="border-t border-white/[0.08] px-3 py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-[5px] bg-[rgba(0,212,200,0.18)] border border-[rgba(0,212,200,0.35)] flex items-center justify-center text-[10px] font-extrabold text-[#00d4c8] flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-bold truncate">
                  {fullName}
                </p>
                <p className="text-white/35 text-[10px] capitalize truncate">
                  {subscription?.plan ?? "—"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left text-white/35 text-[11px] hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer px-0 py-1"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
