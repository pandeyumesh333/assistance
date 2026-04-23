import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTaskStore } from '../../stores/taskStore';
import { Task } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '../../constants/theme';

interface Props {
  navigation: any;
  route: { params?: { task?: Task } };
}

export const TaskFormScreen = ({ navigation, route }: Props) => {
  const existingTask = route.params?.task;
  const isEditing = !!existingTask;

  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    existingTask?.priority || 'medium'
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : null
  );
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(
    existingTask?.recurring || 'none'
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { createTask, updateTask } = useTaskStore();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate?.toISOString() || undefined,
        recurring,
      };

      if (isEditing && existingTask) {
        await updateTask(existingTask._id, taskData);
      } else {
        await createTask(taskData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const priorities: Array<{ value: 'low' | 'medium' | 'high'; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: '#22C55E' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
  ];

  const recurringOptions: Array<{ value: string; label: string }> = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

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
    label: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.medium,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
      marginTop: Spacing.xs,
    },
    optionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: Spacing.xxs,
    },
    optionText: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
      fontWeight: FontWeights.medium,
    },
    dateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: Spacing.xs,
      marginBottom: Spacing.md,
    },
    dateBtnText: {
      flex: 1,
      fontSize: FontSizes.md,
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add details (optional)"
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {/* Priority */}
        <Text style={dynamicStyles.label}>Priority</Text>
        <View style={styles.optionRow}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                dynamicStyles.optionBtn,
                priority === p.value && {
                  backgroundColor: p.color + '18',
                  borderColor: p.color,
                },
              ]}
              onPress={() => setPriority(p.value)}
            >
              <View
                style={[styles.optionDot, { backgroundColor: p.color }]}
              />
              <Text
                style={[
                  dynamicStyles.optionText,
                  priority === p.value && { color: p.color },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Due Date */}
        <Text style={dynamicStyles.label}>Due Date</Text>
        <TouchableOpacity
          style={dynamicStyles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={dynamicStyles.dateBtnText}>
            {dueDate ? dueDate.toLocaleString() : 'Set due date'}
          </Text>
          {dueDate && (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setDueDate(date);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Recurring */}
        <Text style={dynamicStyles.label}>Recurring</Text>
        <View style={styles.optionRow}>
          {recurringOptions.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                dynamicStyles.optionBtn,
                recurring === r.value && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
              ]}
              onPress={() => setRecurring(r.value as any)}
            >
              <Text
                style={[
                  dynamicStyles.optionText,
                  recurring === r.value && { color: colors.primary },
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isEditing ? 'Update Task' : 'Create Task'}
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
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  saveBtn: {
    marginTop: Spacing.lg,
  },
});
