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
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
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
  const { user, restoreSession } = useAuthStore();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      restoreSession(); // Refresh user stats
    }, [fetchTasks, restoreSession])
  );

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSuccessSound = async () => {
    try {
      // Note: Make sure the file exists or handle error
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' } // Placeholder remote sound
      );
      setSound(sound);
      await sound.playAsync();
    } catch (e) {
      // Ignore if sound fails to load
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), restoreSession()]);
    setRefreshing(false);
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await toggleComplete(id, completed);
    if (completed) {
      await playSuccessSound();
      // Refresh user stats to show XP/Level update
      await restoreSession();
    }
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

  const xpProgress = user ? (user.xp % 100) / 100 : 0;
  const streak = user?.streak || 0;

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
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
      gap: 2,
    },
    streakText: {
      color: '#D97706',
      fontSize: FontSizes.xs,
      fontWeight: FontWeights.bold,
    },
    levelProgress: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginTop: Spacing.xs,
      overflow: 'hidden',
      flex: 1,
    },
    levelBar: {
      height: '100%',
      backgroundColor: colors.primary,
      width: `${xpProgress * 100}%`,
    },
    levelText: {
      fontSize: FontSizes.xs,
      fontWeight: FontWeights.bold,
      color: colors.primary,
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
          onPress={() => handleToggleComplete(item._id, !item.completed)}
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
                +{item.xpReward || 10} XP
              </Text>
            </View>
            {item.dueDate && (
              <Text style={dynamicStyles.dueDate}>{formatDate(item.dueDate)}</Text>
            )}
            {item.audioNoteUrl && (
              <Ionicons name="mic" size={14} color={colors.primary} />
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
        <View style={{ flex: 1 }}>
          <Text style={dynamicStyles.headerTitle}>Tasks</Text>
          {user && (
            <View style={dynamicStyles.statsRow}>
              <Text style={dynamicStyles.levelText}>Lvl {user.level}</Text>
              <View style={dynamicStyles.levelProgress}>
                <View style={dynamicStyles.levelBar} />
              </View>
              {streak > 0 && (
                <View style={dynamicStyles.streakBadge}>
                  <Ionicons name="flame" size={12} color="#D97706" />
                  <Text style={dynamicStyles.streakText}>{streak}</Text>
                </View>
              )}
            </View>
          )}
        </View>
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
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
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
    fontWeight: FontWeights.bold,
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
});
