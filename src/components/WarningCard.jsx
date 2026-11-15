import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function WarningCard({ 
  title = 'UNUSUAL BURNING ACTIVITY',
  description = 'Current observed activity is higher than the historical pattern.',
  deltaText
}) {
  return (
    <div className="warning-alert-card" role="alert">
      <div className="warning-icon-box">
        <AlertTriangle size={18} />
      </div>
      <div className="warning-content">
        <div className="warning-header-title">
          <span>⚠ {title}</span>
        </div>
        <p className="warning-body-text">
          {description}
          {deltaText && (
            <span style={{ display: 'block', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {deltaText}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
