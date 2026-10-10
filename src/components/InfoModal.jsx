import React from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { SATELLITE_INFO } from '../data/satelliteInfo';
import { FIRE_META } from '../data/hexData';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <Sparkles size={20} color="#38bdf8" />
            <span>Burning Activity Explorer • TEAM STERION</span>
          </div>
          <button 
            className="panel-close-btn" 
            onClick={onClose}
            aria-label="Close Information Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {/* Disclaimer Banner */}
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fed7aa',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)'
          }}>
            <AlertCircle size={18} color="#eab308" style={{ flexShrink: 0 }} />
            <span>{SATELLITE_INFO.harmonizationProtocol.disclaimer}</span>
          </div>

          <div>
            <h4 className="modal-section-title">PROJECT OVERVIEW</h4>
            <p>
              Developed by <strong>TEAM STERION</strong> for the <strong>NASA Space Apps Challenge 2026</strong>, 
              the <em>Burning Activity Explorer</em> bridges high-resolution contemporary thermal detections 
              with multi-decadal Earth observation records. Rather than presenting generic fire risks, 
              it models an empirical <strong>Burning Activity Calendar</strong> specifically tailored to regional crop cycles and agricultural residue burning.
            </p>
          </div>

          <div>
            <h4 className="modal-section-title">WHY HARMONIZE MODIS + VIIRS?</h4>
            <div className="info-cards-row">
              <div className="info-stat-card">
                <h4>NASA MODIS (Terra & Aqua)</h4>
                <p>
                  <strong>Spatial:</strong> 1 km at nadir<br />
                  <strong>Temporal Baseline:</strong> 2000–Present (26+ years)<br />
                  Provides essential climate normals and long-term reference baselines, but can miss small low-intensity smoldering field fires.
                </p>
              </div>

              <div className="info-stat-card">
                <h4>NASA/NOAA VIIRS (Suomi-NPP & JPSS)</h4>
                <p>
                  <strong>Spatial:</strong> 375 m I-band<br />
                  <strong>Temporal Baseline:</strong> 2012–Present<br />
                  Detects small-scale agricultural burns down to 0.01 ha with superior perimeter delineation, cross-calibrated against MODIS historical energy scales.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="modal-section-title">H3 DISCRETE GLOBAL GRID SYSTEM (DGGS)</h4>
            <p>
              By partitioning the Earth into Uber H3 hierarchical hexagonal cells, the platform eliminates map projection distortion (especially at high latitudes) and provides uniform equal-area cells for spatial fire aggregations, clustering, and Fire Radiative Power (FRP) density computation.
            </p>
          </div>

          <div>
            <h4 className="modal-section-title">DATA IN THIS VIEW</h4>
            <p>
              This build visualises real <strong>NASA FIRMS</strong> near-real-time detections for South Asia:
              MODIS C6.1 (Terra &amp; Aqua) and VIIRS C2 (S-NPP, NOAA-20, NOAA-21), covering
              <strong> {FIRE_META.startLabel} – {FIRE_META.endLabel}</strong> ({FIRE_META.total.toLocaleString()} detections after
              removing low-confidence points). Detections are aggregated into H3 resolution-5 hexagons
              (≈250&nbsp;km² each); activity classes count detections per cell over the whole window.
              The final day is only partially covered (last observation {FIRE_META.lastObservation}).
              Multi-year historical baselines are not part of this feed.
              For Bangladesh, all 64 districts plus detailed places in the Rajshahi and Chattogram divisions are shown
              as H3 hexagons; because FIRMS sees few fires over Bangladesh in this window, their values combine real
              FIRMS detections with modelled estimates. Place locations are approximate centroids.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <span>NASA Space Apps Challenge 2026 • Team STERION</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>MODIS • VIIRS • H3 • THREE.JS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
