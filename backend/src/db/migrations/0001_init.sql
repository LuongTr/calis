CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate')),
  training_style TEXT NOT NULL DEFAULT 'full_body' CHECK (training_style IN ('full_body', 'upper_lower')),
  mobility_level TEXT NOT NULL DEFAULT 'normal' CHECK (mobility_level IN ('stiff', 'normal', 'flexible')),
  experience TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  push_up_level INTEGER,
  pull_up_level INTEGER,
  squat_level INTEGER,
  last_workout_date TIMESTAMPTZ,
  last_workout_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'calis' CHECK (type IN ('calis', 'mobility')),
  muscle_group TEXT CHECK (muscle_group IN ('push', 'pull', 'legs', 'core', 'full')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  format TEXT NOT NULL DEFAULT 'reps' CHECK (format IN ('reps', 'time')),
  default_reps INTEGER,
  default_time_sec INTEGER,
  default_sets INTEGER NOT NULL DEFAULT 3,
  rest_time_sec INTEGER NOT NULL DEFAULT 60,
  video_id TEXT,
  video_start_sec INTEGER,
  video_end_sec INTEGER,
  short_description TEXT,
  tips TEXT[] NOT NULL DEFAULT '{}',
  common_mistakes TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate')),
  type TEXT NOT NULL DEFAULT 'full_body' CHECK (type IN ('full_body', 'upper', 'lower', 'mobility')),
  duration_min INTEGER,
  goal_tags TEXT[] NOT NULL DEFAULT '{}',
  exercise_blocks JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id TEXT REFERENCES workout_templates(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_sets INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  exercises_completed JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_completed_at ON workout_history(completed_at);
