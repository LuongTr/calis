-- ============================================================
-- Calis App Database Schema
-- ============================================================

-- 1. User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate')),
  training_style TEXT DEFAULT 'full_body' CHECK (training_style IN ('full_body', 'upper_lower')),
  mobility_level TEXT DEFAULT 'normal' CHECK (mobility_level IN ('stiff', 'normal', 'flexible')),
  experience TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  push_up_level INTEGER,
  pull_up_level INTEGER,
  squat_level INTEGER,
  last_workout_date TIMESTAMPTZ,
  last_workout_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Exercises Library
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'calis' CHECK (type IN ('calis', 'mobility')),
  muscle_group TEXT CHECK (muscle_group IN ('push', 'pull', 'legs', 'core', 'full')),
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  format TEXT DEFAULT 'reps' CHECK (format IN ('reps', 'time')),
  default_reps INTEGER,
  default_time_sec INTEGER,
  default_sets INTEGER DEFAULT 3,
  rest_time_sec INTEGER DEFAULT 60,
  video_id TEXT,
  video_start_sec INTEGER,
  video_end_sec INTEGER,
  short_description TEXT,
  tips TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}'
);

-- 3. Workout Templates
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate')),
  type TEXT DEFAULT 'full_body' CHECK (type IN ('full_body', 'upper', 'lower', 'mobility')),
  duration_min INTEGER,
  goal_tags TEXT[] DEFAULT '{}',
  exercise_blocks JSONB DEFAULT '[]'::jsonb
);

-- 4. Workout History
CREATE TABLE IF NOT EXISTS public.workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id TEXT REFERENCES public.workout_templates(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  total_sets INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  exercises_completed JSONB DEFAULT '[]'::jsonb
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON public.workout_history(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_completed_at ON public.workout_history(completed_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Exercises: public read, admin write
CREATE POLICY "Exercises are publicly readable"
  ON public.exercises FOR SELECT
  USING (true);

-- Workout Templates: public read, admin write
CREATE POLICY "Templates are publicly readable"
  ON public.workout_templates FOR SELECT
  USING (true);

-- Workout History: users can only read/write their own history
CREATE POLICY "Users can view own history"
  ON public.workout_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.workout_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);