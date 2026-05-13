# Calis Backend

Backend for the Calisthenics Training App, built with Supabase.

## Quick Start

1. Create a Supabase project at https://supabase.com
2. Go to Project Settings → API → copy URL and anon key
3. Copy `.env.template` to `.env` and paste the values
4. Go to SQL Editor and run `migrations/001_init.sql`
5. Run seed scripts to populate exercises and templates

## Structure

```
backend/
├── migrations/          # Database migrations (SQL)
│   └── 001_init.sql     # Initial schema
├── seed/                # Seed data scripts
│   ├── exercises.json   # Exercise library
│   └── templates.json   # Workout templates
├── functions/           # Supabase Edge Functions (future)
├── .env.template        # Environment variables
└── README.md
```

## Database Schema

- `profiles` — User profiles (extends auth.users)
- `exercises` — Exercise library
- `workout_templates` — Preset workout templates
- `workout_history` — Completed workout history

## Seed Data

CSV files are in `seed/`:

- `seed/exercises.csv` — 20 exercises
- `seed/templates.csv` — 8 workout templates

### How to import (Supabase Dashboard)

1. Open Supabase Dashboard → **Table Editor**
2. Select table **`exercises`**
3. Click **Insert** → **Import data from CSV**
4. Open file `seed/exercises.csv` → copy all content → paste
5. Click **Save**
6. Repeat for **`workout_templates`** with `seed/templates.csv`

> ⚠️ Import `exercises` **trước**, vì `workout_templates` tham chiếu đến exercise IDs.

#### Method 2: SQL Editor

```sql
-- Copy paste the seed JSON, then run:
-- Note: You can also use the Supabase Dashboard for easier import
INSERT INTO public.exercises (id, name, type, muscle_group, level, format, default_reps, default_time_sec, default_sets, rest_time_sec, video_id, video_start_sec, video_end_sec, short_description, tips, common_mistakes, tags)
VALUES
('knee-pushup', 'Knee Push-up', 'calis', 'push', 'beginner', 'reps', 8, NULL, 3, 60, 'WDIpL0pjun0', NULL, NULL, 'A beginner-friendly push-up variation on knees.', '{Keep your core tight,Lower chest to ground,Exhale on the way up}', '{Arching your back,Flaring elbows too wide}', '{push,strength,beginner,main,no_equipment,regression}');
-- ... repeat for all exercises (or use Dashboard import)
```
