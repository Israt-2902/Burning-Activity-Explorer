import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, X, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { FIRE_META } from '../data/hexData';
import {
  loadSubscriptions, saveSubscriptions, isValidEmail, isTriggered, buildMailto, dispatchAlert
} from '../utils/alertService';

export default function AlertRegistration({ areas = [], currentRegion }) {
  const [subs, setSubs] = useState(loadSubscriptions);
  const [email, setEmail] = useState('');
  const [threshold, setThreshold] = useState('HIGH');
  const [picked, setPicked] = useState([]); // area ids chosen in the form
  const [message, setMessage] = useState(null);

  const byId = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);
  const choices = useMemo(
    () => areas.filter((a) => a.isBangladesh).sort((a, b) => a.name.localeCompare(b.name)),
    [areas]
  );

  // Pre-select the region currently open in the panel
  useEffect(() => {
    if (currentRegion?.isBangladesh) setPicked((p) => (p.length ? p : [currentRegion.id]));
  }, [currentRegion]);

  useEffect(() => { saveSubscriptions(subs); }, [subs]);

  // Evaluate subscriptions against current data and dispatch emails when an endpoint exists
  const triggered = useMemo(() => {
    const out = [];
    for (const sub of subs) {
      for (const id of sub.areaIds) {
        const region = byId.get(id);
        if (region && isTriggered(sub, region)) out.push({ sub, region });
      }
    }
    return out;
  }, [subs, byId]);

  useEffect(() => {
    triggered.forEach(({ sub, region }) => { dispatchAlert(sub, region, FIRE_META.endLabel); });
  }, [triggered]);

  const addArea = (id) => { if (id && !picked.includes(id)) setPicked([...picked, id]); };

  const register = () => {
    if (!isValidEmail(email)) return setMessage({ type: 'error', text: 'Enter a valid email address.' });
    if (!picked.length) return setMessage({ type: 'error', text: 'Choose at least one area.' });
    const existing = subs.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    const next = existing
      ? subs.map((s) => (s === existing
          ? { ...s, threshold, areaIds: [...new Set([...s.areaIds, ...picked])] }
          : s))
      : [...subs, { email: email.trim(), threshold, areaIds: picked, createdAt: Date.now() }];
    setSubs(next);
    setMessage({ type: 'ok', text: `Registered ${picked.length} area${picked.length > 1 ? 's' : ''} for ${email.trim()}.` });
    setPicked([]);
  };

  const removeArea = (email, id) =>
    setSubs(subs.map((s) => (s.email === email ? { ...s, areaIds: s.areaIds.filter((a) => a !== id) } : s))
      .filter((s) => s.areaIds.length));

  return (
    <div className="alert-card">
      <div className="section-label-row">
        <span className="section-title">
          <BellRing size={13} color="#f97316" />
          <span>BURNING ALERTS</span>
        </span>
      </div>
      <p className="alert-intro">
        Register your preferred areas and receive an email alert when your selected area reaches a concerning level of burning activity.
      </p>

      {triggered.map(({ sub, region }) => (
        <div key={`${sub.email}-${region.id}`} className="alert-triggered">
          <AlertTriangle size={14} />
          <div>
            <strong>{region.name}</strong> is at <strong>{region.activityLevel.label}</strong> ({region.recentDetections} detections).
            <a href={buildMailto(sub, region, FIRE_META.endLabel)} className="alert-mail-link">
              <Mail size={11} /> Email this alert to {sub.email}
            </a>
          </div>
        </div>
      ))}

      <div className="alert-form">
        <input
          type="email"
          className="alert-input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address for alerts"
        />

        <div className="alert-row">
          <select className="alert-input" value="" onChange={(e) => addArea(e.target.value)} aria-label="Add an area">
            <option value="">+ Add area…</option>
            {choices.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.level === 'district' ? a.division : a.districtName}</option>
            ))}
          </select>
          {currentRegion?.isBangladesh && (
            <button className="alert-btn ghost" onClick={() => addArea(currentRegion.id)} title="Add the area shown in the panel">
              + This area
            </button>
          )}
        </div>

        {picked.length > 0 && (
          <div className="alert-chips">
            {picked.map((id) => (
              <span key={id} className="alert-chip">
                {byId.get(id)?.name}
                <button onClick={() => setPicked(picked.filter((p) => p !== id))} aria-label="Remove"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="alert-row">
          <select className="alert-input" value={threshold} onChange={(e) => setThreshold(e.target.value)} aria-label="Alert level">
            <option value="HIGH">Alert at High activity or above</option>
            <option value="VERY_HIGH">Alert at Very High activity only</option>
          </select>
          <button className="alert-btn" onClick={register}>Register</button>
        </div>

        {message && (
          <div className={`alert-message ${message.type}`}>
            {message.type === 'ok' && <CheckCircle2 size={12} />} {message.text}
          </div>
        )}
      </div>

      {subs.length > 0 && (
        <div className="alert-subs">
          {subs.map((s) => (
            <div key={s.email} className="alert-sub">
              <div className="alert-sub-email">{s.email} <span>• {s.threshold === 'VERY_HIGH' ? 'Very High' : 'High+'}</span></div>
              <div className="alert-chips">
                {s.areaIds.map((id) => {
                  const r = byId.get(id);
                  if (!r) return null;
                  return (
                    <span key={id} className="alert-chip" style={{ borderColor: `${r.activityLevel.color}80` }}>
                      <i style={{ background: r.activityLevel.color }} />
                      {r.name}
                      <button onClick={() => removeArea(s.email, id)} aria-label="Unsubscribe"><X size={10} /></button>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
