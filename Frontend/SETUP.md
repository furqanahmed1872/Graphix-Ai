# Graphix — Full Stack Database Setup Guide

## What Was Added

### Backend (server/)
- `db/init.sql` — PostgreSQL schema (users, subscriptions, saved_charts, graph_templates, feedbacks)
- `db/pool.js` — pg connection pool
- `middleware/auth.js` — JWT sign + verify middleware
- `routes/auth.js` — POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me
- `routes/user.js` — GET /api/user/bootstrap (single call loads ALL user data)
- `routes/charts.js` — POST/DELETE/PATCH /api/charts
- `index.js` — Updated with all new routes

### Frontend (client/src/)
- `store/appStore.ts` — Zustand global store (token, user, subscription, charts, templates, feedbacks)
- `lib/api.ts` — API helper functions
- `components/AppBootstrapper.tsx` — Splash screen wrapper that calls /bootstrap on login
- `components/RouteGuard.tsx` — Client-side route protection
- `middleware.ts` — Next.js edge middleware (server-side route guard)
- `components/auth/LoginForm.tsx` — Updated: real API call + token store + bootstrap
- `components/auth/SignupForm.tsx` — Updated: real API call + auto-login after signup
- `components/dashboard/DashboardContent.tsx` — Reads ALL data from Zustand (no API calls)
- `app/layout.tsx` — Wraps everything in AppBootstrapper
- `app/dashboard/page.tsx` — Wrapped in RouteGuard
- `app/app/page.tsx` — Wrapped in RouteGuard

---

## Step 1 — Install Dependencies

### Backend
```bash
cd server
npm install pg bcrypt jsonwebtoken
```

### Frontend
```bash
cd client
npm install zustand
```

---

## Step 2 — Set Up Environment Variables

### server/.env (copy from .env.example)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=graphix_db
DB_USER=graphix_user
DB_PASSWORD=graphix_pass
JWT_SECRET=change_this_to_a_long_random_string
GROQ_API_KEYS=your_groq_key_here
PORT=3001
CLIENT_URL=http://localhost:3000
```

### client/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Step 3 — Start PostgreSQL with Docker

```bash
# From the project root (where docker-compose.yml is)
docker-compose up -d

# Verify it started
docker ps
# Should show graphix_db running on port 5432

# Check DB initialized correctly
docker exec -it graphix_db psql -U graphix_user -d graphix_db -c "\dt"
# Should list: users, subscriptions, saved_charts, graph_templates, feedbacks
```

The `init.sql` runs automatically on first start and seeds the templates + feedbacks tables.

---

## Step 4 — Start the Backend

```bash
cd server
npm run dev
# Server running on http://localhost:3001
```

Test it:
```bash
curl http://localhost:3001/api/status
# {"status":"ok","timestamp":"..."}
```

---

## Step 5 — Start the Frontend

```bash
cd client
npm run dev
# Running on http://localhost:3000
```

---

## How It All Works

### Login Flow
1. User submits login form
2. `LoginForm` calls `POST /api/auth/login`
3. Backend validates password, returns JWT token
4. Token stored in Zustand (persisted to localStorage) AND cookie (for Next.js middleware)
5. `bootstrap()` called — single `GET /api/user/bootstrap` fetches everything in parallel
6. Zustand store populated with: user, subscription, savedCharts, graphTemplates, feedbacks
7. AppBootstrapper shows splash screen during bootstrap, then renders the app
8. User lands on /dashboard — all data already available, zero extra API calls

### Route Guard (two layers)
- **Server-side**: `middleware.ts` — runs at edge, checks cookie, redirects before page renders
- **Client-side**: `RouteGuard` component — second layer, handles Zustand state

### Returning User
1. User opens the site with existing token in localStorage
2. AppBootstrapper detects `isAuthenticated: true` from persisted Zustand state
3. Calls `bootstrap()` automatically to refresh all data
4. Splash screen shows briefly, then app renders with fresh data

### Chart Auto-save
When a chart is generated in `/app`:
1. Chart config stored in Zustand (in-memory conversations)
2. Simultaneously saved to DB via `POST /api/charts`
3. `addSavedChart()` updates Zustand instantly (optimistic UI)
4. Chart appears on Dashboard immediately without refresh

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Account info (email, hashed password, name, avatar) |
| `subscriptions` | Plan info per user (free/pro/enterprise) |
| `saved_charts` | User's generated charts with Plotly config (JSONB) |
| `graph_templates` | Global chart templates (seeded, visible to all) |
| `feedbacks` | Global testimonials (seeded, shown on landing + dashboard) |

---

## Troubleshooting

**Docker won't start:**
```bash
docker-compose down -v  # remove old volume
docker-compose up -d    # fresh start
```

**"column X does not exist" errors:**
The init.sql only runs on first DB creation. If you changed the schema:
```bash
docker-compose down -v   # destroys volume
docker-compose up -d     # re-creates with new schema
```

**JWT errors on frontend:**
Clear localStorage: `localStorage.removeItem('graphix-store')` and sign in again.

**CORS errors:**
Make sure `CLIENT_URL=http://localhost:3000` in server/.env matches your frontend URL.
