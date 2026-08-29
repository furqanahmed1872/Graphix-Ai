# Graphix — Backend

Express API for Graphix: auth (JWT + optional Google OAuth), saved charts,
feedback, and AI chart generation via Groq. Data access is Prisma 7 over
PostgreSQL.

**To run the whole stack locally, follow [../LOCAL_DEV.md](../LOCAL_DEV.md).**

## Quick start

```bash
cp .env.example .env      # then fill in GROQ_API_KEY
docker compose -f ../docker-compose.dev.yml up -d
npm install
npm run db:setup          # generate + push schema + seed
npm run dev               # http://localhost:5000
```

## Scripts

| Script             | Description                                     |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start with `node --watch` (auto-restart)        |
| `npm start`        | Start without watching                          |
| `npm run db:push`  | Sync `prisma/schema.prisma` to the database     |
| `npm run db:seed`  | Seed global templates + feedback (idempotent)   |
| `npm run db:setup` | `generate` + `db:push` + `db:seed`              |
| `npm run db:studio`| Open Prisma Studio                              |

## Routes

| Method | Path                        | Auth | Purpose                       |
| ------ | --------------------------- | ---- | ----------------------------- |
| GET    | `/api/status`               | –    | Health check                  |
| POST   | `/api/auth/signup`          | –    | Create account                |
| POST   | `/api/auth/login`           | –    | Log in                        |
| GET    | `/api/auth/me`              | ✓    | Current user                  |
| GET    | `/api/auth/google`          | –    | Start Google OAuth            |
| GET    | `/api/auth/google/callback` | –    | OAuth redirect target         |
| GET    | `/api/user/bootstrap`       | ✓    | User + subscription + charts  |
| PATCH  | `/api/user/profile`         | ✓    | Update profile                |
| POST   | `/api/charts`               | ✓    | Save a chart                  |
| GET    | `/api/charts/:id`           | ✓    | Read one chart                |
| PATCH  | `/api/charts/:id`           | ✓    | Update a chart                |
| POST   | `/api/charts/:id/star`      | ✓    | Toggle star                   |
| POST   | `/api/charts/:id/share`     | ✓    | Issue a public share token    |
| DELETE | `/api/charts/:id`           | ✓    | Delete a chart                |
| GET    | `/api/charts/share/:token`  | –    | Read a shared chart           |
| GET    | `/api/feedback`             | –    | List feedback                 |
| POST   | `/api/feedback`             | ✓    | Submit feedback               |
| GET    | `/api/feedback/mine`        | ✓    | Own feedback                  |
| DELETE | `/api/feedback/:id`         | ✓    | Delete own feedback           |
| POST   | `/api/graph`                | ✓    | Generate a chart from a prompt|

Environment variables are documented in [../ENV.md](../ENV.md) and `.env.example`.
