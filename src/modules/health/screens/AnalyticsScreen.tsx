import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useHealthStore } from '../store/healthStore';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';

const { width } = Dimensions.get('window');

export const AnalyticsScreen = ({ navigation }: any) => {
  const { analytics, fetchAnalytics, isLoading } = useHealthStore();
  const { colors, isDark } = useTheme();

  const { useFocusEffect } = require('@react-navigation/native');
  useFocusEffect(
    useCallback(() => {
      fetchAnalytics(7);
    }, [fetchAnalytics])
  );

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
    sectionTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.md,
      marginTop: Spacing.lg,
    },
    chartCard: {
      padding: Spacing.md,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
  });

  if (isLoading || !analytics.length) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const labels = analytics.map((a: any) => a.date.split('-')[2]);
  const calorieData = analytics.map((a: any) => a.caloriesConsumed);
  const workoutData = analytics.map((a: any) => a.exerciseMinutes);
  const healthScores = analytics.map((a: any) => a.healthScore);
  const volumeData = analytics.map((a: any) => a.totalVolume || 0);

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(129, 140, 248, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Health Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={dynamicStyles.sectionTitle}>Calories Trend (Last 7 Days)</Text>
        <Card style={dynamicStyles.chartCard}>
          <LineChart
            data={{
              labels,
              datasets: [{ data: calorieData }],
            }}
            width={width - Spacing.lg * 4}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Workout Consistency (Mins)</Text>
        <Card style={dynamicStyles.chartCard}>
          <BarChart
            data={{
              labels,
              datasets: [{ data: workoutData }],
            }}
            width={width - Spacing.lg * 4}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Health Score History</Text>
        <Card style={dynamicStyles.chartCard}>
          <LineChart
            data={{
              labels,
              datasets: [{ data: healthScores }],
            }}
            width={width - Spacing.lg * 4}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Gym Volume Trend (kg)</Text>
        <Card style={dynamicStyles.chartCard}>
          <LineChart
            data={{
              labels,
              datasets: [{ data: volumeData }],
            }}
            width={width - Spacing.lg * 4}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
            }}
            style={styles.chart}
            bezier
          />
        </Card>
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
  backBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
