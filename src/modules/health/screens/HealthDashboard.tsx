import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { useAuthStore } from '../../../stores/authStore';
import { useTheme } from '../../../hooks/useTheme';
import { ProgressRing } from '../components/ProgressRing';
import { HealthStatCard } from '../components/HealthStatCard';
import { Card } from '../../../components/Card';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export const HealthDashboard = ({ navigation }: any) => {
  const { 
    dailyStats, 
    targets, 
    fetchHealthData, 
    isLoading,
    profile 
  } = useHealthStore();
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = React.useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const loadData = useCallback(async () => {
    await fetchHealthData(today);
  }, [fetchHealthData, today]);

  const { useFocusEffect } = require('@react-navigation/native');
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    greeting: {
      fontSize: FontSizes.xxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    dateText: {
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      marginTop: 2,
    },
    scoreTitle: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    scoreSubtitle: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    wideCardTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semibold,
      color: colors.textPrimary,
    },
    wideCardSubtitle: {
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      marginTop: 2,
    },
    tipBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '15',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.md,
      gap: Spacing.xs,
    },
    tipText: {
      flex: 1,
      fontSize: FontSizes.xs,
      color: colors.primary,
      fontWeight: FontWeights.medium,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness" size={80} color={colors.primary + '30'} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Welcome to Health</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Setup your health profile to start tracking your fitness journey.
          </Text>
          <TouchableOpacity 
            style={[styles.setupButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('HealthProfileSetup')}
          >
            <Text style={styles.setupButtonText}>Setup Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const score = dailyStats?.healthScore || 0;
  const caloriesProgress = (dailyStats?.caloriesConsumed || 0) / (targets?.dailyCaloriesTarget || 2000);
  const waterProgress = (dailyStats?.waterConsumed || 0) / (targets?.hydrationTargetMl || 3000);
  const stepsProgress = (dailyStats?.steps || 0) / (targets?.stepsTarget || 10000);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={dynamicStyles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!</Text>
            <Text style={dynamicStyles.dateText}>{format(new Date(), 'EEEE, do MMMM')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Health Score Ring */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <ProgressRing
              size={120}
              progress={score / 100}
              label={score.toString()}
              subLabel="Health Score"
              color={score > 70 ? colors.success : score > 40 ? colors.warning : colors.error}
            />
            <View style={styles.scoreInfo}>
              <Text style={dynamicStyles.scoreTitle}>You're doing great!</Text>
              <Text style={dynamicStyles.scoreSubtitle}>
                You completed {score}% of today's health goals.
              </Text>
              <View style={dynamicStyles.tipBox}>
                <Ionicons name="water" size={16} color={colors.primary} />
                <Text style={dynamicStyles.tipText}>
                  {waterProgress < 1 
                    ? `Drink ${Math.round((targets?.hydrationTargetMl - dailyStats?.waterConsumed) / 250)} more glasses of water.`
                    : "Hydration target achieved! Keep it up."}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <HealthStatCard
              title="Calories"
              value={dailyStats?.caloriesConsumed || 0}
              unit="kcal"
              icon="nutrition"
              color="#F59E0B"
              progress={caloriesProgress}
              onPress={() => navigation.navigate('MealTracker')}
            />
            <HealthStatCard
              title="Water"
              value={dailyStats?.waterConsumed || 0}
              unit="ml"
              icon="water"
              color="#3B82F6"
              progress={waterProgress}
              onPress={() => navigation.navigate('WaterTracker')}
            />
          </View>
          <View style={styles.statsRow}>
            <HealthStatCard
              title="Steps"
              value={dailyStats?.steps || 0}
              unit="steps"
              icon="walk"
              color="#22C55E"
              progress={stepsProgress}
              onPress={() => {}}
            />
            <HealthStatCard
              title="Exercise"
              value={dailyStats?.exerciseMinutes || 0}
              unit="mins"
              icon="fitness"
              color="#8B5CF6"
              progress={(dailyStats?.exerciseMinutes || 0) / 30}
              onPress={() => navigation.navigate('WorkoutTracker')}
            />
          </View>
        </View>

        {/* Secondary Stats */}
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>More Trackers</Text>
        </View>

        <Card style={styles.wideCard} onPress={() => navigation.navigate('SleepTracker')}>
          <View style={styles.wideCardRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="moon" size={24} color={colors.primary} />
            </View>
            <View style={styles.wideCardContent}>
              <Text style={dynamicStyles.wideCardTitle}>Sleep Tracking</Text>
              <Text style={dynamicStyles.wideCardSubtitle}>
                {dailyStats?.sleepHours ? `${dailyStats.sleepHours}h slept last night` : 'Log your sleep to track recovery'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </Card>

        <Card style={styles.wideCard} onPress={() => navigation.navigate('HabitTracker')}>
          <View style={styles.wideCardRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.secondary + '15' }]}>
              <Ionicons name="checkbox" size={24} color={colors.secondary} />
            </View>
            <View style={styles.wideCardContent}>
              <Text style={dynamicStyles.wideCardTitle}>Habit Checklist</Text>
              <Text style={dynamicStyles.wideCardSubtitle}>Daily routines and streaks</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoreCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  statsGrid: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  wideCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  wideCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideCardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 24,
  },
  setupButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xxl,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
