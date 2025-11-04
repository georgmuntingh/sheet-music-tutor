import { RehearsalSettings, AudioDetectionSettings, AppSettings } from '../types';

const SETTINGS_KEY = 'piano-tutor-settings';

// Default rehearsal intervals (in milliseconds)
export const DEFAULT_REHEARSAL_SETTINGS: RehearsalSettings = {
  box0Interval: 1000,           // Box 0: 1 second
  box1Interval: 60 * 1000,      // Box 1: 1 minute
  box2Interval: 60 * 60 * 1000, // Box 2: 1 hour
  box3Interval: 24 * 60 * 60 * 1000, // Box 3: 1 day
  box4Interval: 7 * 24 * 60 * 60 * 1000, // Box 4: 1 week
};

// Default audio detection settings
export const DEFAULT_AUDIO_SETTINGS: AudioDetectionSettings = {
  enableHarmonicRatio: true,
  harmonicRatioThreshold: 0.6, // 60% harmonic content required
};

// Combined default settings
export const DEFAULT_SETTINGS: AppSettings = {
  rehearsal: DEFAULT_REHEARSAL_SETTINGS,
  audioDetection: DEFAULT_AUDIO_SETTINGS,
};

// Legacy export for backward compatibility
export { DEFAULT_REHEARSAL_SETTINGS as DEFAULT_SETTINGS_LEGACY };

/**
 * Get the storage key for a specific user, or default key if no user specified
 */
const getStorageKey = (userId?: string): string => {
  return userId ? `${SETTINGS_KEY}-${userId}` : SETTINGS_KEY;
};

/**
 * Save app settings to localStorage
 */
export const saveSettings = (settings: AppSettings, userId?: string): void => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

/**
 * Load app settings from localStorage
 * Handles migration from old RehearsalSettings-only format
 */
export const loadSettings = (userId?: string): AppSettings => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      const parsed = JSON.parse(stored);

      // Check if this is the old format (direct RehearsalSettings)
      if (parsed.box0Interval !== undefined && parsed.rehearsal === undefined) {
        // Migrate from old format
        return {
          rehearsal: parsed as RehearsalSettings,
          audioDetection: DEFAULT_AUDIO_SETTINGS,
        };
      }

      // New format - ensure all fields are present
      return {
        rehearsal: parsed.rehearsal || DEFAULT_REHEARSAL_SETTINGS,
        audioDetection: parsed.audioDetection || DEFAULT_AUDIO_SETTINGS,
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Reset settings to defaults
 */
export const resetSettings = (userId?: string): AppSettings => {
  saveSettings(DEFAULT_SETTINGS, userId);
  return DEFAULT_SETTINGS;
};

/**
 * Legacy function for backward compatibility with existing Settings component
 * @deprecated Use loadSettings instead
 */
export const loadRehearsalSettings = (userId?: string): RehearsalSettings => {
  const settings = loadSettings(userId);
  return settings.rehearsal;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use saveSettings instead
 */
export const saveRehearsalSettings = (settings: RehearsalSettings, userId?: string): void => {
  const currentSettings = loadSettings(userId);
  saveSettings({
    ...currentSettings,
    rehearsal: settings,
  }, userId);
};

// Convert milliseconds to human-readable format
export const formatInterval = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''}`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
};
