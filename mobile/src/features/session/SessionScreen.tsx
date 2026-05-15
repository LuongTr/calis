import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { SessionState, WorkoutTemplate } from '../../types';
import {
  sessionReducer,
  createInitialSessionState,
  processTransition,
} from './sessionMachine';
import { getCachedExerciseById } from '../../lib/api';
import { getAdjacentVariant, getExerciseVariants } from '../../data/exercises';
import YouTubeVideo from '../../components/YouTubeVideo';
import CircularProgress from '../../components/CircularProgress';
import RestScreen from './RestScreen';
import CompleteScreen from './CompleteScreen';

interface Props {
  workout: WorkoutTemplate;
  preferredVariants: Record<string, string>;
  onPersistVariant: (familyId: string, exerciseId: string) => void;
  onComplete: (workoutId: string) => void;
  onExit: () => void;
}

export default function SessionScreen({
  workout,
  preferredVariants,
  onPersistVariant,
  onComplete,
  onExit,
}: Props) {
  const [state, setState] = useState<SessionState>(() =>
    createInitialSessionState(workout)
  );
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeSetTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializedWorkoutIdRef = useRef<string | null>(null);
  const [variantByExerciseIndex, setVariantByExerciseIndex] = useState<Record<number, string>>({});
  const [setSecondsRemaining, setSetSecondsRemaining] = useState<number | null>(null);

  const currentExercise = workout.exerciseBlocks[state.currentExerciseIndex];
  const selectedExerciseId =
    currentExercise &&
    (variantByExerciseIndex[state.currentExerciseIndex] || currentExercise.exerciseId);
  const exercise = selectedExerciseId ? getCachedExerciseById(selectedExerciseId) : null;
  const isTimeBasedSet = Boolean(currentExercise?.timeSec);
  const totalSetSeconds = currentExercise?.timeSec ?? 0;

  useEffect(() => {
    if (initializedWorkoutIdRef.current === workout.id) {
      return;
    }
    const next: Record<number, string> = {};
    workout.exerciseBlocks.forEach((block, index) => {
      const baseExercise = getCachedExerciseById(block.exerciseId);
      const familyId = baseExercise?.familyId;
      if (!familyId) return;
      const preferred = preferredVariants[familyId];
      if (preferred) {
        const preferredExercise = getCachedExerciseById(preferred);
        if (preferredExercise?.familyId === familyId) {
          next[index] = preferred;
        }
      }
    });
    initializedWorkoutIdRef.current = workout.id;
    setVariantByExerciseIndex(next);
  }, [preferredVariants, workout]);

  // Process transition whenever state enters 'transition'
  useEffect(() => {
    if (state.status === 'transition') {
      const newState = processTransition(state, workout);
      const id = setTimeout(() => {
        setState(newState);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [state, workout]);

  // Handle rest timer
  useEffect(() => {
    if (state.status === 'rest') {
      restTimerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.restSeconds <= 0) {
            return sessionReducer(prev, { type: 'TIMER_DONE' });
          }
          return { ...prev, restSeconds: prev.restSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [state.status]);

  // Handle active set timer for time-based exercises (auto finish, no done button)
  useEffect(() => {
    if (state.status !== 'active_set' || !isTimeBasedSet || totalSetSeconds <= 0) {
      if (activeSetTimerRef.current) {
        clearInterval(activeSetTimerRef.current);
        activeSetTimerRef.current = null;
      }
      setSetSecondsRemaining(null);
      return;
    }

    setSetSecondsRemaining(totalSetSeconds);
    activeSetTimerRef.current = setInterval(() => {
      setSetSecondsRemaining((prev) => {
        if (prev === null) return totalSetSeconds;
        if (prev <= 1) {
          setState((current) => sessionReducer(current, { type: 'DONE' }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (activeSetTimerRef.current) {
        clearInterval(activeSetTimerRef.current);
        activeSetTimerRef.current = null;
      }
    };
  }, [state.status, state.currentExerciseIndex, state.currentSetIndex, isTimeBasedSet, totalSetSeconds]);

  const handleDone = useCallback(() => {
    setState((prev) => sessionReducer(prev, { type: 'DONE' }));
  }, []);

  const handleSkipTimeSet = useCallback(() => {
    setState((prev) => sessionReducer(prev, { type: 'DONE' }));
  }, []);

  const handleSwitchVariant = useCallback(
    (direction: 'easier' | 'harder') => {
      if (!selectedExerciseId) return;
      const current = getCachedExerciseById(selectedExerciseId);
      const linkedTargetId =
        direction === 'easier' ? current?.regressionExerciseId : current?.progressionExerciseId;
      const linkedTarget = linkedTargetId ? getCachedExerciseById(linkedTargetId) : null;
      const target = linkedTarget || getAdjacentVariant(selectedExerciseId, direction);
      if (!target) return;

      setVariantByExerciseIndex((prev) => ({
        ...prev,
        [state.currentExerciseIndex]: target.id,
      }));
      if (target.familyId) {
        onPersistVariant(target.familyId, target.id);
      }
    },
    [onPersistVariant, selectedExerciseId, state.currentExerciseIndex]
  );

  const handleSkip = useCallback(() => {
    setState((prev) => sessionReducer(prev, { type: 'SKIP' }));
  }, []);

  const handleAdjustRest = useCallback((adjustment: number) => {
    setState((prev) =>
      sessionReducer(prev, { type: 'ADJUST_REST', payload: adjustment })
    );
  }, []);

  const handleRestComplete = useCallback(() => {
    // TIMER_DONE is handled by the reducer in the timer interval
  }, []);

  const handleWorkoutComplete = useCallback(() => {
    onComplete(workout.id);
  }, [workout.id, onComplete]);

  // IDLE state
  if (state.status === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.readyText}>Ready to begin?</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setState((prev) => sessionReducer(prev, { type: 'START_WORKOUT' }))}
          >
            <Text style={styles.startButtonText}>Begin Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ACTIVE SET state
  if (state.status === 'active_set') {
    const variants = selectedExerciseId ? getExerciseVariants(selectedExerciseId) : [];
    const currentVariantIndex = variants.findIndex((item) => item.id === selectedExerciseId);
    const canGoEasier =
      Boolean(exercise?.regressionExerciseId) || currentVariantIndex > 0;
    const canGoHarder =
      Boolean(exercise?.progressionExerciseId) ||
      (currentVariantIndex >= 0 && currentVariantIndex < variants.length - 1);
    const hasVariantSystem =
      variants.length > 1 || Boolean(exercise?.progressionExerciseId || exercise?.regressionExerciseId);
    const timerProgress =
      isTimeBasedSet && totalSetSeconds > 0 && setSecondsRemaining !== null
        ? 1 - Math.min(setSecondsRemaining / totalSetSeconds, 1)
        : 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContent}>
          {/* YouTube Video Embed */}
          {exercise?.videoId ? (
            <YouTubeVideo
              videoId={exercise.videoId}
              startSec={exercise.videoStartSec}
              endSec={exercise.videoEndSec}
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoText}>{exercise?.name || 'Exercise'}</Text>
            </View>
          )}

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>
              {exercise?.name || 'Exercise'}
            </Text>
            <Text style={styles.setCounter}>
              Set {state.currentSetIndex + 1} of{' '}
              {currentExercise?.sets || 0}
            </Text>
            <Text style={styles.repInfo}>
              {currentExercise?.reps
                ? `${currentExercise.reps} reps`
                : currentExercise?.timeSec
                ? `${currentExercise.timeSec}s`
                : ''}
            </Text>
            {hasVariantSystem ? (
              <View style={styles.variantControls}>
                <TouchableOpacity
                  style={[styles.variantButton, !canGoEasier && styles.variantButtonDisabled]}
                  onPress={() => handleSwitchVariant('easier')}
                  disabled={!canGoEasier}
                >
                  <Text style={styles.variantButtonText}>Easier</Text>
                </TouchableOpacity>
                <Text style={styles.variantLabel}>
                  {variants.length > 1
                    ? `Variant ${Math.max(currentVariantIndex + 1, 1)}/${variants.length}`
                    : 'Variant linked'}
                </Text>
                <TouchableOpacity
                  style={[styles.variantButton, !canGoHarder && styles.variantButtonDisabled]}
                  onPress={() => handleSwitchVariant('harder')}
                  disabled={!canGoHarder}
                >
                  <Text style={styles.variantButtonText}>Harder</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.variantUnavailable}>No easier/harder variant for this exercise</Text>
            )}
          </View>

          {isTimeBasedSet ? (
            <View style={styles.timerWrap}>
              <CircularProgress
                size={190}
                strokeWidth={8}
                progress={timerProgress}
                color={COLORS.success}
              >
                <View style={styles.timerContent}>
                  <Text style={styles.timerText}>{setSecondsRemaining ?? totalSetSeconds}</Text>
                  <Text style={styles.timerCaption}>seconds</Text>
                </View>
              </CircularProgress>
              <Text style={styles.timerHint}>Auto complete when timer reaches zero</Text>
              {__DEV__ ? (
                <TouchableOpacity style={styles.skipTimeButton} onPress={handleSkipTimeSet}>
                  <Text style={styles.skipTimeButtonText}>Skip</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (state.completedSets / state.totalSets) * 100
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {state.completedSets} / {state.totalSets} sets completed
        </Text>
      </SafeAreaView>
    );
  }

  // REST state
  if (state.status === 'rest') {
    // Find next exercise for hint
    const nextAction = state.nextAction;
    let nextExerciseName = '';
    if (nextAction === 'NEXT_EXERCISE') {
      const nextBlock = workout.exerciseBlocks[state.currentExerciseIndex + 1];
      if (nextBlock) {
        const nextExerciseId =
          variantByExerciseIndex[state.currentExerciseIndex + 1] || nextBlock.exerciseId;
        const nextEx = getCachedExerciseById(nextExerciseId);
        nextExerciseName = nextEx?.name || '';
      }
    } else {
      nextExerciseName = exercise?.name || '';
    }

    return (
      <RestScreen
        restSeconds={state.restSeconds}
        defaultRestSeconds={state.defaultRestSeconds}
        nextExerciseName={nextExerciseName}
        nextAction={state.nextAction}
        onAdjustRest={handleAdjustRest}
        onSkip={handleSkip}
        onRestComplete={handleRestComplete}
      />
    );
  }

  // COMPLETE state
  if (state.status === 'complete') {
    return (
      <CompleteScreen
        workoutTitle={workout.title}
        totalSets={state.totalSets}
        onFinish={() => handleWorkoutComplete()}
        onNewWorkout={() => {}}
      />
    );
  }

  // Transition state (brief)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.loadingText}>Preparing next...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
  },
  workoutTitle: {
    fontSize: FONTS.titleMedium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  readyText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  startButtonText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.white,
    fontWeight: '700',
  },
  exitButton: {
    paddingVertical: SPACING.sm,
  },
  exitButtonText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  activeContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  videoPlaceholder: {
    height: 180,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  videoText: {
    fontSize: FONTS.titleSmall,
    fontWeight: '600',
    color: COLORS.text,
  },
  exerciseInfo: {
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: FONTS.titleMedium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  setCounter: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  repInfo: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.primary,
    fontWeight: '600',
  },
  variantControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  variantButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  variantButtonDisabled: {
    opacity: 0.45,
  },
  variantButtonText: {
    color: COLORS.text,
    fontSize: FONTS.bodySmall,
    fontWeight: '600',
  },
  variantLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.caption,
    minWidth: 80,
    textAlign: 'center',
  },
  variantUnavailable: {
    marginTop: SPACING.sm,
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  timerWrap: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: FONTS.timer,
    fontWeight: '800',
    color: COLORS.success,
  },
  timerCaption: {
    fontSize: FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
  timerHint: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  skipTimeButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  skipTimeButtonText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: FONTS.titleSmall,
    color: COLORS.white,
    fontWeight: '700',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
});
