import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { TrainingStyle, UserProfile, WorkoutHistoryEntry } from '../../types';
import CircularProgress from '../../components/CircularProgress';

interface Props {
  profile: UserProfile;
  history: WorkoutHistoryEntry[];
  onRetakeOnboarding: () => void;
  onChangeTrainingStyle: (style: TrainingStyle) => void;
  onBack: () => void;
  onLogout: () => void;
}

function getLevelData(level?: string) {
  if (level === 'intermediate') {
    return { label: 'Intermediate', color: COLORS.warning, icon: 'I', progress: 0.65 };
  }
  return { label: 'Beginner', color: COLORS.success, icon: 'B', progress: 0.35 };
}

function getMobilityData(mobility?: string) {
  switch (mobility) {
    case 'flexible':
      return { label: 'Flexible', color: COLORS.success };
    case 'stiff':
      return { label: 'Stiff', color: COLORS.error };
    default:
      return { label: 'Normal', color: COLORS.primary };
  }
}

function getTrainingStyleLabel(style?: TrainingStyle): string {
  switch (style) {
    case 'push_pull_legs':
      return 'Push / Pull / Legs';
    case 'upper_lower':
      return 'Upper / Lower Split';
    default:
      return 'Full Body Focus';
  }
}

function getWeeklySessions(history: WorkoutHistoryEntry[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter((entry) => new Date(entry.completedAt).getTime() >= sevenDaysAgo).length;
}

export default function ProfileScreen({
  profile,
  history,
  onRetakeOnboarding,
  onChangeTrainingStyle,
  onBack,
  onLogout,
}: Props) {
  const data = profile.onboardingData;
  const isGuestProfile = profile.authMode === 'guest';
  const displayName = profile.displayName?.trim() || (isGuestProfile ? 'Guest' : 'User');
  const { label: levelLabel, color: levelColor, icon: levelIcon, progress: levelProgress } =
    getLevelData(data?.userLevel);
  const { label: mobilityLabel, color: mobilityColor } = getMobilityData(data?.mobilityLevel);
  const lastWorkoutDate = profile.lastWorkoutDate
    ? new Date(profile.lastWorkoutDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const recentSessions = history.slice(0, 7);
  const weeklySessions = getWeeklySessions(history);
  const availableStyles: TrainingStyle[] =
    data?.userLevel === 'intermediate'
      ? ['upper_lower', 'push_pull_legs']
      : ['full_body'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <CircularProgress size={100} strokeWidth={8} progress={levelProgress} color={levelColor}>
            <View style={[styles.avatar, { borderColor: levelColor }]}>
              <Text style={styles.avatarIcon}>{levelIcon}</Text>
            </View>
          </CircularProgress>
          <Text style={styles.userLevel}>{levelLabel}</Text>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.trainingStyle}>{getTrainingStyleLabel(data?.trainingStyle)}</Text>
          {isGuestProfile ? <Text style={styles.guestHint}>Guest mode - progress stays on this device for this session.</Text> : null}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: levelColor }]}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={[styles.statValue, { color: levelColor }]}>{levelLabel}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: mobilityColor }]}>
            <Text style={styles.statLabel}>Mobility</Text>
            <Text style={[styles.statValue, { color: mobilityColor }]}>{mobilityLabel}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.statLabel}>This week</Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{weeklySessions} sessions</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.textSecondary }]}>
            <Text style={styles.statLabel}>Last Workout</Text>
            <Text style={styles.statValue}>{lastWorkoutDate || 'No workouts yet'}</Text>
          </View>
        </View>

        {data && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Experience</Text>
            <Text style={styles.infoText}>
              {data.experience === 'completely_new'
                ? 'New to calisthenics'
                : data.experience === 'some_experience'
                ? 'Some experience'
                : 'Experienced'}
            </Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Training split</Text>
          <View style={styles.styleRow}>
            {availableStyles.map((style) => {
              const selected = data?.trainingStyle === style;
              return (
                <TouchableOpacity
                  key={style}
                  style={[styles.styleChip, selected && styles.styleChipActive]}
                  onPress={() => onChangeTrainingStyle(style)}
                >
                  <Text style={[styles.styleChipText, selected && styles.styleChipTextActive]}>
                    {getTrainingStyleLabel(style)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Recent sessions</Text>
          {recentSessions.length === 0 ? (
            <Text style={styles.infoText}>No sessions recorded yet.</Text>
          ) : (
            <View style={styles.historyList}>
              {recentSessions.map((entry) => (
                <View key={entry.id} style={styles.historyItem}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>{entry.workoutTitle}</Text>
                    <Text style={styles.historyMeta}>
                      {entry.workoutType.replace(/_/g, ' ')} | {Math.round(entry.durationSeconds / 60)} min | {entry.totalSets} sets
                      {entry.syncStatus === 'pending' ? ' | pending sync' : ''}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(entry.completedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.retakeButton} onPress={onRetakeOnboarding} activeOpacity={0.7}>
          <Text style={styles.retakeButtonText}>Retake Assessment</Text>
          <Text style={styles.retakeButtonHint}>Update your level and preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: { fontSize: FONTS.bodyMedium, color: COLORS.primary, fontWeight: '500' },
  title: { fontSize: FONTS.titleSmall, fontWeight: '700', color: COLORS.text },
  headerSpacer: { width: 60 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  profileHeader: { alignItems: 'center', paddingVertical: SPACING.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 30, fontWeight: '700', color: COLORS.text },
  userLevel: { fontSize: FONTS.titleSmall, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  userName: { fontSize: FONTS.bodyMedium, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.xs },
  trainingStyle: { fontSize: FONTS.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.xs },
  guestHint: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: { fontSize: FONTS.bodyLarge, color: COLORS.text, fontWeight: '700' },
  infoSection: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: { fontSize: FONTS.bodyMedium, color: COLORS.text, fontWeight: '500' },
  styleRow: { gap: SPACING.sm },
  styleChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  styleChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  styleChipText: { fontSize: FONTS.bodySmall, color: COLORS.textSecondary, fontWeight: '600' },
  styleChipTextActive: { color: COLORS.primary },
  historyList: { gap: SPACING.sm },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  historyInfo: { flex: 1, marginRight: SPACING.md },
  historyTitle: { fontSize: FONTS.bodyMedium, color: COLORS.text, fontWeight: '600' },
  historyMeta: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  historyDate: { fontSize: FONTS.caption, color: COLORS.textSecondary, fontWeight: '600' },
  retakeButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  retakeButtonText: { fontSize: FONTS.bodyMedium, color: COLORS.primary, fontWeight: '700' },
  retakeButtonHint: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginTop: SPACING.xs },
  logoutButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  logoutButtonText: { fontSize: FONTS.bodyMedium, color: COLORS.error, fontWeight: '600' },
});
