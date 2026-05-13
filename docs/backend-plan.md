# Calis App — Backend Implementation Plan

## Stack

- **Backend as a Service**: Supabase (PostgreSQL + Auth + Storage)
- **Client**: Expo (React Native) — `@supabase/supabase-js`
- **Auth**: Supabase Auth (Email/Password + Google OAuth)
- **Database**: PostgreSQL (hosted on Supabase)

---

## Phase 1: Setup & Auth (Đang làm)

### Step 1: Setup Supabase Project

- [ ] Tạo project tại [supabase.com](https://supabase.com)
- [ ] Copy `anon public key` và `project URL` vào `.env`
- [ ] Cài `@supabase/supabase-js`

### Step 2: Database Schema

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  level TEXT DEFAULT 'beginner',
  training_style TEXT DEFAULT 'full_body',
  mobility_level TEXT DEFAULT 'normal',
  experience TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_workout_date TIMESTAMPTZ,
  last_workout_type TEXT,
  push_up_level INTEGER,
  pull_up_level INTEGER,
  squat_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises library (seed data)
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  muscle_group TEXT,
  level TEXT,
  format TEXT,
  default_reps INTEGER,
  default_time_sec INTEGER,
  default_sets INTEGER DEFAULT 3,
  rest_time_sec INTEGER DEFAULT 60,
  video_id TEXT,
  video_start_sec INTEGER,
  video_end_sec INTEGER,
  short_description TEXT,
  tips TEXT[],
  common_mistakes TEXT[],
  tags TEXT[]
);

-- Workout templates
CREATE TABLE workout_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT,
  type TEXT,
  duration_min INTEGER,
  goal_tags TEXT[],
  exercise_blocks JSONB DEFAULT '[]'
);

-- Workout history
CREATE TABLE workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id TEXT REFERENCES workout_templates(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  total_sets INTEGER,
  duration_seconds INTEGER,
  exercises_completed JSONB DEFAULT '[]'
);
```

### Step 3: Auth Implementation

- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] Google OAuth
- [ ] Session management (auto-refresh token)
- [ ] Profile creation on first sign up

### Step 4: Seed Data

- [ ] Insert 20 exercises from `src/data/exercises.ts`
- [ ] Insert 8 workout templates from `src/data/templates.ts`

---

## Phase 2: API Layer

### Files to migrate

| File hiện tại        | File mới              | Mục đích                    |
| -------------------- | --------------------- | --------------------------- |
| `src/lib/storage.ts` | `src/lib/supabase.ts` | Supabase client + API calls |
| `src/lib/storage.ts` | `src/lib/api.ts`      | Data fetching functions     |
| `src/lib/storage.ts` | `src/lib/auth.ts`     | Auth functions              |

### State management

- React Context cho auth state (user session)
- React Context cho profile data
- Custom hooks: `useAuth`, `useProfile`, `useApi`

---

## Phase 3: Workout History

- [ ] Save completed workout to `workout_history`
- [ ] Fetch last N workouts for Profile screen
- [ ] Weekly/monthly streak calculation
- [ ] Statistics (total workouts, total time, etc.)

---

## Phase 4: Admin Dashboard

- [ ] Dùng Supabase Studio có sẵn
- [ ] Hoặc xây web admin riêng (Next.js)
- [ ] CRUD exercises, templates, users

---

## File Structure (mới)

```
src/
├── lib/
│   ├── supabase.ts      # Supabase client init
│   ├── api.ts           # Data fetching functions
│   └── auth.ts          # Auth functions (login, signup, logout)
├── features/
│   ├── auth/
│   │   ├── AuthScreen.tsx    # Login/Signup UI
│   │   └── useAuth.ts       # Auth context + hooks
│   ├── onboarding/
│   │   └── OnboardingScreen.tsx
│   └── ...
├── types/
│   └── index.ts
└── components/
    └── ...
```

---

## Tài nguyên

- Supabase Docs: https://supabase.com/docs
- Supabase React Native: https://supabase.com/docs/guides/getting-started/quickstarts/react-native
- Supabase Auth: https://supabase.com/auth

---

## Ghi chú triển khai

1. **Row Level Security (RLS)** — Bật cho tất cả tables, chỉ user mới được đọc/ghi data của mình
2. **.env file** — `EXPO_PUBLIC_SUPABASE_URL` và `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Prefix `EXPO_PUBLIC_` để Expo public)
3. **Seed script** — Tạo file `scripts/seed.ts` để insert data lần đầu
4. **Local dev** — Dùng Supabase local CLI: `supabase start` (cần Docker)
