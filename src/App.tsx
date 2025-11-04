import { useState, useEffect, useCallback } from 'react';
import { FlashCard as FlashCardType, Lesson, AppSettings, UserProfile } from './types';
import { FlashCard } from './components/FlashCard';
import { ProgressDisplay } from './components/ProgressDisplay';
import { Settings } from './components/Settings';
import UserProfileComponent from './components/UserProfile';
import { PianoPitchDetector } from './utils/pitchDetection';
import {
  initializeFlashCards,
  getNextCard,
  promoteCard,
  demoteCard,
  introduceCard,
} from './utils/leitnerSystem';
import { saveProgress, loadProgress } from './utils/storage';
import { loadSettings } from './utils/settingsStorage';
import {
  initializeDefaultProfiles,
  getUserProfiles,
  getCurrentUserId,
  setCurrentUserId,
  getUserProfile,
  createUserProfile,
  deleteUserProfile,
} from './utils/userStorage';
import { LESSONS } from './utils/lessons';
import './App.css';

function App() {
  // User profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Learning state
  const [cards, setCards] = useState<FlashCardType[]>([]);
  const [currentCard, setCurrentCard] = useState<FlashCardType | null>(null);
  const [injectedLessonIds, setInjectedLessonIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [detector] = useState(() => new PianoPitchDetector(settings.audioDetection));
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Inject lesson into stack (adds cards to existing stack)
  const injectLesson = useCallback((lesson: Lesson) => {
    if (!currentUser) return;

    // Don't inject if already injected
    if (injectedLessonIds.includes(lesson.id)) {
      return;
    }

    // Shuffle notes before creating flash cards for random injection order
    const shuffledNotes = shuffleArray(lesson.notes);
    const newCards = initializeFlashCards(shuffledNotes);
    const updatedCards = [...cards, ...newCards];
    const updatedInjectedIds = [...injectedLessonIds, lesson.id];

    setCards(updatedCards);
    setInjectedLessonIds(updatedInjectedIds);
    saveProgress(updatedCards, updatedInjectedIds, currentUser.id);

    const nextCard = getNextCard(updatedCards);
    if (nextCard) {
      // If it's a new card, introduce it
      if (nextCard.boxNumber === -1) {
        const introduced = introduceCard(nextCard);
        const cardsWithIntroduced = updatedCards.map(c =>
          c.id === introduced.id ? introduced : c
        );
        setCards(cardsWithIntroduced);
        setCurrentCard(introduced);
        saveProgress(cardsWithIntroduced, updatedInjectedIds, currentUser.id);
      } else {
        setCurrentCard(nextCard);
      }
    }
  }, [cards, injectedLessonIds, currentUser]);

  // Initialize user profiles on mount
  useEffect(() => {
    const profiles = initializeDefaultProfiles();
    setAllUsers(profiles);

    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      const user = getUserProfile(currentUserId);
      if (user) {
        setCurrentUser(user);
      } else if (profiles.length > 0) {
        // Fallback to first profile if saved user not found
        setCurrentUser(profiles[0]);
        setCurrentUserId(profiles[0].id);
      }
    } else if (profiles.length > 0) {
      // No current user, set first profile as default
      setCurrentUser(profiles[0]);
      setCurrentUserId(profiles[0].id);
    }

    // Cleanup detector on unmount
    return () => {
      detector.stop();
    };
  }, [detector]);

  // Load user-specific data when current user changes
  useEffect(() => {
    if (!currentUser) return;

    // Load user-specific settings
    const userSettings = loadSettings(currentUser.id);
    setSettings(userSettings);

    // Load user-specific progress
    const savedProgress = loadProgress(currentUser.id);
    if (savedProgress && savedProgress.cards.length > 0) {
      setCards(savedProgress.cards);
      setInjectedLessonIds(savedProgress.injectedLessonIds || []);

      const nextCard = getNextCard(savedProgress.cards);
      if (nextCard) {
        if (nextCard.boxNumber === -1) {
          const introduced = introduceCard(nextCard);
          const updatedCards = savedProgress.cards.map(c =>
            c.id === introduced.id ? introduced : c
          );
          setCards(updatedCards);
          setCurrentCard(introduced);
          saveProgress(updatedCards, savedProgress.injectedLessonIds || [], currentUser.id);
        } else {
          setCurrentCard(nextCard);
        }
      }
    } else {
      // Start with empty stack - show lesson selector
      setCards([]);
      setInjectedLessonIds([]);
      setCurrentCard(null);
    }
  }, [currentUser]);

  // Start countdown before listening
  const startListening = () => {
    setCountdown(3);
    setError(null);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished, start actual listening
      actuallyStartListening();
      setCountdown(null);
    }
  }, [countdown]);

  // Actually start listening after countdown
  const actuallyStartListening = async () => {
    setIsInitializing(true);

    try {
      await detector.initialize();
      setIsListening(true);
      setIsInitializing(false);
      setIsPaused(false);

      // Start pitch detection loop
      detectPitchLoop();
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access and try again.');
      setIsInitializing(false);
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    detector.stop();
    setIsListening(false);
    setDetectedNote(null);
  };

  // Toggle pause/continue
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Pitch detection loop
  const detectPitchLoop = useCallback(async () => {
    if (!detector.getIsRunning()) return;

    const note = await detector.detectPitchStable(300, 2);
    if (note) {
      setDetectedNote(`${note.name}${note.octave}`);
    }

    // Continue detection if still listening
    if (detector.getIsRunning()) {
      setTimeout(detectPitchLoop, 100);
    }
  }, [detector]);

  // Handle correct answer
  const handleCorrect = useCallback(() => {
    if (!currentCard || !currentUser) return;

    const promoted = promoteCard(currentCard, settings.rehearsal);
    const updatedCards = cards.map(c => c.id === promoted.id ? promoted : c);
    setCards(updatedCards);
    saveProgress(updatedCards, injectedLessonIds, currentUser.id);

    // Get next card immediately (FlashCard.tsx handles visual delay)
    setDetectedNote(null);
    const nextCard = getNextCard(updatedCards);

    if (nextCard) {
      if (nextCard.boxNumber === -1) {
        const introduced = introduceCard(nextCard);
        const cardsWithIntroduced = updatedCards.map(c =>
          c.id === introduced.id ? introduced : c
        );
        setCards(cardsWithIntroduced);
        setCurrentCard(introduced);
        saveProgress(cardsWithIntroduced, injectedLessonIds, currentUser.id);
      } else {
        setCurrentCard(nextCard);
      }
    } else {
      setCurrentCard(null);
    }
  }, [currentCard, cards, settings, injectedLessonIds, currentUser]);

  // Handle incorrect answer
  const handleIncorrect = useCallback(() => {
    if (!currentCard || !currentUser) return;

    const demoted = demoteCard(currentCard, settings.rehearsal);
    const updatedCards = cards.map(c => c.id === demoted.id ? demoted : c);
    setCards(updatedCards);
    saveProgress(updatedCards, injectedLessonIds, currentUser.id);

    // Get next card immediately (FlashCard.tsx handles visual delay)
    setDetectedNote(null);
    const nextCard = getNextCard(updatedCards);

    if (nextCard) {
      if (nextCard.boxNumber === -1) {
        const introduced = introduceCard(nextCard);
        const cardsWithIntroduced = updatedCards.map(c =>
          c.id === introduced.id ? introduced : c
        );
        setCards(cardsWithIntroduced);
        setCurrentCard(introduced);
        saveProgress(cardsWithIntroduced, injectedLessonIds, currentUser.id);
      } else {
        setCurrentCard(nextCard);
      }
    } else {
      setCurrentCard(null);
    }
  }, [currentCard, cards, settings, injectedLessonIds, currentUser]);

  // Handle manual next card (for backup button)
  const handleNextCard = useCallback(() => {
    if (!currentUser) return;

    setDetectedNote(null);
    const nextCard = getNextCard(cards);

    if (nextCard) {
      if (nextCard.boxNumber === -1) {
        const introduced = introduceCard(nextCard);
        const updatedCards = cards.map(c =>
          c.id === introduced.id ? introduced : c
        );
        setCards(updatedCards);
        setCurrentCard(introduced);
        saveProgress(updatedCards, injectedLessonIds, currentUser.id);
      } else {
        setCurrentCard(nextCard);
      }
    } else {
      setCurrentCard(null);
    }
  }, [cards, injectedLessonIds, currentUser]);

  // Reset progress
  const resetProgress = () => {
    if (!currentUser) return;

    if (confirm('Are you sure you want to reset all progress for this user?')) {
      setCards([]);
      setInjectedLessonIds([]);
      setCurrentCard(null);
      saveProgress([], [], currentUser.id);
    }
  };

  // Handle user profile changes
  const handleUserChange = (userId: string) => {
    const user = getUserProfile(userId);
    if (user) {
      // Stop listening when switching users
      if (isListening) {
        stopListening();
      }

      setCurrentUser(user);
      setCurrentUserId(userId);
    }
  };

  const handleCreateUser = (name: string) => {
    createUserProfile(name);
    setAllUsers(getUserProfiles());
    // Don't auto-switch to new user, keep current user active
  };

  const handleDeleteUser = (userId: string) => {
    if (allUsers.length <= 1) {
      alert('Cannot delete the last user profile!');
      return;
    }

    deleteUserProfile(userId);
    const remainingUsers = getUserProfiles();
    setAllUsers(remainingUsers);

    // If we deleted the current user, switch to first remaining user
    if (currentUser?.id === userId && remainingUsers.length > 0) {
      setCurrentUser(remainingUsers[0]);
      setCurrentUserId(remainingUsers[0].id);
    }
  };

  // Handle settings changes
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Update detector settings in real-time
    detector.updateSettings(newSettings.audioDetection);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🎹 Piano Sheet Music Tutor</h1>
            <p className="subtitle">Learn to read piano sheet music with spaced repetition</p>
          </div>
          <UserProfileComponent
            currentUser={currentUser}
            allUsers={allUsers}
            onUserChange={handleUserChange}
            onCreateUser={handleCreateUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!currentCard && (
          <div className="lesson-selector">
            <h2>Select a Lesson to Inject into Stack</h2>
            <p className="lesson-hint">
              {cards.length === 0
                ? "Get started by selecting your first lesson!"
                : "All cards reviewed! Choose another lesson to continue learning."}
            </p>
            <div className="lesson-grid">
              <div className="lesson-grid-header">
                <div className="lesson-grid-cell header">Natural Notes</div>
                <div className="lesson-grid-cell header">Sharps & Flats</div>
              </div>
              <div className="lesson-grid-row">
                {[LESSONS[0], LESSONS[3]].map((lesson) => {
                  const isInjected = injectedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => injectLesson(lesson)}
                      disabled={isInjected}
                      className={isInjected ? 'lesson-button injected' : 'lesson-button'}
                    >
                      <strong>{lesson.name}</strong>
                      <span className="lesson-description">{lesson.description}</span>
                      {isInjected && <span className="injected-badge">✓ Injected</span>}
                    </button>
                  );
                })}
              </div>
              <div className="lesson-grid-row">
                {[LESSONS[1], LESSONS[4]].map((lesson) => {
                  const isInjected = injectedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => injectLesson(lesson)}
                      disabled={isInjected}
                      className={isInjected ? 'lesson-button injected' : 'lesson-button'}
                    >
                      <strong>{lesson.name}</strong>
                      <span className="lesson-description">{lesson.description}</span>
                      {isInjected && <span className="injected-badge">✓ Injected</span>}
                    </button>
                  );
                })}
              </div>
              <div className="lesson-grid-row">
                {[LESSONS[2], LESSONS[5]].map((lesson) => {
                  const isInjected = injectedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => injectLesson(lesson)}
                      disabled={isInjected}
                      className={isInjected ? 'lesson-button injected' : 'lesson-button'}
                    >
                      <strong>{lesson.name}</strong>
                      <span className="lesson-description">{lesson.description}</span>
                      {isInjected && <span className="injected-badge">✓ Injected</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="controls">
          {!isListening && !isInitializing && countdown === null && (
            <button onClick={startListening} className="primary-button">
              🎤 Start Listening
            </button>
          )}

          {countdown !== null && countdown > 0 && (
            <div className="countdown-display">
              <h2>Get ready...</h2>
              <div className="countdown-number">{countdown}</div>
            </div>
          )}

          {isInitializing && (
            <button disabled className="primary-button">
              Initializing microphone...
            </button>
          )}

          {isListening && (
            <>
              <button onClick={stopListening} className="danger-button">
                ⏹ Stop Listening
              </button>
              <button onClick={togglePause} className="secondary-button">
                {isPaused ? '▶️ Continue' : '⏸ Pause'}
              </button>
            </>
          )}

          <button
            onClick={() => setShowProgress(!showProgress)}
            className="secondary-button"
          >
            {showProgress ? '📚 Hide' : '📊 Show'} Progress
          </button>

          <button onClick={resetProgress} className="secondary-button">
            🔄 Reset Progress
          </button>

          <button onClick={() => setShowSettings(true)} className="secondary-button">
            ⚙️ Settings
          </button>
        </div>

        {showProgress && <ProgressDisplay cards={cards} />}
        {showSettings && currentUser && <Settings
          userId={currentUser.id}
          onClose={() => {
            setShowSettings(false);
            const updatedSettings = loadSettings(currentUser.id);
            setSettings(updatedSettings);
            detector.updateSettings(updatedSettings.audioDetection);
          }}
          onSettingsChange={handleSettingsChange}
        />}

        {currentCard && (
          <FlashCard
            card={currentCard}
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
            onNextCard={handleNextCard}
            isListening={isListening}
            detectedNote={detectedNote}
            isPaused={isPaused}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Play notes on your piano. The app uses your microphone to detect which note you play.
        </p>
        <p className="tip">
          <strong>Tip:</strong> Make sure you're in a quiet environment for best results.
        </p>
      </footer>
    </div>
  );
}

export default App;
