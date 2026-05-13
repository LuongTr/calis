import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, sql } from "./index.js";
import { exercises, workoutTemplates } from "./schema.js";
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
    await db.insert(exercises).values(entries).onConflictDoNothing();
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
    await db.insert(workoutTemplates).values(entries).onConflictDoNothing();
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
