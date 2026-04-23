import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { ProgressRing } from '../components/ProgressRing';
import { useTheme } from '../../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const WATER_BUTTONS = [
  { amount: 250, label: '250ml', icon: 'water-outline' },
  { amount: 500, label: '500ml', icon: 'water' },
  { amount: 1000, label: '1L', icon: 'beer' },
];

export const WaterTracker = ({ navigation }: any) => {
  const { dailyStats, targets, addWater } = useHealthStore();
  const { colors, isDark } = useTheme();

  const current = dailyStats?.waterConsumed || 0;
  const target = targets?.hydrationTargetMl || 3000;
  const progress = Math.min(1, current / target);

  const handleAddWater = async (amount: number) => {
    try {
      await addWater(amount);
    } catch (error) {
      console.error(error);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    statusText: {
      fontSize: FontSizes.xl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginTop: Spacing.xl,
    },
    sectionTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      alignSelf: 'flex-start',
      marginBottom: Spacing.lg,
      marginTop: Spacing.lg,
    },
    waterButton: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonLabel: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Hydration Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <ProgressRing
            size={width * 0.7}
            progress={progress}
            strokeWidth={20}
            color={colors.primary}
            label={current.toString()}
            subLabel={`of ${target}ml`}
          />
          <Text style={dynamicStyles.statusText}>
            {progress >= 1 ? "Goal Achieved! 🏆" : `${Math.round((1 - progress) * 100)}% to go`}
          </Text>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Quick Add</Text>
        <View style={styles.buttonGrid}>
          {WATER_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.label}
              style={dynamicStyles.waterButton}
              onPress={() => handleAddWater(btn.amount)}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={btn.icon as any} size={32} color={colors.primary} />
              </View>
              <Text style={dynamicStyles.buttonLabel}>{btn.label}</Text>
              <Text style={[styles.buttonSubtext, { color: colors.primary }]}>+{btn.amount}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Drinking water regularly helps maintain energy levels and improves focus.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: Spacing.md,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  buttonSubtext: {
    fontSize: FontSizes.xs,
    marginTop: 2,
    fontWeight: FontWeights.medium,
  },
  infoCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
