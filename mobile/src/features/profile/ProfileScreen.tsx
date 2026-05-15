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
import { TrainingStyle, UserProfile } from '../../types';

interface Props {
  profile: UserProfile;
  onRetakeOnboarding: () => void;
  onChangeTrainingStyle: (style: TrainingStyle) => void;
  onBack: () => void;
  onLogout: () => void;
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

export default function ProfileScreen({
  profile,
  onRetakeOnboarding,
  onChangeTrainingStyle,
  onBack,
  onLogout,
}: Props) {
  const data = profile.onboardingData;
  const isGuestProfile = profile.authMode === 'guest';
  const displayName = profile.displayName?.trim() || (isGuestProfile ? 'Guest' : 'User');
  const availableStyles: TrainingStyle[] =
    data?.userLevel === 'intermediate'
      ? ['upper_lower', 'push_pull_legs']
      : ['full_body'];
  const accountState = isGuestProfile ? 'Guest mode' : 'Signed in';
  const emailLabel = profile.email?.trim() || 'No email';

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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{displayName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{emailLabel}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>State</Text>
            <Text style={styles.rowValue}>{accountState}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Preferences</Text>
          <View style={styles.preferenceBlock}>
            <Text style={styles.preferenceLabel}>Split</Text>
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
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Level</Text>
            <Text style={styles.rowValue}>{data?.userLevel || 'Beginner'}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Mobility</Text>
            <Text style={styles.rowValue}>{data?.mobilityLevel || 'normal'}</Text>
          </View>
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
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  section: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
    textTransform: 'capitalize',
    maxWidth: '58%',
    textAlign: 'right',
  },
  preferenceBlock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  preferenceLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
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
