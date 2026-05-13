import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  onLogin: () => void;
  onSignup: () => void;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onEmailSignup: (email: string, password: string, displayName: string) => Promise<void>;
  error?: string | null;
  helperMessage?: string | null;
}

export default function AuthScreen({
  onLogin,
  onSignup,
  onEmailLogin,
  onEmailSignup,
  error,
  helperMessage,
}: Props) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter email and password');
      return;
    }

    if (isSignup && displayName.trim().length < 2) {
      setLocalError('Please enter a valid username');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      if (isSignup) {
        await onEmailSignup(email, password, displayName.trim());
      } else {
        await onEmailLogin(email, password);
      }
    } catch (submitError: any) {
      setLocalError(submitError.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (showEmailForm) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <View style={styles.top}>
            <Text style={styles.logo}>CALIS</Text>
            <Text style={styles.subtitle}>{isSignup ? 'Create Account' : 'Welcome Back'}</Text>
          </View>

          <View style={styles.form}>
            {helperMessage ? (
              <View style={styles.helperBanner}>
                <Text style={styles.helperBannerText}>{helperMessage}</Text>
              </View>
            ) : null}

            {isSignup ? (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
              />
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={isSignup ? 'new-password' : 'password'}
            />

            {localError || error ? (
              <Text style={styles.errorText}>{localError || error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleEmailSubmit}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignup(!isSignup);
                setLocalError(null);
                setDisplayName('');
              }}
            >
              <Text style={styles.switchButtonText}>
                {isSignup
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Create one"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setShowEmailForm(false)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>CALIS</Text>
        <Text style={styles.subtitle}>Guided Calisthenics Training</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.message}>Your guided path to bodyweight strength</Text>
        {helperMessage ? (
          <View style={styles.helperBanner}>
            <Text style={styles.helperBannerText}>{helperMessage}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.primaryButton} onPress={onSignup}>
          <Text style={styles.primaryButtonText}>Quick Start</Text>
        </TouchableOpacity>
        <Text style={styles.quickStartHint}>
          Guest mode. Progress stays on this device until you create an account.
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setShowEmailForm(true);
            setIsSignup(false);
          }}
        >
          <Text style={styles.secondaryButtonText}>Sign in with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => {
            setShowEmailForm(true);
            setIsSignup(true);
          }}
        >
          <Text style={styles.tertiaryButtonText}>Create Account</Text>
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
  flex: {
    flex: 1,
  },
  top: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  message: {
    fontSize: FONTS.titleSmall,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  bottom: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  input: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: FONTS.bodyMedium,
    color: COLORS.text,
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
  secondaryButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tertiaryButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
  },
  quickStartHint: {
    fontSize: FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: -SPACING.xs,
  },
  switchButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
  },
  backButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.error,
    textAlign: 'center',
  },
  helperBanner: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helperBannerText: {
    fontSize: FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
