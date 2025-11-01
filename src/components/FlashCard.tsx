import { useState, useEffect } from 'react';
import { FlashCard as FlashCardType, RehearsalSettings } from '../types';
import { MusicNotation } from './MusicNotation';
import './FlashCard.css';

interface FlashCardProps {
  card: FlashCardType;
  onCorrect: () => void;
  onIncorrect: () => void;
  isListening: boolean;
  detectedNote: string | null;
  settings: RehearsalSettings;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  onCorrect,
  onIncorrect,
  isListening,
  detectedNote,
  settings,
}) => {
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [detectionTimer, setDetectionTimer] = useState<number | null>(null);
  const [stableNote, setStableNote] = useState<string | null>(null);
  const [timeoutTimer, setTimeoutTimer] = useState<number | null>(null);

  const expectedNote = `${card.note.name}${card.note.octave}`;

  // Clear timers when component unmounts or card changes
  useEffect(() => {
    return () => {
      if (detectionTimer) {
        clearTimeout(detectionTimer);
      }
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    };
  }, [detectionTimer, timeoutTimer, card.id]);

  // Start timeout timer when listening begins
  useEffect(() => {
    if (isListening && !feedback && !timeoutTimer) {
      const timer = setTimeout(() => {
        // Timeout - mark as incorrect
        setFeedback('incorrect');
        setTimeout(() => {
          onIncorrect();
          setFeedback(null);
          setShowNote(false);
          setStableNote(null);
        }, settings.feedbackLength);
      }, settings.timeoutLength);

      setTimeoutTimer(timer);
    }

    // Clear timeout if listening stops
    if (!isListening && timeoutTimer) {
      clearTimeout(timeoutTimer);
      setTimeoutTimer(null);
    }
  }, [isListening, feedback, timeoutTimer, onIncorrect, settings.timeoutLength, settings.feedbackLength]);

  // Handle note detection with delay
  useEffect(() => {
    if (!isListening || feedback) {
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
            if (detectedNote === expectedNote) {
              // Clear the timeout timer on correct answer
              if (timeoutTimer) {
                clearTimeout(timeoutTimer);
                setTimeoutTimer(null);
              }
              setFeedback('correct');
              setTimeout(() => {
                onCorrect();
                setFeedback(null);
                setShowNote(false);
                setStableNote(null);
              }, settings.feedbackLength);
            } else {
              setFeedback('incorrect');
              setTimeout(() => {
                onIncorrect();
                setFeedback(null);
                setShowNote(false);
                setStableNote(null);
              }, settings.feedbackLength);
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
          if (detectedNote === expectedNote) {
            // Clear the timeout timer on correct answer
            if (timeoutTimer) {
              clearTimeout(timeoutTimer);
              setTimeoutTimer(null);
            }
            setFeedback('correct');
            setTimeout(() => {
              onCorrect();
              setFeedback(null);
              setShowNote(false);
              setStableNote(null);
            }, settings.feedbackLength);
          } else {
            setFeedback('incorrect');
            setTimeout(() => {
              onIncorrect();
              setFeedback(null);
              setShowNote(false);
              setStableNote(null);
            }, settings.feedbackLength);
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
  }, [detectedNote, expectedNote, isListening, onCorrect, onIncorrect, feedback, detectionTimer, stableNote, timeoutTimer, settings.feedbackLength]);

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

        {isListening && !feedback && (
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
