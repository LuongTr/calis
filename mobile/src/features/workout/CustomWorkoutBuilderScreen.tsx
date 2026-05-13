import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { Exercise, WorkoutTemplate, WorkoutType } from '../../types';

interface Props {
  exercises: Exercise[];
  onSave: (workout: WorkoutTemplate) => void;
  onBack: () => void;
}

const TYPE_OPTIONS: WorkoutType[] = ['full_body', 'upper', 'lower', 'push', 'pull', 'legs', 'mobility'];

function normalizeExerciseType(type: Exercise['type']): WorkoutType {
  return type === 'mobility' ? 'mobility' : 'full_body';
}

export default function CustomWorkoutBuilderScreen({ exercises, onSave, onBack }: Props) {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<WorkoutType>('full_body');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const filteredExercises = useMemo(() => {
    if (selectedType === 'mobility') {
      return exercises.filter((exercise) => exercise.type === 'mobility');
    }

    if (selectedType === 'full_body') {
      return exercises.filter((exercise) => exercise.type === 'calis');
    }

    return exercises.filter((exercise) => {
      if (exercise.type !== 'calis') return false;
      if (selectedType === 'legs') return exercise.muscleGroup === 'legs' || exercise.muscleGroup === 'core';
      if (selectedType === 'push') return exercise.muscleGroup === 'push' || exercise.muscleGroup === 'core';
      if (selectedType === 'pull') return exercise.muscleGroup === 'pull' || exercise.muscleGroup === 'core';
      if (selectedType === 'upper') return exercise.muscleGroup === 'push' || exercise.muscleGroup === 'pull' || exercise.muscleGroup === 'core';
      if (selectedType === 'lower') return exercise.muscleGroup === 'legs' || exercise.muscleGroup === 'core';
      return true;
    });
  }, [exercises, selectedType]);

  const selectedExercises = selectedExerciseIds
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  const canSave = title.trim().length >= 3 && selectedExercises.length >= 2;

  const handleToggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId]
    );
  };

  const handleSave = () => {
    if (!canSave) return;

    const blocks = selectedExercises.map((exercise, index) => ({
      exerciseId: exercise.id,
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      timeSec: exercise.defaultTimeSec,
      restTimeSec: exercise.restTimeSec,
      order: index,
    }));

    const durationMin = Math.max(
      10,
      Math.round(
        selectedExercises.reduce((sum, exercise) => sum + (exercise.defaultTimeSec ? 0.5 : 1.5) * exercise.defaultSets, 0)
      )
    );

    const workout: WorkoutTemplate = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      level: selectedExercises.some((exercise) => exercise.level === 'intermediate') ? 'intermediate' : 'beginner',
      type: selectedType,
      durationMin,
      goalTags: ['custom'],
      exerciseBlocks: blocks,
    };

    onSave(workout);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Custom Workout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Workout name</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Example: Short Push Day"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Focus</Text>
          <View style={styles.chipRow}>
            {TYPE_OPTIONS.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, selectedType === type && styles.chipActive]}
                onPress={() => {
                  setSelectedType(type);
                  setSelectedExerciseIds([]);
                }}
              >
                <Text style={[styles.chipText, selectedType === type && styles.chipTextActive]}>
                  {type.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Selected exercises</Text>
          {selectedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No exercises selected</Text>
              <Text style={styles.emptyText}>Pick at least two exercises from the list below.</Text>
            </View>
          ) : (
            <View style={styles.selectedList}>
              {selectedExercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.selectedItem}>
                  <Text style={styles.selectedIndex}>{index + 1}</Text>
                  <Text style={styles.selectedName}>{exercise.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Exercise library</Text>
          <View style={styles.exerciseList}>
            {filteredExercises.map((exercise) => {
              const selected = selectedExerciseIds.includes(exercise.id);
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[styles.exerciseCard, selected && styles.exerciseCardActive]}
                  onPress={() => handleToggleExercise(exercise.id)}
                >
                  <View style={styles.exerciseCardHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={[styles.exercisePill, selected && styles.exercisePillActive]}>
                      {selected ? 'Added' : 'Add'}
                    </Text>
                  </View>
                  <Text style={styles.exerciseMeta}>
                    {normalizeExerciseType(exercise.type).replace(/_/g, ' ')} | {exercise.level} | {exercise.defaultSets} sets
                  </Text>
                  <Text style={styles.exerciseDescription}>{exercise.shortDescription}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>Save custom workout</Text>
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
  section: { marginBottom: SPACING.xl },
  label: { fontSize: FONTS.bodyMedium, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.bodyMedium,
    color: COLORS.text,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.bodySmall, color: COLORS.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
  emptyState: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  emptyTitle: { fontSize: FONTS.bodyMedium, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  emptyText: { fontSize: FONTS.bodySmall, color: COLORS.textSecondary, lineHeight: 20 },
  selectedList: { gap: SPACING.sm },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedIndex: {
    width: 24,
    fontSize: FONTS.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
  selectedName: { fontSize: FONTS.bodyMedium, color: COLORS.text, fontWeight: '500' },
  exerciseList: { gap: SPACING.sm },
  exerciseCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.accent },
  exerciseCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseName: { fontSize: FONTS.bodyMedium, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  exercisePill: { fontSize: FONTS.caption, color: COLORS.primary, fontWeight: '700' },
  exercisePillActive: { color: COLORS.primaryDark },
  exerciseMeta: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginTop: SPACING.xs, textTransform: 'capitalize' },
  exerciseDescription: { fontSize: FONTS.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.xs, lineHeight: 20 },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: FONTS.bodyLarge, color: COLORS.white, fontWeight: '700' },
});
