import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { WorkoutHistoryEntry } from '../../types';

interface Props {
  history: WorkoutHistoryEntry[];
}

function getWeeklySessions(history: WorkoutHistoryEntry[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter((entry) => new Date(entry.completedAt).getTime() >= sevenDaysAgo).length;
}

export default function WorkoutHistoryScreen({ history }: Props) {
  const weeklySessions = getWeeklySessions(history);
  const totalSessions = history.length;
  const pendingSync = history.filter((item) => item.syncStatus === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>This week</Text>
            <Text style={styles.metricValue}>{weeklySessions}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total</Text>
            <Text style={styles.metricValue}>{totalSessions}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pending sync</Text>
            <Text style={styles.metricValue}>{pendingSync}</Text>
          </View>
        </View>

        <View style={styles.section}>
          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No workouts recorded yet.</Text>
            </View>
          ) : (
            history.map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyMain}>
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
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.titleMedium,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: FONTS.titleSmall,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  section: {
    gap: SPACING.sm,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  historyItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyMain: {
    flex: 1,
    marginRight: SPACING.md,
  },
  historyTitle: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
  },
  historyMeta: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  historyDate: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
