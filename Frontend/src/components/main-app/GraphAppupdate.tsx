"use client";

/**
 * GraphApp — now integrated with auth + Zustand
 * When a chart is generated, user can save it to DB (via backend).
 * Saved charts persist to their account, shown on dashboard.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChartArea";
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

const INITIAL_CONV = createConversation();
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function GraphApp() {
  const [conversations, setConversations] = useState<Conversation[]>([INITIAL_CONV]);
  const [activeId, setActiveId] = useState<string>(INITIAL_CONV.id);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<Record<string, "saving" | "saved" | "error">>({});

  const chatRef = useRef<HTMLDivElement>(null);

  // Get token + actions from Zustand
  const { token, isAuthenticated, addSavedChart } = useAppStore();

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640) {
      setSidebarOpen(true);
    }
  }, []);

  const activeConv = conversations.find((c) => c.id === activeId);
  const hasMessages = (activeConv?.messages?.length ?? 0) > 0;

  const updateMessages = useCallback(
    (convId: string, updater: Message[] | ((prev: Message[]) => Message[])) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const messages = typeof updater === "function" ? updater(c.messages) : updater;
          const firstUser = messages.find((m) => m.from === "user");
          const newTitle = firstUser
            ? firstUser.content.slice(0, 30) + (firstUser.content.length > 30 ? "…" : "")
            : c.title;
          return { ...c, messages, title: newTitle };
        })
      );
    },
    []
  );

  const newConversation = () => {
    const hasEmpty = conversations.some((c) => c.title === "New conversation" && c.messages.length === 0);
    if (hasEmpty) {
      const empty = conversations.find((c) => c.title === "New conversation" && c.messages.length === 0)!;
      setActiveId(empty.id);
    } else {
      const c = createConversation();
      setConversations((prev) => [c, ...prev]);
      setActiveId(c.id);
    }
    if (typeof window !== "undefined" && window.innerWidth < 640) setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined" && window.innerWidth < 640) setSidebarOpen(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      }, 80);
    }
  }, [activeConv?.messages?.length]);

  // ── Save chart to DB ──────────────────────────────────────────
  const handleSaveChart = async (messageId: string, chartConfig: any, prompt: string, title: string) => {
    if (!token || !isAuthenticated) return;
    setSaveStatus((s) => ({ ...s, [messageId]: "saving" }));
    try {
      const saved = await apiSaveChart(token, { title, prompt, chartConfig });
      addSavedChart(saved); // update Zustand store optimistically
      setSaveStatus((s) => ({ ...s, [messageId]: "saved" }));
    } catch {
      setSaveStatus((s) => ({ ...s, [messageId]: "error" }));
    }
  };

  const handleSend = async (input: string, fileContent: string, fileName: string, prebuiltConfig?: any) => {
    if (!input.trim() || isLoading || !activeId) return;
    const convId = activeId;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      from: "user",
      content: input,
      status: "success",
      hasFile: !!fileContent,
      fileName,
    };
    const aiMsg: Message = { id: crypto.randomUUID(), from: "ai", content: "", status: "loading" };

    updateMessages(convId, (msgs) => [...msgs, userMsg, aiMsg]);
    setIsLoading(true);

    if (prebuiltConfig) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) => (m.id === aiMsg.id ? { ...m, content: prebuiltConfig, status: "success" } : m))
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, fileContent }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const config = await res.json();
      updateMessages(convId, (msgs) =>
        msgs.map((m) => (m.id === aiMsg.id ? { ...m, content: config, status: "success" } : m))
      );

      // Auto-save if logged in
      if (isAuthenticated && token) {
        await handleSaveChart(aiMsg.id, config, input, input.slice(0, 50));
      }
    } catch (err: any) {
      updateMessages(convId, (msgs) =>
        msgs.map((m) =>
          m.id === aiMsg.id ? { ...m, content: err.message || "Failed to generate chart", status: "error" } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="graph-app-root fixed inset-0 overflow-hidden" style={{ background: "#09090f" }}>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js" async />
      <StarField />

      <div className="app-shell flex h-dvh relative z-10">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[9] sm:hidden"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={newConversation}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <div className="main flex-1 flex flex-col min-w-0 relative">
          <div
            className="topbar flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 flex-shrink-0"
            style={{
              background: "rgba(9,9,15,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {!sidebarOpen && (
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0"
                style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}
                onClick={() => setSidebarOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <span className="text-sm font-medium truncate flex-1 min-w-0" style={{ color: "rgba(255,255,255,0.55)" }}>
              {activeConv?.title || "Graphix"}
            </span>

            {/* Dashboard link */}
            {isAuthenticated && (
              <a
                href="/dashboard"
                style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textDecoration: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "4px 10px" }}
              >
                Dashboard
              </a>
            )}
          </div>

          <div
            ref={chatRef}
            className="chat-area flex-1 overflow-y-auto overscroll-contain"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
          >
            {!hasMessages ? (
              <WaveHero onSend={handleSend} isLoading={isLoading} />
            ) : (
              <div className="py-4 sm:py-6 px-2 sm:px-4 md:px-6">
                <ChatArea messages={activeConv?.messages ?? []} />
              </div>
            )}
          </div>

          {hasMessages && <InputBar onSend={handleSend} isLoading={isLoading} />}
        </div>
      </div>
    </div>
  );
}
