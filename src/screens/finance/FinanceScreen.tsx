import React, { useEffect, useState, useCallback } from 'react';
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
import { useTheme } from '../../hooks/useTheme';
import {
  CATEGORY_ICONS,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
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
    hasMore 
  } = useFinanceStore();
  const { colors, isDark } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openingBalanceInput, setOpeningBalanceInput] = useState('');

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => isDark ? `rgba(129, 140, 248, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => colors.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    }
  };

  const getPieChartData = (txs: Transaction[]) => {
    const expenses = txs.filter(t => t.type === 'debit');
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const pieColors = isDark 
      ? ['#818CF8', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA', '#F472B6', '#818CF8', '#2DD4BF', '#FB923C']
      : ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

    return Object.keys(categoryTotals).map((cat, index) => ({
      name: cat,
      amount: categoryTotals[cat],
      color: pieColors[index % pieColors.length],
      legendFontColor: colors.textSecondary,
      legendFontSize: 11
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  };

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
      labels: last7Days.map(d => d.split('-')[2]),
      datasets: [{ data: dailySpending }]
    };
  };

  const { useFocusEffect } = require('@react-navigation/native');
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
      fetchBalance();
    }, [fetchTransactions, fetchBalance])
  );

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

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: FontSizes.xxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    balanceAmount: {
      fontSize: FontSizes.xxxl,
      color: '#FFFFFF',
      fontWeight: FontWeights.bold,
    },
    sectionTitle: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.sm,
      marginTop: Spacing.xs,
    },
    chartTitle: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.semibold,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    txMerchant: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semibold,
      color: colors.textPrimary,
    },
    txCategory: {
      fontSize: FontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: FontSizes.xl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.xxs,
    },
    modalSubtitle: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
      marginBottom: Spacing.lg,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: FontSizes.md,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.xl,
    },
  });

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.txCard}>
      <View style={styles.txRow}>
        <View style={[styles.txIconContainer, { backgroundColor: item.type === 'debit' ? colors.error + '20' : colors.success + '20' }]}>
          <Text style={styles.txIcon}>{CATEGORY_ICONS[item.category] || '📦'}</Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={dynamicStyles.txMerchant}>{item.merchant || 'Unknown'}</Text>
          <Text style={dynamicStyles.txCategory}>{item.category} • {formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.txAmountContainer}>
          <Text style={[styles.txAmount, { color: item.type === 'debit' ? (isDark ? '#F87171' : '#EF4444') : colors.success }]}>
            {item.type === 'debit' ? '-' : '+'}{formatCurrency(item.amount)}
          </Text>
          <Text style={[styles.txSource, { color: colors.textTertiary }]}>{item.source}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={dynamicStyles.title}>Finance</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <>
            <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]} variant="elevated">
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.balanceAmount}>{formatCurrency(balance?.currentBalance || 0)}</Text>
            </Card>

            {transactions.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartsContainer}>
                <Card style={styles.chartCard}>
                  <Text style={dynamicStyles.chartTitle}>Expense Breakdown</Text>
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

                <Card style={styles.chartCard}>
                  <Text style={dynamicStyles.chartTitle}>Spending Trend (Last 7 Days)</Text>
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

            <Text style={dynamicStyles.sectionTitle}>Recent Transactions</Text>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions found"
              subtitle="Your transactions will appear here after they are detected or added."
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
        <View style={dynamicStyles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={dynamicStyles.modalContent}
          >
            <Text style={dynamicStyles.modalTitle}>Update Balance</Text>
            <Text style={dynamicStyles.modalSubtitle}>Set your current opening balance</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter amount (e.g. 5000)"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={openingBalanceInput}
              onChangeText={setOpeningBalanceInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateBalance}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Save Balance</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.massive,
  },
  balanceCard: {
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
  chartsContainer: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  chartCard: {
    width: screenWidth - Spacing.lg * 2,
    marginRight: Spacing.md,
    padding: Spacing.md,
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
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  txSource: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
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
});
