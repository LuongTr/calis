import type { InferSelectModel } from "drizzle-orm";
import { workoutTemplates } from "../db/schema.js";

type WorkoutTemplateRow = InferSelectModel<typeof workoutTemplates>;
type WorkoutType = "full_body" | "upper" | "lower" | "push" | "pull" | "legs" | "mobility";
type UserLevel = "beginner" | "intermediate";
type TrainingStyle = "full_body" | "upper_lower" | "push_pull_legs";

export interface RecommendationItem {
  workout: WorkoutTemplateRow;
  score: number;
  reason: string;
}

interface BuildRecommendationsArgs {
  level: UserLevel;
  trainingStyle: TrainingStyle;
  lastWorkoutDate: Date | null;
  recentWorkoutTypes: WorkoutType[];
  workouts: WorkoutTemplateRow[];
}

function getDaysSince(date: Date | null): number | null {
  if (!date) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function byShortestDuration(a: WorkoutTemplateRow, b: WorkoutTemplateRow): number {
  return (a.durationMin ?? Number.MAX_SAFE_INTEGER) - (b.durationMin ?? Number.MAX_SAFE_INTEGER);
}

function pickWorkout(
  workouts: WorkoutTemplateRow[],
  type: WorkoutType,
  excludedIds: string[] = []
): WorkoutTemplateRow | null {
  const candidate = workouts
    .filter((workout) => workout.type === type && !excludedIds.includes(workout.id))
    .sort(byShortestDuration)[0];

  return candidate ?? null;
}

function getBeginnerNextType(recentWorkoutTypes: WorkoutType[]): WorkoutType {
  const [latest, previous] = recentWorkoutTypes;

  if (latest === "mobility") {
    return "full_body";
  }

  if (latest === "full_body" && previous === "full_body") {
    return "mobility";
  }

  return "full_body";
}

function getIntermediateNextType(recentWorkoutTypes: WorkoutType[]): WorkoutType {
  const [latest] = recentWorkoutTypes;
  if (latest === "upper") return "lower";
  if (latest === "lower") return "upper";
  return "upper";
}

function getPplNextType(recentWorkoutTypes: WorkoutType[]): WorkoutType {
  const [latest] = recentWorkoutTypes;
  if (latest === "push") return "pull";
  if (latest === "pull") return "legs";
  if (latest === "legs") return "push";
  return "push";
}

function getPrimaryType(
  level: UserLevel,
  trainingStyle: TrainingStyle,
  recentWorkoutTypes: WorkoutType[],
  daysSinceLastWorkout: number | null
): { type: WorkoutType; reason: string; score: number } {
  if (daysSinceLastWorkout === null || daysSinceLastWorkout > 2) {
    if (trainingStyle === "push_pull_legs") {
      return {
        type: "push",
        reason: "restart the push/pull/legs rotation with a push day",
        score: 96
      };
    }
    if (level === "intermediate") {
      return {
        type: "upper",
        reason: "restart the upper/lower rotation after time away",
        score: 96
      };
    }

    return {
      type: "full_body",
      reason: "restart with a full body day after time away",
      score: 96
    };
  }

  if (trainingStyle === "push_pull_legs") {
    const type = getPplNextType(recentWorkoutTypes);
    return {
      type,
      reason: `continue the push/pull/legs rotation with a ${type} day`,
      score: 94
    };
  }

  if (level === "intermediate") {
    const type = getIntermediateNextType(recentWorkoutTypes);
    return {
      type,
      reason:
        type === "upper"
          ? "continue the upper/lower rotation with an upper day"
          : "continue the upper/lower rotation with a lower day",
      score: 94
    };
  }

  const type = getBeginnerNextType(recentWorkoutTypes);
  return {
    type,
    reason:
      type === "mobility"
        ? "add a mobility day after two full body sessions"
        : "keep the beginner full body rotation moving",
    score: type === "mobility" ? 91 : 94
  };
}

export function buildTodayRecommendations({
  level,
  trainingStyle,
  lastWorkoutDate,
  recentWorkoutTypes,
  workouts
}: BuildRecommendationsArgs): RecommendationItem[] {
  const daysSinceLastWorkout = getDaysSince(lastWorkoutDate);
  const primary = getPrimaryType(level, trainingStyle, recentWorkoutTypes, daysSinceLastWorkout);
  const primaryWorkout = pickWorkout(workouts, primary.type);

  if (!primaryWorkout) {
    return [];
  }

  const mobilityWorkout = pickWorkout(workouts, "mobility", [primaryWorkout.id]);
  let alternateWorkout: WorkoutTemplateRow | null = null;
  let alternateReason = "";

  if (trainingStyle === "upper_lower" || level === "intermediate") {
    if (trainingStyle === "push_pull_legs") {
      const alternateType: WorkoutType = primary.type === "push" ? "pull" : primary.type === "pull" ? "legs" : "push";
      alternateWorkout = pickWorkout(workouts, alternateType, [primaryWorkout.id]);
      alternateReason = `swap to a ${alternateType} session if you want a different split today`;
    } else {
    const alternateType: WorkoutType = primary.type === "upper" ? "lower" : "upper";
    alternateWorkout = pickWorkout(workouts, alternateType, [primaryWorkout.id]);
    alternateReason =
      alternateType === "upper"
        ? "swap in an upper day if you want a different focus"
        : "swap in a lower day if you want a different focus";
    }
  } else {
    alternateWorkout = pickWorkout(workouts, "full_body", [primaryWorkout.id]);
    alternateReason = "use a second full body option if you want a slightly longer session";
  }

  const items: RecommendationItem[] = [
    {
      workout: primaryWorkout,
      score: primary.score,
      reason: primary.reason
    }
  ];

  if (alternateWorkout) {
    items.push({
      workout: alternateWorkout,
      score: primary.score - 8,
      reason: alternateReason
    });
  }

  if (mobilityWorkout) {
    items.push({
      workout: mobilityWorkout,
      score: 80,
      reason: "take the mobility option for recovery or a lighter day"
    });
  }

  return items.slice(0, 3);
}
