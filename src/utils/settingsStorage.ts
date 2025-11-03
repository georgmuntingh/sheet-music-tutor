import { RehearsalSettings } from '../types';

const SETTINGS_KEY = 'piano-tutor-settings';

// Default rehearsal intervals (in milliseconds)
export const DEFAULT_SETTINGS: RehearsalSettings = {
  box0Interval: 1000,           // Box 0: 1 second
  box1Interval: 60 * 1000,      // Box 1: 1 minute
  box2Interval: 60 * 60 * 1000, // Box 2: 1 hour
  box3Interval: 24 * 60 * 60 * 1000, // Box 3: 1 day
  box4Interval: 7 * 24 * 60 * 60 * 1000, // Box 4: 1 week
};

/**
 * Get the storage key for a specific user, or default key if no user specified
 */
const getStorageKey = (userId?: string): string => {
  return userId ? `${SETTINGS_KEY}-${userId}` : SETTINGS_KEY;
};

export const saveSettings = (settings: RehearsalSettings, userId?: string): void => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadSettings = (userId?: string): RehearsalSettings => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
};

export const resetSettings = (userId?: string): RehearsalSettings => {
  saveSettings(DEFAULT_SETTINGS, userId);
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
