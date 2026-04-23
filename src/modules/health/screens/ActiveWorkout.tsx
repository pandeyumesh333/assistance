import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealthStore } from '../store/healthStore';
import { useTheme } from '../../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { Card } from '../../../components/Card';

// --- Sub-component for individual sets ---
const SetRow = memo(({ set, setIdx, exIdx, updateSet, toggleSetType, removeSet, prevSet, restActive, colors }: any) => {
  const [localWeight, setLocalWeight] = useState(set.weight.toString());
  const [localReps, setLocalReps] = useState(set.reps.toString());

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

  const onFocus = () => {
    if (restActive) {
      Alert.alert('Rest in Progress', 'Rest is not complete! Give your muscles a few more seconds to recover.');
    }
  };

  return (
    <View 
      style={[
        styles.setRow, 
        set.completed && { backgroundColor: colors.secondary + '15' },
        set.type === 'warmup' && { backgroundColor: colors.warning + '10' }
      ]}
    >
      <TouchableOpacity 
        style={styles.setNumberBtn}
        onPress={() => toggleSetType(exIdx, setIdx)}
      >
        <Text style={[styles.setNumberText, { color: colors.textSecondary }, set.type !== 'normal' && { color: colors.secondary }]}>
          {set.type === 'warmup' ? 'W' : set.type === 'drop' ? 'D' : set.type === 'failure' ? 'F' : setIdx + 1}
        </Text>
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={[styles.prevText, { color: colors.textTertiary }]}>
          {prevSet ? `${prevSet.weight} x ${prevSet.reps}` : '-'}
        </Text>
      </View>

      <TextInput
        style={[
          styles.setInput, 
          { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderLight },
          set.completed && { backgroundColor: 'transparent', borderWidth: 0 }
        ]}
        keyboardType="numeric"
        value={localWeight === '0' ? '' : localWeight}
        onChangeText={setLocalWeight}
        onBlur={handleBlur}
        onFocus={onFocus}
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
      />

      <TextInput
        style={[
          styles.setInput, 
          { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderLight },
          set.completed && { backgroundColor: 'transparent', borderWidth: 0 }
        ]}
        keyboardType="numeric"
        value={localReps === '0' ? '' : localReps}
        onChangeText={setLocalReps}
        onBlur={handleBlur}
        onFocus={onFocus}
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
      />

      <TouchableOpacity 
        style={[
          styles.checkBtn, 
          { backgroundColor: colors.background, borderColor: colors.borderLight },
          set.completed && { backgroundColor: colors.secondary, borderColor: colors.secondary }
        ]}
        onPress={() => {
          const reps = parseInt(localReps) || 0;
          const newCompleted = !set.completed;
          
          if (newCompleted) {
            if (reps < 2) {
              Alert.alert('Smart Coach', 'Try to do at least 1 more extra rep for better results!');
            } else if (reps > 4) {
              Alert.alert('Smart Coach', "Great volume! No need for extra sets, you've reached your strength goal!");
            }
          }

          updateSet(exIdx, setIdx, { 
            weight: parseFloat(localWeight) || 0, 
            reps: reps,
            completed: newCompleted 
          });
        }}
      >
        <Ionicons name="checkmark" size={20} color={set.completed ? '#FFFFFF' : colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteSetIcon} onPress={() => removeSet(exIdx, setIdx)}>
        <Ionicons name="close-circle" size={18} color={colors.error + '50'} />
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
  const { colors, isDark } = useTheme();
  
  const [seconds, setSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [undoData, setUndoData] = useState<any>(null);
  const undoAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    fetchPreviousWorkout();
  }, []);

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

  const showUndo = (data: any) => {
    setUndoData(data);
    Animated.spring(undoAnim, { toValue: 0, useNativeDriver: true }).start();
    setTimeout(() => {
      hideUndo();
    }, 5000);
  };

  const hideUndo = () => {
    Animated.timing(undoAnim, { toValue: 100, duration: 300, useNativeDriver: true }).start(() => {
      setUndoData(null);
    });
  };

  const handleUndo = () => {
    if (undoData) {
      const updatedExercises = [...activeWorkout.exercises];
      updatedExercises[undoData.exIdx].sets.splice(undoData.setIdx, 0, undoData.set);
      updateActiveWorkout({ exercises: updatedExercises });
      hideUndo();
    }
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

  const handleExerciseMenu = (exIdx: number) => {
    Alert.alert(
      'Exercise Options',
      exerciseName(exIdx),
      [
        { text: 'Replace Exercise', onPress: () => navigation.navigate('ExerciseSearch', { mode: 'replace', replaceIdx: exIdx }) },
        { text: 'Remove Exercise', style: 'destructive', onPress: () => removeExercise(exIdx) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const exerciseName = (idx: number) => activeWorkout.exercises[idx]?.exerciseName || 'Exercise';

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

  const removeSet = (exIdx: number, setIdx: number) => {
    const set = activeWorkout.exercises[exIdx].sets[setIdx];
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exIdx].sets = updatedExercises[exIdx].sets.filter((_: any, i: number) => i !== setIdx);
    
    showUndo({ exIdx, setIdx, set });
    updateActiveWorkout({ exercises: updatedExercises });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    workoutTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
    },
    totalVolumeText: {
      fontSize: FontSizes.xs,
      color: colors.textTertiary,
      fontWeight: FontWeights.medium,
    },
    timer: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.bold,
      color: colors.primary,
    },
    restText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    exerciseName: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.primary,
    },
    completeText: {
      color: colors.secondary,
    },
    exVolumeText: {
      fontSize: 12,
      color: colors.textTertiary,
      fontWeight: FontWeights.medium,
    },
    setHeader: {
      fontSize: 10,
      fontWeight: FontWeights.bold,
      color: colors.textTertiary,
      textAlign: 'center',
    },
    addSetBtn: {
      marginTop: Spacing.md,
      paddingVertical: Spacing.sm,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    addSetText: {
      color: colors.textPrimary,
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.sm,
    },
    checkpointText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    undoBanner: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: isDark ? colors.surfaceElevated : colors.textPrimary,
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
    undoText: {
      color: '#FFFFFF',
      fontWeight: 'medium',
    },
    undoBtnLabel: {
      color: colors.primaryLight,
      fontWeight: 'bold',
      marginRight: Spacing.md,
    },
  });

  if (!activeWorkout) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>No active workout found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={dynamicStyles.header}>
          <View>
            <View style={styles.titleRow}>
              <Text style={dynamicStyles.workoutTitle}>{activeWorkout.title}</Text>
              <Text style={dynamicStyles.totalVolumeText}>{calculateTotalVolume()} kg</Text>
            </View>
            <View style={styles.timerRow}>
              <Text style={dynamicStyles.timer}>{formatTime(seconds)}</Text>
              {restSeconds > 0 && (
                <View style={[styles.restBadge, { backgroundColor: colors.secondary + '20' }, restSeconds < 10 && { backgroundColor: colors.error + '20' }]}>
                  <Ionicons name="timer-outline" size={14} color={colors.secondary} />
                  <Text style={dynamicStyles.restText}>Rest: {formatTime(restSeconds)}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity style={[styles.finishBtn, { backgroundColor: colors.primary }]} onPress={handleFinish}>
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeWorkout.exercises.map((exercise: any, exIdx: number) => {
            const isComplete = isExerciseComplete(exIdx);
            return (
              <Card key={exIdx} style={[styles.exerciseCard, isComplete && { borderLeftColor: colors.secondary, backgroundColor: colors.success + '05' }]}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={[dynamicStyles.exerciseName, isComplete && dynamicStyles.completeText]}>
                      {exercise.exerciseName}
                    </Text>
                    {isComplete && <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />}
                  </View>
                  <View style={styles.exerciseActions}>
                    <Text style={dynamicStyles.exVolumeText}>{calculateExerciseVolume(exIdx)} kg</Text>
                    <TouchableOpacity onPress={() => handleExerciseMenu(exIdx)}>
                      <Ionicons name="ellipsis-horizontal" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.setListHeader}>
                  <Text style={[dynamicStyles.setHeader, { width: 40 }]}>Set</Text>
                  <Text style={[dynamicStyles.setHeader, { flex: 1 }]}>Previous</Text>
                  <Text style={[dynamicStyles.setHeader, { width: 70 }]}>kg</Text>
                  <Text style={[dynamicStyles.setHeader, { width: 70 }]}>Reps</Text>
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
                      restActive={restSeconds > 0}
                      colors={colors}
                    />
                  );
                })}

                <TouchableOpacity style={dynamicStyles.addSetBtn} onPress={() => addSet(exIdx)}>
                  <Text style={dynamicStyles.addSetText}>+ Add Set</Text>
                </TouchableOpacity>

                {isComplete && (
                  <View style={[styles.checkpointBox, { backgroundColor: colors.secondary + '10' }]}>
                    <Ionicons name="checkmark-done" size={20} color={colors.secondary} />
                    <Text style={dynamicStyles.checkpointText}>Checkpoint Reached!</Text>
                  </View>
                )}
              </Card>
            );
          })}

          <TouchableOpacity 
            style={[styles.addExerciseBtn, { backgroundColor: colors.secondary }]} 
            onPress={() => navigation.navigate('ExerciseSearch', { mode: 'select' })}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
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
            <Text style={[styles.cancelBtnText, { color: colors.error }]}>Discard Workout</Text>
          </TouchableOpacity>
        </ScrollView>

        {undoData && (
          <Animated.View style={[dynamicStyles.undoBanner, { transform: [{ translateY: undoAnim }] }]}>
            <Text style={dynamicStyles.undoText}>Set deleted</Text>
            <TouchableOpacity onPress={handleUndo}>
              <Text style={dynamicStyles.undoBtnLabel}>UNDO</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={hideUndo} style={styles.closeUndo}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  restBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  finishBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  exerciseCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
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
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  setListHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    paddingHorizontal: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  setNumberBtn: {
    width: 40,
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  prevText: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.sm,
  },
  setInput: {
    width: 70,
    borderRadius: 4,
    paddingVertical: 4,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    marginHorizontal: 2,
    borderWidth: 1,
  },
  checkBtn: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginLeft: 4,
    borderWidth: 1,
  },
  deleteSetIcon: {
    paddingHorizontal: 8,
  },
  checkpointBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  addExerciseText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
  },
  cancelBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  cancelBtnText: {
    fontWeight: FontWeights.bold,
  },
  closeUndo: {
    padding: 4,
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
});
