import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { Card } from '../../../components/Card';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { format } from 'date-fns';

const HABITS = [
  { id: 'walkCompleted', label: '10k Steps Walked', icon: 'walk' },
  { id: 'hydrationCompleted', label: 'Stayed Hydrated', icon: 'water' },
  { id: 'sleepBeforeMidnight', label: 'Slept before 12 AM', icon: 'moon' },
  { id: 'meditationCompleted', label: 'Daily Meditation', icon: 'leaf' },
  { id: 'stretchingCompleted', label: 'Daily Stretching', icon: 'body' },
];

export const HabitTracker = ({ navigation }: any) => {
  const { habits, updateHabits } = useHealthStore();

  const toggleHabit = async (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newHabits = { ...habits, [habitId]: !habits[habitId], date: today };
    try {
      await updateHabits(newHabits);
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
        <Text style={styles.headerTitle}>Habit Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={48} color="#F59E0B" />
          <View style={styles.streakInfo}>
            <Text style={styles.streakValue}>5 Day Streak!</Text>
            <Text style={styles.streakSubtitle}>Keep it up, you're on fire!</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {HABITS.map((habit) => {
          const isCompleted = habits ? habits[habit.id] : false;
          return (
            <TouchableOpacity
              key={habit.id}
              activeOpacity={0.7}
              onPress={() => toggleHabit(habit.id)}
            >
              <Card style={[styles.habitCard, isCompleted && styles.completedHabitCard]}>
                <View style={[styles.iconBox, { backgroundColor: isCompleted ? Colors.success + '20' : Colors.primary + '10' }]}>
                  <Ionicons name={habit.icon as any} size={24} color={isCompleted ? Colors.success : Colors.primary} />
                </View>
                <Text style={[styles.habitLabel, isCompleted && styles.completedHabitLabel]}>
                  {habit.label}
                </Text>
                <View style={[styles.checkbox, isCompleted && styles.checkedBox]}>
                  {isCompleted && <Ionicons name="checkmark" size={16} color={Colors.textInverse} />}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          <View style={styles.barChart}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View key={i} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height: Math.random() * 80 + 20, backgroundColor: i === 7 ? Colors.primary : Colors.primary + '30' }]} />
                <Text style={styles.chartDay}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i-1]}</Text>
              </View>
            ))}
          </View>
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
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B10',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F59E0B20',
  },
  streakInfo: {
    marginLeft: Spacing.lg,
  },
  streakValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: '#D97706',
  },
  streakSubtitle: {
    fontSize: FontSizes.sm,
    color: '#D97706',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  completedHabitCard: {
    borderColor: Colors.success + '30',
    backgroundColor: Colors.success + '05',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitLabel: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  completedHabitLabel: {
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  chartPlaceholder: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.textInverse,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  chartTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: Spacing.lg,
  },
  chartColumn: {
    alignItems: 'center',
    width: 30,
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
  },
  chartDay: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 8,
  },
});
