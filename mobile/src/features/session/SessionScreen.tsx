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
import YouTubeVideo from '../../components/YouTubeVideo';
import RestScreen from './RestScreen';
import CompleteScreen from './CompleteScreen';

interface Props {
  workout: WorkoutTemplate;
  onComplete: (workoutId: string) => void;
  onExit: () => void;
}

export default function SessionScreen({ workout, onComplete, onExit }: Props) {
  const [state, dispatch] = useState<SessionState>(() =>
    createInitialSessionState(workout)
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentExercise = workout.exerciseBlocks[state.currentExerciseIndex];
  const exercise = currentExercise ? getCachedExerciseById(currentExercise.exerciseId) : null;

  // Process transition whenever state enters 'transition'
  useEffect(() => {
    if (state.status === 'transition') {
      const newState = processTransition(state, workout);
      // Update state immediately (force a microtask)
      const id = setTimeout(() => {
        dispatch(newState);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [state.status]);

  // Handle rest timer
  useEffect(() => {
    if (state.status === 'rest') {
      timerRef.current = setInterval(() => {
        dispatch((prev) => {
          if (prev.restSeconds <= 0) {
            // Timer done
            return sessionReducer(prev, { type: 'TIMER_DONE' });
          }
          return { ...prev, restSeconds: prev.restSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.status]);

  const handleDone = useCallback(() => {
    dispatch((prev) => sessionReducer(prev, { type: 'DONE' }));
  }, []);

  const handleSkip = useCallback(() => {
    dispatch((prev) => sessionReducer(prev, { type: 'SKIP' }));
  }, []);

  const handleAdjustRest = useCallback((adjustment: number) => {
    dispatch((prev) =>
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
            onPress={() => dispatch(sessionReducer(state, { type: 'START_WORKOUT' }))}
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
          </View>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
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
        const nextEx = getCachedExerciseById(nextBlock.exerciseId);
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
