import { useState, useEffect, useRef } from 'react';
import { FlashCard as FlashCardType } from '../types';
import { MusicNotation } from './MusicNotation';
import { areNotesEquivalent } from '../utils/noteUtils';
import './FlashCard.css';

interface FlashCardProps {
  card: FlashCardType;
  onCorrect: () => void;
  onIncorrect: () => void;
  onNextCard: () => void;
  isListening: boolean;
  detectedNote: string | null;
  isPaused: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  onCorrect,
  onIncorrect,
  onNextCard,
  isListening,
  detectedNote,
  isPaused,
}) => {
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [detectionTimer, setDetectionTimer] = useState<number | null>(null);
  const [stableNote, setStableNote] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [textInput, setTextInput] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const expectedNote = `${card.note.name}${card.note.octave}`;

  // Reset state when card changes
  useEffect(() => {
    setHasAnswered(false);
    setFeedback(null);
    setShowNote(false);
    setStableNote(null);
    setTextInput('');

    return () => {
      if (detectionTimer) {
        clearTimeout(detectionTimer);
      }
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [card.id]);

  // Auto-focus the input field when card changes and input is available
  useEffect(() => {
    // Use setTimeout to ensure the input is rendered after state updates
    const focusTimeout = setTimeout(() => {
      if (inputRef.current && !feedback && !hasAnswered && !isPaused) {
        inputRef.current.focus();
      }
    }, 0);

    return () => {
      clearTimeout(focusTimeout);
    };
  }, [card.id, feedback, hasAnswered, isPaused]);

  // Handle note detection with delay
  useEffect(() => {
    if (!isListening || feedback || isPaused || hasAnswered) {
      // Clear any pending timer when paused
      if (isPaused && detectionTimer) {
        clearTimeout(detectionTimer);
        setDetectionTimer(null);
        setStableNote(null);
      }
      return;
    }

    if (detectedNote) {
      // If we already have a timer running
      if (detectionTimer) {
        // If the note changed, clear the previous timer
        if (detectedNote !== stableNote) {
          clearTimeout(detectionTimer);
          setDetectionTimer(null);
          setStableNote(detectedNote);

          // Start a new timer for the new note
          const timer = setTimeout(() => {
            // After 500ms, make the judgment
            if (areNotesEquivalent(detectedNote, expectedNote)) {
              setFeedback('correct');
              setHasAnswered(true);
              feedbackTimerRef.current = setTimeout(() => {
                onCorrect();
              }, 1000);
            } else {
              setFeedback('incorrect');
              setHasAnswered(true);
              feedbackTimerRef.current = setTimeout(() => {
                onIncorrect();
              }, 1500);
            }
            setDetectionTimer(null);
          }, 500); // 0.5 second delay before judgment

          setDetectionTimer(timer);
        }
        // If note hasn't changed, timer continues
      } else {
        // No timer running yet, start one
        setStableNote(detectedNote);
        const timer = setTimeout(() => {
          // After 500ms, make the judgment
          if (areNotesEquivalent(detectedNote, expectedNote)) {
            setFeedback('correct');
            setHasAnswered(true);
            feedbackTimerRef.current = setTimeout(() => {
              onCorrect();
            }, 1000);
          } else {
            setFeedback('incorrect');
            setHasAnswered(true);
            feedbackTimerRef.current = setTimeout(() => {
              onIncorrect();
            }, 1500);
          }
          setDetectionTimer(null);
        }, 500); // 0.5 second delay before judgment

        setDetectionTimer(timer);
      }
    } else {
      // Note detection cleared, clear timer
      if (detectionTimer) {
        clearTimeout(detectionTimer);
        setDetectionTimer(null);
        setStableNote(null);
      }
    }
  }, [detectedNote, expectedNote, isListening, onCorrect, onIncorrect, feedback, detectionTimer, stableNote, isPaused, hasAnswered]);

  // Handle Enter key to dismiss feedback
  useEffect(() => {
    if (!feedback) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Clear the feedback timer
        if (feedbackTimerRef.current) {
          clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = null;
        }
        // Immediately trigger the next action
        if (feedback === 'correct') {
          onCorrect();
        } else {
          onIncorrect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [feedback, onCorrect, onIncorrect]);

  // Handle text input submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only process if not already answered and input is not empty
    if (hasAnswered || !textInput.trim()) {
      return;
    }

    // Clear any pending detection timer
    if (detectionTimer) {
      clearTimeout(detectionTimer);
      setDetectionTimer(null);
    }

    // Check if the text input matches the expected note
    if (areNotesEquivalent(textInput.trim(), expectedNote)) {
      setFeedback('correct');
      setHasAnswered(true);
      feedbackTimerRef.current = setTimeout(() => {
        onCorrect();
      }, 1000);
    } else {
      setFeedback('incorrect');
      setHasAnswered(true);
      feedbackTimerRef.current = setTimeout(() => {
        onIncorrect();
      }, 1500);
    }
  };

  return (
    <div className={`flash-card ${feedback || ''}`}>
      <div className="card-header">
        <div className="box-info">Box {card.boxNumber + 1}</div>
        <div className="stats">
          {card.reviewCount > 0 && (
            <span>
              {card.correctCount}/{card.reviewCount} correct
            </span>
          )}
        </div>
      </div>

      <div className="notation-container">
        <MusicNotation note={card.note} lessonId={card.lessonId} width={400} height={200} />
      </div>

      <div className="card-content">
        {!isListening && (
          <div className="instruction">Click "Start Listening" to begin</div>
        )}

        {isListening && isPaused && (
          <div className="instruction paused">
            Paused - Click "Continue" to resume
          </div>
        )}

        {isListening && !isPaused && !feedback && (
          <div className="instruction listening">
            Play the note shown above on your piano or type it below...
          </div>
        )}

        {!feedback && !hasAnswered && !isPaused && (
          <form onSubmit={handleTextSubmit} className="text-input-form">
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g., C4, D#5, Bb3"
              className="note-input"
              disabled={hasAnswered}
            />
            <button type="submit" className="submit-button" disabled={hasAnswered || !textInput.trim()}>
              Submit
            </button>
          </form>
        )}

        {feedback === 'correct' && (
          <div className="feedback correct-feedback">
            ✓ Correct! Well done!
          </div>
        )}

        {feedback === 'incorrect' && (
          <div className="feedback incorrect-feedback">
            ✗ Incorrect. The correct note is {card.note.name}{card.note.octave}
            {detectedNote && <div className="detected">You played: {detectedNote}</div>}
            {textInput && !detectedNote && <div className="detected">You typed: {textInput}</div>}
          </div>
        )}

        {detectedNote && isListening && !feedback && (
          <div className="detected-note">
            Detected: {detectedNote}
          </div>
        )}
      </div>

      {feedback && (
        <button
          className="next-card-button"
          onClick={onNextCard}
        >
          Next Card →
        </button>
      )}

      <button
        className="reveal-button"
        onClick={() => setShowNote(!showNote)}
      >
        {showNote ? 'Hide' : 'Reveal'} Answer
      </button>

      {showNote && (
        <div className="revealed-answer">
          {card.note.name}{card.note.octave}
        </div>
      )}
    </div>
  );
};
