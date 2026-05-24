# Deploying Labas on Coolify

Labas is a Turborepo monorepo with separate **web** (Vite SPA) and **server** (Hono API) apps. Deploy them as **two Coolify applications** from the same Git repository, plus **PostgreSQL** and **Redis**.

```
User → app.example.com (Web) → api.example.com (Server) → PostgreSQL + Redis
```

## Resources overview

| Coolify resource | Public URL | Purpose |
|------------------|------------|---------|
| Web application | `https://app.example.com` | Frontend (static SPA) |
| Server application | `https://api.example.com` | API, auth, tRPC, job queue |
| PostgreSQL | internal only | Drizzle ORM |
| Redis | internal only | BullMQ AI generation queue |

Both applications use the **repository root** as Base Directory. They differ only in Nixpacks config and environment variables.

---

## 1. PostgreSQL

1. In Coolify, create a **PostgreSQL** database service.
2. Note the **internal hostname**, port, username, and password.
3. Create a database named `labas` (or adjust `DATABASE_URL` accordingly).
4. Keep the service in the same Coolify project/network as the server app.

Example internal connection (hostname varies by Coolify):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_POSTGRES_HOST:5432/labas
```

---

## 2. Redis

1. Create a **Redis** service in Coolify (or use a managed Redis instance).
2. Note the internal hostname.

```env
REDIS_URL=redis://YOUR_REDIS_HOST:6379
```

Redis is **required** — AI question generation uses BullMQ.

---

## 3. Server application (API)

### Coolify settings

| Setting | Value |
|---------|-------|
| Source | Your Git repository |
| Base Directory | `/` (repository root) |
| Build Pack | Nixpacks |
| Nixpacks config | Set env `NIXPACKS_CONFIG_FILE=deploy/server.nixpacks.toml` |
| Port | `3000` |
| Domain | `api.example.com` |
| HTTPS | Enabled (required for auth cookies) |

Equivalent build/start commands if configuring manually in Coolify UI:

```bash
# Install
bun install --frozen-lockfile

# Build
bunx turbo build -F server

# Start
bun run --cwd apps/server start
```

### Environment variables (runtime)

Set these on the **server** application. All are validated at startup in `packages/env/src/server.ts`.

```env
NODE_ENV=production

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_POSTGRES_HOST:5432/labas
REDIS_URL=redis://YOUR_REDIS_HOST:6379

BETTER_AUTH_SECRET=YOUR_RANDOM_SECRET_MIN_32_CHARS
BETTER_AUTH_URL=https://api.example.com
CORS_ORIGIN=https://app.example.com

API_KEY_ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY_MIN_32_CHARS

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=Labas <noreply@example.com>
```

Generate secrets:

```bash
openssl rand -base64 32
```

**URL correlation (critical):**

| Variable | Must match |
|----------|------------|
| `BETTER_AUTH_URL` | Public URL of this server app (`https://api.example.com`) |
| `CORS_ORIGIN` | Public URL of the web app (`https://app.example.com`) |
| `VITE_SERVER_URL` (on web app) | Same value as `BETTER_AUTH_URL` |

`CORS_ORIGIN` is also used as Better Auth `trustedOrigins`. Use exact URLs including `https://` and no trailing slash mismatch.

Optional:

```env
PLATFORM_AI_API_KEY=
PLATFORM_AI_BASE_URL=
PLATFORM_AI_MODEL=
FREE_CREDITS_ENABLED=false
```

### Database migrations

Migrations run automatically on container start (see [`deploy/server.nixpacks.toml`](./server.nixpacks.toml)). **Remove any Post-deployment Command** for `db:migrate` — it often runs without runtime env vars in Coolify.

**`DATABASE_URL` must be set on the server application** (not on the PostgreSQL resource). The container does not have `apps/server/.env` (gitignored).

1. Open **server application** → **Environment Variables**
2. Add `DATABASE_URL` with **Available at Runtime** enabled (default)
3. Do **not** set it as Build-only

To get the connection string:

1. Open your **PostgreSQL** resource → **Connect** / **Configuration**
2. Copy the **internal** URL (Docker hostname, not `localhost`)
3. Paste into the **server app** env:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_POSTGRES_HOST:5432/labas
```

Verify in the server app **Terminal**:

```bash
echo $DATABASE_URL
```

If empty, the variable is missing or not marked as runtime — fix and redeploy.

Alternative for local-style sync (not recommended in production): `bun run db:push`.

Optional seed (run once via **Terminal** on the server app):

```bash
bun run db:seed
```

### Verify

After deploy, open `https://api.example.com/` — it should return `OK`.

---

## 4. Web application (frontend)

### Option A — Static Site (recommended)

Lightweight: no long-running Node process.

| Setting | Value |
|---------|-------|
| Resource type | Static Site |
| Base Directory | `/` |
| Build command | `bun install --frozen-lockfile && bunx turbo build -F web` |
| Publish directory | `apps/web/dist` |
| Domain | `app.example.com` |

### Option B — Nixpacks application

Use when you need a containerized static server (e.g. SPA fallback via `serve`).

| Setting | Value |
|---------|-------|
| Build Pack | Nixpacks |
| Nixpacks config | `NIXPACKS_CONFIG_FILE=deploy/web.nixpacks.toml` |
| Port | `3001` |
| Domain | `app.example.com` |

Config file: [`deploy/web.nixpacks.toml`](./web.nixpacks.toml)

### Environment variables (build time)

```env
VITE_SERVER_URL=https://api.example.com
```

**Enable "Available at Buildtime"** in Coolify. Vite embeds `VITE_*` variables during `vite build`; runtime env changes have no effect.

Rebuild the web app whenever the API URL changes.

### Verify

1. Open `https://app.example.com` — app loads.
2. Sign up / sign in works (requires valid SMTP on server).
3. Client-side routes work on refresh (Static Site on Coolify handles this; Nixpacks uses `serve -s` for SPA fallback).

---

## First deploy checklist

1. [ ] Deploy PostgreSQL and Redis; confirm both are healthy.
2. [ ] Create server app, set all runtime env vars.
3. [ ] Set `DATABASE_URL` on **server app** env (Runtime). Remove Post-deployment migrate command.
4. [ ] Deploy server; confirm `https://api.example.com/` returns `OK`.
5. [ ] Create web app, set `VITE_SERVER_URL` as **buildtime** env.
6. [ ] Deploy web; confirm app loads and API calls reach the server.
7. [ ] Test sign-up (email verification needs SMTP).
8. [ ] Add an AI API key in Settings and test question generation (needs Redis).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Migrate fails: `url: ''` / `Please provide required params` | `DATABASE_URL` not set in Coolify env | Add internal Postgres URL to server app Environment Variables, redeploy |
| API calls go to `localhost:3000` | `VITE_SERVER_URL` not set at build time | Rebuild web with buildtime env |
| CORS or auth errors | `CORS_ORIGIN` ≠ web URL | Match exact public web URL on server |
| Server crashes on start | Missing or invalid env (SMTP, secrets) | Check Coolify logs; compare with `apps/server/.env.example` |
| AI generation stuck | Redis unreachable | Verify `REDIS_URL` and network |
| Email sign-up fails | Invalid SMTP credentials | Test SMTP vars independently |
| SPA 404 on page refresh | Missing SPA fallback | Use Coolify Static Site, or Nixpacks with `serve -s` (see `start:prod` in `apps/web`) |

---

## Nixpacks config files

| File | Service |
|------|---------|
| [`deploy/server.nixpacks.toml`](./server.nixpacks.toml) | API server |
| [`deploy/web.nixpacks.toml`](./web.nixpacks.toml) | Web app (Option B) |

Both run `bun install` from the monorepo root so workspace packages (`@labas/*`) resolve correctly.
