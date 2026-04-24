import { Pedometer, Accelerometer } from 'expo-sensors';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEP_COUNT_STORAGE_KEY = 'daily_step_count_data';
const BACKGROUND_STEP_TASK = 'BACKGROUND_STEP_SYNC';

interface StepData {
  steps: number;
  date: string;
  lastUpdate: number;
}

class StepCounterModule {
  private static instance: StepCounterModule;
  private currentSteps: number = 0;
  private isPedometerAvailable: boolean = false;
  private accelerometerSubscription: any = null;
  private pedometerSubscription: any = null;
  
  // Accelerometer algorithm constants
  private readonly THRESHOLD = 1.15; // Lowered threshold for better sensitivity
  private readonly STEP_DELAY = 250; // ms between steps
  private lastStepTime: number = 0;
  private lastMagnitude: number = 0;

  private stepListener: ((steps: number) => void) | null = null;

  private constructor() {}

  public static getInstance(): StepCounterModule {
    if (!StepCounterModule.instance) {
      StepCounterModule.instance = new StepCounterModule();
    }
    return StepCounterModule.instance;
  }

  public async initialize() {
    const { status } = await Pedometer.requestPermissionsAsync();
    const isAvailable = await Pedometer.isAvailableAsync();
    this.isPedometerAvailable = isAvailable && status === 'granted';

    const today = new Date().toISOString().split('T')[0];
    const savedData = await this.getLocalSteps();
    
    if (savedData && savedData.date === today) {
      this.currentSteps = savedData.steps;
    } else {
      this.currentSteps = 0;
      await this.saveLocalSteps(0);
    }

    // Always start Accelerometer as a reliable fallback/companion
    this.startAccelerometer();

    if (this.isPedometerAvailable) {
      this.startPedometer();
    }

    this.setupBackgroundSync();
  }

  private async startPedometer() {
    // Initial hardware sync
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      if (result && result.steps > this.currentSteps) {
        this.currentSteps = result.steps;
        await this.saveLocalSteps(this.currentSteps);
        if (this.stepListener) this.stepListener(this.currentSteps);
      }
    } catch (e) {
      console.log('Pedometer query failed', e);
    }

    // Hardware watch
    this.pedometerSubscription = Pedometer.watchStepCount((result) => {
      // result.steps is delta since subscription
      if (result.steps > 0) {
        this.onStepDetected(1); 
      }
    });
  }

  private startAccelerometer() {
    Accelerometer.setUpdateInterval(50); // 20Hz for better precision
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      // Peak detection logic
      // Check for a sharp increase in magnitude followed by a drop
      if (magnitude > this.THRESHOLD && this.lastMagnitude <= this.THRESHOLD) {
        if (now - this.lastStepTime > this.STEP_DELAY) {
          // If we are using Pedometer and it's working, we might want to ignore this to avoid double counting
          // But since Pedometer is failing for the user, we let Accelerometer take the lead
          this.onStepDetected(1);
          this.lastStepTime = now;
        }
      }
      this.lastMagnitude = magnitude;
    });
  }

  public onStepDetected(count: number) {
    this.currentSteps += count;
    this.saveLocalSteps(this.currentSteps);
    if (this.stepListener) {
      this.stepListener(this.currentSteps);
    }
  }

  public setStepListener(callback: (steps: number) => void) {
    this.stepListener = callback;
  }

  public async getTodaySteps(): Promise<number> {
    const data = await this.getLocalSteps();
    const today = new Date().toISOString().split('T')[0];
    if (data && data.date === today) {
      return data.steps;
    }
    return 0;
  }

  private async saveLocalSteps(steps: number) {
    const today = new Date().toISOString().split('T')[0];
    const data: StepData = {
      steps,
      date: today,
      lastUpdate: Date.now(),
    };
    await AsyncStorage.setItem(STEP_COUNT_STORAGE_KEY, JSON.stringify(data));
  }

  private async getLocalSteps(): Promise<StepData | null> {
    const json = await AsyncStorage.getItem(STEP_COUNT_STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  }

  private async setupBackgroundSync() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_STEP_TASK, {
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (err) {
      console.log('Background fetch failed:', err);
    }
  }
}

TaskManager.defineTask(BACKGROUND_STEP_TASK, async () => {
  try {
    const steps = await StepCounterModule.getInstance().getTodaySteps();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const stepCounter = StepCounterModule.getInstance();
