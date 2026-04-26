import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTaskStore } from '../../stores/taskStore';
import { Task } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { NotificationService } from '../../services/NotificationService';
import { ThemeModal } from '../../components/ThemeModal';
import Voice from '@react-native-voice/voice';
import {
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

  const { colors } = useTheme();
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
  const [reminderOffset, setReminderOffset] = useState<number>(
    existingTask?.reminderOffset || 10
  );
  const [audioUri, setAudioUri] = useState<string | null>(
    existingTask?.audioNoteUrl || null
  );
  const [reminderType, setReminderType] = useState<'notification' | 'alarm' | 'both'>(
    existingTask?.reminderType || 'notification'
  );
  const [androidMode, setAndroidMode] = useState<'date' | 'time'>('date');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { createTask, updateTask } = useTaskStore();
  const [transcription, setTranscription] = useState('');

  // Themed Alert State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalShowCancel, setModalShowCancel] = useState(false);

  const showThemeAlert = (title: string, message: string, showCancel: boolean = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalShowCancel(showCancel);
    setModalVisible(true);
  };

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setTranscription(text);
        setTitle(`Voice Task: ${text.slice(0, 30)}${text.length > 30 ? '...' : ''}`);
        setDescription(prev => prev ? `${prev}\n\n[Transcribed]: ${text}` : `[Transcribed]: ${text}`);
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('Speech Error:', e);
      if (e.error?.message?.includes('No recognition service found')) {
        showThemeAlert('Google App Missing', 'Voice recognition requires the Google app to be installed and enabled.');
      } else {
        showThemeAlert('Voice Error', e.error?.message || 'Failed to recognize speech');
      }
      setIsRecording(false);
    };

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);

      // Start native voice recognition
      try {
        await Voice.start('en-US');
      } catch (e) {

      }
    } catch (err) {
      showThemeAlert('Failed to start recording', (err as any).message);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri || null);
      setRecording(null);

      // Stop native voice recognition
      try {
        await Voice.stop();
      } catch (e) {
        // Fallback for Expo Go (placeholder)
        setLoading(true);
        setTimeout(() => {
          if (!transcription) {
            setTitle('Voice Task: Built Application');
            setDescription(prev => prev ? `${prev}\n\n[Transcribed]: Note: Live native transcription will work on the final build.` : `[Transcribed]: Note: Live native transcription will work on the final build.`);
          }
          setLoading(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playRecording = async () => {
    if (!audioUri) {

      return;
    }
    try {

      
      // Ensure the URI has file:// prefix if it's a local path and doesn't have it
      const playbackUri = audioUri.startsWith('http') || audioUri.startsWith('file://') 
        ? audioUri 
        : `file://${audioUri}`;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: playbackUri },
        { shouldPlay: true }
      );
      setSound(newSound);

    } catch (err) {
      console.error('Playback failed', err);
      showThemeAlert('Playback failed', (err as any).message);
    }
  };


  const onDateChange = (event: any, date?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setAndroidMode('date');
      return;
    }

    if (date) {
      if (Platform.OS === 'android' && androidMode === 'date') {
        // Date selected, now show time picker
        setDueDate(date);
        setAndroidMode('time');
        // Small timeout to allow the date picker to fully close before opening time picker
        setTimeout(() => setShowDatePicker(true), 0);
      } else {
        // Time selected on Android or any selection on iOS
        setDueDate(date);
        setShowDatePicker(Platform.OS === 'ios');
        setAndroidMode('date');
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showThemeAlert('Error', 'Title is required');
      return;
    }

    if (dueDate && dueDate.getTime() <= Date.now()) {
      showThemeAlert('Error', 'Due date must be in the future');
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
        reminderOffset,
        reminderType,
        audioNoteUrl: audioUri || undefined,
      };

      if (isEditing && existingTask) {
        await updateTask(existingTask._id, taskData);
      } else {
        await createTask(taskData);
      }

      // Schedule notification if dueDate is set
      if (dueDate) {
        await NotificationService.scheduleTaskReminder({
          ...taskData,
          _id: existingTask?._id || 'temp',
          completed: false,
        } as any);
      }

      navigation.goBack();
    } catch (error) {
      showThemeAlert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const priorities: Array<{ value: 'low' | 'medium' | 'high'; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: '#22C55E' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
  ];

  const reminderOptions = [
    { label: 'None', value: 0 },
    { label: '5m', value: 5 },
    { label: '10m', value: 10 },
    { label: '30m', value: 30 },
    { label: '1h', value: 60 },
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
    optionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: Spacing.xxs,
    },
    optionText: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
      fontWeight: FontWeights.medium,
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
      color: colors.textSecondary,
    },
    audioContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    recordingBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: isRecording ? '#EF4444' : colors.primary,
      gap: Spacing.xs,
    },
    playBtn: {
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>
          {isEditing ? 'Edit Task' : 'New Task'}
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

        {/* Audio Note */}
        <Text style={dynamicStyles.label}>Voice Note</Text>
        <View style={dynamicStyles.audioContainer}>
          <TouchableOpacity
            style={dynamicStyles.recordingBtn}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              {isRecording ? 'Stop Recording' : 'Record Voice Note'}
            </Text>
          </TouchableOpacity>
          {isRecording && (
            <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>
              ● Listening...
            </Text>
          )}
          {audioUri && !isRecording && (
            <TouchableOpacity style={dynamicStyles.playBtn} onPress={playRecording}>
              <Ionicons name="play" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Priority */}
        <Text style={dynamicStyles.label}>Priority & Reward</Text>
        <View style={styles.optionRow}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                dynamicStyles.optionBtn,
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
                  dynamicStyles.optionText,
                  priority === p.value && { color: p.color },
                ]}
              >
                {p.label} (+{p.value === 'low' ? 10 : p.value === 'medium' ? 20 : 50} XP)
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Due Date */}
        <Text style={dynamicStyles.label}>Due Date & Alarm</Text>
        <TouchableOpacity
          style={dynamicStyles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={dynamicStyles.dateBtnText}>
            {dueDate ? dueDate.toLocaleString() : 'Set due date'}
          </Text>
          {dueDate && (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode={Platform.OS === 'ios' ? 'datetime' : androidMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {dueDate && (
          <>
            <Text style={dynamicStyles.label}>Reminder Type</Text>
            <View style={styles.optionRow}>
              {[
                { label: 'Notification', value: 'notification', icon: 'notifications' },
                { label: 'Alarm', value: 'alarm', icon: 'alarm' },
                { label: 'Both', value: 'both', icon: 'options' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    dynamicStyles.optionBtn,
                    reminderType === opt.value && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
                  ]}
                  onPress={() => setReminderType(opt.value as any)}
                >
                  <Ionicons 
                    name={opt.icon as any} 
                    size={16} 
                    color={reminderType === opt.value ? colors.primary : colors.textTertiary} 
                  />
                  <Text
                    style={[
                      dynamicStyles.optionText,
                      reminderType === opt.value && { color: colors.primary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={dynamicStyles.label}>Remind me before</Text>
            <View style={styles.optionRow}>
              {reminderOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    dynamicStyles.optionBtn,
                    reminderOffset === opt.value && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
                  ]}
                  onPress={() => setReminderOffset(opt.value)}
                >
                  <Text
                    style={[
                      dynamicStyles.optionText,
                      reminderOffset === opt.value && { color: colors.primary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Recurring */}
        <Text style={dynamicStyles.label}>Recurring</Text>
        <View style={styles.optionRow}>
          {['none', 'daily', 'weekly', 'monthly'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                dynamicStyles.optionBtn,
                recurring === r && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
              ]}
              onPress={() => setRecurring(r as any)}
            >
              <Text
                style={[
                  dynamicStyles.optionText,
                  recurring === r && { color: colors.primary },
                ]}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
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

      <ThemeModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        showCancel={modalShowCancel}
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
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
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  saveBtn: {
    marginTop: Spacing.lg,
  },
});
