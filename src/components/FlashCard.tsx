import { useState, useEffect } from 'react';
import { FlashCard as FlashCardType } from '../types';
import { MusicNotation } from './MusicNotation';
import './FlashCard.css';

interface FlashCardProps {
  card: FlashCardType;
  onCorrect: () => void;
  onIncorrect: () => void;
  isListening: boolean;
  detectedNote: string | null;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  onCorrect,
  onIncorrect,
  isListening,
  detectedNote,
}) => {
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showNote, setShowNote] = useState(false);

  const expectedNote = `${card.note.name}${card.note.octave}`;

  useEffect(() => {
    if (detectedNote && isListening) {
      if (detectedNote === expectedNote) {
        setFeedback('correct');
        setTimeout(() => {
          onCorrect();
          setFeedback(null);
          setShowNote(false);
        }, 1000);
      } else {
        setFeedback('incorrect');
        setTimeout(() => {
          onIncorrect();
          setFeedback(null);
          setShowNote(false);
        }, 1500);
      }
    }
  }, [detectedNote, expectedNote, isListening, onCorrect, onIncorrect]);

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
