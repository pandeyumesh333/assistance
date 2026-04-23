import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, FontSizes, FontWeights, Spacing } from '../constants/theme';
import { formatCurrency } from '../utils/helpers';

interface DailyBriefProps {
  pendingTasks: number;
  meetingsCount: number;
  expensesToday: number;
  userName: string;
}

export const DailyBrief = ({ pendingTasks, meetingsCount, expensesToday, userName }: DailyBriefProps) => {
  const getBriefMessage = () => {
    if (pendingTasks === 0 && meetingsCount === 0 && expensesToday === 0) {
      return `It's a quiet day, ${userName}. Time to relax! ☕`;
    }
    
    let message = `Good day, ${userName}! `;
    if (meetingsCount > 0) {
      message += `You have ${meetingsCount} meeting${meetingsCount > 1 ? 's' : ''} to attend. `;
    }
    if (pendingTasks > 0) {
      message += `Don't forget your ${pendingTasks} pending task${pendingTasks > 1 ? 's' : ''}. `;
    }
    if (expensesToday > 0) {
      message += `You've spent ${formatCurrency(expensesToday)} so far today.`;
    }
    return message;
  };

  return (
    <Card style={styles.container} variant="elevated">
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Ionicons name="sparkles" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.title}>AI Daily Brief</Text>
      </View>
      <Text style={styles.message}>{getBriefMessage()}</Text>
      
      <View style={styles.footer}>
        <View style={styles.dot} />
        <Text style={styles.footerText}>Assistant is active</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
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
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
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
    backgroundColor: Colors.secondary,
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
});
