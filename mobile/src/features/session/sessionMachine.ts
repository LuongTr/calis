import { REST_CONFIG } from '../../constants/theme';
import { SessionEvent, SessionState, WorkoutTemplate } from '../../types';

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
      return {
        ...state,
        status: 'transition',
        completedSets: state.completedSets + 1,
      };
    }

    case 'TIMER_DONE': {
      if (state.status !== 'rest') return state;
      return {
        ...state,
        status: 'active_set',
        restSeconds: state.defaultRestSeconds,
      };
    }

    case 'SKIP': {
      if (state.status !== 'rest') return state;
      return {
        ...state,
        status: 'active_set',
        restSeconds: state.defaultRestSeconds,
      };
    }

    case 'ADJUST_REST': {
      if (state.status !== 'rest') return state;
      const nextRestSeconds = Math.max(
        REST_CONFIG.minRestSec,
        Math.min(REST_CONFIG.maxRestSec, state.restSeconds + event.payload)
      );
      return { ...state, restSeconds: nextRestSeconds };
    }

    default:
      return state;
  }
}

export function processTransition(state: SessionState, workout: WorkoutTemplate): SessionState {
  if (state.status !== 'transition') return state;

  const currentExercise = workout.exerciseBlocks[state.currentExerciseIndex];
  if (!currentExercise) {
    return { ...state, status: 'complete', nextAction: null };
  }

  const hasMoreSets = state.currentSetIndex + 1 < currentExercise.sets;
  const hasMoreExercises = state.currentExerciseIndex + 1 < workout.exerciseBlocks.length;

  if (hasMoreSets) {
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

  return {
    ...state,
    status: 'complete',
    nextAction: null,
  };
}
