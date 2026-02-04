import {NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIVE_ACTIVITY_ENABLED_KEY = '@wallpe:liveActivityEnabled';
const LIVE_ACTIVITY_MODE_KEY = '@wallpe:liveActivityMode';

type LiveActivityMode =
  | 'yearProgress'
  | 'countdown'
  | 'dayProgress'
  | 'monthProgress'
  | 'pet'
  | 'streak'
  | 'event';

interface StartOptions {
  eventName?: string;
  eventDate?: number;
  streakCount?: number;
}

const LiveActivityManager =
  Platform.OS === 'ios' ? NativeModules.LiveActivityManager : null;

export const LiveActivityService = {
  isSupported(): boolean {
    const supported = Platform.OS === 'ios' && LiveActivityManager != null;
    if (!supported) {
      console.warn('⚠️ Live Activities not supported:', {
        platform: Platform.OS,
        version: Platform.Version,
        nativeModule: LiveActivityManager != null,
      });
    }
    return supported;
  },

  async startLiveActivity(
    mode: LiveActivityMode = 'yearProgress',
    options?: StartOptions,
  ): Promise<boolean> {
    if (!LiveActivityManager) {
      console.error('❌ LiveActivityManager not available');
      return false;
    }
    try {
      const result = await LiveActivityManager.startLiveActivity(mode, options || {});
      await AsyncStorage.setItem(LIVE_ACTIVITY_ENABLED_KEY, 'true');
      await AsyncStorage.setItem(LIVE_ACTIVITY_MODE_KEY, mode);
      return true;
    } catch (error: unknown) {
      console.error('❌ Error starting Live Activity:', error);
      throw error;
    }
  },

  async updateLiveActivity(): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.updateLiveActivity();
    } catch {
      return false;
    }
  },

  async endLiveActivity(): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      await LiveActivityManager.endLiveActivity();
      await AsyncStorage.setItem(LIVE_ACTIVITY_ENABLED_KEY, 'false');
      await AsyncStorage.removeItem(LIVE_ACTIVITY_MODE_KEY);
      return true;
    } catch (error: unknown) {
      console.error('❌ Error ending Live Activity:', error);
      throw error;
    }
  },

  async isLiveActivityEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(LIVE_ACTIVITY_ENABLED_KEY);
    return value === 'true';
  },

  async getLiveActivityMode(): Promise<LiveActivityMode | null> {
    const value = await AsyncStorage.getItem(LIVE_ACTIVITY_MODE_KEY);
    const valid: LiveActivityMode[] = [
      'yearProgress',
      'countdown',
      'dayProgress',
      'monthProgress',
      'pet',
      'streak',
      'event',
    ];
    if (value && valid.includes(value as LiveActivityMode)) {
      return value as LiveActivityMode;
    }
    return null;
  },

  async feedPet(): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.feedPet();
    } catch {
      return false;
    }
  },

  async playWithPet(): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.playWithPet();
    } catch {
      return false;
    }
  },

  async restPet(): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.restPet();
    } catch {
      return false;
    }
  },

  async getPetState(): Promise<Record<string, unknown> | null> {
    if (!LiveActivityManager) return null;
    try {
      return await LiveActivityManager.getPetState();
    } catch {
      return null;
    }
  },

  async setPetName(name: string): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.setPetName(name);
    } catch {
      return false;
    }
  },

  async setPetType(type: string): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.setPetType(type);
    } catch {
      return false;
    }
  },

  async isLiveActivityActive(): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.isLiveActivityActive();
    } catch {
      return false;
    }
  },

  async checkAndRestoreLiveActivity(): Promise<boolean> {
    if (!LiveActivityManager) return false;
    try {
      return await LiveActivityManager.checkAndRestoreLiveActivity();
    } catch {
      return false;
    }
  },
};
