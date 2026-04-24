import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Polyline } from 'react-native-maps';
import { getDistance } from 'geolib';
import { useHealthStore } from '../store/healthStore';
import { useTheme } from '../../../hooks/useTheme';
import { ProgressRing } from '../components/ProgressRing';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../../../constants/theme';
import { format } from 'date-fns';
import { Card } from '../../../components/Card';
import { stepCounter } from '../services/StepCounterModule';

const { width } = Dimensions.get('window');

export const StepsTracker = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { 
    dailyStats, 
    targets, 
    initStepCounter,
    startActivity, 
    finishActivity,
    activityHistory,
    fetchActivityHistory,
    analytics,
    fetchAnalytics
  } = useHealthStore();

  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionDistance, setSessionDistance] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionElevation, setSessionElevation] = useState(0);
  const [sessionSpeed, setSessionSpeed] = useState(0);
  const [route, setRoute] = useState<any[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [activityType, setActivityType] = useState<'walk' | 'run'>('walk');
  
  const timerRef = useRef<any>(null);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<any>(null);
  
  // Track steps at start of session for delta calculation
  const startStepsRef = useRef(0);
  const accumulatedGpsSteps = useRef(0);

  const stepTarget = targets?.stepsTarget || 10000;
  const todaySteps = dailyStats?.steps || 0;
  const progress = Math.min(1, todaySteps / stepTarget);

  useEffect(() => {
    initStepCounter();
    fetchActivityHistory();
    fetchAnalytics(30);
    return () => stopTracking();
  }, []);

  // Listen to step updates from the module
  useEffect(() => {
    if (isTracking) {
        // If the module detects a step, update our session count
        const delta = todaySteps - startStepsRef.current;
        // We take the max of sensor-detected steps or GPS-estimated steps
        setSessionSteps(Math.max(delta, Math.round(accumulatedGpsSteps.current)));
    }
  }, [todaySteps, isTracking]);

  const handleStartActivity = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }

    setIsTracking(true);
    setSessionSteps(0);
    setSessionDistance(0);
    setSessionDuration(0);
    setSessionElevation(0);
    setSessionSpeed(0);
    setRoute([]);
    accumulatedGpsSteps.current = 0;
    
    startStepsRef.current = todaySteps;

    await startActivity(activityType, `${activityType === 'walk' ? 'Walk' : 'Run'} on ${format(new Date(), 'MMM do')}`);

    timerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 3, // More frequent updates
      },
      (location) => {
        const newPoint = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
          speed: location.coords.speed || 0,
          altitude: location.coords.altitude || 0,
        };

        setSessionSpeed(location.coords.speed ? (location.coords.speed * 3.6) : 0);

        setRoute((prev) => {
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const dist = getDistance(
              { latitude: lastPoint.latitude, longitude: lastPoint.longitude },
              { latitude: newPoint.latitude, longitude: newPoint.longitude }
            );
            
            const distKm = dist / 1000;
            setSessionDistance((d) => d + distKm);

            // Accumulate GPS-based step estimation (1 step per 0.75m)
            accumulatedGpsSteps.current += (dist / 0.75);
            
            // If sensor steps (todaySteps - startStepsRef.current) is lagging, 
            // the useEffect above will pick up the higher GPS estimate.

            if (newPoint.altitude > lastPoint.altitude) {
              setSessionElevation((e) => e + (newPoint.altitude - lastPoint.altitude));
            }
          }
          return [...prev, newPoint];
        });

        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    );
  };

  const stopTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationSubscription.current) locationSubscription.current.remove();
    setIsTracking(false);
  };

  const handleStopActivity = async () => {
    stopTracking();

    const calories = Math.round(sessionDistance * (activityType === 'run' ? 90 : 60));

    await finishActivity({
      endTime: new Date(),
      durationSeconds: sessionDuration,
      distanceKm: sessionDistance,
      steps: sessionSteps,
      caloriesBurned: calories,
      route: route,
    });

    // Final sync for any GPS-estimated steps that might have been higher than sensors
    if (sessionSteps > (todaySteps - startStepsRef.current)) {
        stepCounter.onStepDetected(sessionSteps - (todaySteps - startStepsRef.current));
    }

    fetchActivityHistory();
    fetchAnalytics(30);

    Alert.alert('Activity Saved', `You covered ${sessionDistance.toFixed(2)}km in ${formatDuration(sessionDuration)}!`);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const calculateStreak = () => {
    if (!analytics || analytics.length === 0) return 0;
    let streakCount = 0;
    const sortedStats = [...analytics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const stat of sortedStats) {
      if (stat.steps >= stepTarget) streakCount++;
      else break;
    }
    return streakCount;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Activity Tracker</Text>
        <TouchableOpacity onPress={() => { fetchActivityHistory(); fetchAnalytics(30); }}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <ProgressRing
            size={width * 0.65}
            progress={progress}
            strokeWidth={15}
            color={colors.secondary}
            label={todaySteps.toLocaleString()}
            subLabel={`Goal: ${stepTarget.toLocaleString()}`}
          />
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color={colors.warning} />
            <Text style={[styles.streakText, { color: colors.textPrimary }]}>{calculateStreak()} Day Streak</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{(todaySteps * 0.0008).toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>km today</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="flame" size={24} color={colors.error} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{Math.round(todaySteps * 0.04)}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>kcal</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="time" size={24} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{Math.round(todaySteps / 100)}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>mins</Text>
          </Card>
        </View>

        {!isTracking && (
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeButton, activityType === 'walk' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} 
              onPress={() => setActivityType('walk')}
            >
              <Ionicons name="walk" size={24} color={activityType === 'walk' ? colors.primary : colors.textTertiary} />
              <Text style={[styles.typeText, { color: activityType === 'walk' ? colors.primary : colors.textTertiary }]}>Walk</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeButton, activityType === 'run' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} 
              onPress={() => setActivityType('run')}
            >
              <Ionicons name="fitness" size={24} color={activityType === 'run' ? colors.primary : colors.textTertiary} />
              <Text style={[styles.typeText, { color: activityType === 'run' ? colors.primary : colors.textTertiary }]}>Run</Text>
            </TouchableOpacity>
          </View>
        )}

        {isTracking ? (
          <Card style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
              <View style={styles.trackingStat}>
                <Text style={[styles.trackingLabel, { color: colors.textTertiary }]}>TIME</Text>
                <Text style={[styles.trackingValue, { color: colors.textPrimary }]}>{formatDuration(sessionDuration)}</Text>
              </View>
              <View style={styles.trackingStat}>
                <Text style={[styles.trackingLabel, { color: colors.textTertiary }]}>DISTANCE</Text>
                <Text style={[styles.trackingValue, { color: colors.textPrimary }]}>{sessionDistance.toFixed(2)} km</Text>
              </View>
              <View style={styles.trackingStat}>
                <Text style={[styles.trackingLabel, { color: colors.textTertiary }]}>SPEED</Text>
                <Text style={[styles.trackingValue, { color: colors.textPrimary }]}>{sessionSpeed.toFixed(1)} km/h</Text>
              </View>
            </View>
            
            <View style={styles.secondaryTrackingRow}>
               <View style={styles.trackingStat}>
                <Text style={[styles.trackingLabel, { color: colors.textTertiary }]}>STEPS</Text>
                <Text style={[styles.trackingValueSmall, { color: colors.textPrimary }]}>{sessionSteps}</Text>
              </View>
               <View style={styles.trackingStat}>
                <Text style={[styles.trackingLabel, { color: colors.textTertiary }]}>ELEVATION</Text>
                <Text style={[styles.trackingValueSmall, { color: colors.textPrimary }]}>{sessionElevation.toFixed(0)} m</Text>
              </View>
            </View>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: route[0]?.latitude || 0,
                  longitude: route[0]?.longitude || 0,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation
                userInterfaceStyle={isDark ? 'dark' : 'light'}
              >
                {route.length > 1 ? (
                  <Polyline coordinates={route} strokeWidth={5} strokeColor={colors.primary} />
                ) : null}
              </MapView>
            </View>

            <TouchableOpacity 
              style={[styles.stopButton, { backgroundColor: colors.error }]} 
              onPress={handleStopActivity}
            >
              <Ionicons name="stop" size={24} color="#FFF" />
              <Text style={styles.stopButtonText}>Stop Activity</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={handleStartActivity}
          >
            <Ionicons name={activityType === 'walk' ? 'walk' : 'fitness'} size={28} color="#FFF" />
            <View>
              <Text style={styles.startButtonText}>Start {activityType === 'walk' ? 'Walk' : 'Run'}</Text>
              <Text style={styles.startButtonSubtext}>Sensor + GPS Fusion</Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.xl }]}>Recent History</Text>
        {activityHistory.length > 0 ? (
          activityHistory.map((activity, index) => (
            <Card key={activity._id || index} style={styles.historyItem}>
              <View style={[styles.historyIcon, { backgroundColor: (activity.type === 'run' ? colors.error : colors.primary) + '15' }]}>
                <Ionicons 
                  name={activity.type === 'run' ? 'fitness' : 'walk'} 
                  size={20} 
                  color={activity.type === 'run' ? colors.error : colors.primary} 
                />
              </View>
              <View style={styles.historyContent}>
                <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>{activity.title}</Text>
                <Text style={[styles.historySubtitle, { color: colors.textTertiary }]}>
                  {format(new Date(activity.startTime), 'MMM d')} • {activity.distanceKm.toFixed(2)} km • {activity.steps} steps
                </Text>
              </View>
              <View style={styles.historyStats}>
                <Text style={[styles.historyValue, { color: colors.textPrimary }]}>{formatDuration(activity.durationSeconds)}</Text>
                <Text style={[styles.historyLabel, { color: colors.textTertiary }]}>{activity.caloriesBurned} kcal</Text>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="footsteps-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No history found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.huge },
  progressSection: { alignItems: 'center', marginVertical: Spacing.lg },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  streakText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, marginLeft: 6 },
  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  statValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, marginTop: 8 },
  statLabel: { fontSize: FontSizes.xs, marginTop: 2 },
  typeSelector: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  typeText: { fontWeight: FontWeights.semibold },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, marginBottom: Spacing.md },
  startButton: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.xl, gap: Spacing.md },
  startButtonText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  startButtonSubtext: { color: 'rgba(255, 255, 255, 0.8)', fontSize: FontSizes.xs },
  trackingCard: { padding: 0, overflow: 'hidden' },
  trackingHeader: {
    flexDirection: 'row',
    padding: Spacing.lg,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  secondaryTrackingRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    justifyContent: 'space-around',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
  },
  trackingStat: { alignItems: 'center' },
  trackingLabel: { fontSize: 10, fontWeight: FontWeights.bold, letterSpacing: 1 },
  trackingValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, marginTop: 4 },
  trackingValueSmall: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, marginTop: 2 },
  mapContainer: { height: 300, width: '100%' },
  map: { ...StyleSheet.absoluteFillObject },
  stopButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.sm },
  stopButtonText: { color: '#FFF', fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, marginBottom: Spacing.sm },
  historyIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  historyContent: { flex: 1, marginLeft: Spacing.md },
  historyTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  historySubtitle: { fontSize: FontSizes.xs, marginTop: 2 },
  historyStats: { alignItems: 'flex-end' },
  historyValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  historyLabel: { fontSize: FontSizes.xs },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, opacity: 0.5 },
  emptyText: { fontSize: FontSizes.sm, marginTop: Spacing.md },
});
