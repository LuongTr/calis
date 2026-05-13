import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { TrainingExperience, UserLevel, OnboardingData } from '../../types';

interface Props {
  onComplete: (data: OnboardingData) => void;
}

const EXPERIENCE_OPTIONS: { value: TrainingExperience; label: string }[] = [
  { value: 'completely_new', label: 'Completely new' },
  { value: 'some_experience', label: 'Some experience' },
  { value: 'experienced', label: 'Experienced' },
];

const REPS_OPTIONS = [
  { label: '0-5', value: 1 },
  { label: '6-10', value: 2 },
  { label: '11-20', value: 3 },
  { label: '20+', value: 4 },
];

const MOBILITY_OPTIONS = [
  { label: 'Stiff', value: 'stiff' as const },
  { label: 'Normal', value: 'normal' as const },
  { label: 'Flexible', value: 'flexible' as const },
];

type Step = 'experience' | 'pushup' | 'pullup' | 'squat' | 'mobility' | 'complete';

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('experience');
  const [experience, setExperience] = useState<TrainingExperience | null>(null);
  const [pushUpLevel, setPushUpLevel] = useState(1);
  const [pullUpLevel, setPullUpLevel] = useState(1);
  const [squatLevel, setSquatLevel] = useState(1);
  const [mobilityLevel, setMobilityLevel] = useState<'stiff' | 'normal' | 'flexible'>('normal');

  const isBeginner = experience === 'completely_new';

  const calculateLevel = (): UserLevel => {
    if (isBeginner) return 'beginner';
    const avg = (pushUpLevel + pullUpLevel + squatLevel) / 3;
    return avg >= 2.5 ? 'intermediate' : 'beginner';
  };

  const handleNext = () => {
    switch (step) {
      case 'experience':
        setStep(isBeginner ? 'mobility' : 'pushup');
        break;
      case 'pushup':
        setStep('pullup');
        break;
      case 'pullup':
        setStep('squat');
        break;
      case 'squat':
        setStep('mobility');
        break;
      case 'mobility':
        setStep('complete');
        break;
      case 'complete': {
        const nextLevel = calculateLevel();
        const data: OnboardingData = {
          experience: experience!,
          pushUpLevel: isBeginner ? undefined : pushUpLevel,
          pullUpLevel: isBeginner ? undefined : pullUpLevel,
          squatLevel: isBeginner ? undefined : squatLevel,
          mobilityLevel,
          userLevel: nextLevel,
          trainingStyle: nextLevel === 'beginner' ? 'full_body' : 'upper_lower',
        };
        onComplete(data);
        break;
      }
    }
  };

  const canProceed = () => {
    if (step === 'experience') return experience !== null;
    return true;
  };

  const getTitle = () => {
    switch (step) {
      case 'experience':
        return 'Have you trained before?';
      case 'pushup':
        return 'How many push-ups can you do?';
      case 'pullup':
        return 'How many pull-ups can you do?';
      case 'squat':
        return 'How many squats can you do?';
      case 'mobility':
        return 'How is your flexibility?';
      case 'complete':
        return "Let's get started!";
    }
  };

  const getProgress = () => {
    const steps = isBeginner
      ? ['experience', 'mobility', 'complete']
      : ['experience', 'pushup', 'pullup', 'squat', 'mobility', 'complete'];
    const idx = steps.indexOf(step);
    return `${idx + 1} / ${steps.length}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>{getProgress()}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{getTitle()}</Text>

        {step === 'experience' && (
          <View style={styles.options}>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionButton,
                  experience === opt.value && styles.optionButtonSelected,
                ]}
                onPress={() => setExperience(opt.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    experience === opt.value && styles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(step === 'pushup' || step === 'pullup' || step === 'squat') && (
          <View style={styles.options}>
            {REPS_OPTIONS.map((opt) => {
              const currentVal =
                step === 'pushup'
                  ? pushUpLevel
                  : step === 'pullup'
                  ? pullUpLevel
                  : squatLevel;

              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.optionButton,
                    currentVal === opt.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    if (step === 'pushup') setPushUpLevel(opt.value);
                    else if (step === 'pullup') setPullUpLevel(opt.value);
                    else setSquatLevel(opt.value);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currentVal === opt.value && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step === 'mobility' && (
          <View style={styles.options}>
            {MOBILITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionButton,
                  mobilityLevel === opt.value && styles.optionButtonSelected,
                ]}
                onPress={() => setMobilityLevel(opt.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    mobilityLevel === opt.value && styles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'complete' && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {experience === 'completely_new'
                ? "We'll start with beginner-friendly full body workouts."
                : 'We have a good sense of your level. Ready to train?'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {step === 'complete' ? "Let's go!" : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  progress: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONTS.titleMedium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  options: {
    gap: SPACING.md,
  },
  optionButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  optionText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.white,
    fontWeight: '700',
  },
  summary: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
