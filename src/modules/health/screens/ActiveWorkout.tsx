import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '../../../constants/theme';
import { Card } from '../../../components/Card';

// --- Sub-component for individual sets to fix flicking ---
const SetRow = memo(({ set, setIdx, exIdx, updateSet, toggleSetType, removeSet, prevSet }: any) => {
  const [localWeight, setLocalWeight] = useState(set.weight.toString());
  const [localReps, setLocalReps] = useState(set.reps.toString());

  // Update local state when prop changes (e.g. from store)
  useEffect(() => {
    setLocalWeight(set.weight.toString());
    setLocalReps(set.reps.toString());
  }, [set.weight, set.reps]);

  const handleBlur = () => {
    updateSet(exIdx, setIdx, { 
      weight: parseFloat(localWeight) || 0, 
      reps: parseInt(localReps) || 0 
    });
  };

  return (
    <View 
      style={[
        styles.setRow, 
        set.completed && styles.completedSetRow,
        set.type === 'warmup' && styles.warmupSetRow
      ]}
    >
      <TouchableOpacity 
        style={styles.setNumberBtn}
        onPress={() => toggleSetType(exIdx, setIdx)}
        onLongPress={() => {
          Alert.alert('Remove Set', 'Are you sure you want to remove this set?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeSet(exIdx, setIdx) },
          ]);
        }}
      >
        <Text style={[styles.setNumberText, set.type !== 'normal' && styles.specialSetText]}>
          {set.type === 'warmup' ? 'W' : set.type === 'drop' ? 'D' : set.type === 'failure' ? 'F' : setIdx + 1}
        </Text>
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.prevText}>
          {prevSet ? `${prevSet.weight} x ${prevSet.reps}` : '-'}
        </Text>
      </View>

      <TextInput
        style={[styles.setInput, set.completed && styles.completedInput]}
        keyboardType="numeric"
        value={localWeight === '0' ? '' : localWeight}
        onChangeText={setLocalWeight}
        onBlur={handleBlur}
        placeholder="0"
        placeholderTextColor={Colors.textTertiary}
      />

      <TextInput
        style={[styles.setInput, set.completed && styles.completedInput]}
        keyboardType="numeric"
        value={localReps === '0' ? '' : localReps}
        onChangeText={setLocalReps}
        onBlur={handleBlur}
        placeholder="0"
        placeholderTextColor={Colors.textTertiary}
      />

      <TouchableOpacity 
        style={[styles.checkBtn, set.completed && styles.checkBtnActive]}
        onPress={() => {
          const newCompleted = !set.completed;
          // Sync local values before marking as completed
          updateSet(exIdx, setIdx, { 
            weight: parseFloat(localWeight) || 0, 
            reps: parseInt(localReps) || 0,
            completed: newCompleted 
          });
        }}
      >
        <Ionicons name="checkmark" size={20} color={set.completed ? Colors.textInverse : Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
});

export const ActiveWorkout = ({ navigation, route }: any) => {
  const { 
    activeWorkout, 
    previousWorkout,
    updateActiveWorkout, 
    finishWorkout, 
    fetchPreviousWorkout,
  } = useHealthStore();
  const [seconds, setSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);

  useEffect(() => {
    fetchPreviousWorkout();
  }, []);

  // Workout Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeWorkout) {
        const start = new Date(activeWorkout.startTime).getTime();
        const now = new Date().getTime();
        setSeconds(Math.floor((now - start) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest Timer
  useEffect(() => {
    let interval: any;
    if (restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restSeconds]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const calculateTotalVolume = () => {
    if (!activeWorkout) return 0;
    return activeWorkout.exercises.reduce((total: number, ex: any) => {
      return total + ex.sets.reduce((exTotal: number, set: any) => {
        return exTotal + (set.completed ? (set.weight * set.reps) : 0);
      }, 0);
    }, 0);
  };

  const calculateExerciseVolume = (exIdx: number) => {
    return activeWorkout.exercises[exIdx].sets.reduce((total: number, set: any) => {
      return total + (set.completed ? (set.weight * set.reps) : 0);
    }, 0);
  };

  const isExerciseComplete = (exIdx: number) => {
    const sets = activeWorkout.exercises[exIdx].sets;
    return sets.length > 0 && sets.every((s: any) => s.completed);
  };

  const handleFinish = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Finish', onPress: async () => {
          await finishWorkout();
          navigation.navigate('HealthDashboard');
        }},
      ]
    );
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...activeWorkout.exercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    
    updatedExercises[exerciseIndex].sets.push({
      type: 'normal',
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
      completed: false,
    });
    
    updateActiveWorkout({ exercises: updatedExercises });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, data: any) => {
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      ...data,
    };
    
    // Auto-trigger rest timer if a set was just completed
    if (data.completed === true) {
      setRestSeconds(90);
    }
    
    updateActiveWorkout({ exercises: updatedExercises });
  };

  const toggleSetType = (exerciseIndex: number, setIndex: number) => {
    const types: ('warmup' | 'normal' | 'drop' | 'failure')[] = ['normal', 'warmup', 'drop', 'failure'];
    const currentType = activeWorkout.exercises[exerciseIndex].sets[setIndex].type;
    const nextIndex = (types.indexOf(currentType) + 1) % types.length;
    
    updateSet(exerciseIndex, setIndex, { type: types[nextIndex] });
  };

  const removeExercise = (index: number) => {
    const updatedExercises = activeWorkout.exercises.filter((_: any, i: number) => i !== index);
    updateActiveWorkout({ exercises: updatedExercises });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_: any, i: number) => i !== setIndex);
    updateActiveWorkout({ exercises: updatedExercises });
  };

  if (!activeWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>No active workout found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.workoutTitle}>{activeWorkout.title}</Text>
              <Text style={styles.totalVolumeText}>{calculateTotalVolume()} kg</Text>
            </View>
            <View style={styles.timerRow}>
              <Text style={styles.timer}>{formatTime(seconds)}</Text>
              {restSeconds > 0 && (
                <View style={styles.restBadge}>
                  <Ionicons name="timer-outline" size={14} color={Colors.secondary} />
                  <Text style={styles.restText}>Rest: {formatTime(restSeconds)}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeWorkout.exercises.map((exercise: any, exIdx: number) => {
            const isComplete = isExerciseComplete(exIdx);
            return (
              <Card key={exIdx} style={[styles.exerciseCard, isComplete && styles.completeExerciseCard]}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={[styles.exerciseName, isComplete && styles.completeText]}>
                      {exercise.exerciseName}
                    </Text>
                    {isComplete && <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />}
                  </View>
                  <View style={styles.exerciseActions}>
                    <Text style={styles.exVolumeText}>{calculateExerciseVolume(exIdx)} kg</Text>
                    <TouchableOpacity onPress={() => removeExercise(exIdx)}>
                      <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.setListHeader}>
                  <Text style={[styles.setHeader, { width: 40 }]}>Set</Text>
                  <Text style={[styles.setHeader, { flex: 1 }]}>Previous</Text>
                  <Text style={[styles.setHeader, { width: 70 }]}>kg</Text>
                  <Text style={[styles.setHeader, { width: 70 }]}>Reps</Text>
                  <View style={{ width: 40 }} />
                </View>

                {exercise.sets.map((set: any, setIdx: number) => {
                  const prevEx = previousWorkout?.exercises?.find((e: any) => e.exerciseId === exercise.exerciseId);
                  const prevSet = prevEx?.sets?.[setIdx];
                  
                  return (
                    <SetRow 
                      key={setIdx}
                      set={set}
                      setIdx={setIdx}
                      exIdx={exIdx}
                      updateSet={updateSet}
                      toggleSetType={toggleSetType}
                      removeSet={removeSet}
                      prevSet={prevSet}
                    />
                  );
                })}

                <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exIdx)}>
                  <Text style={styles.addSetText}>+ Add Set</Text>
                </TouchableOpacity>
              </Card>
            );
          })}

          <TouchableOpacity 
            style={styles.addExerciseBtn} 
            onPress={() => navigation.navigate('ExerciseSearch', { mode: 'select' })}
          >
            <Ionicons name="add" size={24} color={Colors.textInverse} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => {
              Alert.alert('Cancel Workout', 'Discard this workout?', [
                { text: 'Keep', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => navigation.navigate('HealthDashboard') }
              ]);
            }}
          >
            <Text style={styles.cancelBtnText}>Discard Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  workoutTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  totalVolumeText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  timer: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  restBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  restText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  finishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  finishBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  exerciseCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  completeExerciseCard: {
    borderLeftColor: Colors.secondary,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  exerciseName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  completeText: {
    color: Colors.secondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  exVolumeText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  setListHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    paddingHorizontal: 4,
  },
  setHeader: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  completedSetRow: {
    backgroundColor: Colors.secondary + '15',
  },
  warmupSetRow: {
    backgroundColor: Colors.warning + '10',
  },
  setNumberBtn: {
    width: 40,
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.bold,
  },
  specialSetText: {
    color: Colors.secondary,
  },
  prevText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: FontSizes.sm,
  },
  setInput: {
    width: 70,
    backgroundColor: Colors.background,
    borderRadius: 4,
    paddingVertical: 4,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  completedInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  checkBtn: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: Colors.background,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  checkBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  addSetBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  addSetText: {
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  addExerciseText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  cancelBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  cancelBtnText: {
    color: Colors.error,
    fontWeight: FontWeights.bold,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  backBtnText: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
});
