# Calisthenics App - Product Brainstorm Summary

## 1. Product Overview

Guided home workout app (Calisthenics + Mobility) - Focus: simple,
guided sessions - No tracking/calories in MVP - Minimal user thinking

------------------------------------------------------------------------

## 2. Core Flow

Set → Done → Rest (auto) → Next → Complete

------------------------------------------------------------------------

## 3. Features (MVP)

### Auth

-   Login / Signup

### Onboarding

-   Push-up / Pull-up / Squat / Mobility
-   Determine level

### Home

-   Recommended workouts

### Workout

-   Preset templates only

### Session

-   Guided sets
-   Auto rest
-   YouTube video embed

------------------------------------------------------------------------

## 4. Workout Template System

Structure: - Warm-up (optional) - Main - Cooldown (optional)

Types: - Beginner: Full body - Intermediate: Upper / Lower

Duration: - Beginner: 10--15 min - Intermediate: 25--30 min (primary)

------------------------------------------------------------------------

## 5. Exercise Library

-   \~20 exercises
-   Groups: push, pull, legs, core, mobility
-   Each exercise:
    -   name
    -   reps/time
    -   level
    -   videoId

------------------------------------------------------------------------

## 6. Recommendation System

### Rules:

1.  Match level
2.  Bias:
    -   Beginner → Full Body
    -   Intermediate → Upper/Lower
3.  Avoid repeating same type
4.  Always include:
    -   1 main workout
    -   1 alternative
    -   1 mobility

------------------------------------------------------------------------

## 7. Rotation Logic

### Beginner:

Full → Full → Mobility → repeat

### Intermediate:

Upper → Lower → Upper → Lower

If rest \> 2 days: → reset to Upper or Full Body

------------------------------------------------------------------------

## 8. Scoring System (Score Refinement)

Used to rank workouts before showing to user.

Example scoring: - +10: matches next type - +5: different from last
workout - +5: preferred duration - +2: mobility (optional)

Then: - sort by score - pick top 3

------------------------------------------------------------------------

## 9. Rest Screen UX

-   Focus on timer (largest element)
-   +/- buttons (secondary)
-   Next exercise (minimal)
-   Skip button

Features: - Auto countdown - Adaptive rest (future) - Circular
progress - Smart color change

------------------------------------------------------------------------

## 10. Design Principles

-   One screen = one focus
-   Minimal interaction
-   No overload
-   Implicit guidance (user doesn't think)

------------------------------------------------------------------------

## 11. Not Included in MVP

-   Calorie tracking
-   Custom workouts
-   AI
-   Social features
-   Advanced splits (PPL)

------------------------------------------------------------------------

## 12. Future (Phase 2)

-   Push / Pull / Legs split
-   Custom workouts
-   Adaptive training
-   Advanced recommendation
