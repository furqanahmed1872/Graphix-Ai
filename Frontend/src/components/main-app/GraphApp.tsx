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
    if (typeof window !== "undefined" && window.innerWidth >= 640)
      setSidebarOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") saveToStorage(conversations, activeId);
  }, [conversations, activeId]);

  // Auto-select latest AI chart whenever active conversation changes
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
    if (typeof window !== "undefined" && window.innerWidth < 640)
      setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined" && window.innerWidth < 640)
      setSidebarOpen(false);
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FIX: Build previousChart from the SELECTED chart's frozen message
    // content ONLY — never from window.__graphixCurrentData.
    //
    // WHY THIS WAS BROKEN:
    // window.__graphixCurrentData holds whatever chart is currently rendered
    // in the DOM (SingleChartArea's div). When you have a 3D chart rendered
    // and you click a different chart in the sidebar (selectedAiId changes),
    // the DOM still shows the 3D chart — so window.__graphixCurrentData still
    // has the 3D chart's data. Then when you say "make it red", the AI
    // receives the 3D chart as context and edits THAT instead of your
    // selected chart.
    //
    // THE FIX:
    // Read previousChart directly from the frozen message state (which is
    // keyed by message ID). This is always accurate regardless of what's
    // currently rendered in the DOM.
    //
    // TOOLBAR EDITS (palette changes, type conversions, etc.) are stored
    // per-chart in window.__graphixChartData[messageId] by SingleChartArea,
    // so we can still pick those up without reading the wrong chart.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const conv = conversations.find((c) => c.id === convId);
    const aiMessages =
      conv?.messages.filter(
        (m) => m.from === "ai" && m.status === "success" && m.content?.data,
      ) ?? [];

    // Resolve which chart the user has selected
    const contextAiId = selectedAiId ?? aiMessages.at(-1)?.id ?? null;
    const contextMsg =
      aiMessages.find((m) => m.id === contextAiId) ?? aiMessages.at(-1) ?? null;

    let previousChart: { data: any[]; layout: any } | null = null;

    if (contextMsg) {
      // Check if the user made toolbar/template edits to this specific chart.
      // SingleChartArea now stores edits keyed by message ID so we never
      // accidentally read a different chart's state.
      const perChartData =
        typeof window !== "undefined"
          ? (window as any).__graphixChartData?.[contextMsg.id]
          : null;

      previousChart = {
        data: perChartData?.data ?? contextMsg.content.data,
        layout: perChartData?.layout ?? contextMsg.content.layout,
      };
    }

    // Append user message + loading AI slot
    updateMessages(convId, (msgs) => [...msgs, userMsg, loadingAiMsg]);
    setSelectedAiId(newAiId);
    setIsLoading(true);

    // If this is a prebuilt config from CSV fast-path, skip API
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

      const res = await fetch("http://localhost:3001/api/chart", {
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

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SMART EDIT vs CREATE:
      // If action is "edit", REPLACE the previous chart instead of appending
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

        // Also clear any stale per-chart toolbar state for the edited chart
        if (typeof window !== "undefined") {
          if ((window as any).__graphixChartData) {
            delete (window as any).__graphixChartData[prevAiId];
          }
        }

        setSelectedAiId(prevAiId);
      } else {
        // Normal "create" flow — add as new chart
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
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[9] sm:hidden"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* LEFT — conversations sidebar */}
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={newConversation}
            onClose={() => setSidebarOpen(false)}
          />
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
          </div>

          {/* Body */}
          <div className="flex-1 flex min-h-0">
            {/* Template panel — left, only when chart exists */}
            {hasMessages && <ChartTemplatePanel />}

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

        {/* RIGHT — chart history sidebar */}
        {hasMessages && (
          <MessageHistorySidebar
            messages={activeConv?.messages ?? []}
            selectedAiId={selectedAiId}
            onSelectAiId={setSelectedAiId}
          />
        )}
      </div>
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
