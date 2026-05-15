// ============================================================
// Core Types for Calisthenics Guided Training App
// ============================================================

// --- Onboarding / Profile ---

export type TrainingExperience = 'completely_new' | 'some_experience' | 'experienced';

export type UserLevel = 'beginner' | 'intermediate';

export type TrainingStyle = 'full_body' | 'upper_lower' | 'push_pull_legs';

export type AuthMode = 'guest' | 'account';

export interface OnboardingData {
  experience: TrainingExperience;
  pushUpLevel?: number;
  pullUpLevel?: number;
  squatLevel?: number;
  mobilityLevel: 'stiff' | 'normal' | 'flexible';
  userLevel: UserLevel;
  trainingStyle: TrainingStyle;
}

export interface UserProfile {
  id: string;
  authMode: AuthMode;
  email?: string;
  displayName?: string;
  preferredVariants?: Record<string, string>;
  onboardingCompleted: boolean;
  onboardingData?: OnboardingData;
  lastWorkoutType?: WorkoutType;
  lastWorkoutDate?: string; // ISO date string
  createdAt: string;
}

// --- Exercise ---

export type ExerciseFormat = 'reps' | 'time';

export type MuscleGroup = 'push' | 'pull' | 'legs' | 'core' | 'full';

export type ExerciseType = 'calis' | 'mobility';

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  familyId?: string;
  difficultyRank?: number;
  progressionExerciseId?: string;
  regressionExerciseId?: string;
  name: string;
  type: ExerciseType;
  muscleGroup: MuscleGroup;
  level: ExerciseLevel;
  format: ExerciseFormat;
  defaultReps?: number;
  defaultTimeSec?: number;
  defaultSets: number;
  restTimeSec: number;
  videoId: string; // YouTube video ID
  videoStartSec?: number; // Start time in seconds (optional)
  videoEndSec?: number;   // End time in seconds (optional)
  shortDescription: string;
  tips: string[];
  commonMistakes: string[];
  tags: string[];
}

// --- Workout Templates ---

export type WorkoutType = 'full_body' | 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'mobility';

export interface ExerciseBlock {
  exerciseId: string;
  sets: number;
  reps?: number;
  timeSec?: number;
  restTimeSec: number;
  order: number;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  level: UserLevel;
  type: WorkoutType;
  durationMin: number;
  goalTags: string[];
  exerciseBlocks: ExerciseBlock[];
}

// --- Session State Machine ---

export type SessionStatus = 'idle' | 'active_set' | 'rest' | 'transition' | 'complete';

export type SessionEvent =
  | { type: 'START_WORKOUT' }
  | { type: 'DONE' }
  | { type: 'TIMER_DONE' }
  | { type: 'SKIP' }
  | { type: 'ADJUST_REST'; payload: number };

export interface SessionState {
  workoutId: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  restSeconds: number;
  defaultRestSeconds: number;
  status: SessionStatus;
  nextAction: 'NEXT_SET' | 'NEXT_EXERCISE' | null;
  completedSets: number;
  totalSets: number;
}

// --- Recommendations ---

export interface Recommendation {
  workout: WorkoutTemplate;
  score: number;
  reason: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  ownerId: string;
  workoutId: string;
  workoutTitle: string;
  workoutType: WorkoutType;
  completedAt: string;
  totalSets: number;
  durationSeconds: number;
  syncStatus: 'synced' | 'pending';
}

// --- Navigation Types ---

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Home: undefined;
  WorkoutList: undefined;
  WorkoutDetail: { workoutId: string };
  Session: { workoutId: string };
  Rest: undefined;
  Complete: { workoutId: string };
  Profile: undefined;
};

// --- Skill System (Future-ready stubs) ---

export interface SkillStage {
  id: string;
  name: string;
  description: string;
  exercises: string[]; // exercise IDs
}

export interface SkillTrack {
  id: string;
  name: string;
  stages: SkillStage[];
}
