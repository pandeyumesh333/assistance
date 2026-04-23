import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../constants/theme';

export const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { colors, isDark } = useTheme();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    clearError();
    if (!validate()) return;
    try {
      await signup(email.trim(), password, name.trim());
    } catch (e) {
      // Error is handled in store
    }
  };

  const dynamicStyles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    logoContainer: {
      width: 64,
      height: 64,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    title: {
      fontSize: FontSizes.xxxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.xxs,
    },
    subtitle: {
      fontSize: FontSizes.md,
      color: colors.textSecondary,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorLight,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
      gap: Spacing.xs,
    },
    errorBannerText: {
      color: colors.error,
      fontSize: FontSizes.sm,
      flex: 1,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: FontSizes.md,
    },
    linkText: {
      color: colors.primary,
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semibold,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={dynamicStyles.logoContainer}>
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </View>
            <Text style={dynamicStyles.title}>Create Account</Text>
            <Text style={dynamicStyles.subtitle}>
              Set up your personal life assistant
            </Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={dynamicStyles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={dynamicStyles.errorBannerText}>{error}</Text>
              </View>
            )}

            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
              error={errors.name}
              icon={<Ionicons name="person-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              icon={<Ionicons name="mail-outline" size={20} color={colors.textTertiary} />}
            />

            <View>
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                secureTextEntry={!showPassword}
                error={errors.password}
                icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry={!showPassword}
              error={errors.confirmPassword}
              icon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textTertiary} />}
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={isLoading}
              size="lg"
              style={styles.signupButton}
            />

            <View style={styles.footer}>
              <Text style={dynamicStyles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={dynamicStyles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  form: {
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: 34,
    padding: Spacing.xs,
  },
  signupButton: {
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
});
