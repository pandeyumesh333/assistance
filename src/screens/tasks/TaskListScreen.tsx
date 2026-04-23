import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useTaskStore } from '../../stores/taskStore';
import { Task } from '../../types';
import { formatDate, getPriorityColor } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '../../constants/theme';

export const TaskListScreen = ({ navigation }: any) => {
  const { tasks, fetchTasks, toggleComplete, deleteTask, isLoading } = useTaskStore();
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { useFocusEffect } = require('@react-navigation/native');
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Task', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTask(id),
      },
    ]);
  };

  const dynamicStyles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: FontSizes.xxl,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    taskTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.medium,
      color: colors.textPrimary,
      marginBottom: Spacing.xxs,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textTertiary,
    },
    filterTab: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterText: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.medium,
      color: colors.textSecondary,
    },
    dueDate: {
      fontSize: FontSizes.xs,
      color: colors.textTertiary,
    },
  });

  const renderTask = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <TouchableOpacity
        style={styles.taskRow}
        onPress={() => navigation.navigate('TaskForm', { task: item })}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: colors.border },
            item.completed && { backgroundColor: colors.secondary, borderColor: colors.secondary },
          ]}
          onPress={() => toggleComplete(item._id, !item.completed)}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <View style={styles.taskInfo}>
          <Text
            style={[
              dynamicStyles.taskTitle,
              item.completed && dynamicStyles.taskTitleCompleted,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View style={styles.taskMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) + '18' },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(item.priority) },
                ]}
              >
                {item.priority}
              </Text>
            </View>
            {item.dueDate && (
              <Text style={dynamicStyles.dueDate}>{formatDate(item.dueDate)}</Text>
            )}
            {item.recurring !== 'none' && (
              <Ionicons name="repeat" size={14} color={colors.textTertiary} />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id, item.title)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={dynamicStyles.headerTitle}>Tasks</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('TaskForm')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              dynamicStyles.filterTab, 
              filter === f && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                dynamicStyles.filterText,
                filter === f && { color: '#FFFFFF' },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="No tasks yet"
            subtitle="Tap + to create your first task"
            actionLabel="Create Task"
            onAction={() => navigation.navigate('TaskForm')}
          />
        }
      />
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
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  taskCard: {
    marginBottom: Spacing.xs,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  taskInfo: {
    flex: 1,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    textTransform: 'capitalize',
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
});
