import { FlashCard, LearningProgress } from '../types';

const STORAGE_KEY = 'piano-tutor-progress';

/**
 * Get the storage key for a specific user, or default key if no user specified
 */
const getStorageKey = (userId?: string): string => {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
};

export const saveProgress = (cards: FlashCard[], injectedLessonIds: string[] = [], userId?: string): void => {
  try {
    const progress: LearningProgress = {
      cards,
      currentCardId: null,
      totalReviews: cards.reduce((sum, card) => sum + card.reviewCount, 0),
      correctReviews: cards.reduce((sum, card) => sum + card.correctCount, 0),
      injectedLessonIds,
    };

    localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const loadProgress = (userId?: string): LearningProgress | null => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (!stored) return null;

    const progress: LearningProgress = JSON.parse(stored);
    // Ensure injectedLessonIds exists for backwards compatibility
    if (!progress.injectedLessonIds) {
      progress.injectedLessonIds = [];
    }
    return progress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
};

export const clearProgress = (userId?: string): void => {
  try {
    localStorage.removeItem(getStorageKey(userId));
  } catch (error) {
    console.error('Failed to clear progress:', error);
  }
};
