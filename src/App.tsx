import { useState, useEffect, useCallback } from 'react';
import { FlashCard as FlashCardType, Lesson, RehearsalSettings } from './types';
import { FlashCard } from './components/FlashCard';
import { ProgressDisplay } from './components/ProgressDisplay';
import { Settings } from './components/Settings';
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

  // Load lesson function
  const loadLesson = useCallback((lesson: Lesson) => {
    const newCards = initializeFlashCards(lesson.notes);
    setCards(newCards);
    setCurrentLesson(lesson);
    saveProgress(newCards);

    const nextCard = getNextCard(newCards);
    if (nextCard) {
      // If it's a new card, introduce it
      if (nextCard.boxNumber === -1) {
        const introduced = introduceCard(nextCard);
        const updatedCards = newCards.map(c =>
          c.id === introduced.id ? introduced : c
        );
        setCards(updatedCards);
        setCurrentCard(introduced);
        saveProgress(updatedCards);
      } else {
        setCurrentCard(nextCard);
      }
    }
  }, []);

  // Initialize with first lesson on mount
  useEffect(() => {
    const savedCards = loadProgress();
    if (savedCards && savedCards.length > 0) {
      setCards(savedCards);
      const nextCard = getNextCard(savedCards);
      if (nextCard) {
        if (nextCard.boxNumber === -1) {
          const introduced = introduceCard(nextCard);
          const updatedCards = savedCards.map(c =>
            c.id === introduced.id ? introduced : c
          );
          setCards(updatedCards);
          setCurrentCard(introduced);
          saveProgress(updatedCards);
        } else {
          setCurrentCard(nextCard);
        }
      }
    } else {
      // Start with first lesson if no saved progress
      loadLesson(LESSONS[0]);
    }

    // Cleanup detector on unmount
    return () => {
      detector.stop();
    };
  }, [detector, loadLesson]);

  // Start listening for piano input
  const startListening = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await detector.initialize();
      setIsInitializing(false);

      // Start countdown from 3
      setCountdown(3);
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
    if (note) {
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
    saveProgress(updatedCards);

    // Get next card
    setTimeout(() => {
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
          saveProgress(cardsWithIntroduced);
        } else {
          setCurrentCard(nextCard);
        }
      } else {
        setCurrentCard(null);
      }
    }, 1000);
  }, [currentCard, cards, settings]);

  // Handle incorrect answer
  const handleIncorrect = useCallback(() => {
    if (!currentCard) return;

    const demoted = demoteCard(currentCard, settings);
    const updatedCards = cards.map(c => c.id === demoted.id ? demoted : c);
    setCards(updatedCards);
    saveProgress(updatedCards);

    // Get next card
    setTimeout(() => {
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
          saveProgress(cardsWithIntroduced);
        } else {
          setCurrentCard(nextCard);
        }
      } else {
        setCurrentCard(null);
      }
    }, 1500);
  }, [currentCard, cards, settings]);

  // Reset progress
  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      const newCards = initializeFlashCards();
      setCards(newCards);
      saveProgress(newCards);
      const nextCard = getNextCard(newCards);
      if (nextCard && nextCard.boxNumber === -1) {
        const introduced = introduceCard(nextCard);
        const updatedCards = newCards.map(c => c.id === introduced.id ? introduced : c);
        setCards(updatedCards);
        setCurrentCard(introduced);
        saveProgress(updatedCards);
      } else {
        setCurrentCard(nextCard);
      }
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
            <button disabled className="primary-button">
              Get ready... {countdown}
            </button>
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
            isListening={isListening}
            detectedNote={detectedNote}
          />
        ) : (
          <div className="no-cards">
            <h2>Congratulations!</h2>
            <p>You've reviewed all available cards.</p>
            <p>Come back later for more reviews.</p>
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
