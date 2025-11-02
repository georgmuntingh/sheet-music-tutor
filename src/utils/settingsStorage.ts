import { RehearsalSettings } from '../types';

const SETTINGS_KEY = 'piano-tutor-settings';

// Default rehearsal intervals (in milliseconds)
export const DEFAULT_SETTINGS: RehearsalSettings = {
  box0Interval: 1000,           // Box 0: 1 second
  box1Interval: 60 * 1000,      // Box 1: 1 minute
  box2Interval: 60 * 60 * 1000, // Box 2: 1 hour
  box3Interval: 24 * 60 * 60 * 1000, // Box 3: 1 day
  box4Interval: 7 * 24 * 60 * 60 * 1000, // Box 4: 1 week
  countdownDuration: 5000,      // 5 seconds countdown before starting
  timeoutLength: 2000,          // 2 seconds timeout for answering
  feedbackLength: 2000,         // 2 seconds feedback display
};

export const saveSettings = (settings: RehearsalSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadSettings = (): RehearsalSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing properties (backwards compatibility)
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
};

export const resetSettings = (): RehearsalSettings => {
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
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
