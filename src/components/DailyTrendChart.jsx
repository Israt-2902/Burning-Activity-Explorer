import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { FIRE_META } from '../data/hexData';

// Custom tooltip declared outside component for compiler optimization
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(9, 14, 28, 0.95)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '6px',
        padding: '8px 12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: '#f8fafc'
      }}>
        <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>{d.date}</div>
        <div>Detections: <strong>{d.total}</strong></div>
        <div style={{ color: '#94a3b8', fontSize: '10px' }}>MODIS: {d.modis} • VIIRS: {d.viirs}</div>
        {d.date === FIRE_META.partialLastDay && (
          <div style={{ color: '#eab308', fontSize: '10px' }}>Partial day (feed ends {FIRE_META.lastObservation})</div>
        )}
      </div>
    );
  }
  return null;
}

export default function DailyTrendChart({ daily = [] }) {
  if (!daily.length) return null;
  const total = daily.reduce((s, d) => s + d.total, 0);
  const peak = daily.reduce((b, d) => (d.total > b.total ? d : b), daily[0]);
  const avg = total / daily.length;

  return (
    <div className="historical-comparison-section">
      <div className="historical-chart-box">
        <div className="historical-chart-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={13} color="#38bdf8" />
            <span>DAILY DETECTIONS BY SENSOR — {FIRE_META.startLabel.slice(0, 6).toUpperCase()} to {FIRE_META.endLabel.slice(0, 6).toUpperCase()}</span>
          </span>
          <span style={{ fontSize: '9px', color: '#64748b' }}>NASA FIRMS</span>
        </div>

        <div className="chart-container-inner">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={daily} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} fontFamily="var(--font-mono)" />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} fontFamily="var(--font-mono)" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="modis" stackId="a" fill="#38bdf8" name="MODIS" />
              <Bar dataKey="viirs" stackId="a" fill="#818cf8" radius={[4, 4, 0, 0]} name="VIIRS" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="historical-summary-metrics">
        <div className="metric-line">
          <span>Mean per day (window):</span>
          <span className="metric-line-val">{avg.toFixed(1)} detections</span>
        </div>
        <div className="metric-line">
          <span>Busiest day:</span>
          <span className="metric-line-val">{total ? `${peak.label} (${peak.total})` : '—'}</span>
        </div>
      </div>

      <div className="historical-scientific-note">
        Multi-year baselines (2022–2025) are not part of the current NASA feed, so no historical comparison is shown.
      </div>
    </div>
  );
}
