import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { Card } from '../../../components/Card';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '../../../constants/theme';

export const WorkoutTracker = ({ navigation }: any) => {
  const { dailyStats, activeWorkout, startWorkout, fetchActiveWorkout } = useHealthStore();

  React.useEffect(() => {
    fetchActiveWorkout();
  }, []);

  const handleStartWorkout = async () => {
    if (activeWorkout) {
      navigation.navigate('ActiveWorkout');
    } else {
      await startWorkout();
      navigation.navigate('ActiveWorkout');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ExerciseSearch')}>
          <Ionicons name="search" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsOverview}>
          <Card style={styles.statBox}>
            <Text style={styles.statLabel}>Today's Duration</Text>
            <Text style={styles.statValue}>{dailyStats?.exerciseMinutes || 0} <Text style={styles.statUnit}>mins</Text></Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statLabel}>Calories Burned</Text>
            <Text style={styles.statValue}>{dailyStats?.caloriesBurned || 0} <Text style={styles.statUnit}>kcal</Text></Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statLabel}>Total Volume</Text>
            <Text style={styles.statValue}>{dailyStats?.totalVolume || 0} <Text style={styles.statUnit}>kg</Text></Text>
          </Card>
        </View>

        {activeWorkout ? (
          <Card style={styles.activeWorkoutCard} onPress={() => navigation.navigate('ActiveWorkout')}>
            <View style={styles.activeHeader}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.activeTitle}>{activeWorkout.title}</Text>
            </View>
            <Text style={styles.activeSubtitle}>
              {activeWorkout.exercises.length} exercises logged
            </Text>
            <TouchableOpacity style={styles.resumeBtn} onPress={() => navigation.navigate('ActiveWorkout')}>
              <Text style={styles.resumeBtnText}>Resume Workout</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <TouchableOpacity style={styles.startLargeBtn} onPress={handleStartWorkout}>
            <View style={styles.playIconContainer}>
              <Ionicons name="play" size={32} color={Colors.textInverse} />
            </View>
            <Text style={styles.startLargeBtnText}>Start Empty Workout</Text>
          </TouchableOpacity>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('ExerciseSearch')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#4F46E520' }]}>
                <Ionicons name="library" size={24} color="#4F46E5" />
              </View>
              <Text style={styles.actionLabel}>Library</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="stats-chart" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionLabel}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('History', 'Coming Soon!')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="time" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>
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
  statsOverview: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  statUnit: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
  },
  activeWorkoutCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.textInverse,
    borderColor: '#22C55E',
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  activeTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  activeSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  resumeBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  resumeBtnText: {
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
  startLargeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 24,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.md,
    ...Shadows.md,
  },
  playIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: BorderRadius.full,
  },
  startLargeBtnText: {
    color: Colors.textInverse,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  quickActions: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
});
