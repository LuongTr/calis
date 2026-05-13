# Exercise Library

## Purpose
This library is the single source of truth for:
- workout templates
- session rendering
- video mapping
- future custom workout building

## MVP exercise groups

### Push
- Knee Push-up
- Push-up
- Incline Push-up
- Pike Push-up

### Pull
- Assisted Pull-up
- Pull-up
- Inverted Row
- Dead Hang

### Legs
- Squat
- Lunge
- Bulgarian Split Squat
- Calf Raise

### Core
- Plank
- Dead Bug
- Leg Raise

### Full Body / Warm-up
- Jumping Jacks
- Arm Circles

### Mobility
- Cat-Cow
- Child’s Pose
- Hamstring Stretch

## Exercise fields
Each exercise should include:
- id
- name
- type
- muscleGroup
- level
- format
- default reps or time
- videoId

## Rules
- Keep the library small in MVP
- Beginner exercises should have regressions
- Avoid duplicates with near-identical purpose
- Prefer clear, commonly recognized movements
