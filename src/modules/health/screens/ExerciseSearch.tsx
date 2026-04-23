import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { healthAPI } from '../services/healthService';
import { useHealthStore } from '../store/healthStore';
import { Card } from '../../../components/Card';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';

export const ExerciseSearch = ({ navigation, route }: any) => {
  const { activeWorkout, updateActiveWorkout } = useHealthStore();
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const mode = route.params?.mode;

  const selectExercise = (item: any) => {
    if (!activeWorkout) return;
    
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises.push({
      exerciseId: item._id,
      exerciseName: item.exerciseName,
      sets: [{ type: 'normal', weight: 0, reps: 0, completed: false }],
    });
    
    updateActiveWorkout({ exercises: updatedExercises });
    navigation.goBack();
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await healthAPI.getExercises({ 
        search, 
        type: filter === 'all' ? undefined : filter 
      });
      setExercises(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExercises();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filter]);

  const renderExerciseItem = ({ item }: { item: any }) => (
    <Card style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        {item.videoUrl && (
          <View style={styles.videoContainer}>
            <Image 
              source={{ uri: item.videoUrl }} 
              style={styles.demoGif}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.exerciseName}</Text>
          <Text style={styles.exerciseDetail}>
            {item.muscleGroup} • {item.difficultyLevel}
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.exerciseType) + '20' }]}>
          <Text style={[styles.typeBadgeText, { color: getTypeColor(item.exerciseType) }]}>
            {item.exerciseType.toUpperCase()}
          </Text>
        </View>
      </View>
      
      {mode === 'select' ? (
        <TouchableOpacity style={styles.selectBtn} onPress={() => selectExercise(item)}>
          <Text style={styles.selectBtnText}>+ Add to Workout</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          {item.instructions.slice(0, 2).map((step: string, index: number) => (
            <Text key={index} style={styles.stepText}>
              {index + 1}. {step}
            </Text>
          ))}
          <View style={styles.cardFooter}>
            <Ionicons name="time-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.durationText}>Rec. Duration: {item.recommendedDuration} mins</Text>
          </View>
        </>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'home', 'gym', 'yoga'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.activeFilterBtn]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterBtnText, filter === f && styles.activeFilterBtnText]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : exercises.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No exercises found.</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'gym': return '#4F46E5';
    case 'home': return '#10B981';
    case 'yoga': return '#F59E0B';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textInverse,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '10',
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    backgroundColor: Colors.primary + '08',
  },
  activeFilterBtn: {
    backgroundColor: Colors.primary,
  },
  filterBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  activeFilterBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  listContent: {
    padding: Spacing.lg,
  },
  exerciseCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  videoContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    marginRight: Spacing.md,
  },
  demoGif: {
    width: '100%',
    height: '100%',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  exerciseDetail: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    height: 24,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
  instructionsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  stepText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    gap: Spacing.xs,
  },
  durationText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textTertiary,
    fontSize: FontSizes.md,
  },
  selectBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  selectBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
});
