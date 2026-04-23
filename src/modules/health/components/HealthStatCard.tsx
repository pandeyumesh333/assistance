import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/Card';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';

interface HealthStatCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  progress?: number;
  onPress?: () => void;
}

export const HealthStatCard: React.FC<HealthStatCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  progress,
  onPress,
}) => {
  const { colors } = useTheme();
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textTertiary }]}>{title}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
          <Text style={[styles.unit, { color: colors.textTertiary }]}>{unit}</Text>
        </View>
        {progress !== undefined && (
          <View style={[styles.progressBg, { backgroundColor: colors.borderLight }]}>
            <View style={[styles.progressFg, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: color }]} />
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.md,
    minWidth: 150,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  unit: {
    fontSize: FontSizes.xs,
    marginLeft: 2,
  },
  progressBg: {
    height: 4,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFg: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
