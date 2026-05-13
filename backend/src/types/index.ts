export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  onboardingCompleted: boolean;
  level: "beginner" | "intermediate";
  trainingStyle: "full_body" | "upper_lower" | "push_pull_legs";
  mobilityLevel: "stiff" | "normal" | "flexible";
  experience: string | null;
  pushUpLevel: number | null;
  pullUpLevel: number | null;
  squatLevel: number | null;
  lastWorkoutDate: string | null;
  lastWorkoutType: string | null;
  createdAt: string;
  updatedAt: string;
}
