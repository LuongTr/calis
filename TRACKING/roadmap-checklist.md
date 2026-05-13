# Roadmap Checklist (Execution)

This checklist is derived from:

- `calisthenics_app_brainstorm.md`
- `calisthenics_app_docs_md/docs/overview.md`
- `calisthenics_app_docs_md/docs/user-flow.md`
- `calisthenics_app_docs_md/docs/api.md`

Conventions:

- `[ ]` = not started
- `[x]` = done

---

## Phase 0 - Stabilize Core Loop

Goal: `Auth -> Onboarding -> Home -> Session -> Complete -> Home` is reliable, fast, and low-friction.

- [x] P0.1 Verify env + connectivity
- [x] P0.2 Fix auth edge cases (signup/login/logout)
- [x] P0.3 Guest experience is consistent
- [x] P0.4 Profile rendering correctness (name/guest)
- [x] P0.5 Session completion writes last workout
- [x] P0.6 Loading/offline/error states (minimal)

Acceptance:

- [ ] A0.1 Fresh install launches to Auth by default
- [ ] A0.2 Quick Start -> Onboarding -> MainTabs (no blank screens)
- [ ] A0.3 Email signup with username shows in Profile
- [ ] A0.4 Email login for existing account shows name (displayName or email prefix)
- [ ] A0.5 Sign out returns to Auth immediately (no white screen)
- [ ] A0.6 Complete 1 workout updates last workout date/type and does not crash offline

---

## Phase 1 - Backend-Driven MVP (Minimal Thinking)

Goal: backend becomes source of truth for onboarding + recommendation + rotation, while UI stays simple.

### Backend

- [x] P1.1 Add `POST /onboarding/submit` (save answers, compute level/style, set `onboarding_completed`)
- [x] P1.2 Add `GET /recommendations/today` (returns: main + alt + mobility, includes reason)
- [x] P1.3 Rotation logic in backend (from brainstorm)
- [x] P1.4 Persist training continuity fields
- [x] P1.5 Add minimal analytics logs (server-side console logs are fine for MVP)

Acceptance:

- [ ] A1.1 Onboarding submit sets `level`, `training_style`, `mobility_level`, `experience`, and `onboarding_completed`
- [ ] A1.2 `GET /recommendations/today` returns 3 items for both beginner and intermediate
- [ ] A1.3 Rotation matches rules
- [ ] A1.4 If user inactivity > 2 days, recommendation resets as specified

### Mobile

- [x] P1.6 Replace client recommendation engine with backend `GET /recommendations/today`
- [x] P1.7 Onboarding completion calls `POST /onboarding/submit` and updates local profile
- [x] P1.8 Home shows 1 primary CTA + 2 secondary options (alt + mobility)
- [x] P1.9 Ensure offline fallback remains usable (static templates) if API down

Acceptance:

- [ ] A1.5 Home renders recommended workouts from backend when API configured
- [ ] A1.6 Home falls back to local recommendations if API unreachable

---

## Phase 1.5 - Discoverability Without Extra Thinking

Goal: browsing improves, but Home still drives `start now`.

- [x] P1.5.1 Workout Detail shows clear structure (warm-up/main/cooldown if present)
- [x] P1.5.2 Show `why recommended` in Home (1 line per card)
- [x] P1.5.3 Small QoL filters in workout list (keep minimal)
- [x] P1.5.4 Handle empty states cleanly (no dead ends)

Acceptance:

- [ ] A1.5.1 Workout detail is readable and consistent across templates
- [ ] A1.5.2 Users can always start a workout within 2 taps from Home

---

## Phase 2 - Retention + Training Continuity

Goal: keep users coming back without turning into a tracker-first app.

- [x] P2.1 Minimal history screen (recent sessions list)
- [x] P2.2 Lightweight streak/consistency indicator (optional, non-gamified)
- [x] P2.3 `Train again` shortcuts (repeat last, or today’s recommendation)
- [x] P2.4 Rest UX refinement (color changes, smarter defaults, but still simple)
- [x] P2.5 Scoring refinement (weights from brainstorm)

Acceptance:

- [ ] A2.1 Users can see last 7 sessions and last workout type/date
- [ ] A2.2 Recommendation changes appropriately after completing workouts

---

## Phase 3 - Expansion

Goal: broader training systems after the MVP loop is excellent.

- [x] P3.1 Push/Pull/Legs split option
- [x] P3.2 Custom workouts (minimal builder)
- [x] P3.3 Adaptive training (progression/regression logic)
- [x] P3.4 Advanced recommendations (more context, better reasons)

Acceptance:

- [ ] A3.1 Split selection does not increase onboarding complexity significantly

---

## Open Questions (Decisions Needed)

- [ ] Q1 Do you want login persistence on app launch (auto-restore session), or always start at Auth?
- [ ] Q2 Should `Quick Start` remain guest-only, or allow upgrading guest -> account later?
- [ ] Q3 For recommendations: do you prefer strict rotation (Full -> Full -> Mobility) or scoring-based with soft rules?
