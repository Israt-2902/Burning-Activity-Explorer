import React from 'react';
import { ACTIVITY_LEVELS } from '../utils/activityUtils';

export default function ActivityLegend() {
  const levels = [
    ACTIVITY_LEVELS.LOW,
    ACTIVITY_LEVELS.MODERATE,
    ACTIVITY_LEVELS.HIGH,
    ACTIVITY_LEVELS.VERY_HIGH
  ];

  return (
    <div className="floating-legend-panel" aria-label="Activity Legend">
      <div className="legend-header">
        <span>BURNING ACTIVITY</span>
      </div>
      <div className="legend-items-row">
        {levels.map(lvl => (
          <div key={lvl.key} className="legend-item" title={lvl.threshold}>
            <span 
              className="legend-color-dot" 
              style={{ backgroundColor: lvl.color, color: lvl.color }} 
            />
            <span>{lvl.key === 'VERY_HIGH' ? 'Very High' : lvl.key.charAt(0) + lvl.key.slice(1).toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
