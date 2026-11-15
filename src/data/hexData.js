/**
 * H3 hexagon fire grid built from real NASA FIRMS detections
 * (MODIS C6.1 NRT + VIIRS C2 NRT, see scripts/build-data.mjs).
 * Team STERION - NASA Space Apps Challenge 2026
 */

import * as h3 from 'h3-js';
import { getActivityLevel, ACTIVITY_LEVELS } from '../utils/activityUtils';
import fireData from './fireDetections.json';
import { generateBangladeshAreas, getAreaId, FOCUS_REGIONS } from './bangladeshAreas';

// H3 resolution used to aggregate detections (res 5 ≈ 250 km² per cell)
export const H3_RESOLUTION = 5;

// Initial camera / map focus: Bangladesh (the project's study area)
export const DATA_FOCUS = {
  lat: FOCUS_REGIONS.Bangladesh.lat,
  lng: FOCUS_REGIONS.Bangladesh.lng,
  altitude: FOCUS_REGIONS.Bangladesh.altitude,
  mapZoom: FOCUS_REGIONS.Bangladesh.zoom,
  label: 'BANGLADESH',
  subtitle: 'Rajshahi & Chattogram Divisions • NASA FIRMS'
};

// Rajshahi is the project's original case-study area; it is always kept in the grid
export const RAJSHAHI_COORDINATES = { lat: 24.374, lng: 88.604, altitude: 0.36 };
export const RAJSHAHI_CELL_ID = h3.latLngToCell(RAJSHAHI_COORDINATES.lat, RAJSHAHI_COORDINATES.lng, H3_RESOLUTION);

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const { dates, sensors: SENSOR_NAMES } = fireData.meta;

function fmtDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS_SHORT[m - 1]} ${y}`;
}
function fmtTime(hhmm) {
  const s = String(hhmm).padStart(4, '0');
  return `${s.slice(0, 2)}:${s.slice(2)}`;
}

// Last observation in the feed (used to flag the final, partially-covered day)
const lastRow = fireData.rows.reduce((a, r) => (r[2] > a[2] || (r[2] === a[2] && r[3] > a[3]) ? r : a), fireData.rows[0]);

export const FIRE_META = {
  dates,
  year: dates[0].slice(0, 4),
  month: Number(dates[0].slice(5, 7)) - 1,
  total: fireData.rows.length,
  startLabel: fmtDay(dates[0]),
  endLabel: fmtDay(dates[dates.length - 1]),
  lastObservation: `${fmtDay(dates[lastRow[2]])} • ${fmtTime(lastRow[3])} UTC`,
  partialLastDay: dates[lastRow[2]],
  sensors: SENSOR_NAMES
};

// Reference places, used only to give grid cells a readable "near X" label
const REFERENCE_PLACES = [
  ['Lahore', 31.55, 74.34], ['Faisalabad', 31.42, 73.08], ['Multan', 30.2, 71.47], ['Karachi', 24.86, 67.01],
  ['Islamabad', 33.68, 73.05], ['Peshawar', 34.01, 71.58], ['Amritsar', 31.63, 74.87], ['Ludhiana', 30.9, 75.86],
  ['Chandigarh', 30.73, 76.78], ['Delhi', 28.61, 77.21], ['Jaipur', 26.91, 75.79], ['Lucknow', 26.85, 80.95],
  ['Kanpur', 26.45, 80.35], ['Patna', 25.59, 85.14], ['Varanasi', 25.32, 82.97], ['Kolkata', 22.57, 88.36],
  ['Dhaka', 23.81, 90.41], ['Rajshahi', 24.37, 88.6], ['Chittagong', 22.36, 91.78], ['Bhubaneswar', 20.3, 85.82],
  ['Raipur', 21.25, 81.63], ['Nagpur', 21.15, 79.09], ['Mumbai', 19.08, 72.88], ['Pune', 18.52, 73.86],
  ['Hyderabad', 17.39, 78.49], ['Bengaluru', 12.97, 77.59], ['Chennai', 13.08, 80.27], ['Kathmandu', 27.72, 85.32],
  ['Thimphu', 27.47, 89.64], ['Lhasa', 29.65, 91.12], ['Kabul', 34.53, 69.17], ['Kandahar', 31.63, 65.74],
  ['Herat', 34.34, 62.2], ['Colombo', 6.93, 79.86], ['Yangon', 16.84, 96.16], ['Mandalay', 21.97, 96.08],
  ['Chiang Mai', 18.79, 98.98], ['Bangkok', 13.76, 100.5], ['Vientiane', 17.97, 102.63], ['Ranchi', 23.34, 85.31],
  ['Jabalpur', 23.18, 79.99], ['Bhopal', 23.26, 77.41], ['Ahmedabad', 23.02, 72.57], ['Guwahati', 26.14, 91.74],
  ['Tashkent', 41.3, 69.24], ['Ashgabat', 37.96, 58.38], ['Muscat', 23.59, 58.41], ['Kunming', 25.04, 102.71],
  ['Xining', 36.62, 101.78], ['Hanoi', 21.03, 105.85], ['Dushanbe', 38.56, 68.77], ['Mashhad', 36.3, 59.6],
  ['Bandar Abbas', 27.18, 56.27], ['Visakhapatnam', 17.69, 83.22], ['Madurai', 9.93, 78.12], ['Gorakhpur', 26.76, 83.37]
];

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestPlace(lat, lng) {
  let best = null;
  for (const [name, plat, plng] of REFERENCE_PLACES) {
    const d = distanceKm(lat, lng, plat, plng);
    if (!best || d < best.km) best = { name, km: d };
  }
  return best;
}

function coordLabel(lat, lng) {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
}

function cellGeometry(cell) {
  // GeoJSON polygon coordinates are [lng, lat]; reversed for d3-geo right-hand rule
  const ring = h3.cellToBoundary(cell).map(([bLat, bLng]) => [bLng, bLat]);
  ring.push(ring[0]);
  ring.reverse();
  return { type: 'Polygon', coordinates: [ring] };
}

function emptyAcc() {
  return {
    count: 0, modis: 0, viirs: 0, frpSum: 0, frpMax: 0, lastKey: -1,
    lastDate: 0, lastTime: 0, sensorSet: new Set(),
    daily: dates.map(() => ({ modis: 0, viirs: 0 }))
  };
}

/**
 * Aggregate all detections into H3 cells and return one region record per cell.
 */
export function generateHexData() {
  const acc = new Map();

  for (const [lat, lng, di, hhmm, sensor, frp] of fireData.rows) {
    const cell = h3.latLngToCell(lat, lng, H3_RESOLUTION);
    let a = acc.get(cell);
    if (!a) { a = emptyAcc(); acc.set(cell, a); }
    const isModis = sensor <= 1;
    a.count += 1;
    if (isModis) { a.modis += 1; a.daily[di].modis += 1; } else { a.viirs += 1; a.daily[di].viirs += 1; }
    a.frpSum += frp;
    if (frp > a.frpMax) a.frpMax = frp;
    const key = di * 10000 + hhmm;
    if (key > a.lastKey) { a.lastKey = key; a.lastDate = di; a.lastTime = hhmm; }
    a.sensorSet.add(sensor);
  }

  // Detection counts of all active cells, used for the percentile-rank comparison
  const counts = [...acc.values()].map((a) => a.count).filter((c) => c > 0);

  const hexList = [];
  for (const [cell, a] of acc) {
    const [lat, lng] = h3.cellToLatLng(cell);
    const near = nearestPlace(lat, lng);
    const level = a.count === 0 ? ACTIVITY_LEVELS.LOW : getActivityLevel(a.count);
    const meanFrp = a.count ? a.frpSum / a.count : 0;
    const isRajshahi = false;

    let sensor = 'No detections';
    if (a.modis && a.viirs) sensor = 'MODIS + VIIRS';
    else if (a.viirs) sensor = 'VIIRS only';
    else if (a.modis) sensor = 'MODIS only';

    let comparison;
    let percentDelta = 0;
    if (a.count === 0) {
      comparison = 'No detections in this window';
    } else {
      const fewer = counts.filter((c) => c < a.count).length;
      percentDelta = Math.round((fewer / counts.length) * 100);
      comparison = `Busier than ${percentDelta}% of active cells`;
    }
    const name = isRajshahi ? 'Rajshahi (Case-Study Cell)' : `Fire Cell near ${near.name}`;

    hexList.push({
      id: cell,
      isCenter: false,
      isLocalArea: true,
      lat,
      lng,
      name,
      subtext: isRajshahi ? 'Bangladesh • original case-study area' : `~${Math.round(near.km)} km from ${near.name}`,
      district: `${coordLabel(lat, lng)}`,
      activityLevel: level,
      recentDetections: a.count,
      lastDetection: a.count ? `${fmtDay(dates[a.lastDate])} • ${fmtTime(a.lastTime)} UTC` : 'No detection in window',
      frp: Math.round(meanFrp * 10) / 10,
      maxFrp: a.frpMax,
      sensor,
      modis: a.modis,
      viirs: a.viirs,
      daily: dates.map((iso, i) => ({
        date: iso,
        label: fmtDay(iso).slice(0, 6),
        modis: a.daily[i].modis,
        viirs: a.daily[i].viirs,
        total: a.daily[i].modis + a.daily[i].viirs
      })),
      historicalComparison: comparison,
      percentDelta,
      hasWarning: a.count > 40,
      description: a.count
        ? `${a.count} detections (${a.modis} MODIS, ${a.viirs} VIIRS) between ${FIRE_META.startLabel} and ${FIRE_META.endLabel}.`
        : `No MODIS or VIIRS detections between ${FIRE_META.startLabel} and ${FIRE_META.endLabel}.`,
      geometry: cellGeometry(cell)
    });
  }

  // Bangladesh districts and places (drawn on top of the regional grid)
  return [...hexList, ...generateBangladeshAreas()];
}

/** The cell selected on first load: Rajshahi district (the project's focal area). */
export function getDefaultHexId(hexData) {
  const raj = getAreaId('Rajshahi', 'Rajshahi');
  if (hexData.some((h) => h.id === raj)) return raj;
  return hexData.reduce((best, h) => (h.recentDetections > best.recentDetections ? h : best), hexData[0]).id;
}
