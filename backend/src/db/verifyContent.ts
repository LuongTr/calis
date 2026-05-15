import { db, sql } from "./index.js";
import { exercises, workoutTemplates } from "./schema.js";

type Issue = { kind: string; message: string };

function parseExerciseIdsFromBlocks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const block of value) {
    if (!block || typeof block !== "object") continue;
    const raw = (block as Record<string, unknown>).exerciseId;
    if (typeof raw === "string" && raw.trim().length > 0) {
      ids.push(raw);
    }
  }
  return ids;
}

async function runVerify(): Promise<void> {
  const issues: Issue[] = [];

  const exerciseRows = await db.select().from(exercises);
  const templateRows = await db.select().from(workoutTemplates);

  const exerciseIds = new Set(exerciseRows.map((row) => row.id));

  for (const exercise of exerciseRows) {
    if (exercise.progressionExerciseId && !exerciseIds.has(exercise.progressionExerciseId)) {
      issues.push({
        kind: "variant_chain",
        message: `${exercise.id} progression target ${exercise.progressionExerciseId} not found`
      });
    }
    if (exercise.regressionExerciseId && !exerciseIds.has(exercise.regressionExerciseId)) {
      issues.push({
        kind: "variant_chain",
        message: `${exercise.id} regression target ${exercise.regressionExerciseId} not found`
      });
    }
    if (exercise.familyId && exercise.difficultyRank === null) {
      issues.push({
        kind: "variant_rank",
        message: `${exercise.id} has family_id=${exercise.familyId} but missing difficulty_rank`
      });
    }
  }

  for (const template of templateRows) {
    const ids = parseExerciseIdsFromBlocks(template.exerciseBlocks);
    for (const exerciseId of ids) {
      if (!exerciseIds.has(exerciseId)) {
        issues.push({
          kind: "template_exercise_ref",
          message: `${template.id} references missing exercise ${exerciseId}`
        });
      }
    }
  }

  if (issues.length === 0) {
    console.log("Content verification passed.");
    return;
  }

  console.error(`Content verification failed with ${issues.length} issue(s):`);
  for (const issue of issues) {
    console.error(`- [${issue.kind}] ${issue.message}`);
  }
  process.exitCode = 1;
}

runVerify()
  .catch((error) => {
    const code = (error as { code?: string } | null)?.code;
    if (code === "42703") {
      console.error(
        "Content verification failed because required columns are missing. Run `npm run db:migrate` first."
      );
      process.exitCode = 1;
      return;
    }
    console.error("Content verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
