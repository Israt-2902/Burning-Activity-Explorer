/**
 * Activity Utilities & Constants for NASA Burning Activity Explorer
 * Team STERION - NASA Space Apps Challenge 2026
 */

export const ACTIVITY_LEVELS = {
  LOW: {
    key: 'LOW',
    label: 'Low Activity',
    color: '#10b981', // Emerald green
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.3))',
    border: 'rgba(16, 185, 129, 0.4)',
    altitude: 0.018,
    threshold: '< 10 detections / cell'
  },
  MODERATE: {
    key: 'MODERATE',
    label: 'Moderate Activity',
    color: '#eab308', // Amber yellow
    glowColor: 'rgba(234, 179, 8, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(113, 63, 18, 0.3))',
    border: 'rgba(234, 179, 8, 0.4)',
    altitude: 0.035,
    threshold: '10 - 25 detections / cell'
  },
  HIGH: {
    key: 'HIGH',
    label: 'High Activity',
    color: '#f97316', // Orange
    glowColor: 'rgba(249, 115, 22, 0.45)',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(124, 45, 18, 0.35))',
    border: 'rgba(249, 115, 22, 0.45)',
    altitude: 0.058,
    threshold: '26 - 40 detections / cell'
  },
  VERY_HIGH: {
    key: 'VERY_HIGH',
    label: 'Very High Activity',
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.55)',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(127, 29, 29, 0.4))',
    border: 'rgba(239, 68, 68, 0.55)',
    altitude: 0.085,
    threshold: '> 40 detections / cell'
  }
};

/**
 * Determine activity level from detection count
 */
export function getActivityLevel(detections) {
  if (detections <= 10) return ACTIVITY_LEVELS.LOW;
  if (detections <= 25) return ACTIVITY_LEVELS.MODERATE;
  if (detections <= 40) return ACTIVITY_LEVELS.HIGH;
  return ACTIVITY_LEVELS.VERY_HIGH;
}

/**
 * Format FRP (Fire Radiative Power)
 */
export function formatFRP(frp) {
  return `${frp} MW`;
}

/**
 * Format percentage change
 */
export function formatPercentDelta(current, baseline) {
  if (!baseline || baseline === 0) return '+0%';
  const delta = Math.round(((current - baseline) / baseline) * 100);
  if (delta > 0) return `↑ ${delta}% above`;
  if (delta < 0) return `↓ ${Math.abs(delta)}% below`;
  return `0% on par with`;
}
