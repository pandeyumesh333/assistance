import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { format } from 'date-fns';

const ICON_OPTIONS = ['walk', 'water', 'moon', 'leaf', 'body', 'restaurant', 'bicycle', 'fitness', 'heart', 'sunny'];

export const HabitTracker = ({ navigation }: any) => {
  const { habits, profile, updateHabits, updateHabitsList } = useHealthStore();
  const { colors, isDark } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newHabitLabel, setNewHabitLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('walk');
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const habitsList = profile?.habitsList || [
    { id: 'walkCompleted', label: '10k Steps Walked', icon: 'walk' },
    { id: 'hydrationCompleted', label: 'Stayed Hydrated', icon: 'water' },
    { id: 'sleepBeforeMidnight', label: 'Slept before 12 AM', icon: 'moon' },
    { id: 'meditationCompleted', label: 'Daily Meditation', icon: 'leaf' },
    { id: 'stretchingCompleted', label: 'Daily Stretching', icon: 'body' },
  ];

  const toggleHabit = async (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newHabits = { ...habits, [habitId]: !habits?.[habitId], date: today };
    try {
      await updateHabits(newHabits);
    } catch (error) {
      console.error(error);
    }
  };

  const addHabit = async () => {
    if (!newHabitLabel.trim()) return;
    
    const newHabit = {
      id: `custom_${Date.now()}`,
      label: newHabitLabel.trim(),
      icon: selectedIcon,
    };

    const updatedList = [...habitsList, newHabit];
    await updateHabitsList(updatedList);
    setNewHabitLabel('');
    setModalVisible(false);
  };

  const confirmDelete = async () => {
    if (habitToDelete) {
      const updatedList = habitsList.filter((h: any) => h.id !== habitToDelete);
      await updateHabitsList(updatedList);
      setHabitToDelete(null);
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
    habitLabel: {
      flex: 1,
      marginLeft: Spacing.md,
      fontSize: FontSizes.md,
      fontWeight: FontWeights.medium,
      color: colors.textPrimary,
    },
    completedHabitLabel: {
      color: colors.textTertiary,
      textDecorationLine: 'line-through',
    },
    chartTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.xl,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: Spacing.xl,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      ... (isDark ? { borderWidth: 1, borderColor: colors.border } : {}),
    },
    modalTitle: {
      fontSize: FontSizes.xl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.lg,
    },
    input: {
      backgroundColor: colors.background,
      color: colors.textPrimary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: FontSizes.md,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    iconSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    iconOption: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedIconOption: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Habit Tracker</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.streakCard, { backgroundColor: isDark ? '#F59E0B20' : '#F59E0B10', borderColor: '#F59E0B30' }]}>
          <Ionicons name="flame" size={48} color="#F59E0B" />
          <View style={styles.streakInfo}>
            <Text style={styles.streakValue}>5 Day Streak!</Text>
            <Text style={styles.streakSubtitle}>Keep it up, you're on fire!</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Today's Habits</Text>
        </View>

        {habitsList.map((habit: any) => {
          const isCompleted = habits ? habits[habit.id] : false;
          return (
            <View key={habit.id} style={styles.habitRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.7}
                onPress={() => toggleHabit(habit.id)}
                onLongPress={() => setHabitToDelete(habit.id)}
              >
                <Card style={[styles.habitCard, isCompleted && { borderColor: colors.success + '30', backgroundColor: colors.success + '05' }]}>
                  <View style={[styles.iconBox, { backgroundColor: isCompleted ? colors.success + '20' : colors.primary + '10' }]}>
                    <Ionicons name={habit.icon as any} size={24} color={isCompleted ? colors.success : colors.primary} />
                  </View>
                  <Text style={[dynamicStyles.habitLabel, isCompleted && dynamicStyles.completedHabitLabel]}>
                    {habit.label}
                  </Text>
                  <View style={[styles.checkbox, { borderColor: colors.primary + '30' }, isCompleted && { backgroundColor: colors.success, borderColor: colors.success }]}>
                    {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                </Card>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={[styles.chartPlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={dynamicStyles.chartTitle}>Weekly Progress</Text>
          <View style={styles.barChart}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View key={i} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height: (i * 12) + 20, backgroundColor: i === 7 ? colors.primary : colors.primary + '30' }]} />
                <Text style={[styles.chartDay, { color: colors.textTertiary }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i-1]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Add New Habit</Text>
            
            <TextInput
              style={dynamicStyles.input}
              placeholder="e.g. Morning Yoga"
              placeholderTextColor={colors.textTertiary}
              value={newHabitLabel}
              onChangeText={setNewHabitLabel}
              autoFocus
            />

            <Text style={[dynamicStyles.sectionTitle, { fontSize: FontSizes.sm, marginBottom: Spacing.sm }]}>Select Icon</Text>
            <View style={dynamicStyles.iconSelector}>
              {ICON_OPTIONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[dynamicStyles.iconOption, selectedIcon === icon && dynamicStyles.selectedIconOption]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons name={icon as any} size={20} color={selectedIcon === icon ? colors.primary : colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[dynamicStyles.modalBtn, { backgroundColor: colors.background }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[dynamicStyles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={addHabit}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Add Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!habitToDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setHabitToDelete(null)}
      >
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalContent}>
            <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.error + '20', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }}>
                <Ionicons name="trash" size={30} color={colors.error} />
              </View>
              <Text style={dynamicStyles.modalTitle}>Remove Habit?</Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: FontSizes.md }}>
                Are you sure you want to remove this habit from your daily checklist?
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[dynamicStyles.modalBtn, { backgroundColor: colors.background }]}
                onPress={() => setHabitToDelete(null)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[dynamicStyles.modalBtn, { backgroundColor: colors.error }]}
                onPress={confirmDelete}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContent: {
    padding: Spacing.lg,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  streakInfo: {
    marginLeft: Spacing.lg,
  },
  streakValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: '#D97706',
  },
  streakSubtitle: {
    fontSize: FontSizes.sm,
    color: '#D97706',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    padding: Spacing.sm,
  },
  chartPlaceholder: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: Spacing.lg,
  },
  chartColumn: {
    alignItems: 'center',
    width: 30,
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
  },
  chartDay: {
    fontSize: 10,
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
