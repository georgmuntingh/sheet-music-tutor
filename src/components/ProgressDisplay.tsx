import { useState } from 'react';
import { FlashCard } from '../types';
import { getStatistics, getDueCards } from '../utils/leitnerSystem';
import CardGridView from './CardGridView';
import './ProgressDisplay.css';

interface ProgressDisplayProps {
  cards: FlashCard[];
}

type CardFilter = {
  cards: FlashCard[];
  title: string;
} | null;

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ cards }) => {
  const stats = getStatistics(cards);
  const [selectedFilter, setSelectedFilter] = useState<CardFilter>(null);

  const handleActiveCardsClick = () => {
    const activeCards = cards.filter(card => card.boxNumber >= 0);
    setSelectedFilter({ cards: activeCards, title: 'Active Cards' });
  };

  const handleNewCardsClick = () => {
    const newCards = cards.filter(card => card.boxNumber === -1);
    setSelectedFilter({ cards: newCards, title: 'New Cards' });
  };

  const handleDueCardsClick = () => {
    const dueCards = getDueCards(cards);
    setSelectedFilter({ cards: dueCards, title: 'Due for Review' });
  };

  const handleBoxClick = (boxNumber: number) => {
    const boxCards = cards.filter(card => card.boxNumber === boxNumber);
    setSelectedFilter({ cards: boxCards, title: `Box ${boxNumber + 1}` });
  };

  const handleClose = () => {
    setSelectedFilter(null);
  };

  if (selectedFilter) {
    return (
      <CardGridView
        cards={selectedFilter.cards}
        title={selectedFilter.title}
        onClose={handleClose}
      />
    );
  }

  return (
    <div className="progress-display">
      <h2>Learning Progress</h2>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={handleActiveCardsClick}>
          <div className="stat-value">{stats.activeCards}</div>
          <div className="stat-label">Active Cards</div>
        </div>

        <div className="stat-card clickable" onClick={handleNewCardsClick}>
          <div className="stat-value">{stats.newCards}</div>
          <div className="stat-label">New Cards</div>
        </div>

        <div className="stat-card clickable" onClick={handleDueCardsClick}>
          <div className="stat-value">{stats.dueCards}</div>
          <div className="stat-label">Due for Review</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>

      <div className="box-distribution">
        <h3>Box Distribution</h3>
        <div className="boxes">
          {stats.boxDistribution.map((box) => (
            <div
              key={box.boxNumber}
              className="box clickable"
              onClick={() => handleBoxClick(box.boxNumber)}
            >
              <div className="box-header">Box {box.boxNumber + 1}</div>
              <div className="box-count">{box.count}</div>
              <div className="box-bar-container">
                <div
                  className="box-bar"
                  style={{
                    width: `${(box.count / stats.activeCards) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="total-reviews">
        <strong>Total Reviews:</strong> {stats.totalReviews} ({stats.totalCorrect} correct)
      </div>
    </div>
  );
};
