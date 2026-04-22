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
import {
  Colors,
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Meeting' : 'New Meeting'}
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
          placeholder="Meeting title"
        />

        {/* Date/Time */}
        <Text style={styles.label}>Date & Time</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.dateBtnText}>
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
          icon={<Ionicons name="location-outline" size={20} color={Colors.textTertiary} />}
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
        <Text style={styles.label}>Reminder</Text>
        <View style={styles.optionRow}>
          {reminderOptions.map((r) => (
            <TouchableOpacity
              key={String(r.value)}
              style={[
                styles.optionBtn,
                reminderMinutes === r.value && styles.optionBtnActive,
              ]}
              onPress={() => setReminderMinutes(r.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  reminderMinutes === r.value && styles.optionTextActive,
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
    color: Colors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  optionBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionBtnActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  optionTextActive: {
    color: Colors.primary,
  },
  saveBtn: {
    marginTop: Spacing.lg,
  },
});
