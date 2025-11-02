import { FlashCard, LearningProgress } from '../types';

const STORAGE_KEY = 'piano-tutor-progress';

export const saveProgress = (cards: FlashCard[], injectedLessonIds: string[] = []): void => {
  try {
    const progress: LearningProgress = {
      cards,
      currentCardId: null,
      totalReviews: cards.reduce((sum, card) => sum + card.reviewCount, 0),
      correctReviews: cards.reduce((sum, card) => sum + card.correctCount, 0),
      injectedLessonIds,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const loadProgress = (): LearningProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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

export const clearProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear progress:', error);
  }
};
