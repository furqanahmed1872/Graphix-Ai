-- ─────────────────────────────────────────────────────────────
-- MIGRATION: Add share_token to saved_charts
-- UTC: 2026-04-27 15:19:16
-- Safe to run on live production — non-destructive
-- ─────────────────────────────────────────────────────────────

ALTER TABLE saved_charts
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Verify
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'saved_charts'
   AND column_name = 'share_token';
