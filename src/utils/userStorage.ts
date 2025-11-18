import { UserProfile } from '../types';

const USER_PROFILES_KEY = 'piano-tutor-user-profiles';
const CURRENT_USER_KEY = 'piano-tutor-current-user';

/**
 * Get all user profiles from localStorage
 */
export function getUserProfiles(): UserProfile[] {
  try {
    const stored = localStorage.getItem(USER_PROFILES_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading user profiles:', error);
    return [];
  }
}

/**
 * Save user profiles to localStorage
 */
export function saveUserProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving user profiles:', error);
  }
}

/**
 * Create a new user profile
 */
export function createUserProfile(name: string): UserProfile {
  const profile: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    createdAt: Date.now(),
  };

  const profiles = getUserProfiles();
  profiles.push(profile);
  saveUserProfiles(profiles);

  return profile;
}

/**
 * Get a user profile by ID
 */
export function getUserProfile(userId: string): UserProfile | null {
  const profiles = getUserProfiles();
  return profiles.find(p => p.id === userId) || null;
}

/**
 * Update a user profile
 */
export function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const profiles = getUserProfiles();
  const index = profiles.findIndex(p => p.id === userId);

  if (index === -1) {
    return null;
  }

  profiles[index] = { ...profiles[index], ...updates };
  saveUserProfiles(profiles);

  return profiles[index];
}

/**
 * Delete a user profile and all associated data
 */
export function deleteUserProfile(userId: string): boolean {
  const profiles = getUserProfiles();
  const filteredProfiles = profiles.filter(p => p.id !== userId);

  if (filteredProfiles.length === profiles.length) {
    return false; // User not found
  }

  saveUserProfiles(filteredProfiles);

  // Clean up user-specific data
  localStorage.removeItem(`piano-tutor-progress-${userId}`);
  localStorage.removeItem(`piano-tutor-settings-${userId}`);

  // If this was the current user, clear current user
  if (getCurrentUserId() === userId) {
    clearCurrentUser();
  }

  return true;
}

/**
 * Get the current active user ID
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

/**
 * Set the current active user ID
 */
export function setCurrentUserId(userId: string): void {
  localStorage.setItem(CURRENT_USER_KEY, userId);
}

/**
 * Clear the current user
 */
export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Initialize default user profiles if none exist
 */
export function initializeDefaultProfiles(): UserProfile[] {
  const existingProfiles = getUserProfiles();

  if (existingProfiles.length > 0) {
    return existingProfiles;
  }

  // Create Ella, Georg, and Mina profiles
  const ella = createUserProfile('Ella');
  const georg = createUserProfile('Georg');
  const mina = createUserProfile('Mina');

  // Set Ella as the default active user
  setCurrentUserId(ella.id);

  return [ella, georg, mina];
}
