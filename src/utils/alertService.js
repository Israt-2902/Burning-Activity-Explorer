/**
 * Burning-activity alert subscriptions.
 *
 * Subscriptions live in localStorage (browser only). To deliver real emails, point
 * VITE_ALERT_ENDPOINT at a backend/webhook; it receives a JSON POST:
 *   { type: 'burning-alert', email, area, division, level, detections, date, mailto }
 * Without an endpoint the UI offers a ready-made email draft (mailto:) instead.
 */

const STORAGE_KEY = 'bae.alert-subscriptions.v1';
const SENT_KEY = 'bae.alert-sent.v1';

export const ALERT_LEVEL_RANK = { LOW: 0, MODERATE: 1, HIGH: 2, VERY_HIGH: 3 };

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) – subscriptions then last for this session only */
  }
}

export const loadSubscriptions = () => read(STORAGE_KEY, []);
export const saveSubscriptions = (subs) => write(STORAGE_KEY, subs);

export function isTriggered(sub, region) {
  if (!region) return false;
  return (ALERT_LEVEL_RANK[region.activityLevel.key] ?? 0) >= (ALERT_LEVEL_RANK[sub.threshold] ?? 2);
}

export function buildMailto(sub, region, dateLabel) {
  const subject = `Burning activity alert: ${region.name} is ${region.activityLevel.label}`;
  const body =
    `Burning Activity Explorer alert\n\nArea: ${region.name} (${region.subtext})\n` +
    `Level: ${region.activityLevel.label}\nDetections: ${region.recentDetections} (MODIS ${region.modis}, VIIRS ${region.viirs})\n` +
    `Last detection: ${region.lastDetection}\nObserved window up to: ${dateLabel}\n\nSource: NASA FIRMS (MODIS + VIIRS)`;
  return `mailto:${encodeURIComponent(sub.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Sends each triggered alert once per area/day to the configured endpoint (if any). */
export async function dispatchAlert(sub, region, dateLabel) {
  const endpoint = import.meta.env?.VITE_ALERT_ENDPOINT;
  if (!endpoint) return { sent: false, reason: 'no-endpoint' };

  const sentLog = read(SENT_KEY, {});
  const key = `${sub.email}|${region.id}|${dateLabel}`;
  if (sentLog[key]) return { sent: true, reason: 'already-sent' };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'burning-alert',
        email: sub.email,
        area: region.name,
        division: region.division || null,
        level: region.activityLevel.key,
        detections: region.recentDetections,
        date: dateLabel,
        mailto: buildMailto(sub, region, dateLabel)
      })
    });
    if (!res.ok) return { sent: false, reason: `http-${res.status}` };
    sentLog[key] = Date.now();
    write(SENT_KEY, sentLog);
    return { sent: true, reason: 'ok' };
  } catch {
    return { sent: false, reason: 'network' };
  }
}
