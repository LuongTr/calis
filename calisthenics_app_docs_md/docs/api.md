# API Contract

## Auth
### POST /auth/signup
Create an account.

### POST /auth/login
Login with email/password or OAuth.

## Profile
### GET /me
Return user profile and onboarding state.

### PATCH /me/profile
Update user profile fields.

## Onboarding
### POST /onboarding/submit
Save onboarding answers and calculate level.

## Recommendations
### GET /recommendations/today
Return recommended workouts for Home.

## Workouts
### GET /workouts
List workout templates.

### GET /workouts/:id
Get workout detail.

## Exercises
### GET /exercises
Return exercise library.

### GET /exercises/:id
Return exercise detail.

## Session-related
Session flow may be mostly client-side in MVP, but the backend should at least support saving:
- last workout type
- last workout date
- completed workout status (optional later)
