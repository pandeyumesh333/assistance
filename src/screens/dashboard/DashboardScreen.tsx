import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { DailyBrief } from '../../components/DailyBrief';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStore';
import { useMeetingStore } from '../../stores/meetingStore';
import { useFinanceStore } from '../../stores/financeStore';
import { syncRecentSMS } from '../../services/smsListener';
import { Platform } from 'react-native';
import { getGreeting, formatCurrency, formatTime } from '../../utils/helpers';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../constants/theme';

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { meetings, fetchMeetings } = useMeetingStore();
  const { balance, fetchBalance, fetchTransactions, transactions } = useFinanceStore();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const pendingTasks = (tasks || []).filter((t) => !t.completed);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayMeetings = (meetings || []).filter((m) => {
    const mt = new Date(m.time);
    return mt >= today && mt < tomorrow;
  });

  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayExpenses = (transactions || [])
    .filter((t) => {
      const ts = new Date(t.timestamp);
      return t.type === 'debit' && ts >= yesterdayStart && ts < today;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const latestExpense = (transactions || [])
    .filter((t) => t.type === 'debit')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchTasks(),
      fetchMeetings(),
      fetchBalance(),
      fetchTransactions(),
    ]);

    // Auto-sync SMS on Android
    if (Platform.OS === 'android') {
      syncRecentSMS();
    }
  }, [fetchTasks, fetchMeetings, fetchBalance, fetchTransactions]);

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [loadData, fadeAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greeting = getGreeting();
  const userName = user?.name || user?.email?.split('@')[0] || 'there';

  // Build AI-style summary
  const summaryParts: string[] = [];
  if (todayMeetings.length > 0) {
    summaryParts.push(`${todayMeetings.length} meeting${todayMeetings.length > 1 ? 's' : ''} today`);
  }
  if (pendingTasks.length > 0) {
    summaryParts.push(`${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}`);
  }
  if (yesterdayExpenses > 0) {
    summaryParts.push(`Spent ${formatCurrency(yesterdayExpenses)} yesterday`);
  }

  const expensesToday = (transactions || [])
    .filter((t) => {
      const ts = new Date(t.timestamp);
      return t.type === 'debit' && ts >= today && ts < tomorrow;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{userName} ✨</Text>
          </View>

          {/* AI Daily Brief (V2) */}
          <DailyBrief 
            userName={userName}
            pendingTasks={pendingTasks.length}
            meetingsCount={todayMeetings.length}
            expensesToday={expensesToday}
          />


          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            <Card
              style={styles.statCard}
              onPress={() => navigation.navigate('Tasks')}
            >
              <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight + '20' }]}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{pendingTasks.length}</Text>
              <Text style={styles.statLabel}>Pending Tasks</Text>
            </Card>

            <Card
              style={styles.statCard}
              onPress={() => navigation.navigate('Meetings')}
            >
              <View style={[styles.statIcon, { backgroundColor: Colors.secondaryLight + '20' }]}>
                <Ionicons name="calendar" size={22} color={Colors.secondary} />
              </View>
              <Text style={styles.statValue}>{todayMeetings.length}</Text>
              <Text style={styles.statLabel}>Meetings Today</Text>
            </Card>
          </View>

          {/* Balance Card */}
          <Card
            style={styles.balanceCard}
            variant="elevated"
            onPress={() => navigation.navigate('Finance')}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Ionicons name="wallet" size={22} color={Colors.primaryLight} />
            </View>
            <Text style={styles.balanceAmount}>
              {balance ? formatCurrency(balance.currentBalance) : '₹0'}
            </Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceMini}>
                <Ionicons name="arrow-up-circle" size={16} color={Colors.credit} />
                <Text style={[styles.balanceMiniText, { color: Colors.credit }]}>
                  {balance ? formatCurrency(balance.totalCredits) : '₹0'}
                </Text>
              </View>
              <View style={styles.balanceMini}>
                <Ionicons name="arrow-down-circle" size={16} color={Colors.debit} />
                <Text style={[styles.balanceMiniText, { color: Colors.debit }]}>
                  {balance ? formatCurrency(balance.totalDebits) : '₹0'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Today's Meetings */}
          {todayMeetings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Meetings</Text>
              {todayMeetings.slice(0, 3).map((meeting) => (
                <Card key={meeting._id} style={styles.meetingCard}>
                  <View style={styles.meetingRow}>
                    <View style={styles.meetingDot} />
                    <View style={styles.meetingInfo}>
                      <Text style={styles.meetingTitle}>{meeting.title}</Text>
                      <Text style={styles.meetingTime}>
                        {formatTime(meeting.time)}
                        {meeting.location ? ` · ${meeting.location}` : ''}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Latest Expense */}
          {latestExpense && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Latest Expense</Text>
              <Card style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={[styles.statIcon, { backgroundColor: Colors.errorLight }]}>
                    <Ionicons name="receipt" size={20} color={Colors.debit} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseMerchant}>
                      {latestExpense.merchant || latestExpense.category}
                    </Text>
                    <Text style={styles.expenseCategory}>{latestExpense.category}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>
                    -{formatCurrency(latestExpense.amount)}
                  </Text>
                </View>
              </Card>
            </View>
          )}

          {/* Health Placeholder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health & Wellness</Text>
            <Card style={styles.healthCard} variant="outlined">
              <View style={styles.healthContent}>
                <Ionicons name="fitness" size={28} color={Colors.textTertiary} />
                <View style={styles.healthText}>
                  <Text style={styles.healthTitle}>Coming Soon</Text>
                  <Text style={styles.healthSubtitle}>
                    HealthKit & Google Fit integration
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </Animated.View>
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
  greetingSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  userName: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },
  summaryCard: {
    backgroundColor: Colors.primary + '08',
    borderWidth: 1,
    borderColor: Colors.primary + '15',
    marginBottom: Spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  summaryTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  summaryItem: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    paddingLeft: Spacing.xxs,
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
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xxs,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.primaryLight,
    fontWeight: FontWeights.medium,
  },
  balanceAmount: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
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
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
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
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  meetingTime: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
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
  expenseMerchant: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  expenseCategory: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.debit,
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
  healthTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  healthSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
