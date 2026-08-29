# Deploying Graphix

Frontend on **Netlify**, backend on **Render**, database on **Supabase**.
All three have free tiers that permit commercial use.

> The backend must run as a persistent container, **not** serverless. The Groq
> key cooldowns in `ai/keyRotation.js` and the `express-rate-limit` counters in
> `index.js` are in-memory. On serverless each invocation gets a fresh copy, so
> cooldowns would never stick and the auth rate limiter would stop limiting.
> `Backend/vercel.json` is a leftover — don't use it.

---

## 1. Database — Supabase

1. Create a project. Save the database password; it appears once.
2. SQL Editor → paste all of **`Backend/db/supabase.sql`** → Run.
   The last statement prints `templates | feedbacks` — expect `6 | 4`.
3. Project Settings → Database → Connection string. You need **two**:

   | Variable | Port | Used for |
   | --- | --- | --- |
   | `DATABASE_URL` | **6543** (pooler) | all app traffic |
   | `DIRECT_URL` | **5432** (direct) | `prisma db push` / migrations |

   Append `?pgbouncer=true&connection_limit=1` to the pooler URL. PgBouncer
   runs in transaction mode and can't hold the prepared statements or advisory
   locks migrations need — that's why both exist.

The SQL enables Row Level Security with no policies on every table. That's
deliberate: Supabase exposes `public` through PostgREST using the anon key,
which ships in browser code. RLS blocks that path while your backend's owner
connection is unaffected.

---

## 2. Backend — Render

New → Blueprint → select this repo. `render.yaml` sets everything except the
secrets, which Render prompts for:

| Variable | Value |
| --- | --- |
| `CLIENT_URL` | your Netlify URL — **exact**, no trailing slash |
| `DATABASE_URL` | Supabase pooler (6543) |
| `DIRECT_URL` | Supabase direct (5432) |
| `JWT_SECRET` | generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `GROQ_API_KEY_1..N` | your working keys |

`CLIENT_URL` is the one people get wrong. It's the CORS allow-list — if it
doesn't match the browser's origin character for character, every request
fails with an opaque CORS error rather than a useful message.

Verify: `curl https://<service>.onrender.com/api/status` → `{"status":"ok"}`

**Free tier behaviour.** Spins down after 15 minutes idle; the next request
waits 30–60s. You get 750 instance-hours/month, so pinging to stay warm
consumes essentially the whole allowance — free *or* warm, not both. The $7
Starter plan removes the spin-down and is the first upgrade worth making.

---

## 3. Frontend — Netlify

New site from Git → base directory `Frontend`. `netlify.toml` handles the
build; set one environment variable:

```
NEXT_PUBLIC_API_URL = https://<your-service>.onrender.com
```

This is inlined at **build** time, not read at runtime. Changing it later
requires a redeploy, not just a restart.

---

## 4. After the first deploy

- Sign up with a throwaway account and confirm the dashboard loads — that
  exercises the DB, JWT and CORS in one go.
- Generate a chart to confirm the Groq keys reached the server.
- Supabase free **pauses a project after 7 days with no requests**, and
  resuming is manual. An uptime pinger every ~10 min keeps both Supabase awake
  and Render warm, at the cost of the instance-hours noted above.

---

## Known blockers

- **`Backend/ai/dataset.js` and `Backend/ai/localEdit.js` are untracked** but
  imported by `chartRoute.js` (lines 18–19). Deploy without committing them and
  the backend dies on boot with `Cannot find module './dataset.js'`.
- **Key hygiene.** Three of the four Groq keys currently configured return
  `Invalid API Key`. Check before deploying, or you'll ship with a fraction of
  the capacity you think you have.
- **`Backend/.env` is in git history** on a public repo, including a real
  `GROQ_API_KEY`, `JWT_SECRET` and `DATABASE_URL`. Removing it from tracking
  didn't remove it from history. Use new values everywhere in production —
  the old ones should be treated as public.

---

## Capacity

Measured, not estimated:

- A chart generation uses ~1,200 tokens, but Groq bills the **`max_tokens`
  reservation** against your per-minute limit, not actual usage. With
  `max_tokens: 4096` each request costs ~4,100 TPM.
- Each key gets its own 8,000 TPM — verified independent, keys on separate
  accounts genuinely multiply.
- So: **8,000 ÷ 4,100 ≈ 1.9 generations per minute per key.**

Lowering `max_tokens` from 4096 to 1536 in `chartRoute.js` roughly triples
throughput at no quality cost, since real completions measure 222–319 tokens.
