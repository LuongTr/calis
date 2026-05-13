# Coding Agent Prompt — Calisthenics Guided Training App

You are a senior full-stack engineer agent. Build the project by using the provided docs as the single source of truth:

- `calisthenics_app_docs_md`
- `skill_system_expansion_notes.md`

## Product goal

Build a guided at-home training app/web focused on:
- calisthenics as the primary category
- mobility/stretching as the secondary category

The MVP is NOT a tracker. It is a guided workout experience.

## Product direction

### MVP
- Onboarding once per user
- Level estimation
- Beginner: full body focus
- Intermediate: upper/lower split focus
- Recommendation-based home screen
- Workout templates
- Session flow with set → rest → next
- Rest screen with timer focus
- YouTube embed only in session screens
- No calorie tracking
- No custom workout builder
- No PPL split in phase 1
- No AI coach
- No social/community

### Future-ready direction
The codebase must be structured so future expansion is easy for:
- Front lever
- Back lever
- Handstand
- Planche
- Human flag
- L-sit
- Skill tracks
- Exercise tagging
- Skill progression stages
- Accessory drills
- Future PPL / custom split

Do not implement the future skill system fully unless explicitly needed for MVP wiring. Keep the architecture extensible.

---

# Source docs summary

## 1) Core product docs
Use the following as reference:
- overview
- user flow
- state/data contracts
- session state machine
- API contract
- edge cases
- design system notes
- workout templates
- exercise library
- screen specs

## 2) Skill expansion notes
Use the following as future-ready design constraints:
- add `trainingExperience` during onboarding
- hide advanced skill goals from true beginners
- use flexible tags on exercises
- prepare for `SkillTrack` and `SkillStage`
- keep content curated and structured
- YouTube content should be curated, not dynamically searched
- content quality > quantity

---

# Implementation goals

Build the app with clean separation of concerns:

1. UI/screens
2. session logic/state machine
3. recommendation logic
4. workout templates
5. exercise library
6. onboarding/profile state
7. API/data contracts
8. future extensibility for skill system

---

# Required product behavior

## Onboarding
Add a first question:
- "Have you trained before?"
Options:
- Completely new
- Some experience
- Experienced

Rules:
- If user is completely new:
  - simplify onboarding
  - do not show skill goals
  - do not ask advanced rep questions
  - default beginner path
- If user has experience:
  - ask ability questions like push-ups, pull-ups, squats, mobility
  - skill goals may be shown later / in future

Store onboarding result in profile.

## Home UX
Home must prioritize conversion:
- one primary CTA: `Start Workout`
- 2–3 recommended workouts only
- starting workout should require minimal or no browsing
- recommended list is secondary to the CTA

The user should be able to open the app and start in as few taps as possible.

## Recommendation and rotation
Implement rule-based recommendations:
- Beginner → prioritize Full Body
- Intermediate → prioritize Upper/Lower
- Prefer workout types that do not repeat the last workout type
- If user has been inactive for a while, show a safe fallback option
- Always include at least one strong recommended workout and one alternative

## Session flow
The core flow is:

Idle → Active Set → Rest → Transition → Active Set → ... → Complete

Rules:
- Every completed set goes to Rest
- The last set of an exercise still goes to Rest before the next exercise
- Rest screen is the only place for rest time adjustments
- Rest time can be decreased or increased with small step controls
- Rest time has a maximum boundary
- Rest time cannot go below zero
- Skip should advance immediately

## Rest screen UX
Rest screen must:
- visually prioritize the timer
- show `-30s` on the left and `+30s` on the right
- have a smaller but easy-to-tap control layout
- keep next exercise hint minimal
- optionally support circular progress and smart color shifts
- not let secondary info compete with timer priority

## Workout templates
Use preset workout templates only for MVP.

Intermediate should use Upper/Lower split rather than PPL in phase 1.
PPL is future phase only.

Template goals:
- linear flow
- set/rest-driven
- easy to execute
- 10–15 min for beginner
- 25+ min primary recommendation for intermediate

## Exercise library
Create a structured exercise library as the source of truth for templates and sessions.

Each exercise should have:
- id
- name
- type
- muscleGroup
- level
- format
- defaultReps or defaultTimeSec
- youtubeVideoId
- shortDescription
- tips
- commonMistakes
- tags

Tags should be flexible and future-ready:
- movement tags
- skill tags
- style tags
- purpose tags
- equipment tags
- difficulty tags

## Future skill expansion
Do not fully implement skill progression in MVP, but design the code and data structures so skill tracks can be added later for:
- front lever
- back lever
- handstand
- planche
- human flag
- L-sit

---

# Suggested architecture

Use a clean, extensible structure appropriate for the chosen stack.

Recommended separation:
- `app/` or `src/`
- `components/`
- `features/auth`
- `features/onboarding`
- `features/home`
- `features/workout`
- `features/session`
- `features/exercises`
- `features/recommendation`
- `features/profile`
- `lib/`
- `constants/`
- `types/`
- `services/`
- `docs/` (if needed)

If using React Native/Expo, keep screen logic separated from session logic.
If using web, keep screens/components modular with equivalent structure.

---

# State machine requirements

Implement the workout session as a deterministic state machine.

## States
- idle
- active_set
- rest
- transition
- complete

## Events
- START
- DONE
- TIMER_DONE
- SKIP
- ADJUST_REST

## Must-have rules
- rest always follows a set
- rest always follows the last set of an exercise before the next exercise
- transition updates indices safely
- avoid double transitions
- clear timers on state changes
- keep timer logic isolated from render logic

If you implement with XState, that is preferred.
If not using XState, use a reducer-based state machine with equivalent behavior.

---

# UI screen requirements

Implement these screens at minimum:

## 1. Auth
- login/sign up entry
- simple, low-friction

## 2. Onboarding
- experience question first
- one-question-per-screen or very clear step flow
- calculate initial level

## 3. Home
- greeting
- one large Start Workout CTA
- 2–3 recommended workout cards

## 4. Workout List
- category or recommended list
- minimal filtering only if needed

## 5. Workout Detail
- workout summary
- exercise list
- start button

## 6. Session
- current exercise
- reps/time
- set counter
- video embed area
- Done button

## 7. Rest
- large timer
- -30s / +30s
- skip
- next exercise hint

## 8. Complete
- completion confirmation
- next action CTA

## 9. Profile (optional)
- level
- retake onboarding

---

# Recommendation logic requirements

Implement a simple rule-based recommendation engine.

Minimum rules:
- beginner → full body first
- intermediate → upper/lower first
- avoid repeating previous workout type
- include duration-aware ranking
- include fallback options
- output top 2–4 workouts for Home

This should be deterministic and easy to debug.

---

# Video/content requirements

- Use curated YouTube embed ids only
- Do not build dynamic YouTube search in MVP
- Do not create a video-heavy browsing experience
- Video is support content on the session screen

---

# Build order

Implement in this order:

1. Project scaffold and app shell
2. Types and data contracts
3. Exercise library
4. Workout templates
5. Recommendation engine
6. Onboarding flow
7. Home screen CTA flow
8. Workout detail/list screens
9. Session state machine
10. Rest screen
11. Complete screen
12. Polish and edge cases
13. Future-ready stubs for skill tracks

---

# Acceptance criteria

The build is acceptable only if:

- user can sign up/login
- user completes onboarding once
- user lands on a conversion-focused Home screen
- user can start a recommended workout quickly
- session flow works deterministically
- every set leads to rest
- rest before next exercise is enforced
- rest screen supports timer adjustments
- workout templates are preset and linear
- code structure is future-ready for skills/tags
- beginner and intermediate paths are both supported
- the app does not become a tracker or calorie app in MVP

---

# Implementation notes

- Prefer small, composable functions
- Keep state management deterministic
- Avoid overengineering phase 1
- Keep future skill system as data-model and tag-ready stubs if needed
- Do not introduce unnecessary complexity that is not in the docs

---

# Deliverables

When implementing, produce:
- working screens/components
- state logic
- mock/seed data for exercises and templates
- recommendation logic
- clean types/interfaces
- concise README or setup notes if needed

If something is ambiguous, choose the simplest solution that aligns with the docs and keep the code easy to extend later.
