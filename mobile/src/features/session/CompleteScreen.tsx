import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  workoutTitle: string;
  totalSets: number;
  onFinish: () => void;
  onNewWorkout: () => void;
}

export default function CompleteScreen({
  workoutTitle,
  totalSets,
  onFinish,
  onNewWorkout,
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>

        <Text style={styles.title}>Workout Complete!</Text>
        <Text style={styles.subtitle}>{workoutTitle}</Text>

        <View style={styles.stats}>
          <Text style={styles.statsText}>{totalSets} sets completed</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  checkmark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  checkmarkText: {
    fontSize: 40,
    color: COLORS.white,
    fontWeight: '700',
  },
  title: {
    fontSize: FONTS.titleMedium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  stats: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  statsText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  actions: {
    gap: SPACING.md,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.white,
    fontWeight: '700',
  },
});