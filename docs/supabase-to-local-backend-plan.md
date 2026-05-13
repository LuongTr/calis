# Supabase to Local Backend Migration Plan

## Goal

Replace the current Supabase dependency with a locally owned backend API while keeping the Expo mobile app behavior the same:

- Email/password auth
- User profile and onboarding data
- Public exercises and workout templates
- Private workout history
- Local fallback for MVP/dev remains possible

## Current Codebase Findings

### Supabase touchpoints

- `mobile/src/lib/supabase.ts`
  - Creates the Supabase client.
  - Reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - Stores Supabase auth session through AsyncStorage.

- `mobile/src/lib/auth.ts`
  - Calls `supabase.auth.signUp`, `signInWithPassword`, `signOut`, `getSession`, and `onAuthStateChange`.
  - Falls back to local AsyncStorage profile creation when Supabase is not configured.

- `mobile/src/lib/api.ts`
  - Calls Supabase tables: `exercises`, `workout_templates`, and `workout_history`.
  - Falls back to local static data for exercises/templates.
  - Only saves workout history remotely when Supabase is configured.

- `backend/migrations/001_init.sql`
  - Supabase/Postgres schema.
  - Depends on `auth.users`, `auth.uid()`, RLS policies, and Supabase auth triggers.

- `mobile/package.json`
  - Includes `@supabase/supabase-js`.

### Local-first touchpoints to preserve

- `mobile/src/lib/storage.ts`
  - Stores `UserProfile` and `OnboardingData` in AsyncStorage.

- `mobile/App.tsx`
  - Reads/writes local profile directly.
  - Onboarding completion updates local storage only.
  - Session completion updates local profile only.
  - It imports `initializeData()` but several screens still use static template imports directly.

- `mobile/src/data/exercises.ts` and `mobile/src/data/templates.ts`
  - Static fallback data.

## Target Architecture

### Backend

Use a local Node.js API under `backend/`:

- Runtime: Node.js + TypeScript
- API framework: Express
- Database: PostgreSQL
- ORM: Drizzle ORM
- Auth: JWT access token + bcrypt password hashes
- Validation: Zod
- Dev database: local PostgreSQL installed directly on the machine

### Mobile

Replace Supabase SDK calls with one owned HTTP client:

- `mobile/src/lib/api-client.ts`
  - Base URL from `EXPO_PUBLIC_API_URL`
  - JSON request helper
  - Auth token injection
  - Error normalization

- `mobile/src/lib/auth.ts`
  - Same exported functions where possible: `signUp`, `signIn`, `signOut`, `getSession`
  - Calls backend `/auth/signup`, `/auth/login`, `/me`
  - Stores token and profile locally

- `mobile/src/lib/api.ts`
  - Calls backend `/exercises`, `/exercises/:id`, `/workouts`, `/workouts/:id`, `/history`
  - Keeps local fallback for public data when API is unavailable

## Database Migration Design

### Replace Supabase-owned auth model

Supabase:

- `profiles.id REFERENCES auth.users(id)`
- Trigger creates profile after auth signup
- RLS uses `auth.uid()`

Local backend:

- Own a `users` table.
- Store `password_hash`.
- Enforce user access in route handlers/middleware instead of RLS.

### Proposed tables

#### `users`

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `email TEXT NOT NULL UNIQUE`
- `password_hash TEXT NOT NULL`
- `display_name TEXT`
- `level TEXT DEFAULT 'beginner'`
- `training_style TEXT DEFAULT 'full_body'`
- `mobility_level TEXT DEFAULT 'normal'`
- `experience TEXT`
- `onboarding_completed BOOLEAN DEFAULT FALSE`
- `push_up_level INTEGER`
- `pull_up_level INTEGER`
- `squat_level INTEGER`
- `last_workout_date TIMESTAMPTZ`
- `last_workout_type TEXT`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `updated_at TIMESTAMPTZ DEFAULT now()`

#### `exercises`

Keep the current `backend/migrations/001_init.sql` shape, minus Supabase-specific behavior.

#### `workout_templates`

Keep the current shape:

- `exercise_blocks JSONB DEFAULT '[]'`

#### `workout_history`

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `workout_id TEXT REFERENCES workout_templates(id)`
- `completed_at TIMESTAMPTZ DEFAULT now()`
- `total_sets INTEGER DEFAULT 0`
- `duration_seconds INTEGER DEFAULT 0`
- `exercises_completed JSONB DEFAULT '[]'`

## API Contract

### Auth

- `POST /auth/signup`
  - Body: `{ "email": string, "password": string }`
  - Creates user, returns `{ token, user }`

- `POST /auth/login`
  - Body: `{ "email": string, "password": string }`
  - Verifies password, returns `{ token, user }`

- `GET /me`
  - Auth required.
  - Returns current user profile.

- `PATCH /me`
  - Auth required.
  - Updates profile/onboarding fields.

### Public content

- `GET /exercises`
- `GET /exercises/:id`
- `GET /workouts`
- `GET /workouts/:id`

### Workout history

- `POST /history`
  - Auth required.
  - Body: `{ "workoutId": string, "totalSets": number, "durationSeconds": number, "exercisesCompleted"?: unknown[] }`

- `GET /history`
  - Auth required.
  - Returns only the authenticated user's history.

## Implementation Phases

### Phase 1: Backend scaffold

- Create `backend/package.json`.
- Add TypeScript, Express, CORS, dotenv, Zod, Drizzle, postgres, bcryptjs, jsonwebtoken.
- Add `tsconfig.json`.
- Add `src/app.ts`, `src/index.ts`, and `src/config.ts`.
- Add `GET /health` so mobile/dev can verify the API is alive.

Acceptance:

- `npm run dev` starts the backend locally.
- `GET /health` returns `{ ok: true }`.

### Phase 2: Local database setup

- Use a normal local PostgreSQL installation.
- Add Drizzle config.
- Create Drizzle schema for `users`, `exercises`, `workout_templates`, and `workout_history`.
- Create initial migration.
- Port seed data from `backend/seed/exercises.csv` and `backend/seed/templates.csv`.

Acceptance:

- A fresh local DB can migrate and seed.
- Seed counts match current CSVs.

### Phase 3: Auth and profile API

- Implement password hashing on signup.
- Implement login password verification.
- Implement JWT issuing.
- Implement JWT middleware.
- Implement `GET /me` and `PATCH /me`.
- Normalize backend user shape to match mobile `UserProfile`.

Acceptance:

- Signup returns token + profile.
- Login returns token + profile.
- `/me` rejects requests without a token.
- `/me` returns only the current authenticated user.

### Phase 4: Public content API

- Implement exercise list/detail routes.
- Implement workout template list/detail routes.
- Map database snake_case fields to mobile camelCase fields at API boundary.

Acceptance:

- Mobile can consume returned `Exercise` and `WorkoutTemplate` shapes without screen changes.
- Unknown IDs return 404.

### Phase 5: Workout history API

- Implement `POST /history`.
- Implement `GET /history`.
- Update user `last_workout_date` and `last_workout_type` when a workout is saved, if desired.

Acceptance:

- Users can only read/write their own history.
- Completed workouts persist across app restarts and sign-in.

### Phase 6: Mobile API client

- Add `mobile/src/lib/api-client.ts`.
- Add token storage keys to `mobile/src/lib/storage.ts`.
- Replace Supabase auth calls in `mobile/src/lib/auth.ts`.
- Remove dependency on `mobile/src/lib/supabase.ts`.
- Change env vars:
  - Remove `EXPO_PUBLIC_SUPABASE_URL`
  - Remove `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Add `EXPO_PUBLIC_API_URL`

Acceptance:

- Existing Auth screen still works.
- Sign out clears local token/profile.
- App cold start can restore the saved session/profile.

### Phase 7: Mobile data integration

- Update `mobile/src/lib/api.ts` to call backend content/history endpoints.
- Keep static local fallback for public exercises/templates.
- Decide whether `App.tsx`, `WorkoutListScreen`, and workout wrappers should use API-loaded templates instead of static imports.
- Save onboarding through `PATCH /me` after local save succeeds.
- Save workout completion through `POST /history`.

Acceptance:

- Exercise/workout screens work when backend is running.
- Exercise/workout screens still work with local fallback if backend is down.
- Onboarding and last workout state can sync to backend for signed-in users.

### Phase 8: Remove Supabase

- Delete `mobile/src/lib/supabase.ts`.
- Remove `@supabase/supabase-js` from `mobile/package.json`.
- Update `mobile/package-lock.json`.
- Rename or archive `backend/` as `backend-supabase-archive/`, or keep it as historical reference.
- Update root `README.md`, `backend/README.md`, and `docs/backend-plan.md`.

Acceptance:

- `rg -n "supabase|Supabase|SUPABASE|@supabase" mobile backend docs README.md` only finds archived/history references.
- Mobile app builds without Supabase dependency.

### Phase 9: Verification

- Backend:
  - TypeScript compile
  - Route smoke tests with curl/HTTP client
  - Migration + seed from empty DB

- Mobile:
  - TypeScript compile
  - Sign up
  - Login
  - Complete onboarding
  - View workout list/detail
  - Complete workout
  - Logout/login again and confirm profile/history survive

## Risk Areas

- `App.tsx` currently creates a local `user-1` profile after email signup, which can overwrite the backend user returned from signup. This should be fixed during mobile auth migration.
- Several screens still use static workout data directly, so `initializeData()` does not fully control runtime content yet.
- Current docs and README still describe Supabase, so stale setup instructions may confuse future work.
- Some markdown/text files show mojibake characters. Migration docs should be rewritten cleanly as files are touched.
- JWT storage currently would use AsyncStorage. For a production app, consider `expo-secure-store`; for local MVP, AsyncStorage is acceptable.

## Suggested Commit Plan

1. `backend`: scaffold Express/TypeScript health endpoint.
2. `backend`: add Drizzle schema, migrations, and seed.
3. `backend`: add auth/profile routes.
4. `backend`: add exercise/workout/history routes.
5. `mobile`: add API client and token storage.
6. `mobile`: replace Supabase auth/data calls.
7. `docs`: remove Supabase setup instructions and document local backend startup.
8. `cleanup`: remove Supabase package and dead files.
