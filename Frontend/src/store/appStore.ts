/**
 * Zustand Global Store
 *
 * Single source of truth for the entire app.
 * Hydrated ONCE after login via /api/user/bootstrap.
 * All components read from here — no duplicate DB calls.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Types ──────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  createdAt: string;
}

export interface Subscription {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "expired";
  startedAt: string | null;
  expiresAt: string | null;
}

export interface SavedChart {
  id: string;
  title: string;
  prompt: string;
  chartConfig: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // ── Dashboard display fields (populated by bootstrap) ──
  tag: string;
  category: string;
  views: number;
  trend: string;
  up: boolean;
  starred: boolean;
  desc: string;
  data: number[];
  updated: string;
}

export interface GraphTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  trend: string;
  isTrending: boolean;
  template: Record<string, any>;
  tag: string;
  count: number;
  desc: string;
}

export interface Feedback {
  id: string;
  authorName: string;
  message: string;
  rating: number;
  createdAt: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  delta: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  graph: string;
  time: string;
  avatar: string;
  own: boolean;
}

interface AppState {
  // ── Auth ──────────────────────────────────────────────────
  token: string | null;
  isAuthenticated: boolean;

  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // ── User-specific data ────────────────────────────────────
  user: User | null;
  subscription: Subscription | null;
  savedCharts: SavedChart[];

  // ── Dashboard data ────────────────────────────────────────
  dashboardStats: DashboardStat[];
  activityFeed: ActivityItem[];

  // ── Global data ───────────────────────────────────────────
  graphTemplates: GraphTemplate[];
  feedbacks: Feedback[];

  // ── UI state ──────────────────────────────────────────────
  isBootstrapped: boolean;
  isBootstrapping: boolean;
  bootstrapError: string | null;

  // ── Actions ───────────────────────────────────────────────
  setToken: (token: string) => void;
  bootstrap: () => Promise<void>;
  logout: () => void;

  addSavedChart: (chart: SavedChart) => void;
  removeSavedChart: (id: string) => void;
  updateSavedChart: (chart: SavedChart) => void;
  updateChartTitle: (id: string, title: string) => void;
  toggleStarChart: (id: string) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      user: null,
      subscription: null,
      savedCharts: [],
      dashboardStats: [],
      activityFeed: [],
      graphTemplates: [],
      feedbacks: [],
      isBootstrapped: false,
      isBootstrapping: false,
      bootstrapError: null,

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      bootstrap: async () => {
        const { token, isBootstrapping } = get();
        if (!token || isBootstrapping) return;

        set({ isBootstrapping: true, bootstrapError: null });

        try {
          const res = await fetch(`${API}/api/user/bootstrap`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 401) {
            get().logout();
            return;
          }

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to load user data.");
          }

          const data = await res.json();

          set({
            user: data.user,
            subscription: data.subscription,
            savedCharts: data.savedCharts ?? [],
            dashboardStats: data.dashboardStats ?? [],
            activityFeed: data.activityFeed ?? [],
            graphTemplates: data.globalData?.graphTemplates ?? [],
            feedbacks: data.globalData?.feedbacks ?? [],
            isBootstrapped: true,
            isBootstrapping: false,
            bootstrapError: null,
          });
        } catch (err: any) {
          set({
            isBootstrapping: false,
            bootstrapError: err.message || "Failed to load data.",
          });
        }
      },

      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          user: null,
          subscription: null,
          savedCharts: [],
          dashboardStats: [],
          activityFeed: [],
          graphTemplates: [],
          feedbacks: [],
          isBootstrapped: false,
          isBootstrapping: false,
          bootstrapError: null,
        });
      },

      addSavedChart: (chart: SavedChart) => {
        set((s) => ({ savedCharts: [chart, ...s.savedCharts] }));
      },

      removeSavedChart: (id: string) => {
        set((s) => ({ savedCharts: s.savedCharts.filter((c) => c.id !== id) }));
      },

      updateSavedChart: (chart: SavedChart) => {
        set((s) => ({
          savedCharts: s.savedCharts.map((c) =>
            c.id === chart.id ? chart : c,
          ),
        }));
      },

      updateChartTitle: (id: string, title: string) => {
        set((s) => ({
          savedCharts: s.savedCharts.map((c) =>
            c.id === id ? { ...c, title } : c,
          ),
        }));
      },

      toggleStarChart: (id: string) => {
        set((s) => ({
          savedCharts: s.savedCharts.map((c) =>
            c.id === id ? { ...c, starred: !c.starred } : c,
          ),
        }));
      },
    }),
    {
      name: "graphix-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
