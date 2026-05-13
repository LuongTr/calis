import { WorkoutTemplate } from '../types';

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  // ===== BEGINNER: FULL BODY =====
  {
    id: 'beginner-fullbody-10',
    title: 'Full Body 10 min',
    level: 'beginner',
    type: 'full_body',
    durationMin: 10,
    goalTags: ['full_body', 'beginner', 'quick'],
    exerciseBlocks: [
      { exerciseId: 'jumping-jacks', sets: 2, timeSec: 30, restTimeSec: 20, order: 0 },
      { exerciseId: 'knee-pushup', sets: 2, reps: 8, restTimeSec: 60, order: 1 },
      { exerciseId: 'squat', sets: 2, reps: 10, restTimeSec: 45, order: 2 },
      { exerciseId: 'inverted-row', sets: 2, reps: 6, restTimeSec: 45, order: 3 },
      { exerciseId: 'plank', sets: 2, timeSec: 20, restTimeSec: 30, order: 4 },
    ],
  },
  {
    id: 'beginner-fullbody-15',
    title: 'Full Body 15 min',
    level: 'beginner',
    type: 'full_body',
    durationMin: 15,
    goalTags: ['full_body', 'beginner', 'standard'],
    exerciseBlocks: [
      { exerciseId: 'jumping-jacks', sets: 2, timeSec: 30, restTimeSec: 20, order: 0 },
      { exerciseId: 'knee-pushup', sets: 3, reps: 8, restTimeSec: 60, order: 1 },
      { exerciseId: 'squat', sets: 3, reps: 12, restTimeSec: 45, order: 2 },
      { exerciseId: 'inverted-row', sets: 3, reps: 8, restTimeSec: 60, order: 3 },
      { exerciseId: 'plank', sets: 3, timeSec: 25, restTimeSec: 30, order: 4 },
      { exerciseId: 'lunge', sets: 2, reps: 6, restTimeSec: 45, order: 5 },
      { exerciseId: 'dead-bug', sets: 2, reps: 6, restTimeSec: 30, order: 6 },
    ],
  },

  // ===== INTERMEDIATE: UPPER BODY =====
  {
    id: 'intermediate-upper-25',
    title: 'Upper Body 25 min',
    level: 'intermediate',
    type: 'upper',
    durationMin: 25,
    goalTags: ['upper', 'intermediate', 'standard'],
    exerciseBlocks: [
      { exerciseId: 'arm-circles', sets: 2, timeSec: 20, restTimeSec: 15, order: 0 },
      { exerciseId: 'pushup', sets: 3, reps: 10, restTimeSec: 60, order: 1 },
      { exerciseId: 'pullup', sets: 3, reps: 5, restTimeSec: 90, order: 2 },
      { exerciseId: 'pike-pushup', sets: 3, reps: 8, restTimeSec: 60, order: 3 },
      { exerciseId: 'inverted-row', sets: 3, reps: 10, restTimeSec: 60, order: 4 },
      { exerciseId: 'dead-hang', sets: 2, timeSec: 20, restTimeSec: 45, order: 5 },
    ],
  },
  {
    id: 'intermediate-upper-30',
    title: 'Upper Body 30 min',
    level: 'intermediate',
    type: 'upper',
    durationMin: 30,
    goalTags: ['upper', 'intermediate', 'long'],
    exerciseBlocks: [
      { exerciseId: 'arm-circles', sets: 2, timeSec: 20, restTimeSec: 15, order: 0 },
      { exerciseId: 'pushup', sets: 4, reps: 12, restTimeSec: 60, order: 1 },
      { exerciseId: 'pullup', sets: 4, reps: 6, restTimeSec: 90, order: 2 },
      { exerciseId: 'pike-pushup', sets: 3, reps: 10, restTimeSec: 60, order: 3 },
      { exerciseId: 'inverted-row', sets: 3, reps: 12, restTimeSec: 60, order: 4 },
      { exerciseId: 'dead-hang', sets: 3, timeSec: 25, restTimeSec: 45, order: 5 },
      { exerciseId: 'plank', sets: 3, timeSec: 30, restTimeSec: 30, order: 6 },
    ],
  },

  // ===== INTERMEDIATE: LOWER BODY =====
  {
    id: 'intermediate-lower-25',
    title: 'Lower Body 25 min',
    level: 'intermediate',
    type: 'lower',
    durationMin: 25,
    goalTags: ['lower', 'intermediate', 'standard'],
    exerciseBlocks: [
      { exerciseId: 'jumping-jacks', sets: 2, timeSec: 30, restTimeSec: 15, order: 0 },
      { exerciseId: 'squat', sets: 3, reps: 15, restTimeSec: 60, order: 1 },
      { exerciseId: 'bulgarian-split-squat', sets: 3, reps: 8, restTimeSec: 90, order: 2 },
      { exerciseId: 'lunge', sets: 3, reps: 10, restTimeSec: 60, order: 3 },
      { exerciseId: 'calf-raise', sets: 3, reps: 15, restTimeSec: 30, order: 4 },
      { exerciseId: 'leg-raise', sets: 3, reps: 10, restTimeSec: 45, order: 5 },
    ],
  },
  {
    id: 'intermediate-lower-30',
    title: 'Lower Body 30 min',
    level: 'intermediate',
    type: 'lower',
    durationMin: 30,
    goalTags: ['lower', 'intermediate', 'long'],
    exerciseBlocks: [
      { exerciseId: 'jumping-jacks', sets: 2, timeSec: 30, restTimeSec: 15, order: 0 },
      { exerciseId: 'squat', sets: 4, reps: 15, restTimeSec: 60, order: 1 },
      { exerciseId: 'bulgarian-split-squat', sets: 3, reps: 10, restTimeSec: 90, order: 2 },
      { exerciseId: 'lunge', sets: 3, reps: 12, restTimeSec: 60, order: 3 },
      { exerciseId: 'calf-raise', sets: 4, reps: 15, restTimeSec: 30, order: 4 },
      { exerciseId: 'leg-raise', sets: 3, reps: 12, restTimeSec: 45, order: 5 },
      { exerciseId: 'dead-bug', sets: 3, reps: 10, restTimeSec: 30, order: 6 },
    ],
  },

  // ===== INTERMEDIATE: PUSH / PULL / LEGS =====
  {
    id: 'intermediate-push-25',
    title: 'Push Day 25 min',
    level: 'intermediate',
    type: 'push',
    durationMin: 25,
    goalTags: ['push', 'intermediate', 'standard'],
    exerciseBlocks: [
      { exerciseId: 'arm-circles', sets: 2, timeSec: 20, restTimeSec: 15, order: 0 },
      { exerciseId: 'pushup', sets: 4, reps: 10, restTimeSec: 60, order: 1 },
      { exerciseId: 'pike-pushup', sets: 4, reps: 8, restTimeSec: 75, order: 2 },
      { exerciseId: 'incline-pushup', sets: 3, reps: 12, restTimeSec: 45, order: 3 },
      { exerciseId: 'plank', sets: 3, timeSec: 30, restTimeSec: 30, order: 4 },
    ],
  },
  {
    id: 'intermediate-pull-25',
    title: 'Pull Day 25 min',
    level: 'intermediate',
    type: 'pull',
    durationMin: 25,
    goalTags: ['pull', 'intermediate', 'standard'],
    exerciseBlocks: [
      { exerciseId: 'arm-circles', sets: 2, timeSec: 20, restTimeSec: 15, order: 0 },
      { exerciseId: 'pullup', sets: 4, reps: 5, restTimeSec: 90, order: 1 },
      { exerciseId: 'inverted-row', sets: 4, reps: 10, restTimeSec: 60, order: 2 },
      { exerciseId: 'dead-hang', sets: 3, timeSec: 25, restTimeSec: 45, order: 3 },
      { exerciseId: 'dead-bug', sets: 3, reps: 10, restTimeSec: 30, order: 4 },
    ],
  },
  {
    id: 'intermediate-legs-25',
    title: 'Leg Day 25 min',
    level: 'intermediate',
    type: 'legs',
    durationMin: 25,
    goalTags: ['legs', 'intermediate', 'standard'],
    exerciseBlocks: [
      { exerciseId: 'jumping-jacks', sets: 2, timeSec: 30, restTimeSec: 15, order: 0 },
      { exerciseId: 'squat', sets: 4, reps: 15, restTimeSec: 60, order: 1 },
      { exerciseId: 'bulgarian-split-squat', sets: 3, reps: 8, restTimeSec: 90, order: 2 },
      { exerciseId: 'lunge', sets: 3, reps: 10, restTimeSec: 60, order: 3 },
      { exerciseId: 'calf-raise', sets: 4, reps: 15, restTimeSec: 30, order: 4 },
    ],
  },

  // ===== MOBILITY =====
  {
    id: 'mobility-10',
    title: 'Mobility 10 min',
    level: 'beginner',
    type: 'mobility',
    durationMin: 10,
    goalTags: ['mobility', 'all', 'recovery'],
    exerciseBlocks: [
      { exerciseId: 'cat-cow', sets: 2, timeSec: 30, restTimeSec: 15, order: 0 },
      { exerciseId: 'arm-circles', sets: 2, timeSec: 20, restTimeSec: 10, order: 1 },
      { exerciseId: 'childs-pose', sets: 1, timeSec: 30, restTimeSec: 0, order: 2 },
      { exerciseId: 'hamstring-stretch', sets: 2, timeSec: 30, restTimeSec: 10, order: 3 },
    ],
  },
];

export function getWorkoutById(id: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find((w) => w.id === id);
}

export function getWorkoutsByLevel(level: string): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter((w) => w.level === level);
}

export function getWorkoutsByType(type: string): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter((w) => w.type === type);
}
