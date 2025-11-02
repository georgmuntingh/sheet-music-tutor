import { useState, useEffect, useCallback } from 'react';
import { FlashCard as FlashCardType, Lesson, RehearsalSettings } from './types';
import { FlashCard } from './components/FlashCard';
import { ProgressDisplay } from './components/ProgressDisplay';
import { Settings } from './components/Settings';
import { PianoPitchDetector } from './utils/pitchDetection';
import {
  initializeFlashCards,
  promoteCard,
  demoteCard,
  introduceCard,
} from './utils/leitnerSystem';
import { saveProgress, loadProgress, loadInjectedLessons, saveInjectedLessons } from './utils/storage';
import { loadSettings } from './utils/settingsStorage';
import { LESSONS } from './utils/lessons';
import './App.css';

function App() {
  const [cards, setCards] = useState<FlashCardType[]>([]);
  const [currentCard, setCurrentCard] = useState<FlashCardType | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [detector] = useState(() => new PianoPitchDetector());
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [settings, setSettings] = useState<RehearsalSettings>(loadSettings());
  const [injectedLessons, setInjectedLessons] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  // @ts-ignore - cardQueue is used through setCardQueue functional updates
  const [cardQueue, setCardQueue] = useState<FlashCardType[]>([]);

  // Get next card from queue, repopulating if necessary
  // Returns [nextCard, updatedQueue] to avoid closure issues
  const getNextCardFromQueue = useCallback((allCards: FlashCardType[], currentQueue: FlashCardType[]): [FlashCardType | null, FlashCardType[]] => {
    // If queue has cards, return the first one and the remaining queue
    if (currentQueue.length > 0) {
      const nextCard = currentQueue[0];
      const remainingQueue = currentQueue.slice(1);
      return [nextCard, remainingQueue];
    }

    // Queue is empty, need to populate it with all ready cards
    const now = Date.now();
    const readyCards: FlashCardType[] = [];

    for (const card of allCards) {
      if (card.boxNumber === -1) {
        // New card - add only the first one we find, then stop
        readyCards.push(card);
        break;
      } else if (card.boxNumber >= 0 && card.nextReviewDate <= now) {
        // Due card that's already been introduced
        readyCards.push(card);
      }
    }

    if (readyCards.length === 0) {
      return [null, []];
    }

    // If we found a new card (boxNumber === -1), return it immediately without queuing others
    if (readyCards[0].boxNumber === -1) {
      return [readyCards[0], []];
    }

    // Return first ready card and queue the rest
    const nextCard = readyCards[0];
    const newQueue = readyCards.slice(1);
    return [nextCard, newQueue];
  }, []);

  // Load lesson function - injects cards into existing stack
  const loadLesson = useCallback((lesson: Lesson, isInitial: boolean = false) => {
    const newLessonCards = initializeFlashCards(lesson.notes);

    // Inject cards into existing stack instead of replacing
    const updatedCards = isInitial ? newLessonCards : [...cards, ...newLessonCards];

    setCards(updatedCards);
    setCurrentLesson(lesson);

    // Track this lesson as injected
    const updatedInjectedLessons = [...injectedLessons, lesson.id];
    setInjectedLessons(updatedInjectedLessons);
    saveInjectedLessons(updatedInjectedLessons);
    saveProgress(updatedCards, updatedInjectedLessons);

    // Clear the queue and get next card when loading a new lesson
    const [nextCard, newQueue] = getNextCardFromQueue(updatedCards, []);
    setCardQueue(newQueue);

    if (nextCard) {
      // If it's a new card, introduce it
      if (nextCard.boxNumber === -1) {
        const introduced = introduceCard(nextCard);
        const cardsWithIntroduced = updatedCards.map(c =>
          c.id === introduced.id ? introduced : c
        );
        setCards(cardsWithIntroduced);
        setCurrentCard(introduced);
        saveProgress(cardsWithIntroduced, updatedInjectedLessons);
      } else {
        setCurrentCard(nextCard);
      }
    }
  }, [cards, injectedLessons, getNextCardFromQueue]);

  // Initialize with first lesson on mount
  useEffect(() => {
    const savedCards = loadProgress();
    const savedInjectedLessons = loadInjectedLessons();
    setInjectedLessons(savedInjectedLessons);

    if (savedCards && savedCards.length > 0) {
      setCards(savedCards);
      const [nextCard, newQueue] = getNextCardFromQueue(savedCards, []);
      setCardQueue(newQueue);

      if (nextCard) {
        if (nextCard.boxNumber === -1) {
          const introduced = introduceCard(nextCard);
          const updatedCards = savedCards.map(c =>
            c.id === introduced.id ? introduced : c
          );
          setCards(updatedCards);
          setCurrentCard(introduced);
          saveProgress(updatedCards, savedInjectedLessons);
        } else {
          setCurrentCard(nextCard);
        }
      }
    } else {
      // Start with first lesson if no saved progress
      loadLesson(LESSONS[0], true);
    }

    // Cleanup detector on unmount
    return () => {
      detector.stop();
    };
  }, [detector, loadLesson, getNextCardFromQueue]);

  // Start listening for piano input
  const startListening = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await detector.initialize();
      setIsInitializing(false);

      // Start countdown
      const countdownSeconds = Math.ceil(settings.countdownDuration / 1000);
      setCountdown(countdownSeconds);

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            setIsListening(true);
            detectPitchLoop();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access and try again.');
      setIsInitializing(false);
      setIsListening(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, start listening
      setCountdown(null);
      setIsListening(true);
      setIsPaused(false);
      detectPitchLoop();
    }
  }, [countdown]);

  // Stop listening
  const stopListening = () => {
    detector.stop();
    setIsListening(false);
    setIsPaused(false);
    setCountdown(null);
    setDetectedNote(null);
    setCountdown(null);
    setIsPaused(false);
  };

  // Pause listening
  const pauseListening = () => {
    detector.stop();
    setIsPaused(true);
  };

  // Resume listening
  const resumeListening = () => {
    setIsPaused(false);
    detectPitchLoop();
  };

  // Pause listening
  const pauseListening = () => {
    setIsPaused(true);
  };

  // Continue listening
  const continueListening = () => {
    setIsPaused(false);
    detectPitchLoop();
  };

  // Pitch detection loop
  const detectPitchLoop = useCallback(async () => {
    if (!detector.getIsRunning() || isPaused) return;

    const note = await detector.detectPitchStable(300, 2);
    if (note && !isPaused) {
      setDetectedNote(`${note.name}${note.octave}`);
    }

    // Continue detection if still listening and not paused
    if (detector.getIsRunning() && !isPaused) {
      setTimeout(detectPitchLoop, 100);
    }
  }, [detector, isPaused]);

  // Handle correct answer
  const handleCorrect = useCallback(() => {
    if (!currentCard) return;

    const promoted = promoteCard(currentCard, settings);
    const updatedCards = cards.map(c => c.id === promoted.id ? promoted : c);
    setCards(updatedCards);
    saveProgress(updatedCards, injectedLessons);

    // Get next card from queue
    setTimeout(() => {
      setDetectedNote(null);

      // Use functional state update to get current queue
      setCardQueue((currentQueue: FlashCardType[]) => {
        const [nextCard, newQueue] = getNextCardFromQueue(updatedCards, currentQueue);

        if (nextCard) {
          if (nextCard.boxNumber === -1) {
            const introduced = introduceCard(nextCard);
            const cardsWithIntroduced = updatedCards.map(c =>
              c.id === introduced.id ? introduced : c
            );
            setCards(cardsWithIntroduced);
            setCurrentCard(introduced);
            saveProgress(cardsWithIntroduced, injectedLessons);
          } else {
            setCurrentCard(nextCard);
          }
        } else {
          setCurrentCard(null);
        }

        return newQueue;
      });
    }, 1000);
  }, [currentCard, cards, settings, injectedLessons, getNextCardFromQueue]);

  // Handle incorrect answer
  const handleIncorrect = useCallback(() => {
    if (!currentCard) return;

    const demoted = demoteCard(currentCard, settings);
    const updatedCards = cards.map(c => c.id === demoted.id ? demoted : c);
    setCards(updatedCards);
    saveProgress(updatedCards, injectedLessons);

    // Get next card from queue
    setTimeout(() => {
      setDetectedNote(null);

      // Use functional state update to get current queue
      setCardQueue((currentQueue: FlashCardType[]) => {
        const [nextCard, newQueue] = getNextCardFromQueue(updatedCards, currentQueue);

        if (nextCard) {
          if (nextCard.boxNumber === -1) {
            const introduced = introduceCard(nextCard);
            const cardsWithIntroduced = updatedCards.map(c =>
              c.id === introduced.id ? introduced : c
            );
            setCards(cardsWithIntroduced);
            setCurrentCard(introduced);
            saveProgress(cardsWithIntroduced, injectedLessons);
          } else {
            setCurrentCard(nextCard);
          }
        } else {
          setCurrentCard(null);
        }

        return newQueue;
      });
    }, 1500);
  }, [currentCard, cards, settings, injectedLessons, getNextCardFromQueue]);

  // Reset progress
  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      setCards([]);
      setCurrentCard(null);
      setInjectedLessons([]);
      setCardQueue([]);
      saveProgress([]);
      saveInjectedLessons([]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎹 Piano Sheet Music Tutor</h1>
        <p className="subtitle">Learn to read piano sheet music with spaced repetition</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!currentCard && cards.length === 0 && (
          <div className="lesson-selector">
            <h2>Select a Lesson</h2>
            <div className="lesson-buttons">
              {LESSONS.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => loadLesson(lesson)}
                  className={currentLesson?.id === lesson.id ? 'lesson-button active' : 'lesson-button'}
                >
                  <strong>{lesson.name}</strong>
                  <span className="lesson-description">{lesson.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="controls">
          {!isListening && !isInitializing && countdown === null && (
            <button onClick={startListening} className="primary-button">
              🎤 Start Listening
            </button>
          )}

          {isInitializing && (
            <button disabled className="primary-button">
              Initializing microphone...
            </button>
          )}

          {countdown !== null && (
            <div className="countdown-display">
              <div className="countdown-number">{countdown}</div>
              <div className="countdown-text">Get ready...</div>
            </div>
          )}

          {isListening && !isPaused && (
            <>
              <button onClick={pauseListening} className="warning-button">
                ⏸ Pause
              </button>
              <button onClick={stopListening} className="danger-button">
                ⏹ Stop Listening
              </button>
            </>
          )}

          {isListening && isPaused && (
            <>
              <button onClick={resumeListening} className="primary-button">
                ▶ Resume
              </button>
              <button onClick={stopListening} className="danger-button">
                ⏹ Stop Listening
              </button>
            </>
          )}

          {isListening && !isPaused && (
            <>
              <button onClick={pauseListening} className="warning-button">
                ⏸ Pause
              </button>
              <button onClick={stopListening} className="danger-button">
                ⏹ Stop Listening
              </button>
            </>
          )}

          {isListening && isPaused && (
            <>
              <button onClick={continueListening} className="primary-button">
                ▶️ Continue
              </button>
              <button onClick={stopListening} className="danger-button">
                ⏹ Stop Listening
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
        {showSettings && <Settings onClose={() => {
          setShowSettings(false);
          setSettings(loadSettings());
        }} />}

        {currentCard ? (
          <FlashCard
            card={currentCard}
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
            isListening={isListening && !isPaused}
            detectedNote={detectedNote}
            settings={settings}
          />
        ) : (
          <div className="lesson-selector">
            <h2>Select a Lesson to Inject</h2>
            <p className="lesson-info">
              No cards are currently due for review. Select a lesson to add more cards to your stack.
            </p>
            <div className="lesson-buttons">
              {LESSONS.map((lesson) => {
                const isInjected = injectedLessons.includes(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isInjected && loadLesson(lesson)}
                    className={isInjected ? 'lesson-button injected' : 'lesson-button'}
                    disabled={isInjected}
                  >
                    <strong>{lesson.name}</strong>
                    <span className="lesson-description">{lesson.description}</span>
                    {isInjected && <span className="injected-badge">✓ Injected</span>}
                  </button>
                );
              })}
            </div>
          </div>
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
