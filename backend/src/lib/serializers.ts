import { AuthUser } from "../types/index.js";

export function toAuthUser(row: {
  id: string;
  email: string;
  displayName: string | null;
  onboardingCompleted: boolean;
  level: string;
  trainingStyle: string;
  mobilityLevel: string;
  experience: string | null;
  pushUpLevel: number | null;
  pullUpLevel: number | null;
  squatLevel: number | null;
  lastWorkoutDate: Date | null;
  lastWorkoutType: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    onboardingCompleted: row.onboardingCompleted,
    level: row.level as AuthUser["level"],
    trainingStyle: row.trainingStyle as AuthUser["trainingStyle"],
    mobilityLevel: row.mobilityLevel as AuthUser["mobilityLevel"],
    experience: row.experience,
    pushUpLevel: row.pushUpLevel,
    pullUpLevel: row.pullUpLevel,
    squatLevel: row.squatLevel,
    lastWorkoutDate: row.lastWorkoutDate ? row.lastWorkoutDate.toISOString() : null,
    lastWorkoutType: row.lastWorkoutType,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}
