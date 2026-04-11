# Environment Variables Guide

Complete documentation of all environment variables used in the Graphix-Ai project.

## Table of Contents

- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Setup Instructions](#setup-instructions)
- [Development vs Production](#development-vs-production)

---

## Backend Environment Variables

Located in: `Backend/.env.example`

### Required Variables

| Variable | Type | Example | Description |
|----------|------|---------|-------------|
| `PORT` | Number | `5000` | Server port (5000 for local, 5000 in container) |
| `CLIENT_URL` | URL | `http://localhost:3080` | Frontend URL for CORS validation |
| `JWT_SECRET` | String | `your_secret_key` | Secret key for signing JWT tokens (min 32 chars) |
| `DATABASE_URL` | URL | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |
| `GROQ_API_KEY` | String | `your_groq_key` | Groq LLM API key (get from console.groq.com) |

### Optional Variables

| Variable | Type | Example | Default | Description |
|----------|------|---------|---------|-------------|
| `NODE_ENV` | String | `development` \| `production` | `development` | Server environment mode |
| `JWT_EXPIRES_IN` | String | `7d` | `7d` | Token expiration (uses ms format) |
| `GROQ_KEY_1` to `GROQ_KEY_50` | String | `key_1...key_50` | - | Multiple API keys for rotation |

### Backend Variables by Feature

**Authentication:**
- `JWT_SECRET` - Signs and verifies tokens
- `JWT_EXPIRES_IN` - How long tokens remain valid

**Database:**
- `DATABASE_URL` - Connects to PostgreSQL

**API/Server:**
- `PORT` - Server listening port
- `CLIENT_URL` - CORS origin for frontend
- `NODE_ENV` - Environment mode

**AI/LLM:**
- `GROQ_API_KEY` - Single API key for Groq
- `GROQ_KEY_1` through `GROQ_KEY_50` - Multiple keys for rotation

---

## Frontend Environment Variables

Located in: `Frontend/.env.example`

### Required Variables

| Variable | Type | Example | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | URL | `http://localhost:5080` | Backend API endpoint accessible from browser |

### Optional Variables

| Variable | Type | Example | Description |
|----------|------|---------|-------------|
| `PORT` | Number | `3000` | Server port (Next.js auto-detects) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | `anon_key` | Supabase public/anon API key |
| `NEXT_PUBLIC_GA_ID` | String | `G-XXXXXXXXXX` | Google Analytics ID |
| `NEXT_PUBLIC_SENTRY_DSN` | URL | `https://...@sentry.io/...` | Sentry error tracking DSN |
| `NEXT_PUBLIC_GROWTHBOOK_API_KEY` | String | `key` | Growthbook feature flags API key |

### Frontend Variables by Feature

**API Communication:**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint

**Authentication (via Supabase):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public auth key

**Monitoring & Analytics:**
- `NEXT_PUBLIC_GA_ID` - Google Analytics
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

**Feature Flags:**
- `NEXT_PUBLIC_GROWTHBOOK_API_KEY` - Feature management

---

## Setup Instructions

### 1. Local Development

**Backend Setup:**
```bash
# Copy example file
cp Backend/.env.example Backend/.env

# Edit and fill in values
# Minimum required:
# - PORT=5000
# - CLIENT_URL=http://localhost:3080
# - JWT_SECRET=<random_32_char_string>
# - DATABASE_URL=postgresql://graphix_user:graphix_pass@localhost:5432/graphix_db
# - GROQ_API_KEY=<your_groq_key>
nano Backend/.env

# Start backend
cd Backend
npm install
npm start
```

**Frontend Setup:**
```bash
# Copy example file
cp Frontend/.env.example Frontend/.env

# Edit and fill in values
# Minimum required:
# - NEXT_PUBLIC_API_URL=http://localhost:5080
nano Frontend/.env

# Start frontend
cd Frontend
npm install
npm run dev
```

### 2. Docker Setup

**For Docker Compose:**
```bash
# Backend .env (same as above)
cp Backend/.env.example Backend/.env
nano Backend/.env

# Frontend .env (same as above)
cp Frontend/.env.example Frontend/.env
nano Frontend/.env

# Docker-compose uses the .env files via env_file directive
docker-compose up
```

The `docker-compose.yml` automatically loads:
- `Backend/.env` for backend service
- `Frontend/.env` for frontend service
- PostgreSQL service with built-in database

### 3. Production Setup

See individual .env.example files for production-specific notes.

---

## Development vs Production

### Development Environment

```env
# Backend
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3080
JWT_SECRET=development_secret_key
DATABASE_URL=postgresql://graphix_user:graphix_pass@localhost:5432/graphix_db
GROQ_API_KEY=dev_groq_key

# Frontend
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5080
```

### Production Environment

```env
# Backend
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com
JWT_SECRET=<use-strong-random-key>
DATABASE_URL=<use-managed-database>
GROQ_API_KEY=<use-production-key>

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Security Notes

⚠️ **NEVER commit `.env` files to version control**

- `.env` files are listed in `.gitignore`
- They contain sensitive information (API keys, secrets, passwords)
- Each developer/environment should have their own `.env` file
- Use `.env.example` files as templates for setting up new environments

**For Production:**
- Use strong, randomly generated `JWT_SECRET` (min 32 characters)
- Rotate `GROQ_API_KEY` regularly
- Use environment-specific values (different databases, API keys, URLs)
- Never expose sensitive data in logs or error messages
- Consider using secrets management (AWS Secrets Manager, GitHub Secrets, etc.)

---

## Common Issues

### "Database connection failed"
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### "CORS error - origin not allowed"
- Ensure `CLIENT_URL` matches your frontend URL exactly
- Check protocol (http vs https)
- Check port number

### "Invalid JWT_SECRET"
- Must be set and non-empty
- In production, must be at least 32 characters
- Use `openssl rand -base64 32` to generate

### "Groq API rate limited"
- Use multiple keys with `GROQ_KEY_1`, `GROQ_KEY_2`, etc.
- Backend automatically rotates between available keys
- Supports up to 50 keys

---

## Environment Variable Resolution

### Backend
1. Reads from `Backend/.env` (via dotenv)
2. Falls back to system environment variables
3. Fails if required variables are missing

### Frontend (Next.js)
1. Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser
2. Reads from `Frontend/.env` at build time
3. Available to client-side code

### Docker
1. Each service reads its `env_file` directive
2. Docker `.env` file is NOT used (specify via env_file)
3. Environment variables override `env_file` values
