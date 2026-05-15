import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name"),
    preferredVariants: jsonb("preferred_variants").notNull().default(sql`'{}'::jsonb`),
    level: text("level").notNull().default("beginner"),
    trainingStyle: text("training_style").notNull().default("full_body"),
    mobilityLevel: text("mobility_level").notNull().default("normal"),
    experience: text("experience"),
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
    pushUpLevel: integer("push_up_level"),
    pullUpLevel: integer("pull_up_level"),
    squatLevel: integer("squat_level"),
    lastWorkoutDate: timestamp("last_workout_date", { withTimezone: true }),
    lastWorkoutType: text("last_workout_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    check("users_level_check", sql`${t.level} in ('beginner', 'intermediate')`),
    check("users_training_style_check", sql`${t.trainingStyle} in ('full_body', 'upper_lower', 'push_pull_legs')`),
    check("users_mobility_level_check", sql`${t.mobilityLevel} in ('stiff', 'normal', 'flexible')`)
  ]
);

export const exercises = pgTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id"),
    difficultyRank: integer("difficulty_rank"),
    progressionExerciseId: text("progression_exercise_id"),
    regressionExerciseId: text("regression_exercise_id"),
    name: text("name").notNull(),
    type: text("type").notNull().default("calis"),
    muscleGroup: text("muscle_group"),
    level: text("level").notNull().default("beginner"),
    format: text("format").notNull().default("reps"),
    defaultReps: integer("default_reps"),
    defaultTimeSec: integer("default_time_sec"),
    defaultSets: integer("default_sets").notNull().default(3),
    restTimeSec: integer("rest_time_sec").notNull().default(60),
    videoId: text("video_id"),
    videoStartSec: integer("video_start_sec"),
    videoEndSec: integer("video_end_sec"),
    shortDescription: text("short_description"),
    tips: text("tips").array().notNull().default(sql`'{}'::text[]`),
    commonMistakes: text("common_mistakes").array().notNull().default(sql`'{}'::text[]`),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`)
  },
  (t) => [
    check("exercises_type_check", sql`${t.type} in ('calis', 'mobility')`),
    check("exercises_group_check", sql`${t.muscleGroup} in ('push', 'pull', 'legs', 'core', 'full')`),
    check("exercises_level_check", sql`${t.level} in ('beginner', 'intermediate', 'advanced')`),
    check("exercises_format_check", sql`${t.format} in ('reps', 'time')`)
  ]
);

export const workoutTemplates = pgTable(
  "workout_templates",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    level: text("level").notNull().default("beginner"),
    type: text("type").notNull().default("full_body"),
    durationMin: integer("duration_min"),
    goalTags: text("goal_tags").array().notNull().default(sql`'{}'::text[]`),
    exerciseBlocks: jsonb("exercise_blocks").notNull().default(sql`'[]'::jsonb`)
  },
  (t) => [
    check("workout_templates_level_check", sql`${t.level} in ('beginner', 'intermediate')`),
    check("workout_templates_type_check", sql`${t.type} in ('full_body', 'upper', 'lower', 'push', 'pull', 'legs', 'mobility')`)
  ]
);

export const workoutHistory = pgTable(
  "workout_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workoutId: text("workout_id").references(() => workoutTemplates.id, { onDelete: "set null" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
    totalSets: integer("total_sets").notNull().default(0),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    exercisesCompleted: jsonb("exercises_completed").notNull().default(sql`'[]'::jsonb`)
  },
  (t) => [
    index("idx_workout_history_user_id").on(t.userId),
    index("idx_workout_history_completed_at").on(t.completedAt)
  ]
);
