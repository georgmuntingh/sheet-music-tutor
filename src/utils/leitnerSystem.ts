import { FlashCard, LeitnerBox, Note, RehearsalSettings } from '../types';
import { generateNoteSet } from './noteUtils';
import { loadSettings } from './settingsStorage';

// Leitner system configuration: 5 boxes with increasing intervals
export const LEITNER_BOXES: LeitnerBox[] = [
  { boxNumber: 0, intervalDays: 0 }, // New cards, review immediately
  { boxNumber: 1, intervalDays: 1 }, // Review after 1 day
  { boxNumber: 2, intervalDays: 3 }, // Review after 3 days
  { boxNumber: 3, intervalDays: 7 }, // Review after 7 days
  { boxNumber: 4, intervalDays: 14 }, // Review after 14 days
];

// Get interval in milliseconds based on settings
const getIntervalMs = (boxNumber: number, settings?: RehearsalSettings): number => {
  const currentSettings = settings || loadSettings();

  switch (boxNumber) {
    case 0: return currentSettings.box0Interval;
    case 1: return currentSettings.box1Interval;
    case 2: return currentSettings.box2Interval;
    case 3: return currentSettings.box3Interval;
    case 4: return currentSettings.box4Interval;
    default: return currentSettings.box0Interval;
  }
};

// Initialize flash cards for specific notes (or all notes if not specified)
export const initializeFlashCards = (notes?: Note[]): FlashCard[] => {
  const notesToUse = notes || generateNoteSet();

  return notesToUse.map((note, index) => ({
    id: `card-${note.name}${note.octave}-${index}`,
    note,
    boxNumber: -1, // -1 means not yet introduced
    lastReviewDate: 0,
    nextReviewDate: 0,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
  }));
};

// Get cards that are due for review
export const getDueCards = (cards: FlashCard[]): FlashCard[] => {
  const now = Date.now();
  return cards.filter(card =>
    card.boxNumber >= 0 && card.nextReviewDate <= now
  );
};

// Get a new card that hasn't been introduced yet
export const getNewCard = (cards: FlashCard[]): FlashCard | null => {
  const newCards = cards.filter(card => card.boxNumber === -1);
  return newCards.length > 0 ? newCards[0] : null;
};

// Get the next card to study (due card or new card)
export const getNextCard = (cards: FlashCard[], excludeCardId?: string): FlashCard | null => {
  const dueCards = getDueCards(cards);

  // Filter out the excluded card if specified
  const availableCards = excludeCardId
    ? dueCards.filter(card => card.id !== excludeCardId)
    : dueCards;

  if (availableCards.length > 0) {
    // Return a random due card to add variety
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }

  // If no due cards, introduce a new card
  return getNewCard(cards);
};

// Move card to next box (correct answer)
export const promoteCard = (card: FlashCard, settings?: RehearsalSettings): FlashCard => {
  const now = Date.now();
  const newBoxNumber = Math.min(card.boxNumber + 1, LEITNER_BOXES.length - 1);
  const intervalMs = getIntervalMs(newBoxNumber, settings);

  return {
    ...card,
    boxNumber: newBoxNumber,
    lastReviewDate: now,
    nextReviewDate: now + intervalMs,
    reviewCount: card.reviewCount + 1,
    correctCount: card.correctCount + 1,
  };
};

// Move card to first box (incorrect answer)
export const demoteCard = (card: FlashCard, settings?: RehearsalSettings): FlashCard => {
  const now = Date.now();
  const intervalMs = getIntervalMs(0, settings);

  return {
    ...card,
    boxNumber: 0,
    lastReviewDate: now,
    nextReviewDate: now + intervalMs,
    reviewCount: card.reviewCount + 1,
    incorrectCount: card.incorrectCount + 1,
  };
};

// Introduce a new card (move from -1 to box 0)
export const introduceCard = (card: FlashCard): FlashCard => {
  const now = Date.now();
  return {
    ...card,
    boxNumber: 0,
    lastReviewDate: now,
    nextReviewDate: now,
  };
};

// Get statistics for progress tracking
export const getStatistics = (cards: FlashCard[]) => {
  const activeCards = cards.filter(card => card.boxNumber >= 0);
  const totalReviews = activeCards.reduce((sum, card) => sum + card.reviewCount, 0);
  const totalCorrect = activeCards.reduce((sum, card) => sum + card.correctCount, 0);
  const accuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

  const boxDistribution = LEITNER_BOXES.map(box => ({
    boxNumber: box.boxNumber,
    count: activeCards.filter(card => card.boxNumber === box.boxNumber).length,
  }));

  return {
    totalCards: cards.length,
    activeCards: activeCards.length,
    newCards: cards.filter(card => card.boxNumber === -1).length,
    dueCards: getDueCards(cards).length,
    totalReviews,
    totalCorrect,
    accuracy: accuracy.toFixed(1),
    boxDistribution,
  };
};
