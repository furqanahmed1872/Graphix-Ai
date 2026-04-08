"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { PAGE_TITLES } from "@/lib/Data";
import {
  Btn,
  FieldInput,
  FieldLabel,
  ActionCard,
} from "@/components/dashboard/UIKit";
import GraphCard from "@/components/dashboard/GraphCard";
import Sidebar from "@/components/dashboard/Sidebar";
import { div } from "three/tsl";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CYAN = "#06b6d4";

// ─────────────────────────────────────────────────────────────
// MICRO UTILITIES
// ─────────────────────────────────────────────────────────────
function Skeleton({
  w = "100%",
  h = 40,
  r = 10,
}: {
  w?: string | number;
  h?: number;
  r?: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "rgba(255,255,255,0.04)",
        animation: "skPulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

function detectChartType(data: any[]): string {
  if (!Array.isArray(data) || !data.length) return "other";
  const t = (data[0]?.type ?? "").toLowerCase();
  if (t === "bar" || t === "histogram") return "bar";
  if (t === "scatter" || t === "scattergl") return "line";
  if (t === "pie" || t === "funnel" || t === "funnelarea") return "pie";
  if (t.includes("3d") || t === "surface" || t === "mesh3d") return "3d";
  return "other";
}

// ── Filter chip ────────────────────────────────────────────────
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 20,
        cursor: "pointer",
        border: active
          ? `1px solid ${CYAN}66`
          : "1px solid rgba(255,255,255,0.08)",
        background: active ? `rgba(6,182,212,0.12)` : "rgba(255,255,255,0.03)",
        color: active ? CYAN : "rgba(255,255,255,0.35)",
        transition: "all 0.15s",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT CARD  — glassmorphism with gradient glow
// ─────────────────────────────────────────────────────────────
const STAT_ACCENTS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];
const STAT_ICONS = [
  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
  "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
];

function StatCard({ stat, index }: { stat: any; index: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const accent = STAT_ACCENTS[index % STAT_ACCENTS.length];
  const icon = STAT_ICONS[index % STAT_ICONS.length];

  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 80 + 100);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(16px) scale(0.97)",
        transition: "opacity 0.45s, transform 0.45s",
        position: "relative",
        borderRadius: 14,
        padding: "20px 22px",
        background: hov ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hov ? accent + "44" : "rgba(255,255,255,0.07)"}`,
        overflow: "hidden",
        cursor: "default",
        boxShadow: hov
          ? `0 0 0 1px ${accent}22, 0 8px 24px rgba(0,0,0,0.4)`
          : "0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle,${accent}18 0%,transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Top accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg,${accent},${accent}44,transparent)`,
          opacity: hov ? 1 : 0.5,
          transition: "opacity 0.2s",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {stat.label}
        </p>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}18`,
            border: `1px solid ${accent}33`,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={icon} />
          </svg>
        </div>
      </div>

      <p
        style={{
          margin: "0 0 5px",
          fontSize: 30,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {stat.value}
      </p>
      {stat.delta && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            color: stat.up !== false ? "#10b981" : "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {stat.up !== false && <span>↑</span>}
          {stat.delta}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GRAPH GRID
// ─────────────────────────────────────────────────────────────
function GraphGrid({
  charts,
  heading,
  emptyMsg,
}: {
  charts: any[];
  heading: string;
  emptyMsg: string;
}) {
  const FILTERS = ["All", "Bar", "Line", "Pie", "3D", "Other"];
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All"
      ? charts
      : charts.filter(
          (c) =>
            detectChartType(c.chartConfig?.data ?? []) === filter.toLowerCase(),
        );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 2px",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {filtered.length} chart{filtered.length !== 1 ? "s" : ""}
            {filter !== "All" ? ` · ${filter}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              label={f}
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "80px 0", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <p
            style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", margin: 0 }}
          >
            {emptyMsg}
          </p>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}
        >
          {filtered.map((c, i) => (
            <GraphCard key={c.id} graph={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD HOME
// ─────────────────────────────────────────────────────────────
function DashboardHome({ setTab }: { setTab: (t: string) => void }) {
  const router = useRouter();
  const [vis, setVis] = useState(false);
  const {
    user,
    savedCharts,
    dashboardStats,
    activityFeed,
    isBootstrapping,
    isBootstrapped,
  } = useAppStore();
  const isLoading = isBootstrapping || !isBootstrapped;
  const firstName = user?.firstName ?? "…";

  const totalCharts = savedCharts.length;
  const totalViews = savedCharts.reduce((s, c) => s + (c.views ?? 0), 0);
  const sharedCount = savedCharts.filter(
    (c) => c.shared || !!c.shareToken,
  ).length;
  const starredCount = savedCharts.filter((c) => c.starred).length;

  const stats = dashboardStats?.length
    ? dashboardStats
    : [
        {
          label: "Total Graphs",
          value: String(totalCharts),
          delta:
            starredCount > 0 ? `${starredCount} starred` : "Create your first",
          up: true,
        },
        {
          label: "Total Views",
          value:
            totalViews >= 1000
              ? `${(totalViews / 1000).toFixed(1)}k`
              : String(totalViews),
          delta: "Across all charts",
          up: true,
        },
        {
          label: "Shared Links",
          value: String(sharedCount),
          delta: sharedCount ? `${sharedCount} active` : "None shared yet",
          up: sharedCount > 0,
        },
        {
          label: "Favourites",
          value: String(starredCount),
          delta: starredCount ? "Click ★ to add more" : "Star any chart",
          up: starredCount > 0,
        },
      ];

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 60);
    return () => clearTimeout(t);
  }, []);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(12px)",
        transition: "opacity 0.5s, transform 0.5s",
      }}
    >
      {/* ── Hero welcome banner ─────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          padding: "32px 36px",
          background:
            "linear-gradient(135deg,rgba(6,182,212,0.08) 0%,rgba(139,92,246,0.05) 50%,transparent 100%)",
          border: "1px solid rgba(6,182,212,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Decorative grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: CYAN,
                marginBottom: 8,
                fontFamily: "'DM Mono',monospace",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: CYAN,
                  boxShadow: `0 0 8px ${CYAN}`,
                }}
              />
              {greeting}
            </div>
            {isLoading ? (
              <Skeleton w={240} h={38} r={8} />
            ) : (
              <h1
                style={{
                  margin: "0 0 8px",
                  fontWeight: 900,
                  fontSize: "clamp(1.6rem,3vw,2.2rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  color: "#fff",
                }}
              >
                <span style={{ color: CYAN }}>{firstName}'s</span> workspace
              </h1>
            )}
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                maxWidth: 420,
              }}
            >
              {isLoading
                ? "Loading your workspace…"
                : totalCharts === 0
                  ? "Create your first chart to get started — describe any data in plain English."
                  : `${totalCharts} chart${totalCharts !== 1 ? "s" : ""} · ${totalViews.toLocaleString()} total views · ${sharedCount} shared`}
            </p>
          </div>
          <button
            onClick={() => router.push("/app")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              borderRadius: 10,
              background: `linear-gradient(135deg,${CYAN},#0891b2)`,
              border: "none",
              color: "#000",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "-0.01em",
              cursor: "pointer",
              boxShadow: `0 4px 20px rgba(6,182,212,0.3)`,
              flexShrink: 0,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 6px 24px rgba(6,182,212,0.4)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "none";
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 4px 20px rgba(6,182,212,0.3)`;
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chart
          </button>
        </div>
      </div>

      {/* ── Stats bento grid ─────────────────────────────────── */}
      <div>
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          Overview
        </h3>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} h={110} r={14} />
              ))
            : stats.map((s: any, i: number) => (
                <StatCard key={s.label} stat={s} index={i} />
              ))}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <div>
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          Quick Actions
        </h3>
        <div
          className="grid gap-3"
          
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))" }}
        >
          <ActionCard
            icon="M12 5v14M5 12h14"
            label="New Graph"
            sub="AI-powered chart"
            cta="Create"
            onClick={() => router.push("/app")}
            primary
          />
          <ActionCard
            icon="M9 17H5a2 2 0 00-2 2"
            label="Google Sheets"
            sub="Connect live data"
            cta="Connect"
            onClick={() => {}}
          />
          <ActionCard
            icon="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
            label="Upload File"
            sub="CSV · XLS · XLSX"
            cta="Upload"
            onClick={() => {}}
          />
          <ActionCard
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
            label="Paste Data"
            sub="JSON · tabular text"
            cta="Paste"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* ── Main bento: Recent + Activity ────────────────────── */}
      <div
        className="grid gird-cols-1 md:grid-cols-2 gap-32"
      
      >
        {/* Recent Graphs */}
        <div
          className=""
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: CYAN,
                  boxShadow: `0 0 6px ${CYAN}`,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                Recent Graphs
              </span>
            </div>
            <button
              onClick={() => setTab("graphs")}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 11,
                fontWeight: 600,
                color: CYAN,
                cursor: "pointer",
                opacity: 0.8,
              }}
            >
              View all →
            </button>
          </div>

          {isLoading ? (
            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} h={44} r={8} />
              ))}
            </div>
          ) : savedCharts.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.2)",
                  margin: "0 0 14px",
                }}
              >
                No charts yet.
              </p>
              <Btn size="sm" onClick={() => router.push("/app")}>
                Create your first →
              </Btn>
            </div>
          ) : (
            savedCharts.slice(0, 6).map((c: any, i: number, arr: any[]) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 18px",
                  borderBottom:
                    i < arr.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  transition: "background 0.12s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.025)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                {/* Chart type dot */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={CYAN}
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 1px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 10,
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {c.updated ?? "recently"} ·{" "}
                    {(c.views ?? 0).toLocaleString()} views
                  </p>
                </div>
                {c.trend && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: c.up !== false ? "#10b981" : "#f87171",
                      fontFamily: "'DM Mono',monospace",
                      flexShrink: 0,
                    }}
                  >
                    {c.trend}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Activity Feed */}
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                  animation: "gcPulse 2s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                Activity
              </span>
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                padding: "3px 8px",
                borderRadius: 20,
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.25)",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              LIVE
            </span>
          </div>

          {isLoading ? (
            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} h={44} r={8} />
              ))}
            </div>
          ) : activityFeed.length === 0 ? (
            <div
              style={{
                padding: "40px 16px",
                textAlign: "center",
                fontSize: 13,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              No activity yet — create your first chart!
            </div>
          ) : (
            activityFeed.slice(0, 8).map((a: any, i: number, arr: any[]) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderBottom:
                    i < arr.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.025)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    flexShrink: 0,
                    background: a.own
                      ? "rgba(6,182,212,0.12)"
                      : "rgba(255,255,255,0.06)",
                    color: a.own ? CYAN : "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Mono',monospace",
                    border: `1px solid ${a.own ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {a.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 500,
                      }}
                    >
                      {a.action}
                    </span>{" "}
                    <span style={{ color: "#fff", fontWeight: 700 }}>
                      {a.graph}
                    </span>
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "'DM Mono',monospace",
                    flexShrink: 0,
                  }}
                >
                  {a.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Starred preview ───────────────────────────────────── */}
      {!isLoading && savedCharts.some((c) => c.starred) && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="#facc15"
                stroke="#facc15"
                strokeWidth={1.5}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h3
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Starred
              </h3>
            </div>
            <button
              onClick={() => setTab("favourites")}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 11,
                fontWeight: 600,
                color: CYAN,
                cursor: "pointer",
                opacity: 0.8,
              }}
            >
              See all →
            </button>
          </div>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
            }}
          >
            {savedCharts
              .filter((c) => c.starred)
              .slice(0, 4)
              .map((c, i) => (
                <GraphCard key={c.id} graph={c} index={i} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────
// function TemplateCard({
//   tpl,
//   index,
//   onUse,
// }: {
//   tpl: any;
//   index: number;
//   onUse: () => void;
// }) {
//   const [hov, setHov] = useState(false);
//   const accents = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];
//   const accent = accents[index % accents.length];
//   return (
//     // <div
//     //   onMouseEnter={() => setHov(true)}
//     //   onMouseLeave={() => setHov(false)}
//     //   onClick={onUse}
//     //   style={{
//     //     position: "relative",
//     //     background: hov ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
//     //     border: `1px solid ${hov ? accent + "44" : "rgba(255,255,255,0.07)"}`,
//     //     borderRadius: 14,
//     //     padding: "20px 22px",
//     //     cursor: "pointer",
//     //     transition: "all 0.2s",
//     //     overflow: "hidden",
//     //     opacity: 0,
//     //     animation: `tplIn 0.4s ease ${index * 0.07}s both`,
//     //     boxShadow: hov
//     //       ? `0 0 0 1px ${accent}22,0 8px 24px rgba(0,0,0,0.4)`
//     //       : "0 1px 3px rgba(0,0,0,0.3)",
//     //   }}
//     // >
//     //   {/* Top stripe */}
//     //   <div
//     //     style={{
//     //       position: "absolute",
//     //       top: 0,
//     //       left: 0,
//     //       right: 0,
//     //       height: 2,
//     //       background: hov
//     //         ? `linear-gradient(90deg,${accent},${accent}55,transparent)`
//     //         : "transparent",
//     //       transition: "background 0.2s",
//     //     }}
//     //   />
//     //   {/* Glow */}
//     //   <div
//     //     style={{
//     //       position: "absolute",
//     //       top: -40,
//     //       right: -20,
//     //       width: 120,
//     //       height: 120,
//     //       borderRadius: "50%",
//     //       background: `radial-gradient(circle,${accent}12 0%,transparent 70%)`,
//     //       pointerEvents: "none",
//     //       opacity: hov ? 1 : 0,
//     //       transition: "opacity 0.2s",
//     //     }}
//     //   />

//     //   <div style={{ position: "relative", zIndex: 1 }}>
//     //     <div
//     //       style={{
//     //         display: "flex",
//     //         alignItems: "center",
//     //         justifyContent: "space-between",
//     //         marginBottom: 12,
//     //       }}
//     //     >
//     //       <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//     //         <span
//     //           style={{
//     //             fontSize: 14,
//     //             fontWeight: 800,
//     //             color: "#fff",
//     //             letterSpacing: "-0.02em",
//     //           }}
//     //         >
//     //           {tpl.title}
//     //         </span>
//     //         {tpl.isTrending && (
//     //           <span
//     //             style={{
//     //               fontSize: 8,
//     //               fontWeight: 700,
//     //               padding: "2px 6px",
//     //               borderRadius: 20,
//     //               background: "rgba(245,158,11,0.15)",
//     //               color: "#f59e0b",
//     //               border: "1px solid rgba(245,158,11,0.3)",
//     //               fontFamily: "'DM Mono',monospace",
//     //               letterSpacing: "0.08em",
//     //             }}
//     //           >
//     //             HOT
//     //           </span>
//     //         )}
//     //       </div>
//     //       <span
//     //         style={{
//     //           fontSize: 10,
//     //           fontWeight: 700,
//     //           padding: "2px 8px",
//     //           borderRadius: 20,
//     //           background: `${accent}18`,
//     //           color: accent,
//     //           border: `1px solid ${accent}33`,
//     //           fontFamily: "'DM Mono',monospace",
//     //         }}
//     //       >
//     //         {tpl.tag ?? tpl.category}
//     //       </span>
//     //     </div>
//     //     <p
//     //       style={{
//     //         margin: "0 0 14px",
//     //         fontSize: 12,
//     //         color: "rgba(255,255,255,0.35)",
//     //         lineHeight: 1.6,
//     //       }}
//     //     >
//     //       {tpl.desc ?? tpl.description}
//     //     </p>
//     //     <div
//     //       style={{
//     //         display: "flex",
//     //         alignItems: "center",
//     //         justifyContent: "space-between",
//     //       }}
//     //     >
//     //       <span
//     //         style={{
//     //           fontSize: 10,
//     //           color: "rgba(255,255,255,0.2)",
//     //           fontFamily: "'DM Mono',monospace",
//     //         }}
//     //       >
//     //         {tpl.count} charts
//     //       </span>
//     //       {tpl.trend && (
//     //         <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>
//     //           {tpl.trend}
//     //         </span>
//     //       )}
//     //     </div>
//     //   </div>
//     // </div>
//     <div>
//       Coming soon: templates to jumpstart your charts
//     </div>
//   );
// }

function TemplatesPage({ setTab }: { setTab: (t: string) => void }) {
  // const { graphTemplates, isBootstrapping, isBootstrapped } = useAppStore();
  // const router = useRouter();
  // const isLoading = isBootstrapping || !isBootstrapped;
  return (
    // <div>
    //   <div style={{ marginBottom: 28 }}>
    //     <h2
    //       style={{
    //         margin: "0 0 6px",
    //         fontSize: 22,
    //         fontWeight: 800,
    //         color: "#fff",
    //         letterSpacing: "-0.03em",
    //       }}
    //     >
    //       Templates
    //     </h2>
    //     <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
    //       Start faster with pre-built chart collections
    //     </p>
    //   </div>
    //   {isLoading ? (
    //     <div
    //       className="grid gap-4"
    //       style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}
    //     >
    //       {[0, 1, 2, 3].map((i) => (
    //         <Skeleton key={i} h={150} r={14} />
    //       ))}
    //     </div>
    //   ) : graphTemplates.length === 0 ? (
    //     <div
    //       style={{
    //         padding: "60px 0",
    //         textAlign: "center",
    //         color: "rgba(255,255,255,0.2)",
    //         fontSize: 13,
    //       }}
    //     >
    //       No templates available yet.
    //     </div>
    //   ) : (
    //     <div
    //       className="grid gap-4"
    //       style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}
    //     >
    //       {graphTemplates.map((t: any, i: number) => (
    //         <TemplateCard
    //           key={t.id}
    //           tpl={t}
    //           index={i}
    //           onUse={() => router.push("/app")}
    //         />
    //       ))}
    //     </div>
    //   )}
    // </div>

    <div class=" my-auto flex items-center justify-center p-6">
      <div class="text-center">
        <div class="text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase mb-4">
          Under Construction
        </div>
        <h1 class="text-5xl md:text-6xl font-light text-white tracking-tight">
          Coming Soon
        </h1>
        <div class="h-px w-16 bg-neutral-800 mx-auto mt-8"></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
function PanelCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.015)",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{ width: 3, height: 14, borderRadius: 2, background: CYAN }}
        />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { user, subscription, token } = useAppStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const handleSave = async () => {
    if (saving || !token) return;
    setSaving(true);
    setStatus("idle");
    try {
      const r = await fetch(`${API}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (!r.ok) throw new Error();
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
          }}
        >
          Settings
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          Manage your account details
        </p>
      </div>
      {status === "saved" && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#10b981",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profile saved
        </div>
      )}
      {status === "error" && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ✗ Failed to save — try again
        </div>
      )}
      <PanelCard title="Profile">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel>First Name</FieldLabel>
              <FieldInput
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel>Last Name</FieldLabel>
              <FieldInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <FieldLabel>Email</FieldLabel>
            <FieldInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <Btn
            size="sm"
            style={{ alignSelf: "flex-start" }}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Btn>
        </div>
      </PanelCard>
      <PanelCard title="Plan">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                textTransform: "capitalize",
              }}
            >
              {subscription?.plan ?? "Free"} Plan
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Status:{" "}
              <span
                style={{
                  color:
                    subscription?.status === "active"
                      ? CYAN
                      : "rgba(255,255,255,0.4)",
                  textTransform: "capitalize",
                }}
              >
                {subscription?.status ?? "active"}
              </span>
            </p>
          </div>
          {(!subscription?.plan || subscription.plan === "free") && (
            <Btn size="sm">Upgrade →</Btn>
          )}
        </div>
      </PanelCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BILLING
// ─────────────────────────────────────────────────────────────
function BillingPage() {
  const { user, subscription } = useAppStore();
  const rows: [string, React.ReactNode][] = [
    [
      "Plan",
      <span
        style={{ color: CYAN, fontWeight: 700, textTransform: "capitalize" }}
      >
        {subscription?.plan ?? "Free"}
      </span>,
    ],
    [
      "Status",
      <span
        style={{
          textTransform: "capitalize",
          color:
            subscription?.status === "active" ? CYAN : "rgba(255,255,255,0.5)",
        }}
      >
        {subscription?.status ?? "active"}
      </span>,
    ],
    ["Email", user?.email ?? "—"],
    [
      "Started",
      subscription?.startedAt
        ? new Date(subscription.startedAt).toLocaleDateString()
        : "—",
    ],
    [
      "Expires",
      subscription?.expiresAt
        ? new Date(subscription.expiresAt).toLocaleDateString()
        : "No expiry",
    ],
  ];
  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
          }}
        >
          Billing
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          Manage your subscription
        </p>
      </div>
      <PanelCard title="Current Plan">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rows.map(([l, v]) => (
            <div
              key={String(l)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                {l}
              </span>
              <span style={{ fontSize: 13, color: "#fff" }}>{v}</span>
            </div>
          ))}
          <Btn
            variant="outline"
            size="sm"
            style={{ alignSelf: "flex-start", marginTop: 4 }}
          >
            Manage Subscription →
          </Btn>
        </div>
      </PanelCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELP
// ─────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How do I connect Google Sheets?",
    a: "Go to New Graph → Google Sheets, paste your sheet URL and follow the prompts.",
  },
  {
    q: "Can I export my charts?",
    a: "Yes — open any chart and click the share icon to export as PNG, SVG, or a shareable link.",
  },
  {
    q: "How do I invite teammates?",
    a: "Team invites are available on the Team and Enterprise plans via Settings → Team.",
  },
  {
    q: "What file formats can I upload?",
    a: "We support CSV, XLS, XLSX, and JSON. Max file size is 25 MB.",
  },
  {
    q: "How does AI chart generation work?",
    a: "Describe your data in plain English or upload a file. AI maps it to the best chart type and renders it instantly.",
  },
  {
    q: "Can I edit a generated chart?",
    a: "Yes — click 'Open in Editor' on any chart card to adjust colors, chart type, titles, and more.",
  },
];
function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ maxWidth: 580 }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
          }}
        >
          Help & Support
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          Common questions answered
        </p>
      </div>
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.015)",
          marginBottom: 14,
        }}
      >
        {FAQS.map((f, i) => (
          <div
            key={i}
            style={{
              borderBottom:
                i < FAQS.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {f.q}
              </span>
              <span
                style={{
                  color: CYAN,
                  fontSize: 20,
                  flexShrink: 0,
                  transition: "transform 0.2s",
                  transform: open === i ? "rotate(45deg)" : "none",
                  lineHeight: 1,
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div
                style={{
                  padding: "0 20px 16px",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.7,
                }}
              >
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.015)",
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Still need help?
          </p>
          <p
            style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}
          >
            Our team replies within 24 hours.
          </p>
        </div>
        <Btn size="sm">Contact Us</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [sideOpen, setSide] = useState(true);
  const [collapsed, setCol] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, savedCharts, bootstrap, isBootstrapped, isBootstrapping } =
    useAppStore();

  useEffect(() => {
    if (!isBootstrapped && !isBootstrapping) bootstrap();
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setSide(true); // open on desktop
    }
    // on mobile: stays false (closed by default)
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSide(false); // starts closed on mobile
        setCol(false); // full width when opened
      } else {
        setSide(true);
        setCol(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setSide(true);
  }, []);

  const starredCharts = savedCharts.filter((c) => c.starred);
  const sharedCharts = savedCharts.filter((c) => c.shared || !!c.shareToken);

  const handleNavTab = (t: string) => {
    setTab(t);
    if (isMobile) setSide(false); // auto-close drawer on mobile after nav
  };

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardHome setTab={setTab} />,
    graphs: (
      <GraphGrid
        charts={savedCharts}
        heading="My Graphs"
        emptyMsg="No graphs yet — create your first chart!"
      />
    ),
    shared: (
      <GraphGrid
        charts={sharedCharts}
        heading="Shared With Me"
        emptyMsg="No shared charts yet — share a chart to see it here"
      />
    ),
    favourites: (
      <GraphGrid
        charts={starredCharts}
        heading="Favourites"
        emptyMsg="No favourites yet — click ★ on any chart to star it"
      />
    ),
    templates: <TemplatesPage setTab={setTab} />,
    settings: <SettingsPage />,
    billing: <BillingPage />,
    help: <HelpPage />,
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background: "#0a0a10",
        color: "#fff",
        display: "flex",
        fontFamily: "'Inter','DM Sans',system-ui,sans-serif",
      }}
    >
      <style>{`
        @keyframes skPulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes tplIn    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes gcPulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input::placeholder,textarea::placeholder { color:rgba(255,255,255,0.18) }
        ::-webkit-scrollbar { width:4px; height:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:2px }
        ::-webkit-scrollbar-thumb:hover { background:rgba(6,182,212,0.4) }
      `}</style>

      {/* Mobile backdrop — dims dashboard behind the open drawer */}
      {isMobile && sideOpen && (
        <div
          onClick={() => setSide(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar: fixed overlay on mobile, normal flex item on desktop */}
      {/* Sidebar: fixed overlay on mobile, normal flex item on desktop */}
      {/* Mobile backdrop */}
      {isMobile && sideOpen && (
        <div
          onClick={() => setSide(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, inline on desktop */}
      {(!isMobile || sideOpen) && (
        <div
          style={
            isMobile
              ? {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  zIndex: 50,
                }
              : {}
          }
        >
          <Sidebar
            open={true}
            collapsed={isMobile ? false : collapsed}
            setCollapsed={setCol}
            tab={tab}
            onTab={handleNavTab}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            height: 52,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 22px",
            background: "rgba(10,10,16,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setSide((s) => !s)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3.5,
              padding: "6px 5px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              flexShrink: 0,
              borderRadius: 6,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.7)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.3)")
            }
          >
            <span
              style={{
                width: 14,
                height: 1.5,
                background: "currentColor",
                display: "block",
                borderRadius: 1,
              }}
            />
            <span
              style={{
                width: 14,
                height: 1.5,
                background: "currentColor",
                display: "block",
                borderRadius: 1,
              }}
            />
            <span
              style={{
                width: 10,
                height: 1.5,
                background: "currentColor",
                display: "block",
                borderRadius: 1,
              }}
            />
          </button>

          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.18)", fontWeight: 500 }}>
              Graphix
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.1)",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              /
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              {PAGE_TITLES[tab as keyof typeof PAGE_TITLES] ?? tab}
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Context count */}
          {(tab === "graphs" || tab === "favourites" || tab === "shared") && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(6,182,212,0.1)",
                color: CYAN,
                border: "1px solid rgba(6,182,212,0.2)",
                fontFamily: "'DM Mono',monospace",
                letterSpacing: "0.04em",
              }}
            >
              {tab === "graphs"
                ? savedCharts.length
                : tab === "favourites"
                  ? starredCharts.length
                  : sharedCharts.length}{" "}
              {tab === "favourites"
                ? "starred"
                : tab === "shared"
                  ? "shared"
                  : "charts"}
            </div>
          )}

          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: CYAN,
              cursor: "pointer",
              userSelect: "none",
              flexShrink: 0,
              fontFamily: "'DM Mono',monospace",
              boxShadow: "0 0 0 1px rgba(6,182,212,0.1)",
            }}
            title={
              user
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : ""
            }
          >
            {user
              ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim() ||
                "…"
              : "…"}
          </div>
        </header>

        {/* Scrollable content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "32px 32px 64px",
            background: "#0a0a10",
            minHeight: 0,
          }}
        >
          {pages[tab] ?? null}
        </main>
      </div>
    </div>
  );
}
