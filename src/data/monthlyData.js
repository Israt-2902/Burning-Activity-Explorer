/**
 * Burning Activity Calendar data, derived from the selected region's real detections.
 * Only months that are covered by the loaded NASA feed contain data; all other months
 * are flagged `hasData: false` (no placeholder values are generated).
 * Team STERION - NASA Space Apps Challenge 2026
 */

import { ACTIVITY_LEVELS, getActivityLevel } from '../utils/activityUtils';
import { FIRE_META } from './hexData';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const AVAILABLE_YEARS = [
  { year: FIRE_META.year, label: `${FIRE_META.year} (NASA FIRMS feed)`, badge: 'CURRENT' }
];

function daysInMonth(year, monthIndex) {
  return new Date(Number(year), monthIndex + 1, 0).getDate();
}

/**
 * Build the 12-month calendar for a region and year.
 */
export function getMonthlyDataForRegion(region, year = FIRE_META.year) {
  const dataMonth = FIRE_META.month;
  const hasYear = String(year) === String(FIRE_META.year);

  return MONTH_NAMES.map((monthName, monthIndex) => {
    const base = {
      monthIndex,
      monthName,
      shortName: monthName.slice(0, 3).toUpperCase(),
      activityLevel: ACTIVITY_LEVELS.LOW,
      detections: 0,
      modis: 0,
      viirs: 0,
      avgFRP: 0,
      peakDate: '—',
      dailyData: [],
      hasData: false,
      season: 'No observations loaded for this month'
    };

    if (!hasYear || monthIndex !== dataMonth || !region) return base;

    const total = daysInMonth(year, monthIndex);
    const byDay = new Map(region.daily.map((d) => [Number(d.date.slice(8, 10)), d]));
    const peak = region.daily.reduce((b, d) => (d.total > b.total ? d : b), region.daily[0]);

    const dailyData = Array.from({ length: total }, (_, i) => {
      const day = i + 1;
      const d = byDay.get(day);
      return {
        day,
        detections: d ? d.total : 0,
        modis: d ? d.modis : 0,
        viirs: d ? d.viirs : 0,
        hasData: Boolean(d),
        isPeak: Boolean(d) && region.recentDetections > 0 && d.date === peak.date
      };
    });

    return {
      ...base,
      activityLevel: region.recentDetections ? getActivityLevel(region.recentDetections) : ACTIVITY_LEVELS.LOW,
      detections: region.recentDetections,
      modis: region.modis,
      viirs: region.viirs,
      avgFRP: region.frp,
      peakDate: region.recentDetections ? `${peak.label} ${year} (${peak.total})` : '—',
      dailyData,
      hasData: true,
      season: `Observed ${FIRE_META.startLabel} – ${FIRE_META.endLabel}`
    };
  });
}
