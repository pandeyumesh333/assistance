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
} from 'react-native';
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

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTransactions(), fetchBalance()]);
    setRefreshing(false);
  };

  const handleSetOpeningBalance = () => {
    setOpeningBalanceInput(balance?.openingBalance?.toString() || '0');
    setIsModalVisible(true);
  };

  const saveOpeningBalance = async () => {
    const amount = parseFloat(openingBalanceInput || '0');
    if (!isNaN(amount)) {
      await updateOpeningBalance(amount);
      setIsModalVisible(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.txCard}>
      <View style={styles.txRow}>
        <View
          style={[
            styles.txIcon,
            {
              backgroundColor:
                item.type === 'credit' ? Colors.successLight : Colors.errorLight,
            },
          ]}
        >
          <Text style={styles.txIconEmoji}>
            {CATEGORY_ICONS[item.category] || '📦'}
          </Text>
        </View>

        <View style={styles.txInfo}>
          <Text style={styles.txMerchant} numberOfLines={1}>
            {item.merchant || item.category}
          </Text>
          <View style={styles.txMeta}>
            <Text style={styles.txCategory}>{item.category}</Text>
            {item.source === 'sms' && (
              <View style={styles.smsBadge}>
                <Text style={styles.smsBadgeText}>SMS</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.txRight}>
          <Text
            style={[
              styles.txAmount,
              { color: item.type === 'credit' ? Colors.credit : Colors.debit },
            ]}
          >
            {item.type === 'credit' ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
          <Text style={styles.txDate}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance</Text>
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
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        onEndReached={() => fetchMoreTransactions()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <RefreshControl refreshing={true} tintColor={Colors.primary} />
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            <Card style={styles.balanceCard} variant="elevated" onPress={handleSetOpeningBalance}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                {balance ? formatCurrency(balance.currentBalance) : '₹0'}
              </Text>
              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <Ionicons
                    name="arrow-up-circle"
                    size={18}
                    color={Colors.credit}
                  />
                  <View>
                    <Text style={styles.balanceItemLabel}>Income</Text>
                    <Text style={[styles.balanceItemValue, { color: Colors.credit }]}>
                      {balance ? formatCurrency(balance.totalCredits) : '₹0'}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.balanceItem}>
                  <Ionicons
                    name="arrow-down-circle"
                    size={18}
                    color={Colors.debit}
                  />
                  <View>
                    <Text style={styles.balanceItemLabel}>Expenses</Text>
                    <Text style={[styles.balanceItemValue, { color: Colors.debit }]}>
                      {balance ? formatCurrency(balance.totalDebits) : '₹0'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* SMS Notice for Android */}
            {isSMSAvailable() && (
              <Card style={styles.smsCard} variant="outlined">
                <View style={styles.smsRow}>
                  <Ionicons name="chatbox-ellipses" size={20} color={Colors.info} />
                  <View style={styles.smsText}>
                    <Text style={styles.smsTitle}>SMS Auto-Detection Active</Text>
                    <Text style={styles.smsSubtitle}>
                      Bank transactions are automatically parsed from SMS
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* iOS Manual Entry Notice */}
            {Platform.OS === 'ios' && (
              <Card style={styles.smsCard} variant="outlined">
                <View style={styles.smsRow}>
                  <Ionicons name="create-outline" size={20} color={Colors.info} />
                  <View style={styles.smsText}>
                    <Text style={styles.smsTitle}>Manual Entry Mode</Text>
                    <Text style={styles.smsSubtitle}>
                      Add transactions manually using the + button
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No transactions yet"
            subtitle="Start tracking your expenses"
            actionLabel="Add Transaction"
            onAction={() => navigation.navigate('AddTransaction')}
          />
        }
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Card style={styles.modalContent} variant="elevated">
            <Text style={styles.modalTitle}>Set Opening Balance</Text>
            <Text style={styles.modalSubtitle}>
              Enter your current total balance across all accounts to start tracking.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={openingBalanceInput}
              onChangeText={setOpeningBalanceInput}
              keyboardType="numeric"
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
                onPress={saveOpeningBalance}
              >
                <Text style={styles.saveButtonText}>Save Balance</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
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
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  balanceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.primaryLight,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xxs,
  },
  balanceAmount: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.md,
  },
  balanceDetails: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceItemLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceItemValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: Spacing.sm,
  },
  smsCard: {
    marginBottom: Spacing.md,
  },
  smsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  smsText: {
    flex: 1,
  },
  smsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  smsSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  txCard: {
    marginBottom: Spacing.xs,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  txIconEmoji: {
    fontSize: 18,
  },
  txInfo: {
    flex: 1,
  },
  txMerchant: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  txCategory: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  smsBadge: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.xxs,
    paddingVertical: 1,
    borderRadius: 4,
  },
  smsBadgeText: {
    fontSize: 9,
    fontWeight: FontWeights.semibold,
    color: Colors.info,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  txDate: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.borderLight,
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
  footerLoader: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
});
