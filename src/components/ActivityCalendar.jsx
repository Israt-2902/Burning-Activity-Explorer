import React from 'react';

export default function ActivityCalendar({ 
  months = [], 
  selectedMonthIndex, 
  onSelectMonth, 
  regionName = 'Selected Region',
  selectedYear = '2026'
}) {
  return (
    <div className="activity-calendar-section">
      <div className="calendar-header-row">
        <div className="calendar-title-box">
          <h3 className="calendar-title">Burning Activity Calendar</h3>
          <span className="calendar-subtitle">{regionName} • Year {selectedYear}</span>
        </div>
        <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
          12-MONTH VIEW • LIVE FEED
        </span>
      </div>

      {/* 3 x 4 Grid */}
      <div className="calendar-grid-3x4">
        {months.map((item) => {
          const isSelected = selectedMonthIndex === item.monthIndex;
          const level = item.activityLevel;
          const fillWidth = item.hasData ? Math.min(100, Math.max(10, (item.detections / 45) * 100)) : 0;

          return (
            <div
              key={item.monthIndex}
              className={`month-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectMonth(item.monthIndex)}
              style={{
                borderColor: isSelected ? 'var(--accent-cyan-bright)' : item.hasData ? level.border : 'rgba(148,163,184,0.18)',
                boxShadow: isSelected ? `0 0 16px ${level.glowColor}` : 'none',
                opacity: item.hasData ? 1 : 0.55
              }}
              title={`Click to view ${item.monthName} detailed satellite telemetry`}
            >
              <div className="month-card-top">
                <span className="month-name">{item.monthName}</span>
                <span 
                  className="month-activity-pill" 
                  style={{ 
                    backgroundColor: item.hasData ? `${level.color}25` : 'rgba(148,163,184,0.12)', 
                    color: item.hasData ? level.color : '#94a3b8',
                    border: `1px solid ${item.hasData ? level.color + '45' : 'rgba(148,163,184,0.25)'}`
                  }}
                >
                  {!item.hasData ? 'NO DATA' : level.key === 'VERY_HIGH' ? 'V. HIGH' : level.key}
                </span>
              </div>

              <div className="month-card-bottom">
                <span className="month-detection-count">
                  {item.hasData ? item.detections : '—'} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>{item.hasData ? 'detections' : ''}</span>
                </span>
                <div className="month-activity-bar">
                  <div 
                    className="month-activity-bar-fill" 
                    style={{ 
                      width: `${fillWidth}%`, 
                      backgroundColor: level.color 
                    }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
