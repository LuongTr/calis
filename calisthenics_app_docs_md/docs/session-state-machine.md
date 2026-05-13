# Session State Machine

## Goal
Control workout flow with a deterministic machine:
Idle → Active Set → Rest → Transition → Active Set → ... → Complete

## States
### idle
Waiting for user to start the workout.

### active_set
User is currently performing a set.

### rest
Rest countdown is running.

### transition
A brief internal state used to update indexes safely.

### complete
Workout finished.

## Events
- START_WORKOUT
- DONE
- TIMER_DONE
- SKIP
- ADJUST_REST

## Main rules
1. Every completed set must enter rest.
2. The last set of an exercise still enters rest before the next exercise.
3. The rest screen is the only place where the user can adjust rest time.
4. The UI must not jump directly from one exercise to another without rest.
5. Transition logic must be deterministic to avoid double triggers.

## Transition logic
### From active_set
- DONE → transition
- TIMER_DONE → transition

### From transition
- If more sets remain in the same exercise:
  - increment set index
  - go to rest
- If no sets remain and more exercises remain:
  - mark next action as next exercise
  - go to rest
- If no sets remain and no exercises remain:
  - go to complete

### From rest
- TIMER_DONE → transition after rest ends
- SKIP → transition immediately

## UI mapping
- `active_set`: exercise name, rep/time target, set counter, Done button
- `rest`: timer, +/- rest adjustment, skip button, next exercise hint
- `complete`: workout done screen
