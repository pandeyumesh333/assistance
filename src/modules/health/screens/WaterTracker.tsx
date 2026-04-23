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
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const WATER_BUTTONS = [
  { amount: 250, label: '250ml', icon: 'water-outline' },
  { amount: 500, label: '500ml', icon: 'water' },
  { amount: 1000, label: '1L', icon: 'beer' },
];

export const WaterTracker = ({ navigation }: any) => {
  const { dailyStats, targets, addWater } = useHealthStore();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hydration Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressSection}>
          <ProgressRing
            size={width * 0.7}
            progress={progress}
            strokeWidth={20}
            color="#3B82F6"
            label={current.toString()}
            subLabel={`of ${target}ml`}
          />
          <Text style={styles.statusText}>
            {progress >= 1 ? "Goal Achieved! 🏆" : `${Math.round((1 - progress) * 100)}% to go`}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.buttonGrid}>
          {WATER_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.label}
              style={styles.waterButton}
              onPress={() => handleAddWater(btn.amount)}
            >
              <View style={styles.iconBox}>
                <Ionicons name={btn.icon as any} size={32} color="#3B82F6" />
              </View>
              <Text style={styles.buttonLabel}>{btn.label}</Text>
              <Text style={styles.buttonSubtext}>+{btn.amount}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            Drinking water regularly helps maintain energy levels and improves focus.
          </Text>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
  statusText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: Spacing.md,
  },
  waterButton: {
    flex: 1,
    backgroundColor: Colors.textInverse,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F620',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: '#3B82F610',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  buttonLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  buttonSubtext: {
    fontSize: FontSizes.xs,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: FontWeights.medium,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#3B82F608',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
