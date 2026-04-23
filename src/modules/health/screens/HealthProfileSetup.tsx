import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', value: 'sedentary', desc: 'Little or no exercise' },
  { label: 'Lightly Active', value: 'lightly_active', desc: 'Exercise 1-3 times/week' },
  { label: 'Moderately Active', value: 'moderately_active', desc: 'Exercise 4-5 times/week' },
  { label: 'Very Active', value: 'very_active', desc: 'Daily exercise or intense exercise' },
  { label: 'Extra Active', value: 'extra_active', desc: 'Intense exercise 6-7 times/week' },
];

const FITNESS_GOALS = [
  { label: 'Weight Loss', value: 'weight_loss', icon: 'trending-down' },
  { label: 'Maintenance', value: 'maintenance', icon: 'remove' },
  { label: 'Muscle Gain', value: 'muscle_gain', icon: 'trending-up' },
];

export const HealthProfileSetup = ({ navigation }: any) => {
  const { updateProfile, isLoading } = useHealthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    heightCm: '',
    weightKg: '',
    age: '',
    gender: 'male',
    activityLevel: 'sedentary',
    fitnessGoal: 'maintenance',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleSubmit = async () => {
    try {
      await updateProfile({
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        age: Number(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal,
      });
      navigation.replace('HealthDashboard');
    } catch (error) {
      console.error(error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Info</Text>
            <Text style={styles.stepSubtitle}>Tell us about your physical characteristics.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                keyboardType="numeric"
                value={formData.heightCm}
                onChangeText={(text) => setFormData({ ...formData, heightCm: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                keyboardType="numeric"
                value={formData.weightKg}
                onChangeText={(text) => setFormData({ ...formData, weightKg: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.tabContainer}>
                {['male', 'female', 'other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.tab, formData.gender === g && styles.activeTab]}
                    onPress={() => setFormData({ ...formData, gender: g })}
                  >
                    <Text style={[styles.tabText, formData.gender === g && styles.activeTabText]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Activity Level</Text>
            <Text style={styles.stepSubtitle}>How active are you on a weekly basis?</Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[styles.optionCard, formData.activityLevel === level.value && styles.activeOptionCard]}
                onPress={() => setFormData({ ...formData, activityLevel: level.value })}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, formData.activityLevel === level.value && styles.activeOptionLabel]}>
                    {level.label}
                  </Text>
                  <Text style={styles.optionDesc}>{level.desc}</Text>
                </View>
                {formData.activityLevel === level.value && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Fitness Goal</Text>
            <Text style={styles.stepSubtitle}>What do you want to achieve?</Text>
            {FITNESS_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal.value}
                style={[styles.optionCard, formData.fitnessGoal === goal.value && styles.activeOptionCard]}
                onPress={() => setFormData({ ...formData, fitnessGoal: goal.value })}
              >
                <View style={[styles.iconBox, { backgroundColor: formData.fitnessGoal === goal.value ? Colors.primary + '20' : Colors.background }]}>
                  <Ionicons name={goal.icon as any} size={24} color={formData.fitnessGoal === goal.value ? Colors.primary : Colors.textTertiary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, formData.fitnessGoal === goal.value && styles.activeOptionLabel]}>
                    {goal.label}
                  </Text>
                </View>
                {formData.fitnessGoal === goal.value && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[styles.progressDot, step >= s && styles.activeProgressDot]}
              />
            ))}
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.disabledButton]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {step === 3 ? 'Finish Setup' : 'Next'}
            </Text>
            {step < 3 && <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary + '20',
  },
  activeProgressDot: {
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  stepContainer: {},
  stepTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '08',
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.textInverse,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.textInverse,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeOptionCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  optionContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  optionLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  activeOptionLabel: {
    color: Colors.primary,
  },
  optionDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '10',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  nextButtonText: {
    color: Colors.textInverse,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
