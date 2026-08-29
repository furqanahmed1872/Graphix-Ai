# Running Graphix locally

Two Node processes (Express API + Next.js) plus a Postgres container.

| Piece    | URL                     |
| -------- | ----------------------- |
| Frontend | http://localhost:3000   |
| Backend  | http://localhost:5000   |
| Postgres | localhost:5432          |

## Prerequisites

- Node.js 20+ (tested on 24)
- Docker Desktop **running** (used only for the Postgres container)

## 1. Environment files

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env.local
```

The defaults already point at the local database and the local API.
Fill in `GROQ_API_KEY` in `Backend/.env` — without a real key, sign-up/login and
the dashboard work, but AI chart generation returns
`"All API keys exhausted"` (a bad key gets a 401, which the rotator treats as
exhausted). Get a free key at https://console.groq.com.

If chart generation fails with `model_not_found`, Groq has retired the model.
Set `GROQ_MODEL` in `Backend/.env` to a current one from
https://console.groq.com/docs/models — the default is `openai/gpt-oss-120b`.

`GOOGLE_CLIENT_*` is only needed if you want "Sign in with Google"; email/password
sign-up works without it.

## 2. Start the database

```bash
docker compose -f docker-compose.dev.yml up -d
```

This runs Postgres 16 on port 5432 with the credentials in `DATABASE_URL` and
installs the `uuid-ossp` extension that the schema's UUID defaults need.

> `docker-compose.yml` (no `.dev`) is the **deployment** setup — it builds both
> apps and expects an external database. Don't use it for local work.

## 3. Install dependencies + create the schema

```bash
cd Backend  && npm install && npm run db:setup
cd ../Frontend && npm install
```

`npm run db:setup` = `prisma generate` + `prisma db push` + seed. The seed adds
the global graph templates and testimonial feedback the UI reads; it is
idempotent, so re-running it is safe.

## 4. Run both apps (two terminals)

```bash
cd Backend  && npm run dev    # http://localhost:5000
cd Frontend && npm run dev    # http://localhost:3000
```

Check the API is alive: `curl http://localhost:5000/api/status`

## Useful commands

| Command                                        | What it does                          |
| ---------------------------------------------- | ------------------------------------- |
| `npm run db:push` (Backend)                    | Sync schema.prisma → database         |
| `npm run db:seed` (Backend)                    | Re-run the idempotent seed            |
| `npm run db:studio` (Backend)                  | Browse the data in Prisma Studio      |
| `docker compose -f docker-compose.dev.yml down` | Stop the database (keeps data)        |
| `docker compose -f docker-compose.dev.yml down -v` | Stop and **delete** all data       |

## Notes

- **Prisma 7 needs a driver adapter.** `Backend/prisma/client.js` constructs
  `PrismaClient` with `PrismaPg` from `@prisma/adapter-pg`. Without it the client
  throws `Using engine type "client" requires either "adapter" or "accelerateUrl"`.
  The datasource URL comes from `DATABASE_URL` (CLI reads it via `prisma.config.ts`).
- **Routes.** There is no `GET /api/charts`; the dashboard loads everything from
  `GET /api/user/bootstrap`. Sign-in lives at `/signin`, not `/login`.
- **Ports.** Local dev uses 3000/5000. `docker-compose.yml` maps those to 3080/5080
  on the host, which is why `CLIENT_URL` differs between the two setups.
- **`.env` is not watched.** `npm run dev` uses `node --watch`, which only watches
  loaded modules. After editing `Backend/.env`, restart the server by hand.
- **Stopping the backend.** Use Ctrl+C. Killing only the terminal can leave the
  `node --watch` supervisor alive; it will keep respawning and fight the next
  start for port 5000. If you see `Port 5000 busy, retrying`, look for stray
  `node --watch index.js` processes and kill them.
