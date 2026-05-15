import React from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { Recommendation, UserProfile } from '../../types';

interface Props {
  profile: UserProfile;
  recommendations: Recommendation[];
  recentWorkoutTitle?: string | null;
  weeklySessions: number;
  onStartWorkout: (workoutId: string) => void;
  onViewWorkout: (workoutId: string) => void;
  onViewWorkoutList: () => void;
  onRepeatLastWorkout?: () => void;
  onProfile: () => void;
  statusMessage?: string | null;
  showCreateAccountPrompt?: boolean;
  onCreateAccount?: () => void;
}

function WorkoutIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    full_body: 'FB',
    upper: 'UP',
    lower: 'LO',
    push: 'PU',
    pull: 'PL',
    legs: 'LG',
    mobility: 'MB',
  };

  return <Text style={styles.workoutIcon}>{icons[type] || 'WK'}</Text>;
}

function getLevelBadge(level: string) {
  return level === 'beginner'
    ? { label: 'Beginner', color: COLORS.success }
    : { label: 'Intermediate', color: COLORS.warning };
}

export default function HomeScreen({
  profile,
  recommendations,
  recentWorkoutTitle,
  weeklySessions,
  onStartWorkout,
  onViewWorkout,
  onViewWorkoutList,
  onRepeatLastWorkout,
  onProfile,
  statusMessage,
  showCreateAccountPrompt,
  onCreateAccount,
}: Props) {
  const primaryRec = recommendations[0];
  const onboardingData = profile.onboardingData;
  const userLevel = onboardingData?.userLevel || 'beginner';
  const { label: levelLabel, color: levelColor } = getLevelBadge(userLevel);

  const lastWorkoutDate = profile.lastWorkoutDate
    ? new Date(profile.lastWorkoutDate)
    : null;
  const daysSinceLastWorkout = lastWorkoutDate
    ? Math.floor((Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isGuest = profile.authMode === 'guest';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Ready to train?</Text>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
                <Text style={[styles.levelText, { color: levelColor }]}>{levelLabel}</Text>
              </View>
              {daysSinceLastWorkout !== null && daysSinceLastWorkout <= 1 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>Active</Text>
                </View>
              )}
              {daysSinceLastWorkout !== null && daysSinceLastWorkout > 1 && (
                <View style={[styles.streakBadge, styles.streakInactive]}>
                  <Text style={[styles.streakText, { color: COLORS.textSecondary }]}>
                    {daysSinceLastWorkout}d ago
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={onProfile} style={styles.avatarButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {onboardingData?.userLevel === 'beginner' ? 'B' : 'I'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {statusMessage ? (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>{statusMessage}</Text>
          </View>
        ) : null}

        {isGuest && showCreateAccountPrompt && onCreateAccount ? (
          <View style={styles.guestBanner}>
            <View style={styles.guestBannerTextWrap}>
              <Text style={styles.guestBannerTitle}>Guest mode</Text>
              <Text style={styles.guestBannerText}>
                Create an account to keep progress after you close the app.
              </Text>
            </View>
            <TouchableOpacity style={styles.guestBannerButton} onPress={onCreateAccount}>
              <Text style={styles.guestBannerButtonText}>Create account</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>This week</Text>
            <Text style={styles.metricValue}>{weeklySessions} sessions</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Last done</Text>
            <Text style={styles.metricValue}>{recentWorkoutTitle || 'No sessions yet'}</Text>
          </View>
        </View>

        {primaryRec && (
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={() => onStartWorkout(primaryRec.workout.id)}
            activeOpacity={0.85}
          >
            <View style={styles.ctaContent}>
              <WorkoutIcon type={primaryRec.workout.type} />
              <View style={styles.ctaTextContent}>
                <Text style={styles.ctaTitle}>Start Workout</Text>
                <Text style={styles.ctaSubtitle}>
                  {primaryRec.workout.title} | {primaryRec.workout.durationMin} min
                </Text>
                <Text style={styles.ctaReason}>{primaryRec.reason}</Text>
              </View>
              <Text style={styles.ctaArrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        )}

        {!primaryRec && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No workout ready yet</Text>
            <Text style={styles.emptyStateText}>
              Finish onboarding or browse the workout list to get moving.
            </Text>
          </View>
        )}

        {/*
          Quick actions section intentionally hidden on Home screen.
          Keep code removed to avoid rendering while retaining styles for potential reuse.
        */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <View style={styles.recommendedList}>
            {recommendations.map((rec, index) => {
              const { label, color } = getLevelBadge(rec.workout.level);
              return (
                <TouchableOpacity
                  key={rec.workout.id}
                  style={[
                    styles.recommendedCard,
                    index === 0 && styles.recommendedCardPrimary,
                  ]}
                  onPress={() => onViewWorkout(rec.workout.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardRow}>
                    <WorkoutIcon type={rec.workout.type} />
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, index === 0 && styles.cardTitlePrimary]}>
                        {rec.workout.title}
                      </Text>
                      <View style={styles.cardTags}>
                        <View style={[styles.tag, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.tagText, { color }]}>{label}</Text>
                        </View>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>
                            {rec.workout.type.replace('_', ' ')}
                          </Text>
                        </View>
                        <Text style={styles.cardDuration}>{rec.workout.durationMin} min</Text>
                      </View>
                      <Text style={styles.cardReason}>{rec.reason}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.browseButton} onPress={onViewWorkoutList} activeOpacity={0.7}>
          <Text style={styles.browseButtonText}>View all workouts</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FONTS.titleLarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  levelRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  levelText: {
    fontSize: FONTS.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
  },
  streakInactive: {
    backgroundColor: COLORS.surface,
  },
  streakText: {
    fontSize: FONTS.caption,
    fontWeight: '600',
    color: COLORS.text,
  },
  avatarButton: {
    marginLeft: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONTS.bodyMedium,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBannerText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  guestBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: SPACING.sm,
  },
  guestBannerTextWrap: {
    gap: SPACING.xs,
  },
  guestBannerTitle: {
    fontSize: FONTS.bodyMedium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  guestBannerText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  guestBannerButton: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  guestBannerButtonText: {
    fontSize: FONTS.bodySmall,
    fontWeight: '700',
    color: COLORS.white,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
  },
  primaryCTA: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    ...(Platform.OS === 'web'
      ? { boxShadow: `0px 4px 8px ${COLORS.primary}4d` }
      : {
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }),
    elevation: 6,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaTextContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ctaTitle: {
    fontSize: FONTS.titleSmall,
    fontWeight: '700',
    color: COLORS.white,
  },
  ctaSubtitle: {
    fontSize: FONTS.bodySmall,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  ctaReason: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  ctaArrow: {
    fontSize: 20,
    color: COLORS.white,
    opacity: 0.8,
  },
  workoutIcon: {
    fontSize: FONTS.bodySmall,
    fontWeight: '700',
    color: COLORS.textSecondary,
    minWidth: 28,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActions: {
    gap: SPACING.sm,
  },
  quickActionCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  quickActionTitle: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
  },
  recommendedList: {
    gap: SPACING.sm,
  },
  emptyState: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyStateTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  recommendedCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recommendedCardPrimary: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.bodyMedium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardTitlePrimary: {
    color: COLORS.primary,
  },
  cardTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardDuration: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardReason: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  browseButton: {
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  browseButtonText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
