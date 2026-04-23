import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const dynamicStyles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      gap: Spacing.xs,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.error,
    },
    size_sm: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
    },
    size_md: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.xl,
    },
    size_lg: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xxl,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontWeight: FontWeights.semibold,
    },
    text_primary: {
      color: '#FFFFFF',
    },
    text_secondary: {
      color: '#FFFFFF',
    },
    text_outline: {
      color: colors.primary,
    },
    text_ghost: {
      color: colors.primary,
    },
    text_danger: {
      color: '#FFFFFF',
    },
    text_size_sm: {
      fontSize: FontSizes.sm,
    },
    text_size_md: {
      fontSize: FontSizes.md,
    },
    text_size_lg: {
      fontSize: FontSizes.lg,
    },
  });

  return (
    <TouchableOpacity
      style={[
        dynamicStyles.button,
        dynamicStyles[variant],
        dynamicStyles[`size_${size}`],
        isDisabled && dynamicStyles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              dynamicStyles.text,
              dynamicStyles[`text_${variant}`],
              dynamicStyles[`text_size_${size}`],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
