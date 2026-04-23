import React, { useEffect, useState } from 'react';
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
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';

const { width } = Dimensions.get('window');

export const AnalyticsScreen = ({ navigation }: any) => {
  const { analytics, fetchAnalytics, isLoading } = useHealthStore();

  useEffect(() => {
    fetchAnalytics(7);
  }, []);

  if (isLoading || !analytics.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const labels = analytics.map((a: any) => a.date.split('-')[2]); // Day only
  const calorieData = analytics.map((a: any) => a.caloriesConsumed);
  const workoutData = analytics.map((a: any) => a.exerciseMinutes);
  const healthScores = analytics.map((a: any) => a.healthScore);
  const volumeData = analytics.map((a: any) => a.totalVolume || 0);

  const chartConfig = {
    backgroundColor: Colors.background,
    backgroundGradientFrom: Colors.textInverse,
    backgroundGradientTo: Colors.textInverse,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Calories Trend (Last 7 Days)</Text>
        <Card style={styles.chartCard}>
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

        <Text style={styles.sectionTitle}>Workout Consistency (Mins)</Text>
        <Card style={styles.chartCard}>
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

        <Text style={styles.sectionTitle}>Health Score History</Text>
        <Card style={styles.chartCard}>
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

        <Text style={styles.sectionTitle}>Gym Volume Trend (kg)</Text>
        <Card style={styles.chartCard}>
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
  backBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  chartCard: {
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.textInverse,
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

