import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, sql } from "./index.js";
import { exercises, workoutTemplates } from "./schema.js";
import { sql as drizzleSql } from "drizzle-orm";
import { parseCsv, parsePgTextArray } from "../lib/csv.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toInt(value: string): number | null {
  if (!value || value.trim() === "") return null;
  return Number.parseInt(value, 10);
}

async function seedExercises(seedDir: string): Promise<void> {
  const csvPath = path.join(seedDir, "exercises.csv");
  const content = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(content);
  const headers = rows[0];
  const dataRows = rows.slice(1);

  const entries = dataRows.map((row) => {
    const record = Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]));
    return {
      id: record.id,
      name: record.name,
      type: record.type || "calis",
      muscleGroup: record.muscle_group || null,
      level: record.level || "beginner",
      format: record.format || "reps",
      defaultReps: toInt(record.default_reps),
      defaultTimeSec: toInt(record.default_time_sec),
      defaultSets: toInt(record.default_sets) ?? 3,
      restTimeSec: toInt(record.rest_time_sec) ?? 60,
      videoId: record.video_id || null,
      videoStartSec: toInt(record.video_start_sec),
      videoEndSec: toInt(record.video_end_sec),
      shortDescription: record.short_description || null,
      tips: parsePgTextArray(record.tips),
      commonMistakes: parsePgTextArray(record.common_mistakes),
      tags: parsePgTextArray(record.tags)
    };
  });

  if (entries.length > 0) {
    await db
      .insert(exercises)
      .values(entries)
      .onConflictDoUpdate({
        target: exercises.id,
        set: {
          name: drizzleSql`excluded.name`,
          familyId: drizzleSql`excluded.family_id`,
          difficultyRank: drizzleSql`excluded.difficulty_rank`,
          progressionExerciseId: drizzleSql`excluded.progression_exercise_id`,
          regressionExerciseId: drizzleSql`excluded.regression_exercise_id`,
          type: drizzleSql`excluded.type`,
          muscleGroup: drizzleSql`excluded.muscle_group`,
          level: drizzleSql`excluded.level`,
          format: drizzleSql`excluded.format`,
          defaultReps: drizzleSql`excluded.default_reps`,
          defaultTimeSec: drizzleSql`excluded.default_time_sec`,
          defaultSets: drizzleSql`excluded.default_sets`,
          restTimeSec: drizzleSql`excluded.rest_time_sec`,
          videoId: drizzleSql`excluded.video_id`,
          videoStartSec: drizzleSql`excluded.video_start_sec`,
          videoEndSec: drizzleSql`excluded.video_end_sec`,
          shortDescription: drizzleSql`excluded.short_description`,
          tips: drizzleSql`excluded.tips`,
          commonMistakes: drizzleSql`excluded.common_mistakes`,
          tags: drizzleSql`excluded.tags`
        }
      });
  }
}

async function seedTemplates(seedDir: string): Promise<void> {
  const csvPath = path.join(seedDir, "templates.csv");
  const content = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(content);
  const headers = rows[0];
  const dataRows = rows.slice(1);

  const entries = dataRows.map((row) => {
    const record = Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]));
    return {
      id: record.id,
      title: record.title,
      level: record.level || "beginner",
      type: record.type || "full_body",
      durationMin: toInt(record.duration_min),
      goalTags: parsePgTextArray(record.goal_tags),
      exerciseBlocks: JSON.parse(record.exercise_blocks || "[]") as unknown[]
    };
  });

  if (entries.length > 0) {
    await db
      .insert(workoutTemplates)
      .values(entries)
      .onConflictDoUpdate({
        target: workoutTemplates.id,
        set: {
          title: drizzleSql`excluded.title`,
          level: drizzleSql`excluded.level`,
          type: drizzleSql`excluded.type`,
          durationMin: drizzleSql`excluded.duration_min`,
          goalTags: drizzleSql`excluded.goal_tags`,
          exerciseBlocks: drizzleSql`excluded.exercise_blocks`
        }
      });
  }
}

async function runSeed(): Promise<void> {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const seedDirCandidates = [
    path.join(repoRoot, "backend-supabase", "seed"),
    path.join(repoRoot, "backend", "seed")
  ];

  let seedDir: string | null = null;
  for (const candidate of seedDirCandidates) {
    try {
      await fs.access(candidate);
      seedDir = candidate;
      break;
    } catch {
      // keep trying
    }
  }

  if (!seedDir) {
    throw new Error(
      `Seed directory not found. Tried: ${seedDirCandidates.join(", ")}`
    );
  }

  await seedExercises(seedDir);
  await seedTemplates(seedDir);

  console.log("Seed completed.");
}

runSeed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
