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
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useMeetingStore } from '../../stores/meetingStore';
import { Meeting } from '../../types';
import { formatDate } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../constants/theme';

export const MeetingListScreen = ({ navigation }: any) => {
  const { meetings, fetchMeetings, deleteMeeting, isLoading } = useMeetingStore();
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useTheme();

  useFocusEffect(
    useCallback(() => {
      fetchMeetings();
    }, [])
  );

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
    addButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.sm,
    },
    timeBlock: {
      backgroundColor: colors.primary + '12',
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
      color: colors.primary,
    },
    meetingTitle: {
      fontSize: FontSizes.md,
      fontWeight: FontWeights.medium,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    metaText: {
      fontSize: FontSizes.xs,
      color: colors.textTertiary,
    },
  });

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
              dynamicStyles.timeBlock,
              isPast && { backgroundColor: colors.borderLight },
            ]}
          >
            <Text style={[dynamicStyles.timeText, isPast && { color: colors.textTertiary }]}>
              {new Date(item.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.meetingInfo}>
            <Text
              style={[dynamicStyles.meetingTitle, isPast && { color: colors.textTertiary }]}
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
                    color={colors.textTertiary}
                  />
                  <Text style={dynamicStyles.metaText} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              ) : null}
              <Text style={dynamicStyles.metaText}>{formatDate(item.time)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item._id, item.title)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const allMeetings = [...upcomingMeetings, ...pastMeetings];

  return (
    <SafeAreaView style={dynamicStyles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={dynamicStyles.headerTitle}>Meetings</Text>
        <TouchableOpacity
          style={dynamicStyles.addButton}
          onPress={() => navigation.navigate('MeetingForm')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
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
            tintColor={colors.primary}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  meetingInfo: {
    flex: 1,
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
  deleteBtn: {
    padding: Spacing.xs,
  },
});
