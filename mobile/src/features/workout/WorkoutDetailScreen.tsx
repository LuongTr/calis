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
import { WorkoutTemplate, Exercise, ExerciseBlock } from '../../types';
import { getCachedExerciseById } from '../../lib/api';

interface Props {
  workout: WorkoutTemplate;
  onStart: (workoutId: string) => void;
  onBack: () => void;
}

type SectionKey = 'warmup' | 'main' | 'cooldown';

interface ExerciseRow {
  block: ExerciseBlock;
  exercise?: Exercise;
  originalIndex: number;
}

function getSectionLabel(section: SectionKey): string {
  switch (section) {
    case 'warmup':
      return 'Warm-up';
    case 'cooldown':
      return 'Cooldown';
    default:
      return 'Main Work';
  }
}

function getExerciseSection(exercise?: Exercise): SectionKey {
  const tags = exercise?.tags || [];
  if (tags.includes('purpose_warmup') || tags.includes('warmup')) {
    return 'warmup';
  }
  if (tags.includes('purpose_cooldown') || tags.includes('cooldown')) {
    return 'cooldown';
  }
  return 'main';
}

function formatExerciseDetails(block: ExerciseBlock): string {
  const effort = block.reps ? `${block.reps} reps` : block.timeSec ? `${block.timeSec}s` : 'work';
  return `${block.sets} sets | ${effort} | rest ${block.restTimeSec}s`;
}

function buildSections(workout: WorkoutTemplate): Record<SectionKey, ExerciseRow[]> {
  const sections: Record<SectionKey, ExerciseRow[]> = {
    warmup: [],
    main: [],
    cooldown: [],
  };

  workout.exerciseBlocks.forEach((block, index) => {
    const exercise = getCachedExerciseById(block.exerciseId);
    const section = getExerciseSection(exercise);
    sections[section].push({
      block,
      exercise,
      originalIndex: index,
    });
  });

  return sections;
}

export default function WorkoutDetailScreen({ workout, onStart, onBack }: Props) {
  const sections = buildSections(workout);
  const orderedSections: SectionKey[] = ['warmup', 'main', 'cooldown'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Workout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <View style={styles.summaryTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{workout.durationMin} min</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{workout.level}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{workout.type.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>

        {orderedSections.map((sectionKey) => {
          const items = sections[sectionKey];
          if (items.length === 0) {
            return null;
          }

          return (
            <View key={sectionKey} style={styles.section}>
              <Text style={styles.sectionTitle}>{getSectionLabel(sectionKey)}</Text>
              <View style={styles.sectionCard}>
                {items.map(({ block, exercise, originalIndex }) => (
                  <View key={`${block.exerciseId}-${originalIndex}`} style={styles.exerciseItem}>
                    <View style={styles.exerciseOrder}>
                      <Text style={styles.exerciseOrderText}>{originalIndex + 1}</Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise?.name || block.exerciseId}</Text>
                      <Text style={styles.exerciseDetails}>{formatExerciseDetails(block)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.startButton} onPress={() => onStart(workout.id)}>
          <Text style={styles.startButtonText}>Start Workout</Text>
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
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  summary: {
    marginBottom: SPACING.lg,
  },
  workoutTitle: {
    fontSize: FONTS.titleMedium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  summaryTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exerciseOrderText: {
    fontSize: FONTS.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FONTS.bodyMedium,
    fontWeight: '600',
    color: COLORS.text,
  },
  exerciseDetails: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  startButtonText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.white,
    fontWeight: '700',
  },
});
