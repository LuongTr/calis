import {
  saveUserProfile,
  getUserProfile,
  clearSessionData,
  saveAuthToken,
  getAuthToken,
} from './storage';
import { OnboardingData, UserProfile, WorkoutType } from '../types';
import { ApiError, apiRequest, isApiConfigured } from './api-client';

export interface BackendUser {
  id: string;
  email: string;
  displayName: string | null;
  preferredVariants?: Record<string, string> | null;
  onboardingCompleted: boolean;
  level: 'beginner' | 'intermediate';
  trainingStyle: 'full_body' | 'upper_lower' | 'push_pull_legs';
  mobilityLevel: 'stiff' | 'normal' | 'flexible';
  experience: OnboardingData['experience'] | null;
  pushUpLevel: number | null;
  pullUpLevel: number | null;
  squatLevel: number | null;
  lastWorkoutDate: string | null;
  lastWorkoutType: WorkoutType | null;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: BackendUser;
}

interface SessionResponse {
  user: BackendUser;
}

interface AuthResult {
  data: { user: { id: string } } | null;
  error: string | null;
  isConnectionError?: boolean;
}

export function mapBackendUserToProfile(user: BackendUser): UserProfile {
  const normalizedDisplayName =
    user.displayName?.trim() || user.email.split('@')[0] || 'User';

  const onboardingData: OnboardingData | undefined = user.onboardingCompleted
    ? {
        experience: user.experience || 'completely_new',
        pushUpLevel: user.pushUpLevel ?? undefined,
        pullUpLevel: user.pullUpLevel ?? undefined,
        squatLevel: user.squatLevel ?? undefined,
        mobilityLevel: user.mobilityLevel,
        userLevel: user.level,
        trainingStyle: user.trainingStyle,
      }
    : undefined;

  return {
    id: user.id,
    authMode: 'account',
    email: user.email,
    displayName: normalizedDisplayName,
    preferredVariants: user.preferredVariants || {},
    onboardingCompleted: user.onboardingCompleted,
    onboardingData,
    lastWorkoutDate: user.lastWorkoutDate || undefined,
    lastWorkoutType: user.lastWorkoutType || undefined,
    createdAt: user.createdAt,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Wrong email or password.';
    if (error.status === 409) return 'Email already registered. Try signing in.';
    if (error.status === 0) return error.message || 'Unable to reach backend API.';
    return error.message || 'Something went wrong. Please try again.';
  }

  if (error instanceof Error) {
    return error.message || 'Something went wrong. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}

async function persistAuthSession(payload: AuthResponse | SessionResponse, token?: string): Promise<UserProfile> {
  if (token) {
    await saveAuthToken(token);
  }

  const profile = mapBackendUserToProfile(payload.user);
  await saveUserProfile(profile);
  return profile;
}

export async function signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
  if (!isApiConfigured()) {
    return {
      data: null,
      error: 'Backend API is not configured. Use Quick Start or set EXPO_PUBLIC_API_URL.',
      isConnectionError: false,
    };
  }

  try {
    const response = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    const profile = await persistAuthSession(response, response.token);
    return { data: { user: { id: profile.id } }, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
      isConnectionError: error instanceof ApiError && error.status === 0,
    };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isApiConfigured()) {
    return {
      data: null,
      error: 'Backend API is not configured. Use Quick Start or set EXPO_PUBLIC_API_URL.',
      isConnectionError: false,
    };
  }

  try {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const profile = await persistAuthSession(response, response.token);
    return { data: { user: { id: profile.id } }, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
      isConnectionError: error instanceof ApiError && error.status === 0,
    };
  }
}

export async function signOut() {
  await clearSessionData({ preserveCustomWorkouts: true });
  return { error: null };
}

export async function getSession() {
  const token = await getAuthToken();
  if (!token) {
    return { data: { session: null }, error: null };
  }

  if (!isApiConfigured()) {
    return {
      data: { session: null },
      error: 'Backend API is not configured. Sign in is unavailable until EXPO_PUBLIC_API_URL is set.',
    };
  }

  try {
    const response = await apiRequest<SessionResponse>('/me', { auth: true });
    const profile = await persistAuthSession(response);
    return { data: { session: { user: { id: profile.id } } }, error: null };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearSessionData({ preserveCustomWorkouts: true });
      return { data: { session: null }, error: getErrorMessage(error) };
    }

    const profile = await getUserProfile();
    if (!profile || profile.authMode !== 'account') {
      return {
        data: { session: null },
        error: getErrorMessage(error),
      };
    }

    return {
      data: { session: { user: { id: profile.id } } },
      error: getErrorMessage(error),
    };
  }
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const subscription = {
    unsubscribe: () => {},
  };

  getSession().then(({ data }) => {
    callback(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
  });

  return { data: { subscription } };
}
