import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe from 'globe.gl';
import { Plus, Minus, RotateCcw, Compass, Play, Pause, Navigation } from 'lucide-react';
import { DATA_FOCUS } from '../data/hexData';

export default function GlobeView({ 
  hexData = [], 
  selectedHexId, 
  onSelectHex,
  hoveredHex,
  setHoveredHex,
  focusRequest
}) {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showDistrictLabels, setShowDistrictLabels] = useState(true);
  const showLabelsRef = useRef(true);

  const selectedHex = useMemo(
    () => hexData.find(h => h.id === selectedHexId) || null,
    [hexData, selectedHexId]
  );

  // Every Bangladesh district name (shown when zoomed in) + label for the selected cell
  const labelsData = useMemo(() => {
    const labels = showDistrictLabels
      ? hexData
          .filter(h => h.isBangladesh && h.level === 'district')
          .map(h => ({
            lat: h.lat,
            lng: h.lng,
            text: h.name.replace(' District', ''),
            color: '#e2e8f0',
            size: 0.1,
            dotRadius: 0.035,
            altitude: 0.012
          }))
      : [];
    if (selectedHex) {
      labels.push({
        lat: selectedHex.lat - (selectedHex.level === 'place' ? 0.08 : 0.2),
        lng: selectedHex.lng,
        text: selectedHex.name.split(' (')[0],
        color: '#38bdf8',
        size: selectedHex.isBangladesh ? 0.14 : 0.32,
        dotRadius: selectedHex.isBangladesh ? 0.06 : 0.2,
        altitude: 0.04
      });
    }
    return labels;
  }, [selectedHex, hexData, showDistrictLabels]);

  // Concentric pulsing rings around the selected cell
  const ringsData = useMemo(() => (selectedHex ? [
    {
      lat: selectedHex.lat,
      lng: selectedHex.lng,
      maxRadius: 1.8,
      speed: 1.6,
      repeat: 1600,
      color: () => '#f97316'
    },
    {
      lat: selectedHex.lat,
      lng: selectedHex.lng,
      maxRadius: 1.2,
      speed: 2.2,
      repeat: 1100,
      color: () => '#38bdf8'
    }
  ] : []), [selectedHex]);

  // Helper for polygon cap colors
  const getCapColor = useCallback((d) => {
    const isSelected = d.id === selectedHexId;
    const isHovered = hoveredHex && hoveredHex.id === d.id;
    const baseColor = d.activityLevel?.color || '#38bdf8';

    if (isSelected) {
      return '#00e5ff'; // Bright cyan glow when selected
    }
    if (isHovered) {
      return '#ffffff'; // White highlight on hover
    }
    // High activity hexagons glow with good opacity
    const alphaMap = {
      'LOW': '90',
      'MODERATE': 'B0',
      'HIGH': 'D0',
      'VERY_HIGH': 'F0'
    };
    const alpha = alphaMap[d.activityLevel?.key] || 'B0';
    return `${baseColor}${alpha}`;
  }, [selectedHexId, hoveredHex]);

  // Helper for polygon side colors
  const getSideColor = useCallback((d) => {
    const isSelected = d.id === selectedHexId;
    const baseColor = d.activityLevel?.color || '#38bdf8';
    if (isSelected) return 'rgba(0, 229, 255, 0.6)';
    return `${baseColor}45`;
  }, [selectedHexId]);

  // Helper for 3D extrusion altitude
  const getAltitude = useCallback((d) => {
    const isSelected = d.id === selectedHexId;
    let baseAlt = d.activityLevel?.altitude || 0.025;
    if (d.level === 'district') baseAlt *= 0.5; // district hexes sit under their place hexes
    if (isSelected) return baseAlt + 0.025; // Highlight lift
    return baseAlt;
  }, [selectedHexId]);

  // Initialize Globe
  useEffect(() => {
    const container = containerRef.current;
    if (!container || globeInstanceRef.current) return;

    const globe = Globe()(container)
      .globeImageUrl('/textures/earth-night.jpg')
      .bumpImageUrl('/textures/earth-topology.png')
      .backgroundImageUrl('/textures/night-sky.png')
      .backgroundColor('rgba(3, 7, 18, 0)')
      .showAtmosphere(false)
      .polygonsData(hexData)
      .polygonGeoJsonGeometry(d => d.geometry)
      .polygonCapColor(getCapColor)
      .polygonSideColor(getSideColor)
      .polygonStrokeColor(d => (d.id === selectedHexId ? '#00e5ff' : 'rgba(56, 189, 248, 0.5)'))
      .polygonAltitude(getAltitude)
      .ringsData(ringsData)
      .ringColor(d => d.color)
      .ringMaxRadius(d => d.maxRadius)
      .ringPropagationSpeed(d => d.speed)
      .ringRepeatPeriod(d => d.repeat)
      .labelsData(labelsData)
      .labelLat(d => d.lat)
      .labelLng(d => d.lng)
      .labelText(d => d.text)
      .labelSize(d => d.size)
      .labelDotRadius(d => d.dotRadius)
      .labelColor(d => d.color)
      .labelAltitude(d => d.altitude)
      .labelResolution(3)
      .onPolygonHover(polygon => {
        setHoveredHex(polygon || null);
        if (container) {
          container.style.cursor = polygon ? 'pointer' : 'grab';
        }
      })
      .onPolygonClick(polygon => {
        if (polygon) {
          onSelectHex(polygon);
          // Focus smoothly near the clicked hexagon
          globe.pointOfView({
            lat: polygon.lat,
            lng: polygon.lng,
            altitude: 0.45
          }, 1200);
        }
      });

    // Custom OrbitControls settings with Ultra-Deep Zoom support
    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 101.2; // Allows zooming down right to the surface!
    controls.maxDistance = 600;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.6;

    globeInstanceRef.current = globe;

    // Initial camera fly-in: start far away, then move over the data footprint (South Asia)
    globe.pointOfView({ lat: 10, lng: 30, altitude: 2.6 }, 0);

    // Show district names only when zoomed in enough to read them
    globe.onZoom(pov => {
      const show = pov.altitude < 1.0;
      if (show !== showLabelsRef.current) {
        showLabelsRef.current = show;
        setShowDistrictLabels(show);
      }
    });

    const timer = setTimeout(() => {
      globe.pointOfView({
        lat: DATA_FOCUS.lat,
        lng: DATA_FOCUS.lng - DATA_FOCUS.altitude * 3, // Offset so the open viewport (left of the panel) is centred
        altitude: DATA_FOCUS.altitude
      }, 2400);
    }, 400);

    // Responsive resize handler
    const handleResize = () => {
      if (container && globeInstanceRef.current) {
        globeInstanceRef.current
          .width(container.clientWidth)
          .height(container.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.innerHTML = '';
      }
      globeInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update polygon layers whenever hexData, selectedHexId, or hoveredHex changes
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    const globe = globeInstanceRef.current;
    globe
      .polygonsData(hexData)
      .polygonCapColor(getCapColor)
      .polygonSideColor(getSideColor)
      .polygonStrokeColor(d => (d.id === selectedHexId ? '#00e5ff' : 'rgba(56, 189, 248, 0.5)'))
      .polygonAltitude(getAltitude)
      .ringsData(ringsData)
      .labelsData(labelsData);
  }, [hexData, selectedHexId, getCapColor, getSideColor, getAltitude, ringsData, labelsData]);

  // Jump to a requested region (Bangladesh / Rajshahi / Chattogram)
  useEffect(() => {
    if (!focusRequest || !globeInstanceRef.current) return;
    globeInstanceRef.current.pointOfView({
      lat: focusRequest.lat,
      lng: focusRequest.lng - focusRequest.altitude * 3,
      altitude: focusRequest.altitude
    }, 1500);
  }, [focusRequest]);

  // Handle Auto-rotate toggle
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    const controls = globeInstanceRef.current.controls();
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.5;
    }
  }, [autoRotate]);

  // Controls Handlers
  const handleZoomIn = () => {
    if (!globeInstanceRef.current) return;
    const currentPov = globeInstanceRef.current.pointOfView();
    const newAlt = Math.max(0.02, currentPov.altitude * 0.65);
    globeInstanceRef.current.pointOfView({ altitude: newAlt }, 500);
  };

  const handleZoomOut = () => {
    if (!globeInstanceRef.current) return;
    const currentPov = globeInstanceRef.current.pointOfView();
    const newAlt = Math.min(3.0, currentPov.altitude * 1.5);
    globeInstanceRef.current.pointOfView({ altitude: newAlt }, 500);
  };

  const handleResetView = () => {
    if (!globeInstanceRef.current) return;
    globeInstanceRef.current.pointOfView({
      lat: DATA_FOCUS.lat,
      lng: DATA_FOCUS.lng - DATA_FOCUS.altitude * 3,
      altitude: DATA_FOCUS.altitude
    }, 1500);
  };

  const toggleAutoRotate = () => {
    setAutoRotate(prev => !prev);
  };

  return (
    <div className="globe-viewport-container">
      {/* 3D WebGL Canvas Wrapper */}
      <div 
        ref={containerRef} 
        className="globe-canvas-wrapper" 
        id="nasa-earth-canvas"
      />

      {/* Floating HUD Reticle for Focus Target */}
      <div className="hud-target-reticle">
        <div className="reticle-label-top">
          <Navigation size={10} />
          <span>OBSERVATION FOOTPRINT</span>
        </div>
        <div className="reticle-target-name">{DATA_FOCUS.label}</div>
        <div className="reticle-coords">
          {DATA_FOCUS.subtitle}
        </div>
      </div>

      {/* Floating Interactive Controls (Section 13) */}
      <div className="globe-floating-controls">
        <div className="control-btn-group">
          <button 
            id="globe-zoom-in-btn"
            className="globe-tool-btn" 
            onClick={handleZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <Plus size={18} />
          </button>
          <button 
            id="globe-zoom-out-btn"
            className="globe-tool-btn" 
            onClick={handleZoomOut}
            title="Zoom Out (−)"
            aria-label="Zoom Out"
          >
            <Minus size={18} />
          </button>
          <button 
            id="globe-reset-view-btn"
            className="globe-tool-btn" 
            onClick={handleResetView}
            title="Reset View to Bangladesh"
            aria-label="Reset View"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            id="globe-autorotate-btn"
            className={`globe-tool-btn ${autoRotate ? 'active' : ''}`}
            onClick={toggleAutoRotate}
            title={`Toggle Auto Rotate (Currently ${autoRotate ? 'ON' : 'OFF'})`}
            aria-label="Toggle Auto Rotation"
          >
            {autoRotate ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>

        <button 
          id="focus-rajshahi-shortcut-btn"
          className="globe-focus-shortcut-btn"
          onClick={handleResetView}
          title="Center on Bangladesh"
        >
          <Compass size={14} color="#38bdf8" />
          <span>Focus Bangladesh</span>
        </button>
      </div>

      {/* Hover HUD Tooltip */}
      {hoveredHex && (
        <div 
          style={{
            position: 'absolute',
            top: '84px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(9, 14, 28, 0.85)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${hoveredHex.activityLevel?.color || '#38bdf8'}`,
            borderRadius: '8px',
            padding: '6px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#f8fafc'
          }}
        >
          <span style={{ fontWeight: 700, color: hoveredHex.activityLevel?.color }}>
            {hoveredHex.name}
          </span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span>{hoveredHex.recentDetections} detections</span>
          <span style={{ color: '#94a3b8' }}>•</span>
          <span style={{ color: hoveredHex.activityLevel?.color }}>
            {hoveredHex.activityLevel?.key}
          </span>
          <span style={{ color: '#64748b', fontSize: '10px' }}>(Click to Inspect)</span>
        </div>
      )}
    </div>
  );
}
