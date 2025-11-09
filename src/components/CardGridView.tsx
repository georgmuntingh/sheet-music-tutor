import React, { useState } from 'react';
import { FlashCard } from '../types';
import { MusicNotation } from './MusicNotation';
import './CardGridView.css';

interface CardGridViewProps {
  cards: FlashCard[];
  title: string;
  onClose: () => void;
}

const CardGridView: React.FC<CardGridViewProps> = ({ cards, title, onClose }) => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const handleCardClick = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const renderCardContent = (card: FlashCard, isFlipped: boolean) => {
    if (card.mathProblem) {
      return (
        <div className="grid-card-content math-content">
          <div className="card-side-label">
            {isFlipped ? 'Answer' : 'Question'}
          </div>
          <div className="math-problem-text">
            {isFlipped ? card.mathProblem.answer : card.mathProblem.question}
          </div>
        </div>
      );
    }

    // For music cards (note or chord)
    if (isFlipped) {
      const answer = card.note
        ? `${card.note.name}${card.note.octave}`
        : card.chord
        ? `${card.chord.name} ${card.chord.type}`
        : '';

      return (
        <div className="grid-card-content card-answer">
          <div className="card-side-label">Answer</div>
          <div className="answer-text">
            {answer}
          </div>
        </div>
      );
    }

    return (
      <div className="grid-card-content">
        <div className="card-side-label">Question</div>
        <MusicNotation
          note={card.note}
          chord={card.chord}
          width={150}
          height={120}
        />
      </div>
    );
  };

  return (
    <div className="card-grid-view">
      <div className="grid-header">
        <h2>{title}</h2>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="grid-info">
        <p>{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="cards-grid">
        {cards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          return (
            <div
              key={card.id}
              className={`grid-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="grid-card-header">
                <span className="grid-box-info">Box {card.boxNumber + 1}</span>
                <span className="grid-stats">
                  {card.reviewCount > 0 && (
                    <>{card.correctCount}/{card.reviewCount}</>
                  )}
                </span>
              </div>
              {renderCardContent(card, isFlipped)}
            </div>
          );
        })}
      </div>

      {cards.length === 0 && (
        <div className="no-cards">
          <p>No cards in this category</p>
        </div>
      )}
    </div>
  );
};

export default CardGridView;
