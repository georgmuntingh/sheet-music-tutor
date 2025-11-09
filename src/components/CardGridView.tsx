import React from 'react';
import { FlashCard } from '../types';
import { MusicNotation } from './MusicNotation';
import './CardGridView.css';

interface CardGridViewProps {
  cards: FlashCard[];
  title: string;
  onClose: () => void;
}

const CardGridView: React.FC<CardGridViewProps> = ({ cards, title, onClose }) => {
  const renderCardContent = (card: FlashCard) => {
    if (card.mathProblem) {
      return (
        <div className="grid-card-content math-content">
          <div className="math-problem-text">
            {card.mathProblem.question}
          </div>
        </div>
      );
    }

    // For music cards (note or chord)
    return (
      <div className="grid-card-content">
        <MusicNotation
          note={card.note}
          chord={card.chord}
          width={150}
          height={100}
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
        {cards.map((card) => (
          <div key={card.id} className="grid-card">
            <div className="grid-card-header">
              <span className="grid-box-info">Box {card.boxNumber + 1}</span>
              <span className="grid-stats">
                {card.reviewCount > 0 && (
                  <>{card.correctCount}/{card.reviewCount}</>
                )}
              </span>
            </div>
            {renderCardContent(card)}
          </div>
        ))}
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
