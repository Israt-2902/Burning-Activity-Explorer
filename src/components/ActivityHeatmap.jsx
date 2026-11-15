import React, { useMemo, useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { DISTRICTS } from '../data/bangladeshAreas';

const TABS = ['Rajshahi', 'Chattogram', 'All Divisions'];

// 5-step ramp: none, low, moderate, high, very high (relative to the busiest cell shown)
function cellColor(value, max) {
  if (!value) return 'rgba(148, 163, 184, 0.08)';
  const t = value / Math.max(1, max);
  if (t < 0.25) return 'rgba(16, 185, 129, 0.75)';
  if (t < 0.5) return 'rgba(234, 179, 8, 0.8)';
  if (t < 0.75) return 'rgba(249, 115, 22, 0.85)';
  return 'rgba(239, 68, 68, 0.95)';
}

/**
 * Heat map (rows x days) with a daily-total histogram underneath.
 * Rows are the districts of a division, or the 8 divisions of Bangladesh.
 */
export default function ActivityHeatmap({ areas = [], selectedId, onSelect }) {
  const [tab, setTab] = useState('Rajshahi');

  const { rows, days } = useMemo(() => {
    const districts = areas.filter((a) => a.isBangladesh && a.level === 'district');
    const dayLabels = districts[0]?.daily.map((d) => d.label) || [];
    let list;
    if (tab === 'All Divisions') {
      list = Object.keys(DISTRICTS).map((division) => {
        const members = districts.filter((a) => a.division === division);
        return {
          id: `division-${division}`,
          label: division,
          values: dayLabels.map((_, i) => members.reduce((s, m) => s + m.daily[i].total, 0)),
          selectable: false
        };
      });
    } else {
      list = districts
        .filter((a) => a.division === tab)
        .map((a) => ({ id: a.id, label: a.districtName, values: a.daily.map((d) => d.total), selectable: true }));
    }
    list.sort((a, b) => b.values.reduce((s, v) => s + v, 0) - a.values.reduce((s, v) => s + v, 0));
    return { rows: list, days: dayLabels };
  }, [areas, tab]);

  if (!rows.length) return null;

  const max = Math.max(1, ...rows.flatMap((r) => r.values));
  const totals = days.map((_, i) => rows.reduce((s, r) => s + r.values[i], 0));
  const maxTotal = Math.max(1, ...totals);
  const cols = `92px repeat(${days.length}, 1fr)`;

  return (
    <div className="heatmap-card">
      <div className="section-label-row">
        <span className="section-title">
          <Grid3x3 size={13} color="#38bdf8" />
          <span>ACTIVITY HEAT MAP</span>
        </span>
        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>detections / day</span>
      </div>

      <div className="heatmap-tabs">
        {TABS.map((t) => (
          <button key={t} className={`heatmap-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="heatmap-grid" style={{ gridTemplateColumns: cols }}>
        <span />
        {days.map((d) => (
          <span key={d} className="heatmap-day">{d.slice(0, 2)}</span>
        ))}

        {rows.map((r) => (
          <React.Fragment key={r.id}>
            <button
              className={`heatmap-row-label ${r.id === selectedId ? 'selected' : ''}`}
              onClick={() => r.selectable && onSelect?.(r.id)}
              disabled={!r.selectable}
              title={r.selectable ? `Inspect ${r.label}` : r.label}
            >
              {r.label}
            </button>
            {r.values.map((v, i) => (
              <span
                key={i}
                className="heatmap-cell"
                style={{ backgroundColor: cellColor(v, max) }}
                title={`${r.label} • ${days[i]} Oct: ${v} detections`}
              >
                {v > 0 ? v : ''}
              </span>
            ))}
          </React.Fragment>
        ))}

        {/* Histogram of daily totals */}
        <span className="heatmap-row-label total-label">Daily total</span>
        {totals.map((t, i) => (
          <span key={i} className="heatmap-hist-slot" title={`${days[i]} Oct: ${t} detections`}>
            <span className="heatmap-hist-bar" style={{ height: `${Math.max(6, (t / maxTotal) * 100)}%` }} />
          </span>
        ))}
      </div>

      <div className="heatmap-legend">
        <span>less</span>
        {[0, 0.2, 0.4, 0.6, 0.9].map((t) => (
          <i key={t} style={{ backgroundColor: cellColor(t * max || 0, max) }} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}
