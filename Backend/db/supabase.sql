-- ═══════════════════════════════════════════════════════════════
-- GRAPHIX — Supabase schema
--
-- Run this once in the Supabase SQL Editor on a fresh project.
-- Safe to re-run: every statement is idempotent.
--
-- Two deliberate differences from the old local init.sql:
--
--   1. gen_random_uuid() instead of uuid_generate_v4(). It is built into
--      Postgres 13+, so no extension is needed. Supabase installs uuid-ossp
--      into a separate `extensions` schema, where an unqualified
--      uuid_generate_v4() call does not resolve from `public`.
--
--   2. password_hash is NULLABLE. Google OAuth users never have one, and
--      the old NOT NULL constraint made that sign-in path fail.
-- ═══════════════════════════════════════════════════════════════

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,                                  -- NULL for OAuth accounts
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  avatar        TEXT NOT NULL DEFAULT 'U',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Subscriptions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan       TEXT NOT NULL DEFAULT 'free',    -- 'free' | 'pro' | 'enterprise'
  status     TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'cancelled' | 'expired'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Saved charts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_charts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT 'Untitled Chart',
  prompt       TEXT NOT NULL DEFAULT '',
  chart_config JSONB NOT NULL DEFAULT '{}',

  tag          TEXT NOT NULL DEFAULT 'Line',
  category     TEXT NOT NULL DEFAULT 'General',
  description  TEXT NOT NULL DEFAULT '',
  views        INT  NOT NULL DEFAULT 0,
  trend        TEXT NOT NULL DEFAULT '0%',
  trend_up     BOOLEAN NOT NULL DEFAULT TRUE,
  starred      BOOLEAN NOT NULL DEFAULT FALSE,
  sparkline    JSONB NOT NULL DEFAULT '[]',
  share_token  TEXT UNIQUE,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prisma's @@unique([id, userId]) — lets a chart be fetched scoped to its
-- owner in one indexed lookup.
CREATE UNIQUE INDEX IF NOT EXISTS saved_charts_id_user_id_key
  ON public.saved_charts (id, user_id);

-- ── Activity log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,   -- 'Created' | 'Edited' | 'Shared' | 'Starred' | 'Deleted'
  chart_id    UUID REFERENCES public.saved_charts(id) ON DELETE SET NULL,
  chart_title TEXT NOT NULL DEFAULT '',
  avatar      TEXT NOT NULL DEFAULT 'U',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Graph templates (global) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.graph_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL DEFAULT '',
  template    JSONB NOT NULL DEFAULT '{}',
  trend       TEXT NOT NULL DEFAULT '',
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  tag         TEXT NOT NULL DEFAULT 'General',
  chart_count INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Feedbacks (global) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  message     TEXT NOT NULL,
  rating      INT  NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes (mirroring @@index in schema.prisma) ─────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_charts_user_id
  ON public.saved_charts (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_charts_user_updated
  ON public.saved_charts (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
  ON public.activity_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_graph_templates_trending
  ON public.graph_templates (is_trending, created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at
  ON public.feedbacks (created_at DESC);

-- ── Groq key state ───────────────────────────────────────────
-- Serverless functions get a fresh process per invocation, so the key
-- cooldowns that used to live in memory never survived. Without this table
-- a rate-limited key is retried immediately and a revoked key is retried
-- forever, which is exactly the failure this was meant to prevent.
--
-- Keyed by fingerprint, not by position in .env: reordering the variables
-- or swapping a key must not inherit another key's cooldown. The key itself
-- is never stored — only a SHA-256 prefix.
CREATE TABLE IF NOT EXISTS public.groq_key_state (
  fingerprint    TEXT PRIMARY KEY,
  status         TEXT NOT NULL DEFAULT 'available',  -- 'available' | 'cooling' | 'invalid'
  cooldown_until TIMESTAMPTZ,
  last_error     TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only unavailable keys are ever queried, so index that path.
CREATE INDEX IF NOT EXISTS idx_groq_key_state_unavailable
  ON public.groq_key_state (status, cooldown_until)
  WHERE status <> 'available';

-- ── Rate limit counters ──────────────────────────────────────
-- Only the auth limiter uses this. The general /api limiter stays in memory
-- deliberately: DB-backing it would mean a write on every request to enforce
-- an anti-scraping cap, which costs more than it protects.
CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
  key        TEXT PRIMARY KEY,
  hits       INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Lets expired rows be swept cheaply.
CREATE INDEX IF NOT EXISTS idx_rate_limit_expires
  ON public.rate_limit_hits (expires_at);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — do not skip this
--
-- Supabase publishes every table in `public` through PostgREST, reachable
-- with the anon key. That key ships in browser code, so without RLS anyone
-- could read the whole users and saved_charts tables straight from the API.
--
-- Graphix never uses PostgREST — the Express backend talks to Postgres
-- directly over DATABASE_URL. So enable RLS with NO policies: PostgREST
-- (anon / authenticated roles) is denied everything, while the owner role
-- your backend connects as bypasses RLS and keeps working normally.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_charts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groq_key_state  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;

-- Belt and braces: revoke the PostgREST roles outright as well. Guarded so
-- this file also runs on a plain Postgres (local, CI) where those Supabase
-- roles do not exist — an unguarded REVOKE would abort the whole script and
-- the seed below would never run.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- SEED — global templates and testimonials the UI reads on load.
-- Guarded so re-running the file does not duplicate rows.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.graph_templates (title, category, description, trend, is_trending, tag, chart_count)
SELECT * FROM (VALUES
  ('Monthly Revenue',    'Business',  'Track revenue trends over months',          '+12.4%', TRUE,  'Finance',   6),
  ('User Growth',        'Analytics', 'Visualize user acquisition over time',      '+8.1%',  TRUE,  'Growth',    5),
  ('Sales by Region',    'Business',  'Compare sales across different regions',    '+5.3%',  FALSE, 'Business',  4),
  ('Website Traffic',    'Analytics', 'Monitor page visits and sessions',          '+22.7%', TRUE,  'Marketing', 7),
  ('Product Comparison', 'Marketing', 'Side-by-side product metrics',              '-1.2%',  FALSE, 'Product',   5),
  ('Expense Breakdown',  'Finance',   'Pie chart of spending categories',          '+0.8%',  FALSE, 'Finance',   4)
) AS seed(title, category, description, trend, is_trending, tag, chart_count)
WHERE NOT EXISTS (SELECT 1 FROM public.graph_templates);

INSERT INTO public.feedbacks (author_name, message, rating)
SELECT * FROM (VALUES
  ('Alex Kim',       'Graphix turned our CSV data into beautiful dashboards instantly. Game changer!', 5),
  ('Sarah Chen',     'The AI understands exactly what chart I need. Incredibly intuitive.',            5),
  ('Marcus Johnson', 'Saved hours of work every week. The templates are spot-on.',                    4),
  ('Priya Patel',    'Best data viz tool I have used. Our presentations look so professional now.',   5)
) AS seed(author_name, message, rating)
WHERE NOT EXISTS (SELECT 1 FROM public.feedbacks);

-- ── Verify ───────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM public.graph_templates) AS templates,
  (SELECT COUNT(*) FROM public.feedbacks)       AS feedbacks;
