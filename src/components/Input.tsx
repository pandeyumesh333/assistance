import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { BorderRadius, FontSizes, Spacing, FontWeights } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  icon,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    label: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.medium,
      color: colors.textSecondary,
      marginBottom: Spacing.xxs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
    },
    inputError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      fontSize: FontSizes.md,
      color: colors.textPrimary,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    errorText: {
      fontSize: FontSizes.xs,
      color: colors.error,
      marginTop: Spacing.xxs,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={dynamicStyles.label}>{label}</Text>}
      <View style={[dynamicStyles.inputWrapper, error && dynamicStyles.inputError]}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <TextInput
          style={[dynamicStyles.input, icon ? styles.inputWithIcon : undefined, style]}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />
      </View>
      {error && <Text style={dynamicStyles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  iconWrapper: {
    paddingLeft: Spacing.sm,
  },
  inputWithIcon: {
    paddingLeft: Spacing.xs,
  },
});
