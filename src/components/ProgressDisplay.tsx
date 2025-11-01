import { FlashCard } from '../types';
import { getStatistics } from '../utils/leitnerSystem';
import './ProgressDisplay.css';

interface ProgressDisplayProps {
  cards: FlashCard[];
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ cards }) => {
  const stats = getStatistics(cards);

  return (
    <div className="progress-display">
      <h2>Learning Progress</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.activeCards}</div>
          <div className="stat-label">Active Cards</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.newCards}</div>
          <div className="stat-label">New Cards</div>
        </div>

        <div className="stat-card">
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
            <div key={box.boxNumber} className="box">
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
