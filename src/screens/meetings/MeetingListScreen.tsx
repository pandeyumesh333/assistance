import React, { useEffect, useState } from 'react';
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
import { useMeetingStore } from '../../stores/meetingStore';
import { Meeting } from '../../types';
import { formatDate } from '../../utils/helpers';
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../constants/theme';

export const MeetingListScreen = ({ navigation }: any) => {
  const { meetings, fetchMeetings, deleteMeeting, isLoading } = useMeetingStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeetings();
    setRefreshing(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Meeting', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMeeting(id),
      },
    ]);
  };

  const now = new Date();
  const upcomingMeetings = meetings.filter((m) => new Date(m.time) >= now);
  const pastMeetings = meetings.filter((m) => new Date(m.time) < now);

  const renderMeeting = ({ item }: { item: Meeting }) => {
    const isPast = new Date(item.time) < now;
    return (
      <Card
        style={isPast ? [styles.meetingCard, styles.pastCard] : styles.meetingCard}
        onPress={() => navigation.navigate('MeetingForm', { meeting: item })}
      >
        <View style={styles.meetingRow}>
          <View
            style={[
              styles.timeBlock,
              isPast && { backgroundColor: Colors.borderLight },
            ]}
          >
            <Text style={[styles.timeText, isPast && { color: Colors.textTertiary }]}>
              {new Date(item.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.meetingInfo}>
            <Text
              style={[styles.meetingTitle, isPast && styles.pastText]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={styles.meetingMeta}>
              {item.location ? (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={Colors.textTertiary}
                  />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.metaText}>{formatDate(item.time)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item._id, item.title)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const allMeetings = [...upcomingMeetings, ...pastMeetings];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meetings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MeetingForm')}
        >
          <Ionicons name="add" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allMeetings}
        renderItem={renderMeeting}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No meetings scheduled"
            subtitle="Tap + to schedule your first meeting"
            actionLabel="Add Meeting"
            onAction={() => navigation.navigate('MeetingForm')}
          />
        }
      />
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
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  meetingCard: {
    marginBottom: Spacing.xs,
  },
  pastCard: {
    opacity: 0.6,
  },
  meetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  timeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  pastText: {
    color: Colors.textTertiary,
  },
  meetingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
});
