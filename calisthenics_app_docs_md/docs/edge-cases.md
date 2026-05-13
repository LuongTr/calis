# Edge Cases

## Session edge cases
- User exits during a workout
- App backgrounds during rest countdown
- User taps Skip repeatedly
- Timer reaches zero while the app is not active
- User rest time reaches minimum or maximum boundary

## Onboarding edge cases
- User quits onboarding halfway
- User wants to retake onboarding later
- Answer changes after onboarding completion

## Recommendation edge cases
- No workout matches exact rules
- User has not trained for several days
- User level is unknown

## UI edge cases
- Video unavailable
- Network failure
- Empty workout list
- Empty exercise library

## Rules
- Always show a fallback workout
- Always allow the user to continue or restart gracefully
- Never block the session flow because of a non-critical UI failure
