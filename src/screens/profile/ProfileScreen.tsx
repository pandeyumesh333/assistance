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
import { authAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../constants/theme';

export const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { balance, fetchBalance, updateOpeningBalance } = useFinanceStore();
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Profile</Text>

        {/* User Info */}
        <Card style={styles.userCard} variant="elevated">
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || user?.email || '?')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>

        {/* Notifications */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.primaryLight + '20' }]}>
                <Ionicons name="notifications" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Reminders & alerts</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.textTertiary}
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
              <View style={[styles.settingIcon, { backgroundColor: Colors.secondaryLight + '20' }]}>
                <Ionicons name="wallet" size={20} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Opening Balance</Text>
                <Text style={styles.settingSubtitle}>
                  {balance
                    ? `Current: ${formatCurrency(balance.openingBalance)}`
                    : 'Set your starting balance'}
                </Text>
              </View>
            </View>
            <Ionicons
              name={showBalanceEditor ? 'chevron-up' : 'chevron-forward'}
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>

          {showBalanceEditor && (
            <View style={styles.balanceEditor}>
              <TextInput
                style={styles.balanceInput}
                value={newBalance}
                onChangeText={setNewBalance}
                placeholder="Enter new opening balance"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textTertiary}
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
        <Text style={styles.sectionTitle}>About</Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.infoLight }]}>
                <Ionicons name="information-circle" size={20} color={Colors.info} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Life Assistant</Text>
                <Text style={styles.settingSubtitle}>Version 1.0.0</Text>
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
          style={styles.logoutBtn}
          textStyle={{ color: Colors.error }}
        />

        <Text style={styles.footerText}>
          Built with ❤️ for your productivity
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userCard: {
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
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
  settingTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  balanceEditor: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  balanceInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  logoutBtn: {
    marginTop: Spacing.xl,
    borderColor: Colors.error,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
});
