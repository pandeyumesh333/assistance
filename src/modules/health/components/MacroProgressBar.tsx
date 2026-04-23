import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  current,
  target,
  unit,
  color,
}) => {
  const { colors } = useTheme();
  const progress = Math.min(1, current / (target || 1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.values, { color: colors.textTertiary }]}>
          {Math.round(current)} / {Math.round(target)}{unit}
        </Text>
      </View>
      <View style={[styles.barBackground, { backgroundColor: colors.borderLight }]}>
        <View
          style={[
            styles.barForeground,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  values: {
    fontSize: FontSizes.sm,
  },
  barBackground: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barForeground: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
