import React from 'react';
import { Flame, Info, Sparkles, Globe as GlobeIcon, Map } from 'lucide-react';
import { AVAILABLE_YEARS } from '../data/monthlyData';
import { FIRE_META } from '../data/hexData';

export default function Header({ 
  selectedYear, 
  onSelectYear, 
  onOpenInfoModal,
  viewMode = 'globe',
  onChangeViewMode
}) {
  return (
    <header className="site-header">
      {/* Brand & Mission Identity */}
      <div className="header-brand">
        <div className="nasa-meatball-badge" title="NASA Space Apps Challenge 2026">
          <Flame size={20} color="#fc3d21" />
          <div className="nasa-vector-chevron"></div>
        </div>

        <div className="brand-text-block">
          <div className="brand-team-tag">
            <Sparkles size={11} />
            <span>TEAM STERION • NASA SPACE APPS 2026</span>
          </div>
          <h1 className="brand-title">
            Burning Activity Explorer
          </h1>
          <p className="brand-subtitle">
            Harmonizing MODIS + VIIRS fire observations
          </p>
        </div>
      </div>

      {/* Status & Controls */}
      <div className="header-actions">
        {/* View Mode Switcher: 3D Globe vs Google Satellite Map */}
        <div className="view-mode-switcher" title="Toggle Visualization Perspective">
          <button 
            id="mode-switch-globe-btn"
            className={`mode-switch-btn ${viewMode === 'globe' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('globe')}
            title="3D Interactive Earth Globe"
          >
            <GlobeIcon size={14} />
            <span>3D Earth</span>
          </button>
          <button 
            id="mode-switch-map-btn"
            className={`mode-switch-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('map')}
            title="Google Satellite / Tactical Map View with Deep Zoom"
          >
            <Map size={14} />
            <span>Satellite Map</span>
          </button>
        </div>

        {/* Year Selector */}
        <div className="year-selector-wrap" title="Select Observation Year">
          <span className="year-selector-label">Year:</span>
          <select 
            id="year-select-dropdown"
            className="year-select-dropdown"
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
          >
            {AVAILABLE_YEARS.map(item => (
              <option key={item.year} value={item.year}>
                {item.year}
              </option>
            ))}
          </select>
        </div>

        {/* Data Status Indicator */}
        <div className="data-status-pill" title={`${FIRE_META.total.toLocaleString()} MODIS + VIIRS detections • last observation ${FIRE_META.lastObservation}`}>
          <span className="status-pulsing-dot"></span>
          <span>NASA FIRMS • {FIRE_META.startLabel.slice(0, 6).toUpperCase()}–{FIRE_META.endLabel.slice(0, 6).toUpperCase()}</span>
        </div>

        {/* Settings / Info Modal Trigger */}
        <button 
          id="info-modal-trigger-btn"
          className="header-icon-btn" 
          onClick={onOpenInfoModal}
          title="Project Methodology & NASA Information"
          aria-label="NASA Mission Information"
        >
          <Info size={18} />
        </button>
      </div>
    </header>
  );
}
