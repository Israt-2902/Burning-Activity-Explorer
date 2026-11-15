import React, { useState } from 'react';
import { X, Flame, Radio, MapPin, TrendingUp } from 'lucide-react';
import SatelliteBreakdown from './SatelliteBreakdown';
import ActivityCalendar from './ActivityCalendar';
import MonthDetails from './MonthDetails';
import { FIRE_META } from '../data/hexData';
import ActivityHeatmap from './ActivityHeatmap';
import AlertRegistration from './AlertRegistration';

export default function RegionPanel({ 
  region, 
  monthlyData = [], 
  selectedYear = '2026',
  areas = [],
  onSelectAreaId,
  isOpen = true, 
  onClose 
}) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(FIRE_META.month); // Month covered by the NASA feed

  if (!region) return null;

  const currentMonthData = monthlyData.find(m => m.monthIndex === selectedMonthIndex) || monthlyData[FIRE_META.month];
  const level = region.activityLevel;

  return (
    <aside className={`right-info-panel-wrapper ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Header Bar */}
      <div className="panel-header-bar">
        <div className="panel-title-group">
          <span className="panel-pretitle">SELECTED REGION TELEMETRY</span>
          <h2 className="panel-title-text">
            <span>{region.name}</span>
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={11} color="#38bdf8" />
            <span>{region.subtext} • {region.district}</span>
          </span>
        </div>

        <button 
          className="panel-close-btn" 
          onClick={onClose}
          title="Minimize Region Panel"
          aria-label="Close Panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="panel-scroll-content">
        {/* Core Region Telemetry Grid (Section 6) */}
        <div className="telemetry-grid">
          {/* Burning Activity Status */}
          <div className="telemetry-card">
            <span className="telemetry-label">Burning Activity</span>
            <div 
              className="telemetry-value activity-badge"
              style={{
                backgroundColor: `${level.color}25`,
                color: level.color,
                border: `1px solid ${level.color}50`
              }}
            >
              <Flame size={14} />
              <span>{level.key === 'VERY_HIGH' ? 'VERY HIGH' : level.key}</span>
            </div>
            <span className="telemetry-subtext">{level.threshold}</span>
          </div>

          {/* Recent Detections */}
          <div className="telemetry-card">
            <span className="telemetry-label">Recent Detections</span>
            <span className="telemetry-value">
              {region.recentDetections}
            </span>
            <span className="telemetry-subtext">H3 Res 5 • {FIRE_META.startLabel.slice(0, 6)}–{FIRE_META.endLabel.slice(0, 6)}</span>
          </div>

          {/* Last Detection Timestamp */}
          <div className="telemetry-card span-two">
            <span className="telemetry-label">Last Detection</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={14} color="#38bdf8" />
              <span className="telemetry-value" style={{ fontSize: '15px' }}>
                {region.lastDetection}
              </span>
            </div>
            <span className="telemetry-subtext">Latest Satellite Overpass (UTC)</span>
          </div>

          {/* Fire Radiative Power (FRP) */}
          <div className="telemetry-card">
            <span className="telemetry-label">FRP (Radiative Power)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="telemetry-value" style={{ color: '#fb923c' }}>
                {region.frp}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>MW</span>
            </div>
            <span className="telemetry-subtext">Mean per detection • peak {region.maxFrp} MW</span>
          </div>

          {/* Sensor Info */}
          <div className="telemetry-card">
            <span className="telemetry-label">Sensor Harmonization</span>
            <span className="telemetry-value" style={{ fontSize: '15px', color: '#38bdf8' }}>
              {region.sensor}
            </span>
            <span className="telemetry-subtext">Sensors reporting in this cell</span>
          </div>

          {/* Historical Comparison */}
          <div className="telemetry-card span-two">
            <span className="telemetry-label">Regional Comparison</span>
            <div className="historical-diff-highlight">
              <TrendingUp size={15} />
              <span>{region.historicalComparison}</span>
            </div>
            <span className="telemetry-subtext">Percentile rank among active cells (no multi-year baseline loaded)</span>
          </div>
        </div>

        {/* Satellite Breakdown (Section 7) */}
        <SatelliteBreakdown 
          modisCount={region.modis ?? 0}
          viirsCount={region.viirs ?? 0}
        />

        {/* Heat map / histogram of daily activity by district */}
        <ActivityHeatmap
          areas={areas}
          selectedId={region.id}
          onSelect={onSelectAreaId}
        />

        {/* Burning Activity Calendar (Section 8) */}
        <ActivityCalendar 
          months={monthlyData}
          selectedMonthIndex={selectedMonthIndex}
          onSelectMonth={(index) => setSelectedMonthIndex(index)}
          regionName={region.name}
          selectedYear={selectedYear}
        />

        {/* Detailed Monthly Panel (Section 9, 10, 11) */}
        {currentMonthData && (
          <MonthDetails 
            monthData={currentMonthData}
            region={region}
            selectedYear={selectedYear}
          />
        )}

        {/* Email alert registration for preferred areas */}
        <AlertRegistration areas={areas} currentRegion={region} />
      </div>
    </aside>
  );
}
