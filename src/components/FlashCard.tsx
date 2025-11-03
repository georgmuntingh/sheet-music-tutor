import { useState, useEffect } from 'react';
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

  const expectedNote = `${card.note.name}${card.note.octave}`;

  // Reset state when card changes
  useEffect(() => {
    setHasAnswered(false);
    setFeedback(null);
    setShowNote(false);
    setStableNote(null);

    return () => {
      if (detectionTimer) {
        clearTimeout(detectionTimer);
      }
    };
  }, [card.id]);

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
              setTimeout(() => {
                onCorrect();
              }, 1000);
            } else {
              setFeedback('incorrect');
              setHasAnswered(true);
              setTimeout(() => {
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
            setTimeout(() => {
              onCorrect();
            }, 1000);
          } else {
            setFeedback('incorrect');
            setHasAnswered(true);
            setTimeout(() => {
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
        <MusicNotation note={card.note} width={400} height={200} />
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
            Play the note shown above on your piano...
          </div>
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
