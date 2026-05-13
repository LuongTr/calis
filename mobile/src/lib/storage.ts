import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, OnboardingData, WorkoutHistoryEntry, WorkoutTemplate } from '../types';

const KEYS = {
  USER_PROFILE: '@calis_user_profile',
  ONBOARDING: '@calis_onboarding',
  AUTH_TOKEN: '@calis_auth_token',
  WORKOUT_HISTORY: '@calis_workout_history',
  CUSTOM_WORKOUTS: '@calis_custom_workouts',
};

function normalizeUserProfile(profile: Partial<UserProfile> | null): UserProfile | null {
  if (!profile?.id || !profile.createdAt) {
    return null;
  }

  return {
    id: String(profile.id),
    authMode:
      profile.authMode ||
      (typeof profile.id === 'string' && profile.id.startsWith('user-') ? 'guest' : 'account'),
    email: profile.email,
    displayName: profile.displayName,
    onboardingCompleted: Boolean(profile.onboardingCompleted),
    onboardingData: profile.onboardingData,
    lastWorkoutType: profile.lastWorkoutType,
    lastWorkoutDate: profile.lastWorkoutDate,
    createdAt: String(profile.createdAt),
  };
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? normalizeUserProfile(JSON.parse(data)) : null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getOnboardingData(): Promise<OnboardingData | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ONBOARDING);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveOnboardingData(data: OnboardingData): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING, JSON.stringify(data));
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

export async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
}

export async function clearSessionData(options?: { preserveCustomWorkouts?: boolean }): Promise<void> {
  const keys = [
    KEYS.USER_PROFILE,
    KEYS.ONBOARDING,
    KEYS.AUTH_TOKEN,
    KEYS.WORKOUT_HISTORY,
  ];

  if (!options?.preserveCustomWorkouts) {
    keys.push(KEYS.CUSTOM_WORKOUTS);
  }

  await AsyncStorage.multiRemove(keys);
}

export async function clearAllData(): Promise<void> {
  await clearSessionData();
}

function normalizeHistoryEntry(entry: WorkoutHistoryEntry | (Partial<WorkoutHistoryEntry> & Record<string, unknown>)): WorkoutHistoryEntry | null {
  if (!entry.id || !entry.workoutId || !entry.completedAt || !entry.workoutTitle || !entry.workoutType) {
    return null;
  }

  return {
    id: String(entry.id),
    ownerId: typeof entry.ownerId === 'string' ? entry.ownerId : 'legacy',
    workoutId: String(entry.workoutId),
    workoutTitle: String(entry.workoutTitle),
    workoutType: entry.workoutType as WorkoutHistoryEntry['workoutType'],
    completedAt: String(entry.completedAt),
    totalSets: Number(entry.totalSets ?? 0),
    durationSeconds: Number(entry.durationSeconds ?? 0),
    syncStatus: entry.syncStatus === 'pending' ? 'pending' : 'synced',
  };
}

export async function getWorkoutHistory(ownerId?: string): Promise<WorkoutHistoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORKOUT_HISTORY);
    const parsed = data ? (JSON.parse(data) as Array<Partial<WorkoutHistoryEntry>>) : [];
    const normalized = parsed
      .map((entry) => normalizeHistoryEntry(entry))
      .filter((entry): entry is WorkoutHistoryEntry => Boolean(entry));

    if (!ownerId) {
      return normalized;
    }

    return normalized.filter((entry) => entry.ownerId === ownerId || entry.ownerId === 'legacy');
  } catch {
    return [];
  }
}

export async function saveWorkoutHistoryEntries(entries: WorkoutHistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(entries));
}

export async function appendWorkoutHistoryEntry(entry: WorkoutHistoryEntry): Promise<void> {
  const existing = await getWorkoutHistory();
  const updated = [entry, ...existing].slice(0, 50);
  await saveWorkoutHistoryEntries(updated);
}

export async function updateWorkoutHistoryEntry(
  entryId: string,
  updater: (entry: WorkoutHistoryEntry) => WorkoutHistoryEntry
): Promise<void> {
  const existing = await getWorkoutHistory();
  const updated = existing.map((entry) => (entry.id === entryId ? updater(entry) : entry));
  await saveWorkoutHistoryEntries(updated);
}

export async function getPendingWorkoutHistory(ownerId: string): Promise<WorkoutHistoryEntry[]> {
  const entries = await getWorkoutHistory(ownerId);
  return entries.filter((entry) => entry.syncStatus === 'pending');
}

export async function getCustomWorkouts(): Promise<WorkoutTemplate[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CUSTOM_WORKOUTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveCustomWorkouts(workouts: WorkoutTemplate[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(workouts));
}
