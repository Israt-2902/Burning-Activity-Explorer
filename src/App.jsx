import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import GlobeView from './components/GlobeView';
import TacticalMapView from './components/TacticalMapView';
import ActivityLegend from './components/ActivityLegend';
import RegionPanel from './components/RegionPanel';
import InfoModal from './components/InfoModal';
import DivisionFocus from './components/DivisionFocus';
import { FOCUS_REGIONS } from './data/bangladeshAreas';
import { generateHexData, getDefaultHexId } from './data/hexData';
import { getMonthlyDataForRegion } from './data/monthlyData';
import { SATELLITE_INFO } from './data/satelliteInfo';
import { FIRE_META } from './data/hexData';
import { PanelRightOpen } from 'lucide-react';
import './styles.css';

export default function App() {
  const [selectedYear, setSelectedYear] = useState(FIRE_META.year);
  const [viewMode, setViewMode] = useState('globe'); // 'globe' | 'map'
  const [hoveredHex, setHoveredHex] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState(null);
  const [activeFocus, setActiveFocus] = useState('Bangladesh');

  // Hexagonal grid built from the NASA FIRMS detections
  const hexData = useMemo(() => {
    return generateHexData();
  }, []);

  // Start on the most active cell in the feed
  const [selectedHexId, setSelectedHexId] = useState(() => getDefaultHexId(hexData));

  // Selected region object
  const selectedRegion = useMemo(() => {
    return hexData.find(h => h.id === selectedHexId) || hexData[0];
  }, [hexData, selectedHexId]);

  // Monthly activity calendar for the selected region and year
  const monthlyData = useMemo(() => {
    return getMonthlyDataForRegion(selectedRegion, selectedYear);
  }, [selectedRegion, selectedYear]);

  // Handler for selecting a hexagon
  const handleSelectHex = (hex) => {
    if (!hex) return;
    setSelectedHexId(hex.id);
    setIsPanelOpen(true);
  };

  const handleFocus = (name) => {
    setActiveFocus(name);
    setFocusRequest({ ...FOCUS_REGIONS[name], key: Date.now() });
  };

  const handleSelectAreaId = (id) => {
    const hex = hexData.find(h => h.id === id);
    if (hex) handleSelectHex(hex);
  };

  return (
    <div className="app-container">
      {/* Sci-Fi HUD scanline texture */}
      <div className="hud-scanline-overlay" />

      {/* Main Header with View Mode Switcher */}
      <Header 
        selectedYear={selectedYear}
        onSelectYear={(yr) => setSelectedYear(yr)}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
      />

      {/* Main Visual Elements: 3D Earth vs Google Satellite Map */}
      {viewMode === 'globe' ? (
        <GlobeView 
          hexData={hexData}
          selectedHexId={selectedHexId}
          onSelectHex={handleSelectHex}
          hoveredHex={hoveredHex}
          setHoveredHex={setHoveredHex}
          focusRequest={focusRequest}
        />
      ) : (
        <TacticalMapView 
          hexData={hexData}
          selectedHexId={selectedHexId}
          onSelectHex={handleSelectHex}
          focusRequest={focusRequest}
        />
      )}

      {/* Quick focus: Bangladesh / Rajshahi / Chattogram */}
      <DivisionFocus onFocus={handleFocus} active={activeFocus} />

      {/* Floating Legend */}
      <ActivityLegend />

      {/* Re-open panel trigger button if minimized */}
      {!isPanelOpen && (
        <button 
          id="reopen-panel-btn"
          onClick={() => setIsPanelOpen(true)}
          style={{
            position: 'absolute',
            top: '80px',
            right: '24px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: 'var(--accent-cyan-bright)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            zIndex: 15,
            boxShadow: 'var(--shadow-panel)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          title="Open Region Telemetry & Burning Calendar"
        >
          <PanelRightOpen size={16} />
          <span>Open Telemetry Panel</span>
        </button>
      )}

      {/* Selected Region & Burning Activity Calendar Panel */}
      <RegionPanel 
        region={selectedRegion}
        monthlyData={monthlyData}
        areas={hexData}
        onSelectAreaId={handleSelectAreaId}
        selectedYear={selectedYear}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      {/* Floating Disclaimer Label (Section 18) */}
      <div className="floating-disclaimer" title="Data Transparency Notice">
        {SATELLITE_INFO.harmonizationProtocol.disclaimer}
      </div>

      {/* Project Information & NASA Details Modal */}
      <InfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
