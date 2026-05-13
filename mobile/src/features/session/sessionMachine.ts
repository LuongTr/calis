import { SessionState, SessionEvent, WorkoutTemplate } from '../../types';
import { REST_CONFIG } from '../../constants/theme';

// ============================================================
// Session State Machine
// Deterministic reducer-based state machine
// States: idle → active_set → rest → transition → ... → complete
// ============================================================

export function createInitialSessionState(workout: WorkoutTemplate): SessionState {
  const totalSets = workout.exerciseBlocks.reduce((sum, block) => sum + block.sets, 0);
  return {
    workoutId: workout.id,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    restSeconds: REST_CONFIG.defaultRestSec,
    defaultRestSeconds: REST_CONFIG.defaultRestSec,
    status: 'idle',
    nextAction: null,
    completedSets: 0,
    totalSets,
  };
}

export function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
  switch (event.type) {
    case 'START_WORKOUT': {
      if (state.status !== 'idle') return state;
      return { ...state, status: 'active_set' };
    }

    case 'DONE': {
      if (state.status !== 'active_set') return state;
      // Enter transition to compute next indexes/rest
      return { ...state, status: 'transition' };
    }

    case 'TIMER_DONE': {
      if (state.status !== 'rest') return state;
      // Timer finished → go directly to active_set
      return {
        ...state,
        status: 'active_set',
        completedSets: state.completedSets + 1,
      };
    }

    case 'SKIP': {
      if (state.status !== 'rest') return state;
      // Skip rest → go directly to active_set
      return {
        ...state,
        status: 'active_set',
        restSeconds: state.defaultRestSeconds,
        completedSets: state.completedSets + 1,
      };
    }

    case 'ADJUST_REST': {
      if (state.status !== 'rest') return state;
      const adjustment = event.payload;
      const newRest = Math.max(
        REST_CONFIG.minRestSec,
        Math.min(REST_CONFIG.maxRestSec, state.restSeconds + adjustment)
      );
      return { ...state, restSeconds: newRest };
    }

    default:
      return state;
  }
}

/**
 * Process the transition state.
 * This is called when user taps "Done" on a set.
 * It updates exercise/set indices and routes to rest (or complete).
 */
export function processTransition(
  state: SessionState,
  workout: WorkoutTemplate
): SessionState {
  if (state.status !== 'transition') return state;

  const currentExercise = workout.exerciseBlocks[state.currentExerciseIndex];
  if (!currentExercise) {
    // No more exercises - complete
    return { ...state, status: 'complete', nextAction: null };
  }

  const hasMoreSets = state.currentSetIndex + 1 < currentExercise.sets;
  const hasMoreExercises = state.currentExerciseIndex + 1 < workout.exerciseBlocks.length;

  if (hasMoreSets) {
    // Stay on same exercise, advance set
    return {
      ...state,
      currentSetIndex: state.currentSetIndex + 1,
      status: 'rest',
      nextAction: 'NEXT_SET',
      restSeconds: currentExercise.restTimeSec,
      defaultRestSeconds: currentExercise.restTimeSec,
    };
  }

  if (hasMoreExercises) {
    // Move to next exercise, reset set index
    return {
      ...state,
      currentExerciseIndex: state.currentExerciseIndex + 1,
      currentSetIndex: 0,
      status: 'rest',
      nextAction: 'NEXT_EXERCISE',
      restSeconds: currentExercise.restTimeSec,
      defaultRestSeconds: currentExercise.restTimeSec,
    };
  }

  // Last set of last exercise - complete
  return {
    ...state,
    status: 'complete',
    nextAction: null,
  };
}