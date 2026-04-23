import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../stores/authStore';
import { useFinanceStore } from '../../stores/financeStore';
import { useTheme } from '../../hooks/useTheme';
import { authAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '../../constants/theme';

export const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { balance, fetchBalance, updateOpeningBalance } = useFinanceStore();
  const { mode, colors, toggleTheme, isDark } = useTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true
  );
  const [showBalanceEditor, setShowBalanceEditor] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await authAPI.updateProfile({ notificationsEnabled: value });
      updateUser({ notificationsEnabled: value });
    } catch (error) {
      setNotificationsEnabled(!value);
    }
  };

  const handleResetBalance = async () => {
    const amount = parseFloat(newBalance);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await updateOpeningBalance(amount);
      setShowBalanceEditor(false);
      setNewBalance('');
      Alert.alert('Success', 'Opening balance updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update balance');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  // Dynamic styles based on theme colors
  const dynamicStyles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: FontSizes.xxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    userName: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.semibold,
      color: colors.textPrimary,
    },
    userEmail: {
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.semibold,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: Spacing.sm,
      marginTop: Spacing.xs,
    },
    settingTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.medium,
      color: colors.textPrimary,
    },
    settingSubtitle: {
      fontSize: FontSizes.xs,
      color: colors.textTertiary,
      marginTop: 1,
    },
    balanceInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      fontSize: FontSizes.md,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    footerText: {
      textAlign: 'center',
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    avatarText: {
      fontSize: FontSizes.xxl,
      fontWeight: FontWeights.bold,
      color: colors.textInverse,
    },
    balanceEditor: {
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    logoutBtn: {
      marginTop: Spacing.xl,
      borderColor: colors.error,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={dynamicStyles.headerTitle}>Profile</Text>

        {/* User Info */}
        <Card style={styles.userCard} variant="elevated">
          <View style={styles.avatarContainer}>
            <View style={dynamicStyles.avatar}>
              <Text style={dynamicStyles.avatarText}>
                {(user?.name || user?.email || '?')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={dynamicStyles.userName}>{user?.name || 'User'}</Text>
              <Text style={dynamicStyles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Text style={dynamicStyles.sectionTitle}>Settings</Text>

        {/* Appearance (Theme) */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={dynamicStyles.settingTitle}>Black Theme</Text>
                <Text style={dynamicStyles.settingSubtitle}>Switch to dark mode</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : colors.textTertiary}
            />
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight + '20' }]}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={dynamicStyles.settingTitle}>Push Notifications</Text>
                <Text style={dynamicStyles.settingSubtitle}>Reminders & alerts</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
            />
          </View>
        </Card>

        {/* Opening Balance */}
        <Card style={styles.settingCard}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowBalanceEditor(!showBalanceEditor)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="wallet" size={20} color={colors.secondary} />
              </View>
              <View>
                <Text style={dynamicStyles.settingTitle}>Opening Balance</Text>
                <Text style={dynamicStyles.settingSubtitle}>
                  {balance
                    ? `Current: ${formatCurrency(balance.openingBalance)}`
                    : 'Set your starting balance'}
                </Text>
              </View>
            </View>
            <Ionicons
              name={showBalanceEditor ? 'chevron-up' : 'chevron-forward'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          {showBalanceEditor && (
            <View style={dynamicStyles.balanceEditor}>
              <TextInput
                style={dynamicStyles.balanceInput}
                value={newBalance}
                onChangeText={setNewBalance}
                placeholder="Enter new opening balance"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textTertiary}
              />
              <Button
                title="Update"
                onPress={handleResetBalance}
                size="sm"
                style={{ marginTop: Spacing.xs }}
              />
            </View>
          )}
        </Card>

        {/* App Info */}
        <Text style={dynamicStyles.sectionTitle}>About</Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
              </View>
              <View>
                <Text style={dynamicStyles.settingTitle}>Life Assistant</Text>
                <Text style={dynamicStyles.settingSubtitle}>Version 2.0.0 (Gold)</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          size="lg"
          style={dynamicStyles.logoutBtn}
          textStyle={{ color: colors.error }}
        />

        <Text style={dynamicStyles.footerText}>
          Built with ❤️ for your productivity
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  userCard: {
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  settingCard: {
    marginBottom: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    marginTop: Spacing.xl,
  },
});
