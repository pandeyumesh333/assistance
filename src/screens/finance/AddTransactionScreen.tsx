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
import { useTheme } from '../../hooks/useTheme';
import { CATEGORIES, FontSizes, FontWeights, Spacing, BorderRadius } from '../../constants/theme';

export const AddTransactionScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [category, setCategory] = useState('Other');
  const [merchant, setMerchant] = useState('');
  const [loading, setLoading] = useState(false);

  const { createTransaction } = useFinanceStore();
  const { colors, isDark } = useTheme();

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

  const dynamicStyles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.semibold,
      color: colors.textPrimary,
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    typeText: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semibold,
      color: colors.textSecondary,
    },
    currencySign: {
      fontSize: FontSizes.xxxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginRight: Spacing.xs,
    },
    amountInput: {
      fontSize: FontSizes.xxxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    label: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.medium,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    categoryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xxs,
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryText: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
      fontWeight: FontWeights.medium,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[
              dynamicStyles.typeBtn,
              type === 'debit' && { backgroundColor: isDark ? '#EF4444' : '#EF4444', borderColor: '#EF4444' },
            ]}
            onPress={() => setType('debit')}
          >
            <Ionicons
              name="arrow-down-circle"
              size={20}
              color={type === 'debit' ? '#FFFFFF' : '#EF4444'}
            />
            <Text
              style={[
                dynamicStyles.typeText,
                type === 'debit' && { color: '#FFFFFF' },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.typeBtn,
              type === 'credit' && { backgroundColor: colors.success, borderColor: colors.success },
            ]}
            onPress={() => setType('credit')}
          >
            <Ionicons
              name="arrow-up-circle"
              size={20}
              color={type === 'credit' ? '#FFFFFF' : colors.success}
            />
            <Text
              style={[
                dynamicStyles.typeText,
                type === 'credit' && { color: '#FFFFFF' },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={dynamicStyles.currencySign}>₹</Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            style={dynamicStyles.amountInput}
            containerStyle={styles.amountInputContainer}
            placeholderTextColor={colors.textTertiary}
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
        <Text style={dynamicStyles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                dynamicStyles.categoryBtn,
                category === cat && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
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
                  dynamicStyles.categoryText,
                  category === cat && { color: colors.primary },
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  amountInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  saveBtn: {
    marginTop: Spacing.xs,
  },
});
