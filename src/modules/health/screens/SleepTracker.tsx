import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHealthStore } from '../store/healthStore';
import { Card } from '../../../components/Card';
import { ProgressRing } from '../components/ProgressRing';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

export const SleepTracker = ({ navigation }: any) => {
  const { dailyStats, targets, logSleep } = useHealthStore();
  const [sleepTime, setSleepTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [quality, setQuality] = useState(7);

  const durationHours = differenceInMinutes(wakeTime, sleepTime) / 60;
  // If duration is negative, assume sleep started yesterday
  const adjustedDuration = durationHours < 0 ? durationHours + 24 : durationHours;

  const handleLogSleep = async () => {
    try {
      await logSleep({
        sleepStartTime: sleepTime,
        sleepEndTime: wakeTime,
        sleepQualityScore: quality,
      });
      Alert.alert('Success', 'Sleep logged successfully.');
    } catch (error) {
      console.error(error);
    }
  };

  const currentSleep = dailyStats?.sleepHours || 0;
  const targetSleep = targets?.sleepTargetHours || 8;
  const progress = Math.min(1, currentSleep / targetSleep);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressSection}>
          <ProgressRing
            size={180}
            progress={progress}
            strokeWidth={15}
            color="#6366F1"
            label={currentSleep.toFixed(1)}
            subLabel={`of ${targetSleep}h`}
          />
          <Text style={styles.statusText}>
            {progress >= 1 ? "Fully Rested! ✨" : "Need more rest"}
          </Text>
        </View>

        <Card style={styles.logCard}>
          <Text style={styles.cardTitle}>Log Last Night's Sleep</Text>
          
          <View style={styles.timeRow}>
            <TouchableOpacity 
              style={styles.timePicker} 
              onPress={() => setShowSleepPicker(true)}
            >
              <Text style={styles.timeLabel}>Sleep Time</Text>
              <Text style={styles.timeValue}>{format(sleepTime, 'hh:mm a')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.timePicker}
              onPress={() => setShowWakePicker(true)}
            >
              <Text style={styles.timeLabel}>Wake Time</Text>
              <Text style={styles.timeValue}>{format(wakeTime, 'hh:mm a')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.durationText}>
              Total Duration: <Text style={styles.durationValue}>{adjustedDuration.toFixed(1)} hours</Text>
            </Text>
          </View>

          <Text style={styles.qualityLabel}>Sleep Quality: {quality}/10</Text>
          <View style={styles.qualityRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.qualityBtn, quality === q && styles.activeQualityBtn]}
                onPress={() => setQuality(q)}
              >
                <Text style={[styles.qualityBtnText, quality === q && styles.activeQualityBtnText]}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logButton} onPress={handleLogSleep}>
            <Text style={styles.logButtonText}>Log Sleep</Text>
          </TouchableOpacity>
        </Card>

        {showSleepPicker && (
          <DateTimePicker
            value={sleepTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowSleepPicker(false);
              if (selectedDate) setSleepTime(selectedDate);
            }}
          />
        )}

        {showWakePicker && (
          <DateTimePicker
            value={wakeTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowWakePicker(false);
              if (selectedDate) setWakeTime(selectedDate);
            }}
          />
        )}
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  statusText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  logCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  timePicker: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '10',
  },
  timeLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '08',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  durationText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  durationValue: {
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  qualityLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  qualityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  qualityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeQualityBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  qualityBtnText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  activeQualityBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  logButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  logButtonText: {
    color: Colors.textInverse,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
});
