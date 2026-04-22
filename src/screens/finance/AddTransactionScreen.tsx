import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useFinanceStore } from '../../stores/financeStore';
import { CATEGORIES, Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../constants/theme';

export const AddTransactionScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [category, setCategory] = useState('Other');
  const [merchant, setMerchant] = useState('');
  const [loading, setLoading] = useState(false);

  const { createTransaction } = useFinanceStore();

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        amount: numAmount,
        type,
        category,
        merchant: merchant.trim(),
        source: 'manual',
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === 'debit' && styles.typeBtnDebit,
            ]}
            onPress={() => setType('debit')}
          >
            <Ionicons
              name="arrow-down-circle"
              size={20}
              color={type === 'debit' ? Colors.textInverse : Colors.debit}
            />
            <Text
              style={[
                styles.typeText,
                type === 'debit' && styles.typeTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === 'credit' && styles.typeBtnCredit,
            ]}
            onPress={() => setType('credit')}
          >
            <Ionicons
              name="arrow-up-circle"
              size={20}
              color={type === 'credit' ? Colors.textInverse : Colors.credit}
            />
            <Text
              style={[
                styles.typeText,
                type === 'credit' && styles.typeTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySign}>₹</Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            style={styles.amountInput}
            containerStyle={styles.amountInputContainer}
          />
        </View>

        {/* Merchant */}
        <Input
          label="Merchant / Description"
          value={merchant}
          onChangeText={setMerchant}
          placeholder="Where did you spend? (optional)"
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBtn,
                category === cat && styles.categoryBtnActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.categoryEmoji}>
                {cat === 'Food' ? '🍔' : cat === 'Transport' ? '🚗' : cat === 'Shopping' ? '🛒' :
                  cat === 'Bills' ? '📄' : cat === 'Entertainment' ? '🎬' : cat === 'Health' ? '💊' :
                  cat === 'Education' ? '📚' : cat === 'Salary' ? '💰' : cat === 'Investment' ? '📈' :
                  cat === 'Transfer' ? '🔄' : '📦'}
              </Text>
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Save Transaction"
          onPress={handleSave}
          loading={loading}
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
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
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeBtnDebit: {
    backgroundColor: Colors.debit,
    borderColor: Colors.debit,
  },
  typeBtnCredit: {
    backgroundColor: Colors.credit,
    borderColor: Colors.credit,
  },
  typeText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.textInverse,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  currencySign: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
  },
  amountInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  categoryTextActive: {
    color: Colors.primary,
  },
  saveBtn: {
    marginTop: Spacing.xs,
  },
});
