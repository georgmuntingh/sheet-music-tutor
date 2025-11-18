import { useState, useEffect, useRef, useCallback } from 'react';
import { FlashCard as FlashCardType, Note } from '../types';
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
  detectedChord: Note[] | null; // For chord detection
  isPaused: boolean;
  timeout: number; // Timeout in seconds (0 = infinite)
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  onCorrect,
  onIncorrect,
  onNextCard,
  isListening,
  detectedNote,
  detectedChord,
  isPaused,
  timeout,
}) => {
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [detectionTimer, setDetectionTimer] = useState<number | null>(null);
  const [stableNote, setStableNote] = useState<string | null>(null);
  const [stableChord, setStableChord] = useState<Note[] | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const timeoutTimerRef = useRef<number | null>(null);

  // Determine card type
  const isMathCard = !!card.mathProblem;
  const isChordCard = !!card.chord;
  const expectedNote = card.note ? `${card.note.name}${card.note.octave}` : '';
  const expectedChordName = card.chord ? card.chord.name : '';
  const expectedMathAnswer = card.mathProblem ? card.mathProblem.answer : '';

  // Helper function to check if detected chord matches expected chord
  // Compares note names only (ignoring octaves) since a chord can be played in any octave
  const chordMatches = useCallback((detected: Note[], expected: Note[]): boolean => {
    if (detected.length !== expected.length) {
      return false;
    }

    // Extract and sort note names (without octaves) for comparison
    const detectedNames = detected.map(n => n.name).sort();
    const expectedNames = expected.map(n => n.name).sort();

    // Check if all note names match (accounting for enharmonic equivalents)
    return detectedNames.every((name, index) => {
      const expectedName = expectedNames[index];
      // Use areNotesEquivalent but append a dummy octave for comparison
      return areNotesEquivalent(`${name}4`, `${expectedName}4`);
    });
  }, []);

  // Reset state when card changes
  useEffect(() => {
    setHasAnswered(false);
    setFeedback(null);
    setShowNote(false);
    setStableNote(null);
    setStableChord(null);
    setTextInput('');

    // Initialize timeout for boxes other than box 1 (boxNumber 0)
    if (timeout > 0 && card.boxNumber !== 0) {
      setRemainingTime(timeout);
    } else {
      setRemainingTime(null);
    }

    return () => {
      if (detectionTimer) {
        clearTimeout(detectionTimer);
      }
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      if (timeoutTimerRef.current) {
        clearInterval(timeoutTimerRef.current);
      }
    };
  }, [card.id, timeout, card.boxNumber]);

  // Handle timeout countdown
  useEffect(() => {
    // Don't start timer if:
    // - No timeout is set (remainingTime is null)
    // - User has already answered
    // - Feedback is being shown
    // - Session is paused
    if (remainingTime === null || hasAnswered || feedback || isPaused) {
      // Clear any running timer
      if (timeoutTimerRef.current) {
        clearInterval(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
      return;
    }

    // If time has run out, mark as incorrect
    if (remainingTime <= 0) {
      setFeedback('incorrect');
      setHasAnswered(true);
      feedbackTimerRef.current = setTimeout(() => {
        onIncorrect();
      }, 1500);
      return;
    }

    // Start countdown timer
    timeoutTimerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 0) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeoutTimerRef.current) {
        clearInterval(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    };
  }, [remainingTime, hasAnswered, feedback, isPaused, onIncorrect]);

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

  // Handle note/chord detection with delay
  useEffect(() => {
    if (!isListening || feedback || isPaused || hasAnswered) {
      // Clear any pending timer when paused
      if (isPaused && detectionTimer) {
        clearTimeout(detectionTimer);
        setDetectionTimer(null);
        setStableNote(null);
        setStableChord(null);
      }
      return;
    }

    // Handle chord detection
    if (isChordCard && detectedChord) {
      // Create a key for the detected chord
      const chordKey = detectedChord
        .map(n => `${n.name}${n.octave}`)
        .sort()
        .join('-');

      const stableChordKey = stableChord
        ? stableChord.map(n => `${n.name}${n.octave}`).sort().join('-')
        : null;

      // If we already have a timer running
      if (detectionTimer) {
        // If the chord changed, clear the previous timer
        if (chordKey !== stableChordKey) {
          clearTimeout(detectionTimer);
          setDetectionTimer(null);
          setStableChord(detectedChord);

          // Start a new timer for the new chord
          const timer = setTimeout(() => {
            // After 500ms, make the judgment
            if (card.chord && chordMatches(detectedChord, card.chord.notes)) {
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
          }, 500);

          setDetectionTimer(timer);
        }
      } else {
        // No timer running yet, start one
        setStableChord(detectedChord);
        const timer = setTimeout(() => {
          if (card.chord && chordMatches(detectedChord, card.chord.notes)) {
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
        }, 500);

        setDetectionTimer(timer);
      }
    } else if (!isChordCard && detectedNote) {
      // Handle single note detection
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
          }, 500);

          setDetectionTimer(timer);
        }
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
        }, 500);

        setDetectionTimer(timer);
      }
    } else {
      // Detection cleared, clear timer
      if (detectionTimer) {
        clearTimeout(detectionTimer);
        setDetectionTimer(null);
        setStableNote(null);
        setStableChord(null);
      }
    }
  }, [detectedNote, detectedChord, expectedNote, isChordCard, isListening, onCorrect, onIncorrect, feedback, detectionTimer, stableNote, stableChord, isPaused, hasAnswered, card.chord, chordMatches]);

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

    let isCorrect = false;

    if (isMathCard) {
      // For math problems, check if the input matches the expected answer
      isCorrect = textInput.trim() === expectedMathAnswer;
    } else if (isChordCard) {
      // For chords, just check if the input matches the chord name (case-insensitive)
      isCorrect = textInput.trim().toUpperCase() === expectedChordName.toUpperCase();
    } else {
      // For single notes, check if the input matches the expected note
      isCorrect = areNotesEquivalent(textInput.trim(), expectedNote);
    }

    if (isCorrect) {
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
          {remainingTime !== null && !feedback && (
            <span className={`timeout-display ${remainingTime <= 5 ? 'timeout-warning' : ''}`}>
              ⏱ {remainingTime}s
            </span>
          )}
        </div>
      </div>

      <div className="notation-container">
        {isMathCard ? (
          <div className="math-problem">
            <div className="math-question">{card.mathProblem?.question}</div>
          </div>
        ) : (
          <MusicNotation
            note={card.note}
            chord={card.chord}
            lessonId={card.lessonId}
            width={400}
            height={200}
          />
        )}
      </div>

      <div className="card-content">
        {!isListening && !isMathCard && (
          <div className="instruction">Click "Start Listening" to begin</div>
        )}

        {isListening && isPaused && !isMathCard && (
          <div className="instruction paused">
            Paused - Click "Continue" to resume
          </div>
        )}

        {isMathCard && !feedback && (
          <div className="instruction listening">
            Type your answer below...
          </div>
        )}

        {isListening && !isPaused && !feedback && !isMathCard && (
          <div className="instruction listening">
            {isChordCard
              ? 'Play the chord shown above on your piano or type the chord name below...'
              : 'Play the note shown above on your piano or type it below...'}
          </div>
        )}

        {!feedback && !hasAnswered && !isPaused && (
          <form onSubmit={handleTextSubmit} className="text-input-form">
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={isChordCard ? "e.g., C, D, F#" : "e.g., C4, D#5, Bb3"}
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
            {isChordCard ? (
              <>
                ✗ Incorrect. The correct chord is {expectedChordName} major
                {detectedChord && (
                  <div className="detected">
                    You played: {detectedChord.map(n => `${n.name}${n.octave}`).join(', ')}
                  </div>
                )}
                {textInput && !detectedChord && <div className="detected">You typed: {textInput}</div>}
              </>
            ) : (
              <>
                ✗ Incorrect. The correct note is {expectedNote}
                {detectedNote && <div className="detected">You played: {detectedNote}</div>}
                {textInput && !detectedNote && <div className="detected">You typed: {textInput}</div>}
              </>
            )}
          </div>
        )}

        {detectedNote && isListening && !feedback && !isChordCard && (
          <div className="detected-note">
            Detected: {detectedNote}
          </div>
        )}

        {detectedChord && isListening && !feedback && isChordCard && (
          <div className="detected-note">
            Detected: {detectedChord.map(n => `${n.name}${n.octave}`).join(', ')}
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
          {isChordCard
            ? `${expectedChordName} major (${card.chord!.notes.map(n => `${n.name}${n.octave}`).join(', ')})`
            : expectedNote}
        </div>
      )}
    </div>
  );
};
