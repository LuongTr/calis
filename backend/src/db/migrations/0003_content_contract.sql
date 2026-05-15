ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_variants JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS family_id TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_rank INTEGER,
  ADD COLUMN IF NOT EXISTS progression_exercise_id TEXT,
  ADD COLUMN IF NOT EXISTS regression_exercise_id TEXT;

ALTER TABLE workout_templates DROP CONSTRAINT IF EXISTS workout_templates_type_check;
ALTER TABLE workout_templates
  ADD CONSTRAINT workout_templates_type_check
  CHECK (type IN ('full_body', 'upper', 'lower', 'push', 'pull', 'legs', 'mobility'));
