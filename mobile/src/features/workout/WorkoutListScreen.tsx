import React, { useMemo, useState } from 'react';
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
import { WorkoutTemplate } from '../../types';

interface Props {
  workouts: WorkoutTemplate[];
  onSelectWorkout: (workoutId: string) => void;
  onCreateCustom: () => void;
  onBack: () => void;
}

function WorkoutIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    full_body: 'FB',
    upper: 'UP',
    lower: 'LO',
    mobility: 'MB',
  };
  return <Text style={styles.workoutIcon}>{icons[type] || 'WK'}</Text>;
}

function getLevelColor(level: string) {
  return level === 'beginner'
    ? { bg: COLORS.success + '20', text: COLORS.success, label: 'Beginner' }
    : { bg: COLORS.warning + '20', text: COLORS.warning, label: 'Intermediate' };
}

const LEVEL_FILTERS = ['All', 'Beginner', 'Intermediate'] as const;
const TYPE_FILTERS = ['All', 'Full Body', 'Upper', 'Lower', 'Mobility'] as const;

function normalizeTypeFilter(value: typeof TYPE_FILTERS[number]): string {
  return value.toLowerCase().replace(' ', '_');
}

export default function WorkoutListScreen({ workouts, onSelectWorkout, onCreateCustom, onBack }: Props) {
  const [activeLevelFilter, setActiveLevelFilter] = useState<string>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const levelMatch =
        activeLevelFilter === 'All' || workout.level === activeLevelFilter.toLowerCase();
      const typeMatch =
        activeTypeFilter === 'All' || workout.type === normalizeTypeFilter(activeTypeFilter as typeof TYPE_FILTERS[number]);
      return levelMatch && typeMatch;
    });
  }, [activeLevelFilter, activeTypeFilter, workouts]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Workouts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filtersSection}>
        <TouchableOpacity style={styles.createButton} onPress={onCreateCustom}>
          <Text style={styles.createButtonText}>Build custom workout</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {LEVEL_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeLevelFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveLevelFilter(filter)}
              >
                <Text
                  style={[styles.filterText, activeLevelFilter === filter && styles.filterTextActive]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {TYPE_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeTypeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveTypeFilter(filter)}
              >
                <Text
                  style={[styles.filterText, activeTypeFilter === filter && styles.filterTextActive]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No workouts match these filters</Text>
            <Text style={styles.emptyStateText}>
              Clear one of the filters to see more options.
            </Text>
          </View>
        ) : (
          filteredWorkouts.map((workout) => {
            const { bg, text, label } = getLevelColor(workout.level);
            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.card}
                onPress={() => onSelectWorkout(workout.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardRow}>
                  <WorkoutIcon type={workout.type} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{workout.title}</Text>
                    <View style={styles.cardTags}>
                      <View style={[styles.tag, { backgroundColor: bg }]}>
                        <Text style={[styles.tagText, { color: text }]}>{label}</Text>
                      </View>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{workout.type.replace('_', ' ')}</Text>
                      </View>
                      {workout.goalTags.includes('custom') ? (
                        <View style={[styles.tag, styles.customTag]}>
                          <Text style={[styles.tagText, styles.customTagText]}>custom</Text>
                        </View>
                      ) : null}
                      <Text style={styles.cardMeta}>
                        {workout.durationMin} min | {workout.exerciseBlocks.length} exercises
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardArrow}>{'>'}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: FONTS.titleSmall,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 60,
  },
  filtersSection: {
    marginBottom: SPACING.md,
  },
  createButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  createButtonText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterScroll: {
    paddingLeft: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.bodySmall,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  emptyState: {
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
  card: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...(Platform.OS === 'web'
      ? { boxShadow: `0px 1px 3px ${COLORS.black}0d` }
      : {
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        }),
    elevation: 2,
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
  cardTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardMeta: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  customTag: {
    backgroundColor: COLORS.primary + '18',
  },
  customTagText: {
    color: COLORS.primary,
  },
  tagText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  workoutIcon: {
    fontSize: FONTS.bodySmall,
    fontWeight: '700',
    color: COLORS.textSecondary,
    minWidth: 28,
    textAlign: 'center',
  },
  cardArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
    opacity: 0.5,
    marginLeft: SPACING.sm,
  },
});
