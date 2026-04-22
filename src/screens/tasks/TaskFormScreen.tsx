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
import {
  Colors,
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
        <Text style={styles.label}>Priority</Text>
        <View style={styles.optionRow}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.optionBtn,
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
                  styles.optionText,
                  priority === p.value && { color: p.color },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Due Date */}
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.dateBtnText}>
            {dueDate ? dueDate.toLocaleDateString() : 'Set due date'}
          </Text>
          {dueDate && (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
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
        <Text style={styles.label}>Recurring</Text>
        <View style={styles.optionRow}>
          {recurringOptions.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.optionBtn,
                recurring === r.value && styles.optionBtnActive,
              ]}
              onPress={() => setRecurring(r.value as any)}
            >
              <Text
                style={[
                  styles.optionText,
                  recurring === r.value && styles.optionTextActive,
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
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.xxs,
  },
  optionBtnActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  optionTextActive: {
    color: Colors.primary,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  dateBtnText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  saveBtn: {
    marginTop: Spacing.lg,
  },
});
