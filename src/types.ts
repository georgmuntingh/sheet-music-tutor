// Musical note representation
export interface Note {
  name: string; // e.g., "C", "D#", "Eb"
  octave: number; // e.g., 4 for middle C
  frequency: number; // Hz
}

// Flash card representation
export interface FlashCard {
  id: string;
  note: Note;
  boxNumber: number; // 0-4 (5 boxes in Leitner system)
  lastReviewDate: number; // timestamp
  nextReviewDate: number; // timestamp
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

// Leitner box configuration
export interface LeitnerBox {
  boxNumber: number;
  intervalDays: number; // days until next review
}

// Lesson representation
export interface Lesson {
  id: string;
  name: string;
  description: string;
  notes: Note[];
}

// Learning progress state
export interface LearningProgress {
  cards: FlashCard[];
  currentCardId: string | null;
  totalReviews: number;
  correctReviews: number;
  currentLessonId?: string;
  injectedLessonIds: string[]; // Track which lessons have been injected into the stack
}

// Settings for rehearsal intervals (in milliseconds)
export interface RehearsalSettings {
  box0Interval: number; // Box 0 (new cards)
  box1Interval: number; // Box 1
  box2Interval: number; // Box 2
  box3Interval: number; // Box 3
  box4Interval: number; // Box 4
}

// Settings for audio detection
export interface AudioDetectionSettings {
  enableHarmonicRatio: boolean; // Enable harmonic ratio filtering
  harmonicRatioThreshold: number; // 0-1, minimum ratio to accept as piano sound
}

// Combined app settings
export interface AppSettings {
  rehearsal: RehearsalSettings;
  audioDetection: AudioDetectionSettings;
}

// User profile representation
export interface UserProfile {
  id: string; // Unique identifier for the user
  name: string; // Display name (e.g., "Ella", "Georg")
  createdAt: number; // Timestamp when profile was created
}
