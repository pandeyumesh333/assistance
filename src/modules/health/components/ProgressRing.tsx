import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FontSizes, FontWeights } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';

interface ProgressRingProps {
  size: number;
  progress: number; // 0 to 1
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  subLabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  progress,
  strokeWidth = 10,
  color,
  backgroundColor,
  label,
  subLabel,
}) => {
  const { colors } = useTheme();
  
  const ringColor = color || colors.primary;
  const ringBg = backgroundColor || colors.borderLight;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          stroke={ringBg}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={ringColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        {label !== undefined && label !== null && (
          <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        )}
        {subLabel && <Text style={[styles.subLabel, { color: colors.textTertiary }]}>{subLabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  subLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
});
