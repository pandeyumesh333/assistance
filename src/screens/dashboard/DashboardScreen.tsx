import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { DailyBrief } from '../../components/DailyBrief';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStore';
import { useMeetingStore } from '../../stores/meetingStore';
import { useFinanceStore } from '../../stores/financeStore';
import { useHealthStore } from '../../modules/health/store/healthStore';
import { useTheme } from '../../hooks/useTheme';
import { syncRecentSMS } from '../../services/smsListener';
import { getGreeting, formatCurrency, formatTime } from '../../utils/helpers';
import { NotificationService } from '../../services/NotificationService';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '../../constants/theme';

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { meetings, fetchMeetings } = useMeetingStore();
  const { balance, fetchBalance, fetchTransactions, transactions } = useFinanceStore();
  const { dailyStats, fetchHealthData } = useHealthStore();
  const { colors, isDark } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const pendingTasks = (tasks || []).filter((t) => !t.completed);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayMeetings = (meetings || []).filter((m) => {
    const mt = new Date(m.time);
    return mt >= today && mt < tomorrow;
  });

  const latestExpense = (transactions || [])
    .filter((t) => t.type === 'debit')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const expensesToday = (transactions || [])
    .filter((t) => {
      const ts = new Date(t.timestamp);
      return t.type === 'debit' && ts >= today && ts < tomorrow;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchTasks(),
        fetchMeetings(),
        fetchBalance(),
        fetchTransactions(),
        fetchHealthData(new Date().toISOString().split('T')[0]),
      ]);

      if (Platform.OS === 'android') {
        syncRecentSMS();
      }
    } catch (err) {

    }
  }, [fetchTasks, fetchMeetings, fetchBalance, fetchTransactions, fetchHealthData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greeting = getGreeting();
  const userName = user?.name || user?.email?.split('@')[0] || 'there';

  const dynamicStyles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    greeting: {
      fontSize: FontSizes.lg,
      color: colors.textSecondary,
      fontWeight: FontWeights.medium,
    },
    userName: {
      fontSize: FontSizes.xxxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginTop: Spacing.xxs,
    },
    statValue: {
      fontSize: FontSizes.xxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: FontSizes.xs,
      color: colors.textTertiary,
      marginTop: Spacing.xxs,
    },
    balanceLabel: {
      fontSize: FontSizes.sm,
      color: colors.textInverse,
      fontWeight: FontWeights.medium,
      opacity: 0.8,
    },
    balanceAmount: {
      fontSize: FontSizes.display,
      fontWeight: FontWeights.bold,
      color: colors.textInverse,
      marginBottom: Spacing.sm,
    },
    sectionTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semibold,
      color: colors.textPrimary,
      marginBottom: Spacing.sm,
    },
    meetingTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.medium,
      color: colors.textPrimary,
    },
    meetingTime: {
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      marginTop: 2,
    },
    expenseMerchant: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.medium,
      color: colors.textPrimary,
    },
    expenseCategory: {
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      marginTop: 2,
    },
    healthTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.medium,
      color: colors.textSecondary,
    },
    healthSubtitle: {
      fontSize: FontSizes.sm,
      color: colors.textTertiary,
      marginTop: 2,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.greetingSection}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.greeting}>{greeting},</Text>
              <Text style={dynamicStyles.userName}>{userName} ✨</Text>
            </View>
            <View 
              style={[styles.headerIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.textTertiary} />
            </View>
          </View>

          <DailyBrief 
            userName={userName}
            pendingTasks={pendingTasks.length}
            meetingsCount={todayMeetings.length}
            expensesToday={expensesToday}
            navigation={navigation}
          />

          <View style={styles.statsRow}>
            <Card style={styles.statCard} onPress={() => navigation.navigate('Tasks')}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              </View>
              <Text style={dynamicStyles.statValue}>{pendingTasks.length}</Text>
              <Text style={dynamicStyles.statLabel}>Pending Tasks</Text>
            </Card>

            <Card style={styles.statCard} onPress={() => navigation.navigate('Meetings')}>
              <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="calendar" size={22} color={colors.secondary} />
              </View>
              <Text style={dynamicStyles.statValue}>{todayMeetings.length}</Text>
              <Text style={dynamicStyles.statLabel}>Meetings Today</Text>
            </Card>
          </View>

          <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]} variant="elevated" onPress={() => navigation.navigate('Finance')}>
            <View style={styles.balanceHeader}>
              <Text style={dynamicStyles.balanceLabel}>Current Balance</Text>
              <Ionicons name="wallet" size={22} color={colors.textInverse} />
            </View>
            <Text style={dynamicStyles.balanceAmount}>
              {balance ? formatCurrency(balance.currentBalance) : '₹0'}
            </Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceMini}>
                <Ionicons name="arrow-up-circle" size={16} color={colors.success} />
                <Text style={[styles.balanceMiniText, { color: colors.success }]}>
                  {balance ? formatCurrency(balance.totalCredits) : '₹0'}
                </Text>
              </View>
              <View style={styles.balanceMini}>
                <Ionicons name="arrow-down-circle" size={16} color={isDark ? '#F87171' : '#EF4444'} />
                <Text style={[styles.balanceMiniText, { color: isDark ? '#F87171' : '#EF4444' }]}>
                  {balance ? formatCurrency(balance.totalDebits) : '₹0'}
                </Text>
              </View>
            </View>
          </Card>

          {todayMeetings.length > 0 && (
            <View style={styles.section}>
              <Text style={dynamicStyles.sectionTitle}>Today's Meetings</Text>
              {todayMeetings.slice(0, 3).map((meeting) => (
                <Card key={meeting._id} style={styles.meetingCard}>
                  <View style={styles.meetingRow}>
                    <View style={[styles.meetingDot, { backgroundColor: colors.primary }]} />
                    <View style={styles.meetingInfo}>
                      <Text style={dynamicStyles.meetingTitle}>{meeting.title}</Text>
                      <Text style={dynamicStyles.meetingTime}>
                        {formatTime(meeting.time)}
                        {meeting.location ? ` · ${meeting.location}` : ''}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {latestExpense && (
            <View style={styles.section}>
              <Text style={dynamicStyles.sectionTitle}>Latest Expense</Text>
              <Card style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
                    <Ionicons name="receipt" size={20} color={colors.error} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={dynamicStyles.expenseMerchant}>
                      {latestExpense.merchant || latestExpense.category}
                    </Text>
                    <Text style={dynamicStyles.expenseCategory}>{latestExpense.category}</Text>
                  </View>
                  <Text style={[styles.expenseAmount, { color: colors.error }]}>
                    -{formatCurrency(latestExpense.amount)}
                  </Text>
                </View>
              </Card>
            </View>
          )}

          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Health & Wellness</Text>
            <Card style={styles.healthCard} onPress={() => navigation.navigate('Health')}>
              <View style={styles.healthContent}>
                <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
                  <Ionicons name="fitness" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.healthText}>
                  <Text style={dynamicStyles.healthTitle}>Daily Health Score</Text>
                  <Text style={dynamicStyles.healthSubtitle}>
                    {dailyStats?.healthScore 
                      ? `Your score is ${dailyStats.healthScore}% today. Tap to see more.`
                      : 'Track your fitness, nutrition, and hydration.'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </Card>
          </View>
        </Animated.View>
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
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  balanceCard: {
    marginBottom: Spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  balanceMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  balanceMiniText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  meetingCard: {
    marginBottom: Spacing.xs,
  },
  meetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  meetingInfo: {
    flex: 1,
  },
  expenseCard: {},
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  expenseAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  healthCard: {
    borderStyle: 'dashed',
  },
  healthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  healthText: {
    flex: 1,
  },
});
