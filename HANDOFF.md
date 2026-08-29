# Graphix — session handoff

Written so a fresh Claude session (or a person) can pick this up cold.
**No secrets in this file.** Real values live in `Backend/.env`, which is
gitignored and must stay that way.

---

## What this project is

| Part | Stack | Location |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router, React 19, Turbopack), Plotly | `Frontend/` |
| Backend | Express 4 (ESM), Prisma 7 + `@prisma/adapter-pg` | `Backend/` |
| Database | Supabase Postgres (`us-east-1`) | schema in `Backend/db/supabase.sql` |
| AI | Groq, rotating across multiple API keys | `Backend/ai/` |

Deployment target: **Netlify**, hosting both halves — the Next.js site plus
the Express API as a serverless function at `/api/*`.

---

## Current state

### Working and verified

- **Supabase (`us-east-1`) is live.** 8 tables, RLS enabled on all of them,
  seed data present (6 graph templates, 4 feedbacks). Verified with a real
  Prisma write/read/cascade-delete round-trip.
- **The whole API works through the serverless handler.** `status`,
  `feedback`, `signup`, `login` and `bootstrap` all return 200/201 when
  invoked as a Lambda-style event locally.
- **Local development still works** — `cd Backend && npm run dev` listens on
  :5000 exactly as before.

### Not done

- Nothing is deployed yet. No Netlify site exists.
- 3 of 4 Groq keys return `Invalid API Key` and need regenerating.
- `max_tokens: 4096` at `Backend/ai/chartRoute.js:336` is still throttling
  capacity (see *Capacity* below).
- Dashboard has three dead buttons (see *Known issues*).

---

## What was fixed this session

### 1. Groq keys: only one was ever loading

`Backend/.env` defines `GROQ_API_KEY_1..4`, but the loader read
`GROQ_KEY_1..50` — no `API`. The loop matched nothing and fell through to the
single-key fallback, so the app ran on one key while appearing to have four.

Fixed in `Backend/ai/keyRotation.js`: both spellings are accepted, duplicates
are deduped (two names for one key is still one quota), placeholders are
skipped, and startup logs which variables were found.

### 2. Groq key cooldowns didn't survive a restart

Cooldowns lived in memory. On serverless each request can hit a fresh
container, so a rate-limited key was retried immediately and a revoked key
was retried forever — the exact failures rotation exists to prevent.

Now persisted in a `groq_key_state` table, keyed by **SHA-256 fingerprint**
rather than position in `.env`, so reordering variables or swapping a key
can't inherit another key's cooldown. The key itself is never stored. Falls
back to in-process state if the table is unreachable, so a database blip
can't stop chart generation.

*Verified:* wrote state in one process, a completely separate process still
saw it.

### 3. Rate limiter counted per process

`express-rate-limit`'s default MemoryStore meant an attacker got a fresh
allowance on every cold start.

The **auth** limiter now shares counters through Postgres
(`Backend/middleware/pgRateLimitStore.js`) using a single atomic upsert — a
read-then-write would let concurrent requests undercount. It **fails open**:
a database blip should not lock everyone out of signing in.

The **general** `/api` limiter deliberately stays in memory. DB-backing a
300/min anti-scraping cap would cost a database write on every request,
which costs more than it protects.

*Verified:* hits 1 and 2 in one process, hit 3 in a fresh process.

### 4. `bcrypt` would have broken the bundle

`bcrypt` is a native compiled module and the local prebuild was
`darwin-arm64` — macOS. Netlify runs Linux x64, and serverless bundlers
mis-package native modules.

Swapped to `bcryptjs` (pure JS). *Verified compatible:* same `$2b$10$`
format, cross-verifies in both directions, wrong passwords still rejected,
84ms. **Existing password hashes still validate** — no user is locked out.

### 5. Serverless wrapper

`Backend/index.js` now exports the app and only calls `app.listen()` when run
directly, so one file serves both local dev and the function handler.

`netlify/functions/api.js` wraps it with `serverless-http`. A root
`package.json` exists solely so that function can resolve its own
dependencies — Node resolves upward from `netlify/functions/` and never
reaches `Backend/node_modules`.

**The API is now same-origin with the site** (`/api/*` → the function). That
deletes CORS entirely: no `CLIENT_URL` to keep in sync, no
`NEXT_PUBLIC_API_URL`, no preflight failures. Those are the two things that
usually eat an hour on a first deploy.

### 6. Supabase schema

`Backend/db/supabase.sql` — idempotent, tested by running it twice against a
real Postgres and then driving Prisma against the result.

Three deliberate choices:

- **`gen_random_uuid()`** instead of `uuid_generate_v4()`. Built into
  Postgres 13+. Supabase installs uuid-ossp into a separate `extensions`
  schema where the unqualified call doesn't resolve from `public`.
- **`password_hash` is nullable.** Google OAuth users never have one; the old
  `NOT NULL` broke that sign-in path.
- **RLS enabled with no policies.** Supabase publishes every `public` table
  through PostgREST using the anon key, which ships in browser JavaScript.
  Without this, anyone could read the entire `users` and `saved_charts`
  tables straight from the API. The backend connects as the owner and
  bypasses RLS, so nothing changes for the app.

---

## Next steps

### 1. Push to the new repo

Everything is in the working tree. Commit and push it.

### 2. Create the Netlify site

New site from Git → pick the repo → **leave the base directory empty**. The
root `netlify.toml` handles the build:

```
npm ci && npm --prefix Backend ci && npm --prefix Backend exec prisma generate
  && npm --prefix Frontend ci && npm --prefix Frontend run build
```

Environment variables to set:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler, port **6543**, with `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase session pooler, port **5432** (only used by `prisma db push` locally) |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `GROQ_API_KEY_1..N` | working Groq keys |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |

Do **not** set `CLIENT_URL` or `NEXT_PUBLIC_API_URL` — same origin now.

### 3. Regenerate the dead Groq keys

console.groq.com. Keys on **separate accounts** get separate quotas — this
was verified empirically: burning 4,000 tokens on one key moved another
key's remaining by 0.

### 4. Smoke test

Sign up with a throwaway account, then generate a chart. That exercises the
database, JWT, and Groq in two clicks.

---

## Known issues

**Three dead dashboard buttons.** `Frontend/src/components/dashboard/DashboardContent.tsx`
lines 617, 624, 631 — *Google Sheets*, *Upload File*, *Paste Data* are all
`onClick={() => {}}` while the FAQ tells people to use them. First thing a
curious visitor clicks.

**`max_tokens: 4096`** at `Backend/ai/chartRoute.js:336`. See *Capacity*.

**Dead CSS.** `Frontend/src/app/globals.css` still holds ~30 unused `.gx-*`
rules from a previous landing page. They caused a real namespace collision
once already.

**Secrets in the old repo's git history.** The previous (cousin's) repo has
`Backend/.env` committed across several commits with a real `GROQ_API_KEY`,
`JWT_SECRET` and `DATABASE_URL`, and it is public. Removing the file from
tracking did not remove it from history. Treat every value that was ever in
it as public — use new ones everywhere. This is very likely why keys were
being rate-limited without use: public repos are scraped for `gsk_` keys
within minutes.

---

## Capacity — measured, not estimated

- A chart generation uses **~1,200 tokens** (measured: 1,149 and 1,249).
- But **Groq bills the `max_tokens` reservation against your per-minute
  limit, not actual usage.** Proven: a call with `max_tokens: 4096` consumed
  4,113 TPM while using only 128 actual tokens.
- Each key has its own 8,000 TPM, and keys on separate accounts are
  genuinely independent.

So: **8,000 ÷ 4,100 ≈ 1.9 generations per minute per key.**

Dropping `max_tokens` from 4096 to 1536 roughly **triples** throughput at no
quality cost — real completions measure 222–319 tokens, so 1536 leaves 5×
headroom. Keep the existing "answer was cut off" 502 handler as the guard.

Generation latency is **~1 second**, well inside serverless timeouts.

---

## Gotchas discovered the hard way

- **Supabase passwords with special characters must be URL-encoded.** The
  current one contains `^`, encoded as `%5E`. Unencoded, the connection
  string mis-parses and gives a confusing auth error.
- **Use the pooler host for both URLs.** Supabase's "Direct connection"
  (`db.<ref>.supabase.co`) is IPv6-only on new projects and unreachable from
  most hosts. The session pooler is the IPv4 equivalent.
- **Region matters.** Supabase is `us-east-1` to match Netlify Functions,
  which default to US East. A mismatch adds ~200ms to every query, and
  `bootstrap` makes several.
- **`Math.cos`/`Math.sin` differ in the last bit between Node and Chrome.**
  Using them in inline styles causes React hydration mismatches — round with
  `.toFixed(3)`.
- **Don't put this backend on Vercel or any serverless host without the
  fixes above** — and note Vercel's Hobby plan forbids commercial use, with
  shutdown "without notice" as the enforcement.

---

## Useful commands

```bash
# Local dev
docker compose -f docker-compose.dev.yml up -d      # local Postgres
cd Backend && npm run dev                           # API on :5000
cd Frontend && npm run dev                          # site on :3000

# Database
cd Backend && npm run db:push                       # sync schema.prisma
cd Backend && npm run db:studio                     # browse data

# Checks
cd Frontend && npx tsc --noEmit && npm run build
cd Backend  && node --check index.js
```

To re-apply the schema to a fresh Supabase project: paste all of
`Backend/db/supabase.sql` into the SQL Editor and run it. The final statement
prints `templates | feedbacks` — expect `6 | 4`.
