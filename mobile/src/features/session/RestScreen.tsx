import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, REST_CONFIG } from '../../constants/theme';
import CircularProgress from '../../components/CircularProgress';

interface Props {
  restSeconds: number;
  defaultRestSeconds: number;
  nextExerciseName: string;
  nextAction: 'NEXT_SET' | 'NEXT_EXERCISE' | null;
  onAdjustRest: (adjustment: number) => void;
  onSkip: () => void;
  onRestComplete: () => void;
}

export default function RestScreen({
  restSeconds,
  defaultRestSeconds,
  nextExerciseName,
  nextAction,
  onAdjustRest,
  onSkip,
  onRestComplete,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isNearlyDone = restSeconds <= 10 && restSeconds > 0;
  const CIRCLE_SIZE = 220;
  const STROKE_WIDTH = 8;

  const timerColor = (() => {
    if (restSeconds <= 0) return COLORS.restDone;
    if (isNearlyDone) return COLORS.restNearlyDone;
    return COLORS.restActive;
  })();

  // Pulse animation when nearly done
  useEffect(() => {
    if (isNearlyDone) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isNearlyDone]);

  // Circular progress: full circle when restSeconds === defaultRestSeconds, empty when 0
  // But if user adjusted rest time, respect the current restSeconds as baseline
  const referenceSec = Math.max(defaultRestSeconds, restSeconds, REST_CONFIG.minRestSec);
  const progress = restSeconds > 0 ? restSeconds / referenceSec : 0;
  const invertedProgress = 1 - Math.min(progress, 1);
  const nextLabel = nextAction === 'NEXT_EXERCISE' ? 'Up next' : 'Same exercise';
  const skipLabel = nextAction === 'NEXT_EXERCISE' ? 'Start next exercise' : 'Start next set';
  const skipTone = nextAction === 'NEXT_EXERCISE' ? 'exercise' : 'set';
  const skipButtonStyle = [
    styles.skipButton,
    skipTone === 'set' && styles.skipButtonSet,
    skipTone === 'exercise' && styles.skipButtonExercise,
    isNearlyDone && styles.skipButtonReady,
  ];
  const skipButtonTextStyle = [
    styles.skipButtonText,
    skipTone === 'set' && styles.skipButtonTextSet,
    skipTone === 'exercise' && styles.skipButtonTextExercise,
    isNearlyDone && styles.skipButtonTextReady,
  ];

  const guidance =
    restSeconds <= 0
      ? 'Rest finished. Move when ready.'
      : isNearlyDone
      ? 'Almost there. Get ready.'
      : 'Use the timer or move early if you feel recovered.';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Circular Timer */}
        <Animated.View
          style={[
            styles.timerContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <CircularProgress
            size={CIRCLE_SIZE}
            strokeWidth={STROKE_WIDTH}
            progress={invertedProgress}
            color={timerColor}
          >
            <View style={styles.timerContent}>
              <Text style={[styles.timer, { color: timerColor }]}>
                {restSeconds}
              </Text>
              <Text style={styles.timerLabel}>seconds rest</Text>
              <Text style={styles.guidanceText}>{guidance}</Text>
            </View>
          </CircularProgress>
        </Animated.View>

        {/* Adjustment Controls */}
        <View style={styles.adjustRow}>
          <TouchableOpacity
            style={[
              styles.adjustButton,
              restSeconds <= REST_CONFIG.minRestSec && styles.adjustButtonDisabled,
            ]}
            onPress={() => onAdjustRest(-REST_CONFIG.adjustStep)}
            disabled={restSeconds <= REST_CONFIG.minRestSec}
          >
            <Text style={styles.adjustButtonText}>-{REST_CONFIG.adjustStep}s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.adjustButton,
              restSeconds >= REST_CONFIG.maxRestSec && styles.adjustButtonDisabled,
            ]}
            onPress={() => onAdjustRest(REST_CONFIG.adjustStep)}
            disabled={restSeconds >= REST_CONFIG.maxRestSec}
          >
            <Text style={styles.adjustButtonText}>+{REST_CONFIG.adjustStep}s</Text>
          </TouchableOpacity>
        </View>

        {/* Next Exercise Hint */}
        {nextExerciseName && (
          <View style={styles.nextHint}>
            <Text style={styles.nextLabel}>
              {nextLabel}
            </Text>
            <Text style={styles.nextName}>{nextExerciseName}</Text>
          </View>
        )}

        {/* Skip Button */}
        <TouchableOpacity
          style={skipButtonStyle}
          onPress={onSkip}
        >
          <Text style={skipButtonTextStyle}>
            {skipLabel}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  timerContent: {
    alignItems: 'center',
  },
  timer: {
    fontSize: FONTS.timer,
    fontWeight: '800',
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  guidanceText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 160,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  adjustButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 100,
    alignItems: 'center',
  },
  adjustButtonDisabled: {
    opacity: 0.4,
  },
  adjustButtonText: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextHint: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  nextLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  nextName: {
    fontSize: FONTS.bodyMedium,
    fontWeight: '600',
    color: COLORS.text,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  skipButtonSet: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  skipButtonExercise: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  skipButtonReady: {
    borderColor: COLORS.restNearlyDone,
  },
  skipButtonText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  skipButtonTextSet: {
    color: COLORS.white,
  },
  skipButtonTextExercise: {
    color: COLORS.primary,
  },
  skipButtonTextReady: {
    color: COLORS.primary,
  },
});
