import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ZoomIn, ZoomOut, Compass, Navigation } from 'lucide-react';
import { DATA_FOCUS } from '../data/hexData';

export default function TacticalMapView({
  hexData = [],
  selectedHexId,
  onSelectHex,
  focusRequest
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' | 'dark'
  const [currentZoom, setCurrentZoom] = useState(DATA_FOCUS.mapZoom);
  const [viewTick, setViewTick] = useState(0); // bumps on map move so labels refresh

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on the data footprint; canvas renderer keeps thousands of hexagons fast
    const map = L.map(mapContainerRef.current, {
      center: [DATA_FOCUS.lat, DATA_FOCUS.lng],
      zoom: DATA_FOCUS.mapZoom,
      preferCanvas: true,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false, // Custom controls
      attributionControl: false
    });

    mapInstanceRef.current = map;
    layersGroupRef.current = L.layerGroup().addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });
    map.on('moveend', () => setViewTick(t => t + 1));

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapStyle === 'satellite') {
      // High-resolution ESRI World Imagery (Google Satellite equivalent)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      }).addTo(map);

      // Boundaries & place labels overlay
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.8
      }).addTo(map);
    } else {
      // High-contrast CartoDB Dark Matter
      L.tileLayer('https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; CartoDB &copy; OpenStreetMap'
      }).addTo(map);
    }
  }, [mapStyle]);

  // Update H3 hexagon polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();

    hexData.forEach((hex) => {
      if (!hex.geometry) return;

      const isSelected = hex.id === selectedHexId;
      const color = hex.activityLevel?.color || '#38bdf8';
      const empty = hex.recentDetections === 0;

      // GeoJSON coordinates are [lng, lat], Leaflet expects [lat, lng]
      const rawCoords = hex.geometry.coordinates[0];
      const latLngs = rawCoords.map(([lng, lat]) => [lat, lng]);

      const polygon = L.polygon(latLngs, {
        color: isSelected ? '#00e5ff' : color,
        weight: isSelected ? 3 : 1,
        opacity: isSelected ? 1 : 0.85,
        fillColor: isSelected ? '#00e5ff' : color,
        fillOpacity: isSelected ? 0.45 : empty ? 0.05 : 0.3
      });

      // Hover Tooltip
      polygon.bindTooltip(
        `<div style="font-family: var(--font-mono); font-size: 11px; padding: 2px 4px;">
          <strong style="color: ${color};">${hex.name}</strong><br/>
          <span>${hex.recentDetections} detections • ${hex.frp} MW</span><br/>
          <span style="font-size: 10px; color: #94a3b8;">${hex.activityLevel?.label}</span>
        </div>`,
        { sticky: true, opacity: 0.95, className: 'leaflet-tactical-tooltip' }
      );

      polygon.on('click', () => onSelectHex(hex));
      group.addLayer(polygon);
    });
  }, [hexData, selectedHexId, onSelectHex]);

  // Name tags: only for cells in view, and only when zoomed in far enough
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (markersGroupRef.current) markersGroupRef.current.clearLayers();
    else markersGroupRef.current = L.layerGroup().addTo(map);
    const group = markersGroupRef.current;

    if (currentZoom < 7) return;
    const bounds = map.getBounds();
    let shown = 0;

    for (const hex of hexData) {
      if (!bounds.contains([hex.lat, hex.lng])) continue;
      if (hex.isBangladesh) {
        // All 64 district names from zoom 7; places / upazilas from zoom 10
        if (hex.level === 'district' ? currentZoom < 7 : currentZoom < 10) {
          if (hex.id !== selectedHexId) continue;
        }
      } else {
        if (currentZoom < 8 || shown >= 150) continue;
        if (hex.recentDetections === 0 && hex.id !== selectedHexId) continue;
        shown += 1;
      }

      const isSelected = hex.id === selectedHexId;
      const color = hex.activityLevel?.color || '#38bdf8';
      const markerHtml = `
        <div class="tactical-hex-marker ${isSelected ? 'selected' : ''}" style="border-color: ${isSelected ? '#00e5ff' : color};">
          <span class="marker-dot" style="background-color: ${isSelected ? '#00e5ff' : color};"></span>
          <span class="marker-name">${hex.name.replace('Fire Cell near ', '').replace(' District', '')}</span>
          <span class="marker-count">${hex.recentDetections}</span>
        </div>
      `;
      const divIcon = L.divIcon({
        html: markerHtml,
        className: 'tactical-div-icon',
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });
      group.addLayer(L.marker([hex.lat, hex.lng], { icon: divIcon, interactive: false }));
    }
  }, [hexData, selectedHexId, currentZoom, viewTick]);

  // Jump to a requested region (Bangladesh / Rajshahi / Chattogram)
  useEffect(() => {
    if (!focusRequest || !mapInstanceRef.current) return;
    mapInstanceRef.current.setView([focusRequest.lat, focusRequest.lng], focusRequest.zoom, { animate: true });
  }, [focusRequest]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleReset = () => {
    mapInstanceRef.current?.setView([DATA_FOCUS.lat, DATA_FOCUS.lng], DATA_FOCUS.mapZoom, { animate: true });
  };

  return (
    <div className="tactical-map-viewport">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="leaflet-map-container" />

      {/* Floating HUD Reticle */}
      <div className="hud-target-reticle">
        <div className="reticle-label-top">
          <Navigation size={10} />
          <span>TACTICAL SATELLITE ZOOM</span>
        </div>
        <div className="reticle-target-name">{DATA_FOCUS.label}</div>
        <div className="reticle-coords">
          Zoom Level: {currentZoom} • Click a hexagon to inspect
        </div>
      </div>

      {/* Floating Controls */}
      <div className="globe-floating-controls">
        <div className="control-btn-group">
          <button 
            className="globe-tool-btn" 
            onClick={handleZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            className="globe-tool-btn" 
            onClick={handleZoomOut}
            title="Zoom Out (−)"
            aria-label="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button 
            className="globe-tool-btn" 
            onClick={handleReset}
            title="Reset to South Asia"
            aria-label="Reset View"
          >
            <Compass size={18} />
          </button>
          <button 
            className={`globe-tool-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapStyle(prev => prev === 'satellite' ? 'dark' : 'satellite')}
            title={`Basemap: ${mapStyle === 'satellite' ? 'Satellite Imagery' : 'Dark Carto'}`}
            aria-label="Toggle Basemap"
          >
            <Layers size={16} />
          </button>
        </div>

        <button 
          className="globe-focus-shortcut-btn"
          onClick={handleReset}
          title="Center on South Asia"
        >
          <Compass size={14} color="#38bdf8" />
          <span>Reset to Bangladesh</span>
        </button>
      </div>
    </div>
  );
}
