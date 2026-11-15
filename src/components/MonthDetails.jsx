import React from 'react';
import { Calendar, X } from 'lucide-react';
import DailyTrendChart from './DailyTrendChart';
import WarningCard from './WarningCard';

export default function MonthDetails({ monthData, region, selectedYear, onClose }) {
  if (!monthData) return null;

  const {
    monthName,
    activityLevel,
    detections,
    modis,
    viirs,
    avgFRP,
    peakDate,
    dailyData = [],
    hasData
  } = monthData;

  const maxDaily = Math.max(1, ...dailyData.map((d) => d.detections));

  return (
    <div className="month-detail-panel">
      {/* Header */}
      <div className="month-detail-header">
        <div className="month-detail-title">
          <Calendar size={18} color="#38bdf8" />
          <span>{monthName.toUpperCase()} {selectedYear}</span>
        </div>
        {onClose && (
          <button
            className="panel-close-btn"
            onClick={onClose}
            title="Close Month Breakdown"
            aria-label="Close Month Breakdown"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {!hasData ? (
        <div className="historical-scientific-note" style={{ marginTop: '8px' }}>
          No NASA observations are loaded for {monthName} {selectedYear}. The current feed only covers
          the last 7 days.
        </div>
      ) : (
        <>
          {/* Warning when the cell is in the very-high class */}
          {region?.hasWarning && (
            <WarningCard
              title="VERY HIGH BURNING ACTIVITY"
              description="This cell has more than 40 satellite detections in the observed window."
              deltaText={`Observed: ${detections} detections • peak FRP ${region.maxFrp} MW`}
            />
          )}

          {/* Primary Statistics Grid */}
          <div className="month-detail-stats-grid">
            <div className="month-stat-item">
              <span className="month-stat-label">Activity Level</span>
              <span className="month-stat-val" style={{ color: activityLevel.color }}>
                {activityLevel.key === 'VERY_HIGH' ? 'VERY HIGH' : activityLevel.key}
              </span>
            </div>

            <div className="month-stat-item">
              <span className="month-stat-label">Total Detections</span>
              <span className="month-stat-val">{detections}</span>
            </div>

            <div className="month-stat-item">
              <span className="month-stat-label">MODIS Detections</span>
              <span className="month-stat-val" style={{ color: '#38bdf8' }}>{modis}</span>
            </div>

            <div className="month-stat-item">
              <span className="month-stat-label">VIIRS Detections</span>
              <span className="month-stat-val" style={{ color: '#818cf8' }}>{viirs}</span>
            </div>

            <div className="month-stat-item">
              <span className="month-stat-label">Average FRP</span>
              <span className="month-stat-val">{avgFRP} MW</span>
            </div>

            <div className="month-stat-item">
              <span className="month-stat-label">Peak Activity Date</span>
              <span className="month-stat-val" style={{ fontSize: '12px' }}>{peakDate}</span>
            </div>
          </div>

          {/* Daily Activity Sparkline */}
          {dailyData.length > 0 && (
            <div className="daily-timeline-section">
              <div className="daily-timeline-label">
                <span>Daily Fire Detections (Days 1–{dailyData.length})</span>
                <span style={{ color: '#38bdf8' }}>Peak: {peakDate}</span>
              </div>
              <div className="daily-sparkline-row">
                {dailyData.map((d) => {
                  const heightPct = d.hasData ? Math.max(8, (d.detections / maxDaily) * 100) : 8;
                  return (
                    <div
                      key={d.day}
                      className={`daily-sparkline-bar ${d.isPeak ? 'is-peak' : ''}`}
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: !d.hasData
                          ? 'rgba(255,255,255,0.06)'
                          : d.isPeak ? '#ef4444'
                          : d.detections >= maxDaily * 0.6 ? '#f97316'
                          : d.detections > 0 ? '#38bdf8'
                          : 'rgba(255,255,255,0.15)'
                      }}
                      title={d.hasData ? `Day ${d.day}: ${d.detections} detections` : `Day ${d.day}: no data`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily sensor breakdown */}
          <DailyTrendChart daily={region?.daily} />
        </>
      )}
    </div>
  );
}
