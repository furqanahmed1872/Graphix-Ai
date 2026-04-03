"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { PAGE_TITLES } from "@/lib/Data";
import {
  Ico,
  Chip,
  Btn,
  FieldInput,
  FieldTextarea,
  FieldLabel,
  SectionCard,
  SectionHead,
  StripeDivider,
  BackBtn,
  SuccessBanner,
  DataTable,
  Stepper,
  MiniStepper,
  ActionCard,
} from "@/components/dashboard/UIKit";
import GraphCard from "@/components/dashboard/GraphCard";
import Sidebar from "@/components/dashboard/Sidebar";

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-white/[0.06] ${className}`} />
  );
}

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────
function StatCard({ stat, index }: { stat: any; index: number }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 70 + 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="relative border border-white/[0.08] rounded-[7px] p-4 overflow-hidden transition-all duration-[400ms]"
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(10px)",
      }}
    >
      {/* corner glow */}
      <div className="absolute top-0 right-0 w-[60px] h-[60px] bg-[radial-gradient(circle_at_top_right,rgba(0,212,200,0.08),transparent)] pointer-events-none" />

      <div className="flex items-center justify-between mb-[14px]">
        <span className="text-white/35 text-[10px] font-bold tracking-[0.1em] uppercase">
          {stat.label}
        </span>
        <div className="w-[29px] h-[29px] bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.35)] rounded-[5px] flex items-center justify-center text-[#00d4c8]">
          <Ico d={stat.icon} size={13} />
        </div>
      </div>
      <div className="text-[28px] font-extrabold text-white leading-none mb-[5px] tracking-tight">
        {stat.value}
      </div>
      <div className="text-[12px] text-[#00d4c8]">{stat.delta}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GRAPH GRID  (search + filter + card grid)
// ─────────────────────────────────────────────────────────────
function GraphGrid({
  charts,
  emptyMsg = "No graphs found",
}: {
  charts: any[];
  emptyMsg: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Line", "Bar", "Area"];

  const list = charts.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" || c.tag === filter),
  );

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Search + filter row */}
      <div className="flex gap-[9px] flex-wrap items-center">
        <div className="relative flex-1 min-w-[190px] max-w-[290px]">
          <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={2}
            className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search graphs…"
            className="w-full pl-[30px] pr-[11px] py-2 bg-transparent border border-white/[0.08] focus:border-[rgba(0,212,200,0.45)] rounded-[5px] text-[13px] text-white outline-none transition-colors"
          />
        </div>
        <div className="flex gap-[6px] flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-[10px] py-[5px] text-[11px] font-bold rounded-[4px] border cursor-pointer transition-colors ${
                filter === f
                  ? "bg-[rgba(0,212,200,0.15)] border-[rgba(0,212,200,0.4)] text-[#00d4c8]"
                  : "bg-transparent border-white/[0.08] text-white/35 hover:border-white/20 hover:text-white/55"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-white/20 text-[13px]">
          {emptyMsg}
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}
        >
          {list.map((c) => (
            <GraphCard key={c.id} graph={c} />
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

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="flex flex-col gap-7 transition-all duration-[400ms]"
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(8px)",
      }}
    >
      {/* Welcome */}
      <div>
        <div className="text-[#00d4c8] text-[11px] font-bold tracking-[0.18em] uppercase mb-[7px]">
          Good morning
        </div>
        {isLoading ? (
          <Skeleton className="h-9 w-64 mb-2" />
        ) : (
          <h1 className="text-white font-extrabold text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.12] tracking-tight m-0">
            <span className="text-[#00d4c8]">{firstName}'s</span> workspace
          </h1>
        )}
        <p className="text-white/35 text-[14px] mt-[7px]">
          Here's what's happening with your data today.
        </p>
      </div>

      <StripeDivider />

      {/* Stats */}
      <div
        className="grid gap-[11px]"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))" }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-[7px]" />
            ))
          : dashboardStats.map((s, i) => (
              <StatCard key={s.label} stat={s} index={i} />
            ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white text-[14px] font-bold mb-3">Quick Actions</h2>
        <div
          className="grid gap-[9px]"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}
        >
          <ActionCard
            icon="M12 5v14M5 12h14"
            label="New Graph"
            sub="Build from scratch"
            cta="Create"
            onClick={() => router.push("/app")}
            primary
          />
          <ActionCard
            icon="M9 17H5a2 2 0 00-2 2"
            label="Google Sheets"
            sub="Connect live data"
            cta="Connect"
            onClick={() => setTab("import-google")}
          />
          <ActionCard
            icon="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
            label="Upload Excel"
            sub="XLS / XLSX / CSV"
            cta="Upload"
            onClick={() => setTab("import-excel")}
          />
          <ActionCard
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
            label="Paste Data"
            sub="Tabular text / JSON"
            cta="Paste"
            onClick={() => setTab("import-paste")}
          />
        </div>
      </div>

      {/* Recent Graphs + Activity side-by-side */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))" }}
      >
        {/* Recent Graphs */}
        <SectionCard>
          <SectionHead
            title="Recent Graphs"
            right={
              <button
                onClick={() => setTab("graphs")}
                className="text-[#00d4c8] bg-transparent border-none text-[12px] font-semibold cursor-pointer hover:opacity-75 transition-opacity"
              >
                View all →
              </button>
            }
          />
          {isLoading ? (
            <div className="p-4 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[38px]" />
              ))}
            </div>
          ) : savedCharts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-white/35 text-[13px] mb-4">No graphs yet.</p>
              <Btn size="sm" onClick={() => setTab("new-graph")}>
                Create Graph →
              </Btn>
            </div>
          ) : (
            savedCharts.slice(0, 5).map((c, i, arr) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-[17px] py-[11px] hover:bg-white/[0.02] transition-colors ${
                  i < arr.length - 1 ? "border-b border-white/[0.05]" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[13px] font-semibold truncate">
                    {c.title}
                  </p>
                  <p className="text-white/35 text-[11px]">
                    {c.updated ?? "recently"}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    c.up ? "text-[#00d4c8]" : "text-white/35"
                  }`}
                >
                  {c.trend ?? "—"}
                </span>
              </div>
            ))
          )}
        </SectionCard>

        {/* Activity */}
        <SectionCard>
          <SectionHead title="Activity" right={<Chip>Last 7 days</Chip>} />
          {isLoading ? (
            <div className="p-4 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[38px]" />
              ))}
            </div>
          ) : activityFeed.length === 0 ? (
            <div className="p-8 text-center text-white/20 text-[13px]">
              No activity yet.
            </div>
          ) : (
            activityFeed.map((a, i, arr) => (
              <div
                key={a.id}
                className={`flex items-center gap-3 px-[17px] py-[11px] hover:bg-white/[0.02] transition-colors ${
                  i < arr.length - 1 ? "border-b border-white/[0.05]" : ""
                }`}
              >
                <div
                  className={`w-[29px] h-[29px] rounded-[5px] flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                    a.own
                      ? "bg-[rgba(0,212,200,0.15)] text-[#00d4c8]"
                      : "bg-white/[0.08] text-white/55"
                  }`}
                >
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0 text-[13px] text-white/55">
                  {a.action}{" "}
                  <span className="text-white font-semibold">{a.graph}</span>
                </div>
                <span className="text-white/20 text-[11px] flex-shrink-0">
                  {a.time}
                </span>
              </div>
            ))
          )}
        </SectionCard>
      </div>

      {/* Starred */}
      {!isLoading && savedCharts.some((c) => c.starred) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-[14px] font-bold">Starred</h2>
            <button
              onClick={() => setTab("favourites")}
              className="text-[#00d4c8] bg-transparent border-none text-[12px] font-semibold cursor-pointer hover:opacity-75 transition-opacity"
            >
              See all →
            </button>
          </div>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            }}
          >
            {savedCharts
              .filter((c) => c.starred)
              .slice(0, 4)
              .map((c) => (
                <GraphCard key={c.id} graph={c} />
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
function TemplatesPage({ setTab }: { setTab: (t: string) => void }) {
  const { graphTemplates, isBootstrapping, isBootstrapped } = useAppStore();
  const isLoading = isBootstrapping || !isBootstrapped;

  return (
    <div className="max-w-[800px]">
      <h2 className="text-white text-[20px] font-extrabold mb-1">Templates</h2>
      <p className="text-white/35 text-[13px] mb-[26px]">
        Start faster with pre-built chart collections
      </p>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))" }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-[7px]" />
            ))
          : graphTemplates.map((t, i) => (
              <TemplateCard key={t.id} t={t} index={i} setTab={setTab} />
            ))}
      </div>
    </div>
  );
}

function TemplateCard({
  t,
  index,
  setTab,
}: {
  t: any;
  index: number;
  setTab: (s: string) => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="border rounded-[7px] p-[21px] flex flex-col gap-[10px] transition-all duration-200"
      style={{
        borderColor: hov ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
        opacity: 0,
        animation: `fadeUp 0.4s ease ${index * 0.07}s forwards`,
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-white font-extrabold text-[15px]">{t.title}</span>
        <Chip cyan>{t.tag ?? t.category}</Chip>
      </div>
      <p className="text-white/35 text-[13px] leading-relaxed">
        {t.desc ?? t.description}
      </p>
      {t.count && (
        <p className="text-white/20 text-[12px]">{t.count} pre-built charts</p>
      )}
      <Btn
        variant="outline"
        size="sm"
        onClick={() => setTab("new-graph")}
        style={{ alignSelf: "flex-start" }}
      >
        Use Template →
      </Btn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
function SettingsPage() {
  const { user, subscription } = useAppStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const handleSave = () => {
    // TODO: PATCH /api/user { firstName, lastName, email }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-[480px]">
      <h2 className="text-white text-[20px] font-extrabold mb-1">Settings</h2>
      <p className="text-white/35 text-[13px] mb-[26px]">
        Manage your account preferences
      </p>

      {saved && (
        <div className="mb-3">
          <SuccessBanner>
            <span className="text-[#00d4c8] text-[13px]">
              Changes saved successfully.
            </span>
          </SuccessBanner>
        </div>
      )}

      <SectionCard style={{ marginBottom: 13 }}>
        <SectionHead title="Profile" />
        <div className="p-[17px] flex flex-col gap-[13px]">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[6px]">
              <FieldLabel>First Name</FieldLabel>
              <FieldInput
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <FieldLabel>Last Name</FieldLabel>
              <FieldInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="flex flex-col gap-[6px]">
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
            Save Changes
          </Btn>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHead title="Plan" />
        <div className="p-[17px] flex items-center justify-between">
          <div>
            <p className="text-white text-[13px] font-bold mb-1 capitalize">
              {subscription?.plan ?? "—"} Plan
            </p>
            <p className="text-white/35 text-[12px] capitalize">
              Status: {subscription?.status ?? "—"}
            </p>
          </div>
          {subscription?.plan === "free" && <Btn size="sm">Upgrade →</Btn>}
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BILLING
// ─────────────────────────────────────────────────────────────
function BillingPage() {
  const { user, subscription } = useAppStore();

  const rows = [
    [
      "Plan",
      <span className="capitalize text-[#00d4c8] font-bold">
        {subscription?.plan ?? "—"}
      </span>,
    ],
    [
      "Status",
      <span className="capitalize">{subscription?.status ?? "—"}</span>,
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
        : "—",
    ],
  ] as const;

  return (
    <div className="max-w-[480px]">
      <h2 className="text-white text-[20px] font-extrabold mb-1">Billing</h2>
      <p className="text-white/35 text-[13px] mb-[26px]">
        Manage your subscription and invoices
      </p>
      <SectionCard>
        <SectionHead title="Current Plan" />
        <div className="p-[17px] flex flex-col gap-4">
          {rows.map(([label, val]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between"
            >
              <span className="text-white/55 text-[13px]">{label}</span>
              <span className="text-white text-[13px]">{val}</span>
            </div>
          ))}
          <Btn variant="outline" size="sm" style={{ alignSelf: "flex-start" }}>
            Manage Subscription →
          </Btn>
        </div>
      </SectionCard>
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
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-[560px]">
      <h2 className="text-white text-[20px] font-extrabold mb-1">
        Help & Support
      </h2>
      <p className="text-white/35 text-[13px] mb-[26px]">
        Common questions answered
      </p>
      <div className="border border-white/[0.08] rounded-[7px] overflow-hidden mb-4">
        {FAQS.map((f, i) => (
          <div key={i} className="border-b border-white/[0.05] last:border-b-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-[17px] py-[13px] text-left bg-transparent border-none cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-white text-[13px] font-semibold">
                {f.q}
              </span>
              <span
                className="text-[#00d4c8] text-[18px] leading-none ml-3 flex-shrink-0 transition-transform duration-200"
                style={{ transform: open === i ? "rotate(45deg)" : "none" }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div className="px-[17px] pb-[14px] text-white/35 text-[13px] leading-[1.7] border-t border-white/[0.08]">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border border-white/[0.08] rounded-[7px] p-[17px] flex items-center gap-4">
        <div className="flex-1">
          <p className="text-white font-bold text-[14px] mb-1">Still stuck?</p>
          <p className="text-white/35 text-[13px]">
            Our team replies within 24 hours on business days.
          </p>
        </div>
        <Btn size="sm">Contact Us</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NEW GRAPH
// ─────────────────────────────────────────────────────────────
function NewGraphPage({ setTab }: { setTab: (t: string) => void }) {
  const [step, setStep] = useState(1);
  const steps: [string, string][] = [
    ["1", "Source"],
    ["2", "Configure"],
    ["3", "Preview"],
  ];

  return (
    <div className="max-w-[560px]">
      <BackBtn onClick={() => setTab("graphs")} />
      <h2 className="text-white text-[20px] font-extrabold mb-1">New Graph</h2>
      <p className="text-white/35 text-[13px] mb-7">
        Choose a data source to get started
      </p>

      <Stepper steps={steps} current={step} />

      {step === 1 && (
        <div
          className="grid gap-[9px]"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}
        >
          <ActionCard
            icon="M9 17H5a2 2 0 00-2 2"
            label="Google Sheets"
            sub="Live spreadsheet data"
            cta="Select"
            onClick={() => setStep(2)}
          />
          <ActionCard
            icon="M21 15v4a2 2 0 01-2 2H5"
            label="Upload Excel"
            sub="XLS / XLSX / CSV"
            cta="Select"
            onClick={() => setStep(2)}
          />
          <ActionCard
            icon="M9 5H7a2 2 0 00-2 2v12"
            label="Paste Data"
            sub="Manual entry"
            cta="Select"
            onClick={() => setStep(2)}
          />
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-white/55 text-[13px]">
            Configure your data source in the next step.
          </p>
          <Btn
            variant="ghost"
            onClick={() => setStep(1)}
            style={{ alignSelf: "flex-start" }}
          >
            ← Back
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IMPORT PAGES
// ─────────────────────────────────────────────────────────────
function ImportGooglePage({ setTab }: { setTab: (t: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="max-w-[480px]">
      <BackBtn onClick={() => setTab("dashboard")} />
      <h2 className="text-white text-[20px] font-extrabold mb-1">
        Google Sheets
      </h2>
      <p className="text-white/35 text-[13px] mb-7">
        Paste your Google Sheets URL to connect live data.
      </p>
      <div className="flex flex-col gap-3">
        <FieldLabel>Sheet URL</FieldLabel>
        <FieldInput
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
        />
        <Btn style={{ alignSelf: "flex-start" }}>Connect →</Btn>
      </div>
    </div>
  );
}

function ImportExcelPage({ setTab }: { setTab: (t: string) => void }) {
  return (
    <div className="max-w-[480px]">
      <BackBtn onClick={() => setTab("dashboard")} />
      <h2 className="text-white text-[20px] font-extrabold mb-1">
        Upload Excel
      </h2>
      <p className="text-white/35 text-[13px] mb-7">
        Upload XLS, XLSX, or CSV files.
      </p>
      <div className="border-2 border-dashed border-white/[0.12] rounded-[7px] p-10 text-center hover:border-[rgba(0,212,200,0.35)] transition-colors cursor-pointer">
        <p className="text-white/35 text-[13px]">
          Drop file here or click to browse
        </p>
      </div>
    </div>
  );
}

function ImportPastePage({ setTab }: { setTab: (t: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="max-w-[480px]">
      <BackBtn onClick={() => setTab("dashboard")} />
      <h2 className="text-white text-[20px] font-extrabold mb-1">Paste Data</h2>
      <p className="text-white/35 text-[13px] mb-7">
        Paste tabular text or JSON directly.
      </p>
      <FieldTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste CSV, TSV, or JSON here…"
        style={{ minHeight: 180 }}
      />
      <Btn style={{ marginTop: 12 }}>Parse & Visualise →</Btn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [sideOpen, setSide] = useState(true);
  const [collapsed, setCol] = useState(false);

  const { user, savedCharts, bootstrap, isBootstrapped, isBootstrapping } =
    useAppStore();

  useEffect(() => {
    if (!isBootstrapped && !isBootstrapping) bootstrap();
  }, []);

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardHome setTab={setTab} />,
    graphs: <GraphGrid charts={savedCharts} emptyMsg="No graphs yet" />,
    shared: (
      <GraphGrid
        charts={savedCharts.slice(0, 3)}
        emptyMsg="Nothing shared with you yet"
      />
    ),
    favourites: (
      <GraphGrid
        charts={savedCharts.filter((c) => c.starred)}
        emptyMsg="Star graphs to save them here"
      />
    ),
    templates: <TemplatesPage setTab={setTab} />,
    settings: <SettingsPage />,
    billing: <BillingPage />,
    help: <HelpPage />,
    "new-graph": <NewGraphPage setTab={setTab} />,
    "import-google": <ImportGooglePage setTab={setTab} />,
    "import-excel": <ImportExcelPage setTab={setTab} />,
    "import-paste": <ImportPastePage setTab={setTab} />,
  };

  return (
    <div className="min-h-screen bg-[#111212] text-white flex overflow-hidden font-sans">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(11px); }
          to   { opacity: 1; transform: none; }
        }
        input::placeholder,
        textarea::placeholder { color: rgba(255,255,255,0.20); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(8,145,178,0.35); }
      `}</style>

      <Sidebar
        open={sideOpen}
        collapsed={collapsed}
        setCollapsed={setCol}
        tab={tab}
        onTab={setTab}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-[#111212] border-b border-white/[0.08] px-[19px] h-[50px] flex items-center gap-[11px] flex-shrink-0 sticky top-0 z-10">
          <button
            onClick={() => setSide((s) => !s)}
            className="flex flex-col gap-[3.5px] p-[5px] text-white/35 bg-transparent border-none cursor-pointer"
          >
            <span className="w-[14px] h-[1.5px] bg-current block" />
            <span className="w-[14px] h-[1.5px] bg-current block" />
            <span className="w-[10px] h-[1.5px] bg-current block" />
          </button>

          <div className="flex items-center gap-[7px] text-[13px]">
            <span className="text-white/20">Graphix</span>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold">
              {PAGE_TITLES[tab as keyof typeof PAGE_TITLES] ?? tab}
            </span>
          </div>

          <div className="flex-1" />

          {/* Avatar — real initials from store */}
          <div
            className="w-[31px] h-[31px] rounded-[6px] bg-[rgba(0,212,200,0.18)] border border-[rgba(0,212,200,0.35)] flex items-center justify-center text-[11px] font-extrabold text-[#00d4c8] cursor-pointer select-none"
            title={user ? `${user.firstName} ${user.lastName}` : ""}
          >
            {user ? `${user.firstName[0]}${user.lastName[0]}` : "…"}
          </div>
        </header>

        <main className="flex-1 px-6 pt-6 pb-12 overflow-y-auto bg-[#111212]">
          {pages[tab] ?? null}
        </main>
      </div>
    </div>
  );
}
