// src/components/PeriodSelector/PeriodSelector.jsx
import { getPeriodTimes } from '../../constants';
import './PeriodSelector.css';

const PeriodSelector = ({ periods, periodsList, selectedPeriod, selectedDate, onSelect }) => {
  return (
    <div className="period-selector-container">
      <div className="period-buttons-scroll">
        {periods.map((period) => {
          const { timeDisplay, isFriday } = getPeriodTimes(selectedDate, period, periodsList);
          const isSelected = selectedPeriod === period;
          const matchedPeriodObj = (periodsList || []).find(p => p.name === period);
          const isBreakOrLunch = matchedPeriodObj 
            ? (matchedPeriodObj.type === 'Break' || matchedPeriodObj.type === 'Lunch' || matchedPeriodObj.isBookable === false)
            : (period === 'Break' || period === 'Lunch');

          return (
            <button
              key={period}
              type="button"
              className={`period-chip ${isSelected ? 'selected' : ''} ${isBreakOrLunch ? 'break-chip' : ''}`}
              onClick={() => onSelect(period)}
            >
              <span className="period-title">{period}</span>
              <span className="period-time">{timeDisplay}</span>
              {isFriday && <span className="friday-indicator">Fri</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodSelector;
