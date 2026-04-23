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
import { useTheme } from '../../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '../../../constants/theme';

export const WorkoutTracker = ({ navigation }: any) => {
  const { dailyStats, activeWorkout, startWorkout, fetchActiveWorkout } = useHealthStore();
  const { colors, isDark } = useTheme();

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
    statValue: {
      fontSize: FontSizes.xl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    activeWorkoutCard: {
      padding: Spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.secondary,
      borderWidth: 1,
      marginBottom: Spacing.lg,
    },
    activeTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    sectionTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.md,
    },
    actionLabel: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
      fontWeight: FontWeights.medium,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Workout Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ExerciseSearch')}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsOverview}>
          <Card style={styles.statBox}>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Today's Duration</Text>
            <Text style={dynamicStyles.statValue}>{dailyStats?.exerciseMinutes || 0} <Text style={[styles.statUnit, { color: colors.textTertiary }]}>mins</Text></Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Calories Burned</Text>
            <Text style={dynamicStyles.statValue}>{dailyStats?.caloriesBurned || 0} <Text style={[styles.statUnit, { color: colors.textTertiary }]}>kcal</Text></Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Total Volume</Text>
            <Text style={dynamicStyles.statValue}>{dailyStats?.totalVolume || 0} <Text style={[styles.statUnit, { color: colors.textTertiary }]}>kg</Text></Text>
          </Card>
        </View>

        {activeWorkout ? (
          <Card style={dynamicStyles.activeWorkoutCard} onPress={() => navigation.navigate('ActiveWorkout')}>
            <View style={styles.activeHeader}>
              <View style={[styles.liveBadge, { backgroundColor: colors.secondary + '20' }]}>
                <View style={[styles.liveDot, { backgroundColor: colors.secondary }]} />
                <Text style={[styles.liveText, { color: colors.secondary }]}>LIVE</Text>
              </View>
              <Text style={dynamicStyles.activeTitle}>{activeWorkout.title}</Text>
            </View>
            <Text style={[styles.activeSubtitle, { color: colors.textSecondary }]}>
              {activeWorkout.exercises.length} exercises logged
            </Text>
            <TouchableOpacity 
              style={[styles.resumeBtn, { backgroundColor: colors.secondary }]} 
              onPress={() => navigation.navigate('ActiveWorkout')}
            >
              <Text style={styles.resumeBtnText}>Resume Workout</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <TouchableOpacity 
            style={[styles.startLargeBtn, { backgroundColor: colors.primary }]} 
            onPress={handleStartWorkout}
          >
            <View style={styles.playIconContainer}>
              <Ionicons name="play" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.startLargeBtnText}>Start Empty Workout</Text>
          </TouchableOpacity>
        )}

        <View style={styles.quickActions}>
          <Text style={dynamicStyles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('ExerciseSearch')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="library" size={24} color={colors.primary} />
              </View>
              <Text style={dynamicStyles.actionLabel}>Library</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="stats-chart" size={24} color={colors.warning} />
              </View>
              <Text style={dynamicStyles.actionLabel}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('History', 'Coming Soon!')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="time" size={24} color={colors.secondary} />
              </View>
              <Text style={dynamicStyles.actionLabel}>History</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 4,
  },
  statUnit: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  resumeBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  startLargeBtn: {
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
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  quickActions: {
    marginTop: Spacing.md,
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
});
