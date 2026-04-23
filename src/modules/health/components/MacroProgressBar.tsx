import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';

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
  const progress = Math.min(1, current / (target || 1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {Math.round(current)} / {Math.round(target)}{unit}
        </Text>
      </View>
      <View style={styles.barBackground}>
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
    color: Colors.textSecondary,
  },
  values: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
  },
  barBackground: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barForeground: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
