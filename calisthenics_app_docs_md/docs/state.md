# State & Data Contract

## User profile
```ts
UserProfile {
  id: string
  level: 'beginner' | 'intermediate'
  trainingStyle: 'full_body' | 'upper_lower'
  mobilityLevel: 'stiff' | 'normal' | 'flexible'
  lastWorkoutType?: string
  lastWorkoutDate?: string
  onboardingCompleted: boolean
}
```

## Workout template
```ts
WorkoutTemplate {
  id: string
  title: string
  level: 'beginner' | 'intermediate'
  type: 'full_body' | 'upper' | 'lower' | 'mobility'
  durationMin: number
  goalTags: string[]
  exerciseIds: string[]
}
```

## Exercise
```ts
Exercise {
  id: string
  name: string
  type: 'calis' | 'mobility'
  muscleGroup: 'push' | 'pull' | 'legs' | 'core' | 'full'
  level: 'beginner' | 'intermediate'
  format: 'reps' | 'time'
  defaultReps?: number
  defaultTimeSec?: number
  videoId: string
}
```

## Session state
```ts
SessionState {
  currentExerciseIndex: number
  currentSetIndex: number
  restSeconds: number
  nextAction: 'NEXT_SET' | 'NEXT_EXERCISE' | null
  status: 'idle' | 'active_set' | 'rest' | 'transition' | 'complete'
}
```

## Key contract rules
- REST must happen between sets
- REST must also happen before the next exercise
- Session data should be deterministic
- UI should never guess the next step without state data
