import { FlashCard, LearningProgress } from '../types';

const STORAGE_KEY = 'piano-tutor-progress';

export const saveProgress = (cards: FlashCard[], injectedLessons?: string[]): void => {
  try {
    // Load existing progress to preserve injectedLessons if not provided
    const existing = loadFullProgress();

    const progress: LearningProgress = {
      cards,
      currentCardId: null,
      totalReviews: cards.reduce((sum, card) => sum + card.reviewCount, 0),
      correctReviews: cards.reduce((sum, card) => sum + card.correctCount, 0),
      injectedLessons: injectedLessons !== undefined ? injectedLessons : (existing?.injectedLessons || []),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const loadProgress = (): FlashCard[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const progress: LearningProgress = JSON.parse(stored);
    return progress.cards;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
};

export const loadFullProgress = (): LearningProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load full progress:', error);
    return null;
  }
};

export const loadInjectedLessons = (): string[] => {
  try {
    const progress = loadFullProgress();
    return progress?.injectedLessons || [];
  } catch (error) {
    console.error('Failed to load injected lessons:', error);
    return [];
  }
};

export const saveInjectedLessons = (lessonIds: string[]): void => {
  try {
    const progress = loadFullProgress();
    if (progress) {
      progress.injectedLessons = lessonIds;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch (error) {
    console.error('Failed to save injected lessons:', error);
  }
};

export const clearProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear progress:', error);
  }
};
