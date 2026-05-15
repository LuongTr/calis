import { Exercise, OnboardingData, Recommendation, UserProfile, WorkoutHistoryEntry, WorkoutTemplate } from '../types';
import { apiRequest, isApiConfigured, isBackendStrictMode } from './api-client';
import { BackendUser, mapBackendUserToProfile } from './auth';
import {
  appendWorkoutHistoryEntry,
  getCustomWorkouts,
  getPendingWorkoutHistory,
  getWorkoutHistory,
  saveWorkoutHistoryEntries,
  updateWorkoutHistoryEntry,
} from './storage';
import { EXERCISES as LOCAL_EXERCISES, getExerciseById as localGetExerciseById } from '../data/exercises';
import { WORKOUT_TEMPLATES as LOCAL_TEMPLATES, getWorkoutById as localGetWorkoutById } from '../data/templates';

let cachedExercises: Exercise[] | null = null;
let cachedTemplates: WorkoutTemplate[] | null = null;

function mergeExercises(base: Exercise[], fallback: Exercise[]): Exercise[] {
  const merged = [...base];
  for (const exercise of fallback) {
    if (!merged.find((item) => item.id === exercise.id)) {
      merged.push(exercise);
    }
  }
  return merged;
}

function mapRowToExercise(row: any): Exercise {
  return {
    id: row.id,
    familyId: row.familyId ?? row.family_id,
    difficultyRank: row.difficultyRank ?? row.difficulty_rank,
    progressionExerciseId: row.progressionExerciseId ?? row.progression_exercise_id,
    regressionExerciseId: row.regressionExerciseId ?? row.regression_exercise_id,
    name: row.name,
    type: row.type || 'calis',
    muscleGroup: row.muscleGroup || row.muscle_group,
    level: row.level,
    format: row.format,
    defaultReps: row.defaultReps ?? row.default_reps,
    defaultTimeSec: row.defaultTimeSec ?? row.default_time_sec,
    defaultSets: row.defaultSets ?? row.default_sets ?? 3,
    restTimeSec: row.restTimeSec ?? row.rest_time_sec ?? 60,
    videoId: row.videoId ?? row.video_id ?? '',
    videoStartSec: row.videoStartSec ?? row.video_start_sec,
    videoEndSec: row.videoEndSec ?? row.video_end_sec,
    shortDescription: row.shortDescription ?? row.short_description ?? '',
    tips: row.tips || [],
    commonMistakes: row.commonMistakes ?? row.common_mistakes ?? [],
    tags: row.tags || [],
  };
}

function mapRowToTemplate(row: any): WorkoutTemplate {
  const exerciseBlocks = row.exerciseBlocks || row.exercise_blocks || [];
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    type: row.type,
    durationMin: row.durationMin ?? row.duration_min,
    goalTags: row.goalTags ?? row.goal_tags ?? [],
    exerciseBlocks: exerciseBlocks.map((block: any, index: number) => ({
      exerciseId: block.exerciseId,
      sets: block.sets,
      reps: block.reps,
      timeSec: block.timeSec,
      restTimeSec: block.restTimeSec,
      order: block.order ?? index,
    })),
  };
}

function mergeTemplates(base: WorkoutTemplate[], custom: WorkoutTemplate[]): WorkoutTemplate[] {
  const merged = [...base];
  for (const workout of custom) {
    if (!merged.find((item) => item.id === workout.id)) {
      merged.push(workout);
    }
  }
  return merged;
}

export async function fetchExercises(): Promise<Exercise[]> {
  if (!isApiConfigured()) {
    return LOCAL_EXERCISES;
  }

  if (cachedExercises) return cachedExercises;

  try {
    const data = await apiRequest<any[] | ExercisesResponse>('/exercises');
    const rows = Array.isArray(data) ? data : data.exercises;
    if (rows.length > 0) {
      cachedExercises = isBackendStrictMode()
        ? rows.map(mapRowToExercise)
        : mergeExercises(rows.map(mapRowToExercise), LOCAL_EXERCISES);
      return cachedExercises;
    }
  } catch (error) {
    console.warn('Failed to fetch exercises from backend:', error);
    if (isBackendStrictMode()) {
      throw error;
    }
  }

  return LOCAL_EXERCISES;
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  if (!isApiConfigured()) {
    return localGetExerciseById(id);
  }

  if (cachedExercises) {
    return (
      cachedExercises.find((exercise) => exercise.id === id) ||
      localGetExerciseById(id)
    );
  }

  try {
    const data = await apiRequest<any | ExerciseResponse>(`/exercises/${id}`);
    const row = typeof data === 'object' && data && 'exercise' in data ? data.exercise : data;
    return mapRowToExercise(row);
  } catch (error) {
    console.warn('Failed to fetch exercise from backend:', error);
    if (isBackendStrictMode()) {
      throw error;
    }
  }

  return localGetExerciseById(id);
}

export function getCachedExerciseById(id: string): Exercise | undefined {
  if (cachedExercises) {
    const matched = cachedExercises.find((exercise) => exercise.id === id);
    if (matched) return matched;
    if (isBackendStrictMode()) return undefined;
    return localGetExerciseById(id);
  }

  if (isApiConfigured() && isBackendStrictMode()) {
    return undefined;
  }
  return localGetExerciseById(id);
}

export async function fetchTemplates(): Promise<WorkoutTemplate[]> {
  const customWorkouts = await getCustomWorkouts();

  if (!isApiConfigured()) {
    const mergedLocal = mergeTemplates(LOCAL_TEMPLATES, customWorkouts);
    cachedTemplates = mergedLocal;
    return mergedLocal;
  }

  if (cachedTemplates) return cachedTemplates;

  try {
    const data = await apiRequest<any[] | WorkoutsResponse>('/workouts');
    const rows = Array.isArray(data) ? data : data.workouts;
    if (rows.length > 0) {
      const baseTemplates = isBackendStrictMode()
        ? rows.map(mapRowToTemplate)
        : mergeTemplates(LOCAL_TEMPLATES, rows.map(mapRowToTemplate));
      cachedTemplates = mergeTemplates(baseTemplates, customWorkouts);
      return cachedTemplates;
    }
  } catch (error) {
    console.warn('Failed to fetch templates from backend:', error);
    if (isBackendStrictMode()) {
      throw error;
    }
  }

  const mergedLocal = mergeTemplates(LOCAL_TEMPLATES, customWorkouts);
  cachedTemplates = mergedLocal;
  return mergedLocal;
}

export async function getWorkoutById(id: string): Promise<WorkoutTemplate | undefined> {
  const customWorkouts = await getCustomWorkouts();

  if (!isApiConfigured()) {
    return customWorkouts.find((template) => template.id === id) || localGetWorkoutById(id);
  }

  if (cachedTemplates) {
    return cachedTemplates.find((template) => template.id === id);
  }

  try {
    const data = await apiRequest<any | WorkoutResponse>(`/workouts/${id}`);
    const row = typeof data === 'object' && data && 'workout' in data ? data.workout : data;
    return mapRowToTemplate(row);
  } catch (error) {
    console.warn('Failed to fetch workout template from backend:', error);
    if (isBackendStrictMode()) {
      throw error;
    }
  }

  return customWorkouts.find((template) => template.id === id) || localGetWorkoutById(id);
}

export function getCachedWorkoutById(id: string): WorkoutTemplate | undefined {
  if (cachedTemplates) {
    return cachedTemplates.find((template) => template.id === id);
  }

  if (isApiConfigured() && isBackendStrictMode()) {
    return undefined;
  }
  return localGetWorkoutById(id);
}

export async function initializeData(): Promise<{
  exercises: Exercise[];
  templates: WorkoutTemplate[];
}> {
  const [exercises, templates] = await Promise.all([
    fetchExercises(),
    fetchTemplates(),
  ]);

  return { exercises, templates };
}

interface RecommendationsResponse {
  contentVersion?: string;
  recommendations: Array<{
    workout: any;
    score: number;
    reason: string;
  }>;
}

interface ExercisesResponse {
  contentVersion?: string;
  exercises: any[];
}

interface ExerciseResponse {
  contentVersion?: string;
  exercise: any;
}

interface WorkoutsResponse {
  contentVersion?: string;
  workouts: any[];
}

interface WorkoutResponse {
  contentVersion?: string;
  workout: any;
}

interface OnboardingSubmitResponse {
  user: BackendUser;
}

interface ProfilePatchResponse {
  user: BackendUser;
}

export async function fetchTodayRecommendations(): Promise<Recommendation[]> {
  if (!isApiConfigured()) {
    return [];
  }

  const data = await apiRequest<RecommendationsResponse>('/recommendations/today', {
    auth: true,
  });

  return data.recommendations.map((item) => ({
    workout: mapRowToTemplate(item.workout),
    score: item.score,
    reason: item.reason,
  }));
}

export async function submitOnboarding(data: OnboardingData): Promise<UserProfile | null> {
  if (!isApiConfigured()) {
    return null;
  }

  const response = await apiRequest<OnboardingSubmitResponse>('/onboarding/submit', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({
      experience: data.experience,
      pushUpLevel: data.pushUpLevel,
      pullUpLevel: data.pullUpLevel,
      squatLevel: data.squatLevel,
      mobilityLevel: data.mobilityLevel,
    }),
  });

  return mapBackendUserToProfile(response.user);
}

export async function updatePreferredVariants(
  preferredVariants: Record<string, string>
): Promise<UserProfile | null> {
  if (!isApiConfigured()) {
    return null;
  }

  const response = await apiRequest<ProfilePatchResponse>('/me', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ preferredVariants }),
  });

  return mapBackendUserToProfile(response.user);
}

export interface WorkoutHistoryRecord {
  workoutId: string;
  workoutTitle: string;
  workoutType: WorkoutHistoryEntry['workoutType'];
  completedAt: string;
  totalSets: number;
  durationSeconds: number;
}

export interface SaveWorkoutHistoryOptions {
  ownerId: string;
  shouldSync: boolean;
}

export async function saveWorkoutHistory(
  record: WorkoutHistoryRecord,
  options: SaveWorkoutHistoryOptions
): Promise<{ synced: boolean }> {
  const entry: WorkoutHistoryEntry = {
    id: `history-${options.ownerId}-${record.workoutId}-${record.completedAt}`,
    ownerId: options.ownerId,
    workoutId: record.workoutId,
    workoutTitle: record.workoutTitle,
    workoutType: record.workoutType,
    completedAt: record.completedAt,
    totalSets: record.totalSets,
    durationSeconds: record.durationSeconds,
    syncStatus: options.shouldSync ? 'pending' : 'synced',
  };

  await appendWorkoutHistoryEntry(entry);

  if (!options.shouldSync) {
    return { synced: true };
  }

  if (!isApiConfigured()) {
    return { synced: false };
  }

  try {
    await apiRequest<{ id: string }>('/history', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(record),
    });
    await updateWorkoutHistoryEntry(entry.id, (current) => ({
      ...current,
      syncStatus: 'synced',
    }));
    return { synced: true };
  } catch (error) {
    console.warn('Failed to save workout history:', error);
    return { synced: false };
  }
}

interface RemoteHistoryRow {
  id: string;
  workoutId: string | null;
  completedAt: string;
  totalSets: number;
  durationSeconds: number;
}

export async function fetchWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  const localHistory = await getWorkoutHistory();

  if (!isApiConfigured()) {
    return localHistory;
  }

  try {
    const rows = await apiRequest<RemoteHistoryRow[]>('/history', { auth: true });
    const templates = cachedTemplates ?? (await fetchTemplates());

    const remoteHistory: WorkoutHistoryEntry[] = rows.map((row) => {
      const workout = templates.find((template) => template.id === row.workoutId);
      return {
        id: row.id,
        ownerId: 'remote',
        workoutId: row.workoutId || 'unknown-workout',
        workoutTitle: workout?.title || 'Workout',
        workoutType: (workout?.type || 'full_body') as WorkoutHistoryEntry['workoutType'],
        completedAt: row.completedAt,
        totalSets: row.totalSets,
        durationSeconds: row.durationSeconds,
        syncStatus: 'synced' as const,
      };
    });

    const merged = [...remoteHistory];
    for (const entry of localHistory) {
      const exists = merged.find(
        (item) => item.workoutId === entry.workoutId && item.completedAt === entry.completedAt
      );
      if (!exists) {
        merged.push(entry);
      }
    }

    merged.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return merged.slice(0, 50);
  } catch (error) {
    console.warn('Failed to fetch workout history, using local data:', error);
    return localHistory;
  }
}

function makeHistoryKey(entry: Pick<WorkoutHistoryEntry, 'ownerId' | 'workoutId' | 'completedAt'>): string {
  return `${entry.ownerId}:${entry.workoutId}:${entry.completedAt}`;
}

function mapRemoteHistoryRow(
  row: RemoteHistoryRow,
  templates: WorkoutTemplate[],
  ownerId: string
): WorkoutHistoryEntry {
  const workout = templates.find((template) => template.id === row.workoutId);
  return {
    id: row.id,
    ownerId,
    workoutId: row.workoutId || 'unknown-workout',
    workoutTitle: workout?.title || 'Workout',
    workoutType: (workout?.type || 'full_body') as WorkoutHistoryEntry['workoutType'],
    completedAt: row.completedAt,
    totalSets: row.totalSets,
    durationSeconds: row.durationSeconds,
    syncStatus: 'synced',
  };
}

export async function fetchWorkoutHistoryForProfile(profile: UserProfile): Promise<WorkoutHistoryEntry[]> {
  const localHistory = await getWorkoutHistory(profile.id);

  if (profile.authMode !== 'account' || !isApiConfigured()) {
    return localHistory;
  }

  try {
    const rows = await apiRequest<RemoteHistoryRow[]>('/history', { auth: true });
    const templates = cachedTemplates ?? (await fetchTemplates());
    const remoteHistory = rows.map((row) => mapRemoteHistoryRow(row, templates, profile.id));
    const mergedByKey = new Map<string, WorkoutHistoryEntry>();

    for (const entry of remoteHistory) {
      mergedByKey.set(makeHistoryKey(entry), entry);
    }

    for (const entry of localHistory) {
      const key = makeHistoryKey(entry);
      if (!mergedByKey.has(key) || entry.syncStatus === 'pending') {
        mergedByKey.set(key, entry);
      }
    }

    const merged = Array.from(mergedByKey.values()).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    await saveWorkoutHistoryEntries(merged.slice(0, 50));
    return merged.slice(0, 50);
  } catch (error) {
    console.warn('Failed to fetch workout history, using local data:', error);
    return localHistory;
  }
}

export async function syncPendingWorkoutHistory(ownerId: string): Promise<number> {
  if (!isApiConfigured()) {
    return 0;
  }

  const pendingEntries = await getPendingWorkoutHistory(ownerId);
  let syncedCount = 0;

  for (const entry of pendingEntries) {
    try {
      await apiRequest<{ id: string }>('/history', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          workoutId: entry.workoutId,
          workoutTitle: entry.workoutTitle,
          workoutType: entry.workoutType,
          completedAt: entry.completedAt,
          totalSets: entry.totalSets,
          durationSeconds: entry.durationSeconds,
        }),
      });
      await updateWorkoutHistoryEntry(entry.id, (current) => ({
        ...current,
        syncStatus: 'synced',
      }));
      syncedCount += 1;
    } catch (error) {
      console.warn('Failed to sync pending workout history entry:', error);
    }
  }

  return syncedCount;
}
