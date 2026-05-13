import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';

import AuthScreen from './src/features/auth/AuthScreen';
import OnboardingScreen from './src/features/onboarding/OnboardingScreen';
import HomeScreen from './src/features/home/HomeScreen';
import WorkoutListScreen from './src/features/workout/WorkoutListScreen';
import WorkoutDetailScreen from './src/features/workout/WorkoutDetailScreen';
import SessionScreen from './src/features/session/SessionScreen';
import ProfileScreen from './src/features/profile/ProfileScreen';
import CustomWorkoutBuilderScreen from './src/features/workout/CustomWorkoutBuilderScreen';
import {
  getUserProfile,
  saveCustomWorkouts,
  saveUserProfile,
  saveOnboardingData,
} from './src/lib/storage';
import { getSession, signIn, signOut, signUp } from './src/lib/auth';
import { getRecommendations as getLocalRecommendations } from './src/features/recommendation/recommendationEngine';
import { WORKOUT_TEMPLATES as LOCAL_TEMPLATES } from './src/data/templates';
import {
  fetchWorkoutHistoryForProfile,
  fetchTodayRecommendations,
  initializeData,
  saveWorkoutHistory,
  submitOnboarding,
  syncPendingWorkoutHistory,
} from './src/lib/api';
import { apiRequest, checkBackendHealth, isApiConfigured } from './src/lib/api-client';
import {
  Exercise,
  OnboardingData,
  Recommendation,
  TrainingStyle,
  UserProfile,
  WorkoutHistoryEntry,
  WorkoutTemplate,
} from './src/types';
import { COLORS, FONTS } from './src/constants/theme';

type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  WorkoutDetail: { workoutId: string };
  Session: { workoutId: string };
  CustomWorkoutBuilder: undefined;
};

type TabParamList = {
  Home: undefined;
  Workouts: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: 'H',
    Workouts: 'W',
    Profile: 'P',
  };

  return (
    <View style={tabStyles.iconContainer}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icons[label] || '.'}</Text>
    </View>
  );
}

function isGuestProfile(profile: UserProfile): boolean {
  return profile.authMode === 'guest';
}

function mergeWorkouts(primary: WorkoutTemplate[], fallback: WorkoutTemplate[]): WorkoutTemplate[] {
  const merged = [...primary];
  for (const workout of fallback) {
    if (!merged.find((item) => item.id === workout.id)) {
      merged.push(workout);
    }
  }
  return merged;
}

function getWeeklySessions(history: WorkoutHistoryEntry[]): number {
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter((entry) => new Date(entry.completedAt).getTime() >= weekStart).length;
}

interface AppData {
  profile: UserProfile;
  recommendations: Recommendation[];
  workouts: WorkoutTemplate[];
  history: WorkoutHistoryEntry[];
  statusMessage: string | null;
  exercises: Exercise[];
  onChangeTrainingStyle: (style: TrainingStyle) => Promise<void>;
  onRetakeOnboarding: () => Promise<void>;
  onLogout: () => Promise<void>;
  onCreateAccount: () => Promise<void>;
}

type BackendStatus = 'checking' | 'connected' | 'offline' | 'not_configured';

function MainTabs({
  appData,
  navigationRef,
}: {
  appData: AppData;
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}) {
  const {
    profile,
    recommendations,
    workouts,
    history,
    statusMessage,
    onChangeTrainingStyle,
    onRetakeOnboarding,
    onLogout,
    onCreateAccount,
  } = appData;

  const handleStartWorkout = useCallback((workoutId: string, navigation: any) => {
    navigation.navigate('Session', { workoutId });
  }, []);

  const handleViewWorkout = useCallback((workoutId: string, navigation: any) => {
    navigation.navigate('WorkoutDetail', { workoutId });
  }, []);

  const handleRepeatLastWorkout = useCallback(
    (navigation: any) => {
      const latest = history[0];
      if (!latest) return;
      navigation.navigate('Session', { workoutId: latest.workoutId });
    },
    [history]
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: tabStyles.tabBar,
        tabBarLabelStyle: tabStyles.tabLabel,
      })}
    >
      <Tab.Screen name="Home">
        {({ navigation }) => (
          <HomeScreen
            profile={profile}
            recommendations={recommendations}
            recentWorkoutTitle={history[0]?.workoutTitle || null}
            weeklySessions={getWeeklySessions(history)}
            onStartWorkout={(id) => handleStartWorkout(id, navigation)}
            onViewWorkout={(id) => handleViewWorkout(id, navigation)}
            onViewWorkoutList={() => navigation.navigate('Workouts')}
            onRepeatLastWorkout={() => handleRepeatLastWorkout(navigation)}
            onProfile={() => navigation.navigate('Profile')}
            statusMessage={statusMessage}
            showCreateAccountPrompt={
              profile.authMode === 'guest' &&
              (profile.onboardingCompleted || history.length >= 1)
            }
            onCreateAccount={() => onCreateAccount().then(() => {
              navigationRef.current?.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Workouts">
        {({ navigation }) => (
          <WorkoutListScreen
            workouts={workouts}
            onSelectWorkout={(id) => handleViewWorkout(id, navigation)}
            onCreateCustom={() => navigation.navigate('CustomWorkoutBuilder')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {({ navigation }) => (
          <ProfileScreen
            profile={profile}
            history={history}
            onRetakeOnboarding={() => onRetakeOnboarding().then(() => {
              navigationRef.current?.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
            })}
            onChangeTrainingStyle={onChangeTrainingStyle}
            onBack={() => navigation.goBack()}
            onLogout={() => onLogout().then(() => {
              navigationRef.current?.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            })}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function WorkoutDetailWrapper({
  route,
  navigation,
  workouts,
}: NativeStackScreenProps<RootStackParamList, 'WorkoutDetail'> & {
  workouts: WorkoutTemplate[];
}) {
  const workout = workouts.find((item) => item.id === route.params.workoutId);
  if (!workout) return null;

  return (
    <WorkoutDetailScreen
      workout={workout}
      onStart={(id) => navigation.navigate('Session', { workoutId: id })}
      onBack={() => navigation.goBack()}
    />
  );
}

function SessionWrapper({
  route,
  navigation,
  onSessionComplete,
  workouts,
}: NativeStackScreenProps<RootStackParamList, 'Session'> & {
  onSessionComplete: (workoutId: string) => void;
  workouts: WorkoutTemplate[];
}) {
  const workout = workouts.find((item) => item.id === route.params.workoutId);
  if (!workout) return null;

  return (
    <SessionScreen
      workout={workout}
      onComplete={(id) => {
        onSessionComplete(id);
        navigation.popToTop();
      }}
      onExit={() => navigation.goBack()}
    />
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>(LOCAL_TEMPLATES);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(
    isApiConfigured() ? 'checking' : 'not_configured'
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const workoutsRef = useRef<WorkoutTemplate[]>(LOCAL_TEMPLATES);

  useEffect(() => {
    workoutsRef.current = workouts;
  }, [workouts]);

  const refreshHistory = useCallback(async (targetProfile: UserProfile | null) => {
    if (!targetProfile) {
      setHistory([]);
      return [];
    }

    const items = await fetchWorkoutHistoryForProfile(targetProfile);
    setHistory(items);
    return items;
  }, []);

  const syncPendingHistory = useCallback(async (targetProfile: UserProfile | null) => {
    if (!targetProfile || targetProfile.authMode !== 'account') {
      return 0;
    }

    const syncedCount = await syncPendingWorkoutHistory(targetProfile.id);
    if (syncedCount > 0) {
      setBackendStatus('connected');
      setStatusMessage(null);
    }
    return syncedCount;
  }, []);

  const refreshRecommendations = useCallback(
    async (
      targetProfile: UserProfile,
      templates: WorkoutTemplate[] = workoutsRef.current
    ) => {
      const shouldUseBackend =
        isApiConfigured() &&
        !isGuestProfile(targetProfile) &&
        targetProfile.onboardingCompleted;

      if (shouldUseBackend) {
        try {
          const remoteRecommendations = await fetchTodayRecommendations();
          if (remoteRecommendations.length > 0) {
            setBackendStatus('connected');
            setStatusMessage(null);
            setRecommendations(remoteRecommendations);
            return remoteRecommendations;
          }
        } catch {
          setBackendStatus('offline');
          setStatusMessage(
            'Using local recommendations because backend recommendation sync is unavailable.'
          );
        }
      }

      const fallbackRecommendations = getLocalRecommendations(targetProfile, 3, templates);
      setRecommendations(fallbackRecommendations);
      return fallbackRecommendations;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const { exercises: loadedExercises, templates } = await initializeData().catch(() => ({
        exercises: [],
        templates: LOCAL_TEMPLATES,
      }));
      const mergedTemplates = mergeWorkouts(templates, LOCAL_TEMPLATES);

      if (cancelled) return;

      setExercises(loadedExercises);
      setWorkouts(mergedTemplates);

      const storedProfile = await getUserProfile();
      if (storedProfile?.authMode === 'guest') {
        await signOut();
      }

      let restoredProfile: UserProfile | null = null;
      let nextStatus: BackendStatus = isApiConfigured() ? 'checking' : 'not_configured';
      let nextMessage: string | null =
        nextStatus === 'not_configured'
          ? 'Quick Start is available locally. Set EXPO_PUBLIC_API_URL to enable email accounts and sync.'
          : null;

      if (isApiConfigured()) {
        const sessionResult = await getSession();
        if (sessionResult.data.session) {
          restoredProfile = await getUserProfile();
          if (sessionResult.error) {
            nextStatus = 'offline';
            nextMessage = 'Signed in with cached account data. Backend sync will resume when the API is reachable.';
          } else {
            nextStatus = 'connected';
          }
        } else {
          const isHealthy = await checkBackendHealth();
          nextStatus = isHealthy ? 'connected' : 'offline';
          nextMessage = isHealthy
            ? null
            : 'Backend is unreachable right now. Quick Start still works, but email account sync is unavailable.';
        }
      }

      if (cancelled) return;

      setBackendStatus(nextStatus);
      setStatusMessage(nextMessage);

      if (restoredProfile) {
        setProfile(restoredProfile);
        await syncPendingHistory(restoredProfile);
        await refreshHistory(restoredProfile);

        if (restoredProfile.onboardingCompleted) {
          await refreshRecommendations(restoredProfile, mergedTemplates);
        } else {
          setRecommendations([]);
        }
      } else {
        setProfile(null);
        setRecommendations([]);
        setHistory([]);
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refreshHistory, refreshRecommendations, syncPendingHistory]);

  useEffect(() => {
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    if (!profile && currentRoute && currentRoute !== 'Auth') {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile || profile.authMode !== 'account') {
      return;
    }

    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState !== 'active') {
        return;
      }

      const syncedCount = await syncPendingHistory(profile);
      if (syncedCount > 0) {
        await refreshHistory(profile);
        await refreshRecommendations(profile);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [profile, refreshHistory, refreshRecommendations, syncPendingHistory]);

  const handleGuestStart = useCallback(async () => {
    const guestProfile: UserProfile = {
      id: 'user-' + Date.now(),
      authMode: 'guest',
      displayName: 'Guest',
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setProfile(guestProfile);
    setHistory([]);
    setRecommendations([]);
    setAuthError(null);
    setStatusMessage(
      backendStatus === 'connected'
        ? 'You are in guest mode. Create an account later if you want synced progress.'
        : 'You are in guest mode. Progress stays on this device until backend sync is available.'
    );

    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });

    try {
      await signOut();
      await saveUserProfile(guestProfile);
    } catch {
      setAuthError('Failed to initialize guest session. Please try again.');
    }
  }, [backendStatus]);

  const handleChangeTrainingStyle = useCallback(
    async (style: TrainingStyle) => {
      if (!profile || !profile.onboardingData) return;

      const updatedProfile: UserProfile = {
        ...profile,
        onboardingData: {
          ...profile.onboardingData,
          trainingStyle: style,
        },
      };

      setProfile(updatedProfile);
      await saveUserProfile(updatedProfile);

      if (isApiConfigured() && !isGuestProfile(updatedProfile)) {
        try {
          await apiRequest('/me', {
            method: 'PATCH',
            auth: true,
            body: JSON.stringify({ trainingStyle: style }),
          });
          setBackendStatus('connected');
        } catch {
          setBackendStatus('offline');
        }
      }

      await refreshRecommendations(updatedProfile, workouts);
    },
    [profile, refreshRecommendations, workouts]
  );

  const handleOnboardingComplete = useCallback(
    async (data: OnboardingData) => {
      if (!profile) return;

      const updatedProfile: UserProfile = {
        ...profile,
        onboardingCompleted: true,
        onboardingData: data,
      };

      setProfile(updatedProfile);
      await saveUserProfile(updatedProfile);
      await saveOnboardingData(data);

      try {
        if (isApiConfigured() && !isGuestProfile(updatedProfile)) {
          const remoteProfile = await submitOnboarding(data);
          if (remoteProfile) {
            setProfile(remoteProfile);
            await saveUserProfile(remoteProfile);
            await refreshRecommendations(remoteProfile, workouts);
          } else {
            await refreshRecommendations(updatedProfile, workouts);
          }
        } else {
          await refreshRecommendations(updatedProfile, workouts);
        }
      } catch {
        if (isApiConfigured()) {
          setBackendStatus('offline');
          setStatusMessage(
            'Onboarding was saved on this device. Backend sync will retry when the API is reachable.'
          );
        }
        await refreshRecommendations(updatedProfile, workouts);
      }

      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    },
    [profile, refreshRecommendations, workouts]
  );

  const handleSessionComplete = useCallback(
    async (workoutId: string) => {
      if (!profile) return;

      const workout = workouts.find((item) => item.id === workoutId);
      const completedAt = new Date().toISOString();
      const updatedProfile: UserProfile = {
        ...profile,
        lastWorkoutType: workout?.type || profile.lastWorkoutType,
        lastWorkoutDate: completedAt,
      };

      setProfile(updatedProfile);
      await saveUserProfile(updatedProfile);

      if (workout) {
        const historyResult = await saveWorkoutHistory({
          workoutId,
          workoutTitle: workout.title,
          workoutType: workout.type,
          completedAt,
          totalSets: workout.exerciseBlocks.reduce((sum, block) => sum + block.sets, 0),
          durationSeconds: workout.durationMin * 60,
        }, {
          ownerId: profile.id,
          shouldSync: profile.authMode === 'account',
        });

        if (!historyResult.synced && profile.authMode === 'account') {
          setBackendStatus('offline');
          setStatusMessage(
            'Workout saved on this device. Backend sync will resume when the API is reachable.'
          );
        } else if (historyResult.synced && profile.authMode === 'account') {
          setBackendStatus('connected');
          setStatusMessage(null);
        }
      }

      await refreshHistory(updatedProfile);
      await refreshRecommendations(updatedProfile, workouts);
    },
    [profile, refreshHistory, refreshRecommendations, workouts]
  );

  const handleCreateCustomWorkout = useCallback(
    async (workout: WorkoutTemplate) => {
      const nextWorkouts = mergeWorkouts(workouts, [workout]);
      const customOnly = nextWorkouts.filter((item) => item.goalTags.includes('custom'));
      setWorkouts(nextWorkouts);
      await saveCustomWorkouts(customOnly);

      if (profile?.onboardingCompleted) {
        await refreshRecommendations(profile, nextWorkouts);
      }

      navigationRef.current?.goBack();
    },
    [profile, refreshRecommendations, workouts]
  );

  const handleRetakeOnboarding = useCallback(async () => {
    if (!profile) return;

    const resetProfile: UserProfile = {
      ...profile,
      onboardingCompleted: false,
      onboardingData: undefined,
    };

    setProfile(resetProfile);
    setRecommendations([]);
    await saveUserProfile(resetProfile);
  }, [profile]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setProfile(null);
    setRecommendations([]);
    setHistory([]);
    setAuthError(null);
    setStatusMessage(null);
  }, []);

  const handleCreateAccount = useCallback(async () => {
    await signOut();
    setProfile(null);
    setRecommendations([]);
    setHistory([]);
    setAuthError(null);
    setStatusMessage(
      'Guest mode is temporary. Create an account to keep progress synced across launches.'
    );
  }, []);

  const authHelperMessage =
    backendStatus === 'not_configured'
      ? 'Quick Start works now. To use email signup and login, set EXPO_PUBLIC_API_URL to your backend URL.'
      : backendStatus === 'offline'
      ? 'Backend is unreachable. Quick Start still works locally, but email account features need the backend.'
      : null;

  const handleEmailLogin = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      const { data, error, isConnectionError } = await signIn(email, password);
      if (error) {
        setAuthError(error);
        if (isConnectionError) setBackendStatus('offline');
        return;
      }
      if (!data?.user) return;

      const savedProfile = await getUserProfile();
      if (!savedProfile) return;

      setProfile(savedProfile);
      setBackendStatus('connected');
      setStatusMessage(null);
      await syncPendingHistory(savedProfile);
      await refreshHistory(savedProfile);

      if (savedProfile.onboardingCompleted) {
        await refreshRecommendations(savedProfile, workouts);
      } else {
        setRecommendations([]);
      }

      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: savedProfile.onboardingCompleted ? 'MainTabs' : 'Onboarding' }],
      });
    },
    [refreshHistory, refreshRecommendations, syncPendingHistory, workouts]
  );

  const handleEmailSignup = useCallback(
    async (email: string, password: string, displayName: string) => {
      setAuthError(null);
      const { data, error, isConnectionError } = await signUp(email, password, displayName);
      if (error) {
        setAuthError(error);
        if (isConnectionError) setBackendStatus('offline');
        return;
      }
      if (!data?.user) return;

      const savedProfile = await getUserProfile();
      if (!savedProfile) return;

      setProfile(savedProfile);
      setBackendStatus('connected');
      setStatusMessage(null);
      await syncPendingHistory(savedProfile);
      await refreshHistory(savedProfile);

      if (savedProfile.onboardingCompleted) {
        await refreshRecommendations(savedProfile, workouts);
      } else {
        setRecommendations([]);
      }

      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: savedProfile.onboardingCompleted ? 'MainTabs' : 'Onboarding' }],
      });
    },
    [refreshHistory, refreshRecommendations, syncPendingHistory, workouts]
  );

  const renderAuthScreen = useCallback(
    () => (
      <AuthScreen
        onLogin={handleGuestStart}
        onSignup={handleGuestStart}
        error={authError}
        helperMessage={authHelperMessage}
        onEmailLogin={handleEmailLogin}
        onEmailSignup={handleEmailSignup}
      />
    ),
    [authError, authHelperMessage, handleEmailLogin, handleEmailSignup, handleGuestStart]
  );

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your training app...</Text>
      </View>
    );
  }

  const appData: AppData = {
    profile: profile!,
    recommendations,
    workouts,
    history,
    statusMessage,
    exercises,
    onChangeTrainingStyle: handleChangeTrainingStyle,
    onRetakeOnboarding: handleRetakeOnboarding,
    onLogout: handleLogout,
    onCreateAccount: handleCreateAccount,
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" />
      <RootStack.Navigator
        initialRouteName={profile ? (profile.onboardingCompleted ? 'MainTabs' : 'Onboarding') : 'Auth'}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <RootStack.Screen name="Auth">{renderAuthScreen}</RootStack.Screen>

        <RootStack.Screen name="Onboarding">
          {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
        </RootStack.Screen>

        <RootStack.Screen name="MainTabs">
          {() => (profile ? <MainTabs appData={appData} navigationRef={navigationRef} /> : null)}
        </RootStack.Screen>

        <RootStack.Screen name="WorkoutDetail">
          {(props: any) => <WorkoutDetailWrapper {...props} workouts={workouts} />}
        </RootStack.Screen>

        <RootStack.Screen name="Session">
          {(props: any) => (
            <SessionWrapper {...props} onSessionComplete={handleSessionComplete} workouts={workouts} />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="CustomWorkoutBuilder">
          {() => (
            <CustomWorkoutBuilderScreen
              exercises={exercises}
              onSave={handleCreateCustomWorkout}
              onBack={() => navigationRef.current?.goBack()}
            />
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: FONTS.caption,
    fontWeight: '600',
    marginBottom: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
