
# Skill System Expansion Notes

# Overview

The app direction is evolving from:
- guided workout app

toward:
- structured calisthenics progression platform

The app should eventually support advanced calisthenics skills such as:
- Front Lever
- Back Lever
- Handstand
- Planche
- Human Flag
- L-sit

However, these systems should NOT be implemented in MVP.

The MVP should remain focused on:
- guided workouts
- onboarding
- recommendation flow
- session UX
- workout consistency

The architecture should simply be designed to support future expansion.

---

# Onboarding Refinement

## Add training experience question

Recommended first onboarding question:

"Have you trained before?"

Options:
- Completely new
- Some experience
- Experienced

---

## Beginner-friendly branching

If the user selects:
- Completely new

Then:
- do not show skill goals
- do not ask advanced rep questions
- simplify onboarding
- default beginner level
- focus on:
  - movement foundation
  - consistency
  - mobility

---

## Experienced users

If the user selects:
- Some experience
- Experienced

Then onboarding can include:
- push-up reps
- pull-up reps
- squat reps
- mobility level
- optional future skill goals

---

# User Goal System

Future-ready concept:

```ts
userGoals: [
  'general_fitness',
  'front_lever'
]
```

This will later power:
- recommendations
- accessory exercises
- skill tracks
- progression systems

---

# Exercise Taxonomy & Tagging System

## Core philosophy

Do NOT think:
- exercise belongs to one category

Instead:
- exercise has multiple attributes/tags

---

## Recommended tag groups

### Movement
- push
- pull
- legs
- core
- mobility
- full_body

### Skills
- front_lever
- back_lever
- planche
- handstand
- human_flag
- l_sit

### Training style
- static
- dynamic
- explosive
- strength
- endurance
- mobility

### Purpose
- main
- accessory
- warmup
- cooldown
- skill_drill
- rehab

### Equipment
- no_equipment
- pullup_bar
- parallettes
- resistance_band

---

## Example exercise tagging

### Push-up

```ts
tags: [
  'push',
  'strength',
  'beginner',
  'main',
  'no_equipment'
]
```

---

### Planche Lean

```ts
tags: [
  'push',
  'planche',
  'shoulder',
  'wrist',
  'static',
  'advanced',
  'skill_drill',
  'accessory'
]
```

---

### Tuck Front Lever Hold

```ts
tags: [
  'pull',
  'front_lever',
  'core',
  'static',
  'intermediate',
  'skill_drill'
]
```

---

# Why Tagging Matters

The tagging system becomes the foundation for:
- recommendations
- search/filter
- accessory work
- adaptive workouts
- skill progression
- future AI coaching

---

# Skill Progression System

## Core structure

```text
SkillTrack
  → SkillStage
      → Exercises
```

---

## Philosophy

Wrong mindset:
- unlock skill instantly

Correct mindset:
- skill = long-term progression

---

# Example: Front Lever

## Stage 1
- Dead Hang
- Scapula Pull
- Tuck Hold

## Stage 2
- Advanced Tuck
- Negative Front Lever
- Band Assisted Hold

## Stage 3
- Straddle Front Lever

## Stage 4
- Full Front Lever

---

# Progression Design

Recommended:
- soft progression
- guidance-based progression

Avoid:
- hard-locking users aggressively

Example:
- recommend next stage
- still allow practice of previous stages

---

# Assessment Strategy

Phase 1 recommendation:
- self-assessment only

Avoid in MVP:
- AI posture detection
- computer vision form analysis

---

# Skill Session Design

Skill training should usually be:
- 10–20 minutes

Then followed by:
- accessory work
- mobility work

---

# Long-term Product Positioning

The app can eventually evolve into:

"Duolingo for Calisthenics Skills"

Key differentiation:
- structured progression
- high-quality content
- skill-based coaching
- long-term user goals

---

# Workout Content Strategy

## Core insight

The real product is NOT:
- timer
- tracker

The real product is:
- structured exercise content

---

# Video Strategy

## Recommended MVP approach

Use:
- curated YouTube embeds

Avoid:
- dynamic YouTube search

Reason:
- inconsistent quality
- broken videos
- random languages/styles

---

# Correct exercise-video structure

```ts
Exercise {
  id
  name

  youtubeVideoId
}
```

Each exercise should map to a manually curated video.

---

# Exercise Content Schema

```ts
Exercise {
  id
  name

  shortDescription

  tags[]

  level

  format

  reps/time

  youtubeVideoId

  tips[]

  commonMistakes[]
}
```

---

# Content Quality Strategy

Prioritize:
- quality > quantity

Recommended MVP scope:
- 30–50 curated exercises

Avoid:
- huge uncurated libraries

---

# Future Skill Content

Each skill track may eventually require:
- drill videos
- accessory exercise videos
- mobility videos
- stage progression content

This significantly increases content complexity,
so the content system should remain structured and standardized from the beginning.

---

# Recommended Architecture Evolution

## Current MVP

```text
WorkoutTemplate
Exercise
```

## Future-ready architecture

```text
WorkoutTemplate
Exercise
SkillTrack
SkillStage
```
