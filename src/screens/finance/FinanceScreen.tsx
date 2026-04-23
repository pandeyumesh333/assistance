import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  LineChart,
  PieChart,
} from "react-native-chart-kit";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useFinanceStore } from '../../stores/financeStore';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { isSMSAvailable } from '../../utils/smsParser';
import {
  Colors,
  CATEGORY_ICONS,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../constants/theme';

const screenWidth = Dimensions.get("window").width;

export const FinanceScreen = ({ navigation }: any) => {
  const { 
    transactions, 
    balance, 
    fetchTransactions, 
    fetchMoreTransactions, 
    fetchBalance, 
    updateOpeningBalance, 
    isLoading,
    isLoadingMore,
    hasMore 
  } = useFinanceStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openingBalanceInput, setOpeningBalanceInput] = useState('');

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => Colors.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  // Helper to get data for Pie Chart (Expenses only)
  const getPieChartData = (txs: Transaction[]) => {
    const expenses = txs.filter(t => t.type === 'debit');
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const colors = [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'
    ];

    return Object.keys(categoryTotals).map((cat, index) => ({
      name: cat,
      amount: categoryTotals[cat],
      color: colors[index % colors.length],
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  };

  // Helper to get data for Line Chart (Spending trend)
  const getLineChartData = (txs: Transaction[]) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailySpending = last7Days.map(date => {
      return txs
        .filter(t => t.type === 'debit' && t.timestamp.startsWith(date))
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      labels: last7Days.map(d => d.split('-')[2]), // Just the day
      datasets: [{ data: dailySpending }]
    };
  };

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTransactions(), fetchBalance()]);
    setRefreshing(false);
  };

  const handleUpdateBalance = async () => {
    const amount = parseFloat(openingBalanceInput);
    if (!isNaN(amount)) {
      await updateOpeningBalance(amount);
      setIsModalVisible(false);
      setOpeningBalanceInput('');
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.txCard}>
      <View style={styles.txRow}>
        <View style={[styles.txIconContainer, { backgroundColor: item.type === 'debit' ? Colors.errorLight : Colors.successLight }]}>
          <Text style={styles.txIcon}>{CATEGORY_ICONS[item.category] || '📦'}</Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txMerchant}>{item.merchant || 'Unknown'}</Text>
          <Text style={styles.txCategory}>{item.category} • {formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.txAmountContainer}>
          <Text style={[styles.txAmount, { color: item.type === 'debit' ? Colors.debit : Colors.credit }]}>
            {item.type === 'debit' ? '-' : '+'}{formatCurrency(item.amount)}
          </Text>
          <Text style={styles.txSource}>{item.source}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Finance</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Ionicons name="add" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onEndReached={hasMore ? fetchMoreTransactions : null}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            <Card style={styles.balanceCard} variant="elevated">
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <Ionicons name="settings-outline" size={20} color={Colors.textInverse} />
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            </Card>

            {/* Charts Section (V2) */}
            {transactions.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartsContainer}>
                {/* Pie Chart: Expenses by Category */}
                <Card style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Expense Breakdown</Text>
                  <PieChart
                    data={getPieChartData(transactions)}
                    width={screenWidth - Spacing.lg * 4}
                    height={200}
                    chartConfig={chartConfig}
                    accessor={"amount"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute
                  />
                </Card>

                {/* Line Chart: Daily Trend */}
                <Card style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Spending Trend (Last 7 Days)</Text>
                  <LineChart
                    data={getLineChartData(transactions)}
                    width={screenWidth - Spacing.lg * 4}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.lineChart}
                  />
                </Card>
              </ScrollView>
            )}

            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions found"
              description="Your transactions will appear here after they are detected or added."
            />
          ) : null
        }
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Update Balance</Text>
            <Text style={styles.modalSubtitle}>Set your current opening balance</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount (e.g. 5000)"
              keyboardType="numeric"
              value={openingBalanceInput}
              onChangeText={setOpeningBalanceInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateBalance}
              >
                <Text style={styles.saveButtonText}>Save Balance</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.massive,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: FontWeights.medium,
  },
  balanceAmount: {
    fontSize: FontSizes.xxxl,
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  chartsContainer: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  chartCard: {
    width: screenWidth - Spacing.lg * 2,
    marginRight: Spacing.md,
    padding: Spacing.md,
  },
  chartTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  txCard: {
    marginBottom: Spacing.xs,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  txIcon: {
    fontSize: 24,
  },
  txInfo: {
    flex: 1,
  },
  txMerchant: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  txCategory: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  txSource: {
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: FontWeights.semibold,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.semibold,
  },
});
