# Calis - Calisthenics Guided Training App

A guided at-home workout app focused on calisthenics and mobility/stretching.

## Structure

```text
Calis/
|- mobile/              # React Native (Expo) mobile app
|- backend/             # Local Node.js + PostgreSQL backend
|- backend-supabase/    # Archived Supabase schema and seed reference
|- shared/              # Shared types/constants (future)
|- docs/                # Documentation
+- README.md
```

## Quick Start (Mobile)

```bash
cd mobile
npm install
npx expo start
```

Press `w` for web, or scan QR code with Expo Go.

## Tech Stack

- Mobile: React Native (Expo), TypeScript
- Backend: Express + PostgreSQL + Drizzle ORM
- Auth: JWT + bcrypt
- State: React hooks + reducer-based state machine
- Storage: AsyncStorage locally, backend sync in progress

## Features

- Auth and onboarding
- Home with recommendations
- Workout list by level
- Guided session with state machine
- Rest timer with circular progress
- YouTube video embeds
- Profile with stats

## Backend

See [backend/README.md](/d:/Code_Space/Calis/backend/README.md) and [docs/supabase-to-local-backend-plan.md](/d:/Code_Space/Calis/docs/supabase-to-local-backend-plan.md) for the local PostgreSQL backend setup and migration plan.
