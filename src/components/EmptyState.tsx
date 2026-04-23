import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontSizes, FontWeights, Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    title: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.semibold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.xxs,
    },
    subtitle: {
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      textAlign: 'center',
      lineHeight: 20,
    },
    actionText: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semibold,
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.iconContainer}>
        <Ionicons name={icon} size={48} color={colors.textTertiary} />
      </View>
      <Text style={dynamicStyles.title}>{title}</Text>
      {subtitle && <Text style={dynamicStyles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={dynamicStyles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.massive,
    paddingHorizontal: Spacing.xxl,
  },
  action: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
});
