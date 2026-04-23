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
import { useTheme } from '../../../hooks/useTheme';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { format, differenceInMinutes } from 'date-fns';

export const SleepTracker = ({ navigation }: any) => {
  const { dailyStats, targets, logSleep } = useHealthStore();
  const { colors, isDark } = useTheme();
  const [sleepTime, setSleepTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [quality, setQuality] = useState(7);

  const durationHours = differenceInMinutes(wakeTime, sleepTime) / 60;
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
    statusText: {
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginTop: Spacing.lg,
    },
    cardTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.lg,
    },
    timePicker: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeLabel: {
      fontSize: FontSizes.xs,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    timeValue: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.bold,
      color: colors.primary,
    },
    durationText: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
    },
    qualityLabel: {
      fontSize: FontSizes.sm,
      fontWeight: FontWeights.semibold,
      color: colors.textSecondary,
      marginBottom: Spacing.md,
    },
    qualityBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qualityBtnText: {
      fontSize: FontSizes.xs,
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Sleep Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <ProgressRing
            size={180}
            progress={progress}
            strokeWidth={15}
            color="#6366F1"
            label={currentSleep.toFixed(1)}
            subLabel={`of ${targetSleep}h`}
          />
          <Text style={dynamicStyles.statusText}>
            {progress >= 1 ? "Fully Rested! ✨" : "Need more rest"}
          </Text>
        </View>

        <Card style={styles.logCard}>
          <Text style={dynamicStyles.cardTitle}>Log Last Night's Sleep</Text>
          
          <View style={styles.timeRow}>
            <TouchableOpacity 
              style={dynamicStyles.timePicker} 
              onPress={() => setShowSleepPicker(true)}
            >
              <Text style={dynamicStyles.timeLabel}>Sleep Time</Text>
              <Text style={dynamicStyles.timeValue}>{format(sleepTime, 'hh:mm a')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={dynamicStyles.timePicker}
              onPress={() => setShowWakePicker(true)}
            >
              <Text style={dynamicStyles.timeLabel}>Wake Time</Text>
              <Text style={dynamicStyles.timeValue}>{format(wakeTime, 'hh:mm a')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.durationRow, { backgroundColor: colors.primary + '08' }]}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={dynamicStyles.durationText}>
              Total Duration: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{adjustedDuration.toFixed(1)} hours</Text>
            </Text>
          </View>

          <Text style={dynamicStyles.qualityLabel}>Sleep Quality: {quality}/10</Text>
          <View style={styles.qualityRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
              <TouchableOpacity
                key={q}
                style={[
                  dynamicStyles.qualityBtn,
                  quality === q && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setQuality(q)}
              >
                <Text style={[
                  dynamicStyles.qualityBtnText,
                  quality === q && { color: '#FFFFFF', fontWeight: 'bold' }
                ]}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.logButton, { backgroundColor: colors.primary }]} onPress={handleLogSleep}>
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
  progressSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  qualityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  logButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
});
