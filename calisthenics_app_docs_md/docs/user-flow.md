# User Flow

## High-level flow
Auth → Onboarding → Home → Workout Detail → Session → Complete → Home

## First-time user
1. User opens app
2. User signs up or logs in
3. User completes onboarding once
4. System calculates level
5. Home shows recommended workout
6. User taps Start Workout
7. User enters the session
8. User completes the workout
9. User returns to Home

## Returning user
1. User opens app
2. Home shows today's recommendation
3. User taps Start Workout
4. User enters session
5. User completes workout

## Decision philosophy
- The app should decide the default workout for the user
- User should rarely need to browse multiple options before starting
- Home should be optimized for immediate action

## Main navigation
- Home
- Optional Profile / Settings
