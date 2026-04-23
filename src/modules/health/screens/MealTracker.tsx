import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { MacroProgressBar } from '../components/MacroProgressBar';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { format } from 'date-fns';

const QUICK_ADD_FOODS = [
  { name: 'Roti', cal: 120, prot: 3, carbs: 22, fat: 3, unit: '1 pc' },
  { name: 'Rice', cal: 200, prot: 4, carbs: 45, fat: 0.5, unit: '1 bowl' },
  { name: 'Dal', cal: 150, prot: 9, carbs: 24, fat: 4, unit: '1 bowl' },
  { name: 'Milk', cal: 150, prot: 8, carbs: 12, fat: 8, unit: '1 glass' },
  { name: 'Egg', cal: 70, prot: 6, carbs: 0.6, fat: 5, unit: '1 boiled' },
  { name: 'Paneer', cal: 260, prot: 18, carbs: 4, fat: 20, unit: '100g' },
  { name: 'Banana', cal: 105, prot: 1.3, carbs: 27, fat: 0.4, unit: '1 medium' },
  { name: 'Chicken', cal: 240, prot: 31, carbs: 0, fat: 12, unit: '100g' },
];

export const MealTracker = ({ navigation }: any) => {
  const { dailyStats, targets, meals, addMeal } = useHealthStore();
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [customMeal, setCustomMeal] = useState({
    name: '',
    cal: '',
    prot: '',
    carbs: '',
    fat: '',
    type: 'breakfast',
  });

  const handleQuickAdd = async (food: any) => {
    try {
      await addMeal({
        mealType: 'snack',
        foodName: food.name,
        calories: food.cal,
        protein: food.prot,
        carbs: food.carbs,
        fat: food.fat,
        quantity: food.unit,
      });
      Alert.alert('Added', `${food.name} added to your logs.`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCustom = async () => {
    if (!customMeal.name || !customMeal.cal) {
      Alert.alert('Error', 'Please enter food name and calories.');
      return;
    }
    try {
      await addMeal({
        mealType: customMeal.type,
        foodName: customMeal.name,
        calories: Number(customMeal.cal),
        protein: Number(customMeal.prot) || 0,
        carbs: Number(customMeal.carbs) || 0,
        fat: Number(customMeal.fat) || 0,
        quantity: '1 serving',
      });
      setModalVisible(false);
      setCustomMeal({ name: '', cal: '', prot: '', carbs: '', fat: '', type: 'breakfast' });
    } catch (error) {
      console.error(error);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    sectionTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.md,
    },
    quickAddCard: {
      backgroundColor: colors.surface,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      marginRight: Spacing.md,
      alignItems: 'center',
      width: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickAddName: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    mealName: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.semibold,
      color: colors.textPrimary,
    },
    mealCal: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: BorderRadius.xxl,
      borderTopRightRadius: BorderRadius.xxl,
      padding: Spacing.lg,
      maxHeight: '80%',
    },
    inputLabel: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.semibold,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: FontSizes.md,
      color: colors.textPrimary,
    },
    inputGroup: {
      marginBottom: Spacing.lg,
    },
    typeButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    typeText: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Nutrition Tracker</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.progressCard}>
          <MacroProgressBar
            label="Calories"
            current={dailyStats?.caloriesConsumed || 0}
            target={targets?.dailyCaloriesTarget || 2000}
            unit="kcal"
            color="#F59E0B"
          />
          <View style={styles.macroRow}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <MacroProgressBar
                label="Protein"
                current={dailyStats?.proteinConsumed || 0}
                target={targets?.proteinTargetGrams || 150}
                unit="g"
                color="#EF4444"
              />
            </View>
            <View style={{ flex: 1 }}>
              <MacroProgressBar
                label="Carbs"
                current={0}
                target={targets?.carbsTargetGrams || 250}
                unit="g"
                color="#3B82F6"
              />
            </View>
          </View>
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Quick Add Indian Foods</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddScroll}>
          {QUICK_ADD_FOODS.map((food) => (
            <TouchableOpacity
              key={food.name}
              style={dynamicStyles.quickAddCard}
              onPress={() => handleQuickAdd(food)}
            >
              <Text style={styles.quickAddEmoji}>{getFoodEmoji(food.name)}</Text>
              <Text style={dynamicStyles.quickAddName}>{food.name}</Text>
              <Text style={styles.quickAddCal}>{food.cal} kcal</Text>
              <Text style={styles.quickAddUnit}>{food.unit}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={dynamicStyles.sectionTitle}>Today's Meals</Text>
        {meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No meals logged today.</Text>
          </View>
        ) : (
          meals.map((meal, index) => (
            <Card key={meal._id || index} style={styles.mealItem}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealType}>{meal.mealType.toUpperCase()}</Text>
                <Text style={dynamicStyles.mealName}>{meal.foodName}</Text>
                <Text style={styles.mealTime}>{format(new Date(meal.timestamp), 'hh:mm a')}</Text>
              </View>
              <View style={styles.mealStats}>
                <Text style={dynamicStyles.mealCal}>{meal.calories} kcal</Text>
                <Text style={styles.mealMacros}>P: {meal.protein}g | C: {meal.carbs}g</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Meal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Food Name</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="e.g. Oats with Almonds"
                  placeholderTextColor={colors.textTertiary}
                  value={customMeal.name}
                  onChangeText={(text) => setCustomMeal({ ...customMeal, name: text })}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[dynamicStyles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
                  <Text style={dynamicStyles.inputLabel}>Calories</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    placeholder="300"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={customMeal.cal}
                    onChangeText={(text) => setCustomMeal({ ...customMeal, cal: text })}
                  />
                </View>
                <View style={[dynamicStyles.inputGroup, { flex: 1 }]}>
                  <Text style={dynamicStyles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    placeholder="15"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={customMeal.prot}
                    onChangeText={(text) => setCustomMeal({ ...customMeal, prot: text })}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[dynamicStyles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
                  <Text style={dynamicStyles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    placeholder="40"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={customMeal.carbs}
                    onChangeText={(text) => setCustomMeal({ ...customMeal, carbs: text })}
                  />
                </View>
                <View style={[dynamicStyles.inputGroup, { flex: 1 }]}>
                  <Text style={dynamicStyles.inputLabel}>Fat (g)</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    placeholder="5"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={customMeal.fat}
                    onChangeText={(text) => setCustomMeal({ ...customMeal, fat: text })}
                  />
                </View>
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>Meal Type</Text>
                <View style={styles.typeContainer}>
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        dynamicStyles.typeButton,
                        customMeal.type === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setCustomMeal({ ...customMeal, type })}
                    >
                      <Text style={[
                        dynamicStyles.typeText,
                        customMeal.type === type && { color: '#FFFFFF', fontWeight: 'bold' }
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleAddCustom}>
                <Text style={styles.submitButtonText}>Log Meal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getFoodEmoji = (name: string) => {
  const emojis: any = {
    Roti: '🫓',
    Rice: '🍚',
    Dal: '🍲',
    Milk: '🥛',
    Egg: '🥚',
    Paneer: '🧀',
    Banana: '🍌',
    Chicken: '🍗',
  };
  return emojis[name] || '🍲';
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  progressCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  macroRow: {
    flexDirection: 'row',
  },
  quickAddScroll: {
    marginBottom: Spacing.xl,
  },
  quickAddEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  quickAddCal: {
    fontSize: FontSizes.xs,
    color: '#F59E0B',
    marginTop: 2,
  },
  quickAddUnit: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 2,
  },
  mealTime: {
    fontSize: FontSizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  mealStats: {
    alignItems: 'flex-end',
  },
  mealMacros: {
    fontSize: FontSizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: FontSizes.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  submitButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
});
