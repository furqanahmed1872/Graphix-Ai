"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import SingleChartArea from "./SingleChartArea";
import ChartTemplatePanel from "./ChartTemplatePanel";
import MessageHistorySidebar from "./MessageHistorySidebar";
import InputBar from "./InputBar";
import StarField from "./StarField";
import WaveHero from "./WaveHero";
import { createConversation } from "./conversations";
import { useAppStore } from "@/store/appStore";
import { apiSaveChart } from "@/lib/api";

interface Message {
  id: string;
  from: "user" | "ai";
  content: string | any;
  status?: "loading" | "success" | "error";
  hasFile?: boolean;
  fileName?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const STORAGE_KEY = "graphix_conversations_v2";

function loadFromStorage(): {
  conversations: Conversation[];
  activeId: string;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.conversations?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(conversations: Conversation[], activeId: string) {
  try {
    const toSave = conversations.map((c) => ({
      ...c,
      messages: c.messages.filter((m) => m.status !== "loading"),
    }));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ conversations: toSave, activeId }),
    );
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export default function GraphApp() {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === "undefined") return [createConversation()];
    const stored = loadFromStorage();
    return stored?.conversations ?? [createConversation()];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return conversations[0]?.id ?? "";
    const stored = loadFromStorage();
    return stored?.activeId ?? conversations[0]?.id ?? "";
  });
  const [selectedAiId, setSelectedAiId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mobile panel states
  const [mobileTemplatesOpen, setMobileTemplatesOpen] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { token, isAuthenticated, addSavedChart } = useAppStore();

  const handleSaveChart = async (
    chartConfig: { data: any[]; layout: any },
    title: string,
    prompt: string,
  ) => {
    if (!token || !isAuthenticated) return;
    const saved = await apiSaveChart(token, { title, prompt, chartConfig });
    addSavedChart(saved);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile panels when switching conversations
  useEffect(() => {
    setMobileTemplatesOpen(false);
    setMobileHistoryOpen(false);
  }, [activeId]);

  useEffect(() => {
    if (typeof window !== "undefined") saveToStorage(conversations, activeId);
  }, [conversations, activeId]);

  useEffect(() => {
    const conv = conversations.find((c) => c.id === activeId);
    const aiMsgs =
      conv?.messages.filter(
        (m) => m.from === "ai" && m.status === "success" && m.content?.data,
      ) ?? [];
    setSelectedAiId(aiMsgs.at(-1)?.id ?? null);
  }, [activeId]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const hasMessages = (activeConv?.messages?.length ?? 0) > 0;

  const chartMsgsCount =
    activeConv?.messages.filter(
      (m) => m.from === "ai" && m.status === "success" && m.content?.data,
    ).length ?? 0;

  const updateMessages = useCallback(
    (convId: string, updater: Message[] | ((prev: Message[]) => Message[])) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const messages =
            typeof updater === "function" ? updater(c.messages) : updater;
          const firstUser = messages.find((m) => m.from === "user");
          const newTitle = firstUser
            ? firstUser.content.slice(0, 30) +
              (firstUser.content.length > 30 ? "…" : "")
            : c.title;
          return { ...c, messages, title: newTitle };
        }),
      );
    },
    [],
  );

  const handleDeleteConversation = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (id === activeId) {
        if (filtered.length > 0) {
          setActiveId(filtered[0].id);
        } else {
          const newConv = createConversation();
          setActiveId(newConv.id);
          return [newConv];
        }
      }
      return filtered;
    });
    if (id === activeId) setSelectedAiId(null);
    setDeleteConfirmId(null);
  };

  const newConversation = () => {
    const hasEmpty = conversations.some(
      (c) => c.title === "New conversation" && c.messages.length === 0,
    );
    if (hasEmpty) {
      const empty = conversations.find(
        (c) => c.title === "New conversation" && c.messages.length === 0,
      )!;
      setActiveId(empty.id);
    } else {
      const c = createConversation();
      setConversations((prev) => [c, ...prev]);
      setActiveId(c.id);
    }
    setSelectedAiId(null);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSend = async (
    input: string,
    fileContent: string,
    fileName: string,
    prebuiltConfig?: any,
  ) => {
    if (!input.trim() || isLoading || !activeId) return;
    const convId = activeId;
    const newAiId = crypto.randomUUID();

    // Close mobile panels when sending
    setMobileTemplatesOpen(false);
    setMobileHistoryOpen(false);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      from: "user",
      content: input,
      status: "success",
      hasFile: !!fileContent,
      fileName,
    };

    const loadingAiMsg: Message = {
      id: newAiId,
      from: "ai",
      content: "",
      status: "loading",
    };

    const conv = conversations.find((c) => c.id === convId);
    const aiMessages =
      conv?.messages.filter(
        (m) => m.from === "ai" && m.status === "success" && m.content?.data,
      ) ?? [];

    const contextAiId = selectedAiId ?? aiMessages.at(-1)?.id ?? null;
    const contextMsg =
      aiMessages.find((m) => m.id === contextAiId) ?? aiMessages.at(-1) ?? null;

    let previousChart: { data: any[]; layout: any } | null = null;

    if (contextMsg) {
      const perChartData =
        typeof window !== "undefined"
          ? (window as any).__graphixChartData?.[contextMsg.id]
          : null;

      previousChart = {
        data: perChartData?.data ?? contextMsg.content.data,
        layout: perChartData?.layout ?? contextMsg.content.layout,
      };
    }

    updateMessages(convId, (msgs) => [...msgs, userMsg, loadingAiMsg]);
    setSelectedAiId(newAiId);
    setIsLoading(true);

    if (prebuiltConfig) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.id === newAiId
            ? { ...m, content: prebuiltConfig, status: "success" as const }
            : m,
        ),
      );
      setIsLoading(false);
      return;
    }

    try {
      const augmentedPrompt = previousChart
        ? `${input}\n\n[IMPORTANT: When modifying the chart, always set explicit "color" values on marker and line objects in every trace. Never omit color fields — if the user requested a color change, apply it as a hex or CSS color string on marker.color and line.color for every trace.]`
        : input;

      const res = await fetch("http://localhost:3001/api/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: augmentedPrompt,
          fileContent,
          previousChart,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const config = await res.json();

      if (config.error) {
        updateMessages(convId, (msgs) =>
          msgs.map((m) =>
            m.id === newAiId
              ? {
                  ...m,
                  content: { error: config.error },
                  status: "success" as const,
                }
              : m,
          ),
        );
        setIsLoading(false);
        return;
      }

      if (config.action === "edit" && contextMsg) {
        const prevAiId = contextMsg.id;
        updateMessages(convId, (msgs) => {
          const withoutLoading = msgs.filter((m) => m.id !== newAiId);
          return withoutLoading.map((m) =>
            m.id === prevAiId
              ? {
                  ...m,
                  content: { data: config.data, layout: config.layout },
                  status: "success" as const,
                }
              : m,
          );
        });
        if (typeof window !== "undefined") {
          if ((window as any).__graphixChartData) {
            delete (window as any).__graphixChartData[prevAiId];
          }
        }
        setSelectedAiId(prevAiId);
      } else {
        updateMessages(convId, (msgs) =>
          msgs.map((m) =>
            m.id === newAiId
              ? {
                  ...m,
                  content: { data: config.data, layout: config.layout },
                  status: "success" as const,
                }
              : m,
          ),
        );
      }
    } catch (err: any) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.id === newAiId
            ? {
                ...m,
                content: err.message || "Failed to generate chart",
                status: "error" as const,
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="graph-app-root fixed inset-0 overflow-hidden"
      style={{ background: "#09090f" }}
    >
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js"
        async
      />
      <StarField />

      <div className="flex h-dvh relative z-10">
        {/* Mobile backdrop for sidebar */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 z-[9]"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile backdrop for template panel */}
        {mobileTemplatesOpen && isMobile && (
          <div
            className="fixed inset-0 z-[19]"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setMobileTemplatesOpen(false)}
          />
        )}

        {/* Mobile backdrop for history sidebar */}
        {mobileHistoryOpen && isMobile && (
          <div
            className="fixed inset-0 z-[19]"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setMobileHistoryOpen(false)}
          />
        )}

        {/* LEFT — conversations sidebar */}
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={newConversation}
            onDelete={handleDeleteConversation}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile template panel — slides in from left */}
        {isMobile && mobileTemplatesOpen && hasMessages && (
          <div
            className="fixed left-0 top-0 bottom-0 z-20"
            style={{
              animation: "slideInLeft 0.2s ease both",
            }}
          >
            <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
            <div style={{ paddingTop: 48 }}>
              <ChartTemplatePanel />
            </div>
          </div>
        )}

        {/* Mobile history sidebar — slides in from right */}
        {isMobile && mobileHistoryOpen && hasMessages && (
          <div
            className="fixed right-0 top-0 bottom-0 z-20"
            style={{
              animation: "slideInRight 0.2s ease both",
            }}
          >
            <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
            <div style={{ paddingTop: 48 }}>
              <MessageHistorySidebar
                messages={activeConv?.messages ?? []}
                selectedAiId={selectedAiId}
                onSelectAiId={(id) => {
                  setSelectedAiId(id);
                  setMobileHistoryOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* CENTER — main area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Topbar */}
          <div
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 flex-shrink-0"
            style={{
              background: "rgba(9,9,15,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              height: 48,
            }}
          >
            {!sidebarOpen && (
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <MenuIcon />
              </button>
            )}
            <span
              className="text-sm font-medium truncate flex-1 min-w-0"
              style={{
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "-0.01em",
              }}
            >
              {activeConv?.title || "Graphix"}
            </span>

            <div className="flex items-center gap-2  flex-shrink-0">
              <a
                className="flex text-black text-xs px-2 items-center justify-center bg-white h-6 rounded-lg transition-all"
                href="/dashboard"
                aria-label="Go to dashboard"
              >
                Dashboad
              </a>
            </div>

            {/* Mobile action buttons — show when there are charts */}
            {isMobile && hasMessages && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Templates toggle */}
                <button
                  onClick={() => {
                    setMobileTemplatesOpen((v) => !v);
                    setMobileHistoryOpen(false);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                  style={{
                    color: mobileTemplatesOpen
                      ? "#06b6d4"
                      : "rgba(255,255,255,0.4)",
                    border: `1px solid ${mobileTemplatesOpen ? "rgba(6,182,212,0.35)" : "rgba(255,255,255,0.07)"}`,
                    background: mobileTemplatesOpen
                      ? "rgba(6,182,212,0.1)"
                      : "transparent",
                  }}
                  aria-label="Templates"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>

                {/* Charts history toggle */}
                <button
                  onClick={() => {
                    setMobileHistoryOpen((v) => !v);
                    setMobileTemplatesOpen(false);
                  }}
                  className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                  style={{
                    color: mobileHistoryOpen
                      ? "#06b6d4"
                      : "rgba(255,255,255,0.4)",
                    border: `1px solid ${mobileHistoryOpen ? "rgba(6,182,212,0.35)" : "rgba(255,255,255,0.07)"}`,
                    background: mobileHistoryOpen
                      ? "rgba(6,182,212,0.1)"
                      : "transparent",
                  }}
                  aria-label="Chart history"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="3 17 9 11 13 15 21 7" />
                  </svg>
                  {chartMsgsCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[9px] font-bold"
                      style={{
                        width: 14,
                        height: 14,
                        background: "#06b6d4",
                        color: "#000",
                      }}
                    >
                      {chartMsgsCount > 9 ? "9+" : chartMsgsCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 flex min-h-0">
            {/* Template panel — desktop only (left) */}
            {!isMobile && hasMessages && <ChartTemplatePanel />}

            {/* Chart or Hero */}
            <div className="flex-1 flex flex-col min-w-0">
              {!hasMessages ? (
                <WaveHero onSend={handleSend} isLoading={isLoading} />
              ) : (
                <div className="flex-1 min-h-0 flex">
                  <SingleChartArea
                    messages={activeConv?.messages ?? []}
                    selectedAiId={selectedAiId}
                    onSaveChart={isAuthenticated ? handleSaveChart : undefined}
                  />
                </div>
              )}
              {hasMessages && (
                <InputBar onSend={handleSend} isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — chart history sidebar (desktop only) */}
        {!isMobile && hasMessages && (
          <MessageHistorySidebar
            messages={activeConv?.messages ?? []}
            selectedAiId={selectedAiId}
            onSelectAiId={setSelectedAiId}
          />
        )}
      </div>

      {/* Delete Confirmation Toast */}
      {deleteConfirmId && (
        <>
          <div
            className="fixed inset-0 z-[99] bg-black/70 backdrop-blur-md"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-red-500/40 rounded-xl shadow-2xl w-full max-w-[340px] overflow-hidden">
              <div className="p-6">
                <div className="text-white text-[15px] leading-snug text-center mb-6">
                  Are you sure you want to delete this conversation?
                  <br />
                  <span className="text-red-400 text-sm mt-1 block">
                    This action cannot be undone.
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmDeleteConversation(deleteConfirmId)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 rounded-lg transition-colors text-sm font-semibold"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
