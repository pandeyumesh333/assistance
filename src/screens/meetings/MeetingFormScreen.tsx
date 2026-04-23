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
import { useMeetingStore } from '../../stores/meetingStore';
import { Meeting } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from '../../constants/theme';

interface Props {
  navigation: any;
  route: { params?: { meeting?: Meeting } };
}

export const MeetingFormScreen = ({ navigation, route }: Props) => {
  const existingMeeting = route.params?.meeting;
  const isEditing = !!existingMeeting;

  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState(existingMeeting?.title || '');
  const [location, setLocation] = useState(existingMeeting?.location || '');
  const [notes, setNotes] = useState(existingMeeting?.notes || '');
  const [meetingTime, setMeetingTime] = useState<Date>(
    existingMeeting?.time ? new Date(existingMeeting.time) : new Date()
  );
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(15);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { createMeeting, updateMeeting } = useMeetingStore();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setLoading(true);
    try {
      const reminderTime = reminderMinutes
        ? new Date(meetingTime.getTime() - reminderMinutes * 60 * 1000).toISOString()
        : undefined;

      const meetingData = {
        title: title.trim(),
        time: meetingTime.toISOString(),
        location: location.trim(),
        notes: notes.trim(),
        reminderTime,
      };

      if (isEditing && existingMeeting) {
        await updateMeeting(existingMeeting._id, meetingData);
      } else {
        await createMeeting(meetingData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  const reminderOptions = [
    { value: null, label: 'None' },
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' },
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
      color: colors.textPrimary,
    },
    optionBtn: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    optionBtnActive: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
      fontWeight: FontWeights.medium,
    },
    optionTextActive: {
      color: colors.primary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>
          {isEditing ? 'Edit Meeting' : 'New Meeting'}
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
          placeholder="Meeting title"
        />

        {/* Date/Time */}
        <Text style={dynamicStyles.label}>Date & Time</Text>
        <TouchableOpacity
          style={dynamicStyles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={dynamicStyles.dateBtnText}>
            {meetingTime.toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={meetingTime}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setMeetingTime(date);
            }}
          />
        )}

        <Input
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Where? (optional)"
          icon={<Ionicons name="location-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Meeting notes (optional)"
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {/* Reminder */}
        <Text style={dynamicStyles.label}>Reminder</Text>
        <View style={styles.optionRow}>
          {reminderOptions.map((r) => (
            <TouchableOpacity
              key={String(r.value)}
              style={[
                dynamicStyles.optionBtn,
                reminderMinutes === r.value && dynamicStyles.optionBtnActive,
              ]}
              onPress={() => setReminderMinutes(r.value)}
            >
              <Text
                style={[
                  dynamicStyles.optionText,
                  reminderMinutes === r.value && dynamicStyles.optionTextActive,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isEditing ? 'Update Meeting' : 'Schedule Meeting'}
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
  saveBtn: {
    marginTop: Spacing.lg,
  },
});
