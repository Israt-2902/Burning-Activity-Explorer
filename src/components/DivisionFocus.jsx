import React from 'react';
import { MapPinned } from 'lucide-react';

const TARGETS = ['Bangladesh', 'Rajshahi', 'Chattogram'];

export default function DivisionFocus({ onFocus, active }) {
  return (
    <div className="division-focus-bar" aria-label="Focus region">
      <span className="division-focus-title"><MapPinned size={11} /> FOCUS</span>
      {TARGETS.map((t) => (
        <button key={t} className={`division-focus-btn ${active === t ? 'active' : ''}`} onClick={() => onFocus(t)}>
          {t === 'Bangladesh' ? 'Bangladesh' : `${t} Division`}
        </button>
      ))}
    </div>
  );
}
