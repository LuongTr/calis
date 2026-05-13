import { UserProfile, WorkoutTemplate, Recommendation, WorkoutType } from '../../types';
import { WORKOUT_TEMPLATES } from '../../data/templates';

function getDaysSince(lastWorkoutDate?: string): number | null {
  if (!lastWorkoutDate) return null;
  const lastDate = new Date(lastWorkoutDate);
  return Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getCandidateTemplates(profile: UserProfile, templates: WorkoutTemplate[]): WorkoutTemplate[] {
  const level = profile.onboardingData?.userLevel || 'beginner';
  return templates.filter((workout) => workout.level === level || workout.type === 'mobility');
}

function getNextType(profile: UserProfile): { type: WorkoutType; reason: string } {
  const trainingStyle = profile.onboardingData?.trainingStyle || 'full_body';
  const lastWorkoutType = profile.lastWorkoutType;
  const daysSinceLastWorkout = getDaysSince(profile.lastWorkoutDate);

  if (daysSinceLastWorkout === null || daysSinceLastWorkout > 2) {
    if (trainingStyle === 'push_pull_legs') {
      return { type: 'push', reason: 'restart the push/pull/legs cycle after time away' };
    }
    if (trainingStyle === 'upper_lower') {
      return { type: 'upper', reason: 'restart the upper/lower cycle after time away' };
    }
    return { type: 'full_body', reason: 'restart with a full body day after time away' };
  }

  if (trainingStyle === 'push_pull_legs') {
    if (lastWorkoutType === 'push') return { type: 'pull', reason: 'continue the push/pull/legs split' };
    if (lastWorkoutType === 'pull') return { type: 'legs', reason: 'continue the push/pull/legs split' };
    return { type: 'push', reason: 'continue the push/pull/legs split' };
  }

  if (trainingStyle === 'upper_lower') {
    if (lastWorkoutType === 'upper') return { type: 'lower', reason: 'continue the upper/lower split' };
    return { type: 'upper', reason: 'continue the upper/lower split' };
  }

  if (lastWorkoutType === 'full_body') {
    return { type: 'mobility', reason: 'use mobility after repeated full body work' };
  }

  return { type: 'full_body', reason: 'keep the beginner full body flow moving' };
}

function getPreferredDurationScore(profile: UserProfile, workout: WorkoutTemplate): number {
  const trainingStyle = profile.onboardingData?.trainingStyle || 'full_body';
  if (trainingStyle === 'push_pull_legs' && workout.durationMin >= 25) return 5;
  if (trainingStyle === 'upper_lower' && workout.durationMin >= 25) return 5;
  if (trainingStyle === 'full_body' && workout.durationMin <= 15) return 4;
  return 0;
}

function scoreWorkout(profile: UserProfile, workout: WorkoutTemplate): Recommendation {
  const next = getNextType(profile);
  const lastWorkoutType = profile.lastWorkoutType;
  let score = 0;
  const reasons: string[] = [];

  if (workout.type === next.type) {
    score += 10;
    reasons.push(next.reason);
  }

  if (lastWorkoutType && workout.type !== lastWorkoutType) {
    score += 5;
    reasons.push('change the stimulus from the last session');
  }

  const durationScore = getPreferredDurationScore(profile, workout);
  if (durationScore > 0) {
    score += durationScore;
    reasons.push('match the target session length');
  }

  if (workout.type === 'mobility') {
    score += 2;
    reasons.push('keep a recovery option available');
  }

  if (profile.lastWorkoutDate && getDaysSince(profile.lastWorkoutDate)! > 4 && workout.durationMin <= 25) {
    score += 2;
    reasons.push('ease back in with a manageable session');
  }

  return {
    workout,
    score,
    reason: reasons[0] || 'fit the current training plan',
  };
}

function getAlternateType(
  primaryType: WorkoutType,
  trainingStyle: 'full_body' | 'upper_lower' | 'push_pull_legs'
): WorkoutType {
  if (trainingStyle === 'push_pull_legs') {
    if (primaryType === 'push') return 'pull';
    if (primaryType === 'pull') return 'legs';
    return 'push';
  }
  if (trainingStyle === 'upper_lower') {
    return primaryType === 'upper' ? 'lower' : 'upper';
  }
  return 'full_body';
}

export function getRecommendations(
  profile: UserProfile,
  count: number = 3,
  templates: WorkoutTemplate[] = WORKOUT_TEMPLATES
): Recommendation[] {
  const candidates = getCandidateTemplates(profile, templates);
  const trainingStyle = profile.onboardingData?.trainingStyle || 'full_body';
  const scored = candidates.map((workout) => scoreWorkout(profile, workout)).sort((a, b) => b.score - a.score);

  const primary = scored[0];
  if (!primary) {
    return [];
  }

  const alternateType = getAlternateType(primary.workout.type, trainingStyle);
  const alternate = scored.find((item) => item.workout.id !== primary.workout.id && item.workout.type === alternateType);
  const mobility = scored.find((item) => item.workout.id !== primary.workout.id && item.workout.type === 'mobility');

  const results: Recommendation[] = [primary];
  if (alternate) results.push(alternate);
  if (mobility && !results.find((item) => item.workout.id === mobility.workout.id)) {
    results.push(mobility);
  }

  for (const item of scored) {
    if (results.length >= count) break;
    if (!results.find((entry) => entry.workout.id === item.workout.id)) {
      results.push(item);
    }
  }

  return results.slice(0, count);
}

export function getPrimaryRecommendation(profile: UserProfile): Recommendation | null {
  const recs = getRecommendations(profile, 1);
  return recs.length > 0 ? recs[0] : null;
}
