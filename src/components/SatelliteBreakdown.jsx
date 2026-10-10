import React from 'react';
import { Satellite } from 'lucide-react';
import { SATELLITE_INFO } from '../data/satelliteInfo';

export default function SatelliteBreakdown({ modisCount = 0, viirsCount = 0 }) {
  const total = (modisCount + viirsCount) || 1;
  const modisPct = Math.round((modisCount / total) * 100);
  const viirsPct = (modisCount + viirsCount) ? 100 - modisPct : 0;

  return (
    <div className="satellite-breakdown-card">
      <div className="section-label-row">
        <span className="section-title">
          <Satellite size={13} color="#38bdf8" />
          <span>SATELLITE OBSERVATIONS</span>
        </span>
        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
          {modisCount + viirsCount} Harmonized Events
        </span>
      </div>

      <div className="sensor-cards-grid">
        {/* MODIS Card */}
        <div className="sensor-card">
          <div className="sensor-card-header">
            <span className="sensor-tag">MODIS</span>
            <span className="sensor-resolution">1 km Nadir</span>
          </div>
          <div className="sensor-count">
            {modisCount} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>detections</span>
          </div>
          <div className="sensor-proportion-bar">
            <div 
              className="sensor-bar-fill" 
              style={{ width: `${modisPct}%`, background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)' }}
              title={`MODIS: ${modisPct}% of total`}
            />
          </div>
        </div>

        {/* VIIRS Card */}
        <div className="sensor-card">
          <div className="sensor-card-header">
            <span className="sensor-tag" style={{ color: '#818cf8' }}>VIIRS</span>
            <span className="sensor-resolution">375 m I-Band</span>
          </div>
          <div className="sensor-count">
            {viirsCount} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>detections</span>
          </div>
          <div className="sensor-proportion-bar">
            <div 
              className="sensor-bar-fill" 
              style={{ width: `${viirsPct}%`, background: 'linear-gradient(90deg, #818cf8, #6366f1)' }}
              title={`VIIRS: ${viirsPct}% of total`}
            />
          </div>
        </div>
      </div>

      {/* Harmonization Explanation */}
      <p className="harmonization-explanation-quote">
        "{SATELLITE_INFO.harmonizationProtocol.quote}"
      </p>
    </div>
  );
}
