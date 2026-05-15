# Calis Backend API

Self-hosted backend replacing Supabase for auth, profile, content, and workout history.

## Local Stack

- Node.js + TypeScript
- Express API
- Local PostgreSQL installation
- Drizzle ORM
- JWT auth

Docker is not required. The backend connects to any locally installed PostgreSQL instance through `DATABASE_URL`.

## Setup

1. Install PostgreSQL locally.
2. Create a database named `calis`.
3. Copy `.env.example` to `.env`.
4. Update `DATABASE_URL` in `.env` to match your local PostgreSQL user, password, host, port, and database.
5. Install dependencies with `npm install`.
6. Run migrations with `npm run db:migrate`.
7. Seed and backfill exercises/workout templates with `npm run db:seed`.
8. Verify content integrity with `npm run db:verify-content`.
9. Start the API with `npm run dev`.

Default base URL: `http://localhost:4000`

## Example DATABASE_URL

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/calis
```

If you use the default PostgreSQL installer on Windows, `localhost:5432` is usually correct and only the username/password may differ.

## Create Database

If PostgreSQL is already installed, one of these commands is enough:

```bash
createdb -U postgres calis
```

or:

```sql
CREATE DATABASE calis;
```

## Endpoints

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /me` with Bearer token
- `PATCH /me` with Bearer token
- `GET /exercises`
- `GET /exercises/:id`
- `GET /workouts`
- `GET /workouts/:id`
- `GET /history` with Bearer token
- `POST /history` with Bearer token

## Test Phase Contracts

This smoke test validates the latest backend-first contract changes:

- `GET /exercises` and `GET /workouts` include `contentVersion`
- `POST /auth/signup` works
- `GET /me` includes `preferredVariants`
- `PATCH /me` persists `preferredVariants`

Run:

```bash
npm run test:phase-contract
```

Optional custom base URL:

```bash
API_BASE_URL=http://localhost:4000 npm run test:phase-contract
```

## Notes

- Seed scripts read CSVs from `../backend-supabase/seed/`.
- Seed is upsert-based: running `npm run db:seed` updates existing rows and inserts missing rows.
- For backend-first cutover, run `db:migrate`, `db:seed`, and `db:verify-content` before enabling strict mode on mobile.
- Full release matrix and rollback steps: `../TRACKING/phase5-cutover-runbook.md`.
- This backend keeps its data shape close to the existing mobile app types.
