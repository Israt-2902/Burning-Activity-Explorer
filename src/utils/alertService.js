/**
 * HexaFlare alert subscriptions + email delivery.
 *
 * Subscriptions are stored in localStorage (this browser only).
 *
 * Real email sending (pick one, configured in .env — see .env.example):
 *   1) EmailJS  (no backend needed):  VITE_EMAILJS_SERVICE_ID / _TEMPLATE_ID / _PUBLIC_KEY
 *   2) Your own backend / webhook:    VITE_ALERT_ENDPOINT   (receives a JSON POST with the same fields)
 * With neither configured, the UI falls back to a ready-made email draft (mailto:).
 *
 * Template fields sent: to_email, subject, message, app_name, area_name, level, detections, date
 */

const STORAGE_KEY = 'bae.alert-subscriptions.v1';
const SENT_KEY = 'bae.alert-sent.v1';
const APP_NAME = 'HexaFlare: Burning Activity Explorer';

const env = import.meta.env || {};
const EMAILJS = {
  serviceId: env.VITE_EMAILJS_SERVICE_ID,
  templateId: env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: env.VITE_EMAILJS_PUBLIC_KEY
};
const ENDPOINT = env.VITE_ALERT_ENDPOINT;

export const ALERT_LEVEL_RANK = { LOW: 0, MODERATE: 1, HIGH: 2, VERY_HIGH: 3 };

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** 'emailjs' | 'endpoint' | 'none' */
export function getEmailMode() {
  if (EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey) return 'emailjs';
  if (ENDPOINT) return 'endpoint';
  return 'none';
}

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

export function buildAlertMessage(region, dateLabel) {
  return (
    `${APP_NAME} — fire activity alert\n\n` +
    `Area: ${region.name} (${region.subtext})\n` +
    `Activity level: ${region.activityLevel.label}\n` +
    `Detections: ${region.recentDetections} (MODIS ${region.modis}, VIIRS ${region.viirs})\n` +
    `Latest detection: ${region.lastDetection}\n` +
    `Data up to: ${dateLabel}\n\n` +
    `Source: NASA FIRMS (MODIS + VIIRS)`
  );
}

export function buildMailto(sub, region, dateLabel) {
  const subject = `Fire activity alert: ${region.name} is ${region.activityLevel.label}`;
  return `mailto:${encodeURIComponent(sub.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildAlertMessage(region, dateLabel))}`;
}

/** Low-level send. Returns { ok, error? } */
async function sendEmail(params) {
  const mode = getEmailMode();
  try {
    if (mode === 'emailjs') {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS.serviceId,
          template_id: EMAILJS.templateId,
          user_id: EMAILJS.publicKey,
          template_params: { app_name: APP_NAME, ...params }
        })
      });
      if (!res.ok) return { ok: false, error: `EmailJS ${res.status}: ${await res.text()}` };
      return { ok: true };
    }
    if (mode === 'endpoint') {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'burning-alert', app_name: APP_NAME, ...params })
      });
      return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: false, error: 'not-configured' };
  } catch (e) {
    return { ok: false, error: e?.message || 'network' };
  }
}

const inflight = new Set(); // guards against double sends (e.g. React StrictMode)

/**
 * Sends the alert email for one subscription/area, at most once per area per data day.
 * Returns { status: 'sent' | 'already-sent' | 'failed' | 'not-configured', error? }
 */
export async function dispatchAlert(sub, region, dateLabel) {
  if (getEmailMode() === 'none') return { status: 'not-configured' };

  const key = `${sub.email.toLowerCase()}|${region.id}|${dateLabel}`;
  const sentLog = read(SENT_KEY, {});
  if (sentLog[key]) return { status: 'already-sent' };
  if (inflight.has(key)) return { status: 'sending' };

  inflight.add(key);
  const result = await sendEmail({
    to_email: sub.email,
    subject: `Fire activity alert: ${region.name} is ${region.activityLevel.label}`,
    message: buildAlertMessage(region, dateLabel),
    area_name: region.name,
    level: region.activityLevel.label,
    detections: String(region.recentDetections),
    date: dateLabel
  });
  inflight.delete(key);

  if (!result.ok) return { status: 'failed', error: result.error };
  sentLog[key] = Date.now();
  write(SENT_KEY, sentLog);
  return { status: 'sent' };
}

/** Confirmation email sent when someone registers. */
export async function sendConfirmation(sub, areaNames) {
  if (getEmailMode() === 'none') return { status: 'not-configured' };
  const result = await sendEmail({
    to_email: sub.email,
    subject: `You're registered for ${APP_NAME} alerts`,
    message:
      `You will receive an email when any of these areas reaches ${sub.threshold === 'VERY_HIGH' ? 'Very High' : 'High or Very High'} fire activity:\n\n` +
      areaNames.map((n) => `• ${n}`).join('\n') +
      `\n\nSource: NASA FIRMS (MODIS + VIIRS)`,
    area_name: areaNames.join(', '),
    level: sub.threshold,
    detections: '',
    date: ''
  });
  return result.ok ? { status: 'sent' } : { status: 'failed', error: result.error };
}
