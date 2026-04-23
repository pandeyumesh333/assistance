import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { FontSizes, FontWeights, Spacing } from '../constants/theme';
import { formatCurrency } from '../utils/helpers';
import { useTheme } from '../hooks/useTheme';
import { useHealthStore } from '../modules/health/store/healthStore';

interface DailyBriefProps {
  pendingTasks: number;
  meetingsCount: number;
  expensesToday: number;
  userName: string;
  navigation: any;
}

export const DailyBrief = ({ pendingTasks, meetingsCount, expensesToday, userName, navigation }: DailyBriefProps) => {
  const { dailyStats, targets } = useHealthStore();
  const { colors } = useTheme();

  const getBriefMessage = () => {
    let message = `Good day, ${userName}! `;
    
    if (meetingsCount > 0) {
      message += `You have ${meetingsCount} meeting${meetingsCount > 1 ? 's' : ''} today. `;
    }
    if (pendingTasks > 0) {
      message += `There are ${pendingTasks} tasks on your plate. `;
    }
    
    if (dailyStats && targets) {
      const waterLeft = Math.max(0, targets.hydrationTargetMl - dailyStats.waterConsumed);
      if (waterLeft > 0) {
        message += `Drink ${Math.round(waterLeft / 250)} more glasses of water. `;
      } else {
        message += `Great job on hydration! `;
      }
      
      if (dailyStats.exerciseMinutes === 0) {
        message += `Don't forget to squeeze in a workout. `;
      }
    }

    if (expensesToday > 0) {
      message += `Spending is at ${formatCurrency(expensesToday)}.`;
    }
    
    return message;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      marginBottom: Spacing.lg,
      padding: Spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    title: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    message: {
      fontSize: FontSizes.md,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing.md,
    },
    footerText: {
      fontSize: FontSizes.xs,
      color: colors.textTertiary,
      fontWeight: FontWeights.medium,
    },
  });

  return (
    <Card style={dynamicStyles.container} variant="elevated">
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
        </View>
        <Text style={dynamicStyles.title}>AI Daily Brief</Text>
      </View>
      <Text style={dynamicStyles.message}>{getBriefMessage()}</Text>
      
      <View style={styles.footer}>
        <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
        <Text style={dynamicStyles.footerText}>Assistant is active</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
