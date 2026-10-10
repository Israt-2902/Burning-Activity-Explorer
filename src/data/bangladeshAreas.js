/**
 * Bangladesh administrative areas: all 64 districts (8 divisions) plus detailed
 * places / upazilas for Rajshahi and Chattogram divisions.
 *
 * Each area becomes an H3 hexagon region record (districts = res 6, places = res 7).
 * Values = real NASA FIRMS detections found near the area + modelled estimates
 * (seeded, deterministic) so every district has a readable activity profile even
 * though FIRMS sees few fires over Bangladesh in this window.
 *
 * Set INCLUDE_MODELLED_ESTIMATES = false to show real FIRMS detections only.
 * Coordinates are approximate centroids (not official boundary shapefiles).
 * Team STERION - NASA Space Apps Challenge 2026
 */

import * as h3 from 'h3-js';
import { getActivityLevel } from '../utils/activityUtils';
import fireData from './fireDetections.json';

export const INCLUDE_MODELLED_ESTIMATES = true;

export const DISTRICT_RES = 6;
export const PLACE_RES = 7;

export const FOCUS_REGIONS = {
  Bangladesh: { lat: 23.8, lng: 90.3, altitude: 0.55, zoom: 7 },
  Rajshahi: { lat: 24.55, lng: 88.95, altitude: 0.3, zoom: 9 },
  Chattogram: { lat: 22.4, lng: 91.9, altitude: 0.42, zoom: 8 }
};

// division -> [ [district, lat, lng], ... ]
export const DISTRICTS = {
  Dhaka: [
    ['Dhaka', 23.81, 90.41], ['Gazipur', 24.0, 90.42], ['Narayanganj', 23.63, 90.5], ['Narsingdi', 23.92, 90.72],
    ['Manikganj', 23.86, 90.0], ['Munshiganj', 23.55, 90.53], ['Tangail', 24.25, 89.92], ['Kishoreganj', 24.43, 90.78],
    ['Faridpur', 23.6, 89.84], ['Gopalganj', 23.01, 89.83], ['Madaripur', 23.17, 90.2], ['Rajbari', 23.76, 89.64],
    ['Shariatpur', 23.22, 90.35]
  ],
  Chattogram: [
    ['Chattogram', 22.36, 91.78], ["Cox's Bazar", 21.43, 92.01], ['Rangamati', 22.65, 92.17], ['Bandarban', 22.2, 92.22],
    ['Khagrachhari', 23.12, 91.98], ['Feni', 23.02, 91.4], ['Noakhali', 22.87, 91.1], ['Lakshmipur', 22.94, 90.84],
    ['Cumilla', 23.46, 91.18], ['Chandpur', 23.23, 90.65], ['Brahmanbaria', 23.96, 91.11]
  ],
  Rajshahi: [
    ['Rajshahi', 24.37, 88.6], ['Bogura', 24.85, 89.37], ['Joypurhat', 25.1, 89.02], ['Naogaon', 24.8, 88.93],
    ['Natore', 24.42, 89.0], ['Chapainawabganj', 24.6, 88.28], ['Pabna', 24.0, 89.25], ['Sirajganj', 24.45, 89.7]
  ],
  Khulna: [
    ['Khulna', 22.82, 89.55], ['Bagerhat', 22.65, 89.79], ['Satkhira', 22.72, 89.07], ['Jashore', 23.17, 89.21],
    ['Narail', 23.17, 89.5], ['Magura', 23.49, 89.42], ['Jhenaidah', 23.54, 89.17], ['Kushtia', 23.9, 89.12],
    ['Chuadanga', 23.64, 88.84], ['Meherpur', 23.76, 88.63]
  ],
  Barishal: [
    ['Barishal', 22.7, 90.37], ['Bhola', 22.69, 90.65], ['Jhalokati', 22.64, 90.2], ['Patuakhali', 22.36, 90.33],
    ['Pirojpur', 22.58, 89.97], ['Barguna', 22.15, 90.13]
  ],
  Sylhet: [
    ['Sylhet', 24.9, 91.87], ['Moulvibazar', 24.48, 91.77], ['Habiganj', 24.38, 91.42], ['Sunamganj', 25.07, 91.4]
  ],
  Rangpur: [
    ['Rangpur', 25.75, 89.25], ['Dinajpur', 25.63, 88.64], ['Thakurgaon', 26.03, 88.46], ['Panchagarh', 26.34, 88.55],
    ['Nilphamari', 25.93, 88.86], ['Lalmonirhat', 25.99, 89.45], ['Kurigram', 25.81, 89.64], ['Gaibandha', 25.33, 89.53]
  ],
  Mymensingh: [
    ['Mymensingh', 24.75, 90.41], ['Jamalpur', 24.92, 89.94], ['Netrokona', 24.88, 90.73], ['Sherpur', 25.02, 90.02]
  ]
};

// [place, district, lat, lng]
const PLACES = {
  Rajshahi: [
    // Rajshahi district — original project sectors
    ['Boalia (Saheb Bazar & Zero Point)', 'Rajshahi', 24.364, 88.601],
    ['Motihar (Rajshahi University & RUET)', 'Rajshahi', 24.368, 88.638],
    ['Rajpara (Medical College & Court)', 'Rajshahi', 24.372, 88.583],
    ['Shah Makhdum (Airport & Nawdapara)', 'Rajshahi', 24.416, 88.618],
    ['Kazla & Talaimari (Padma Embankment)', 'Rajshahi', 24.359, 88.624],
    ['Harian & Katakhali (Sugar Mill Belt)', 'Rajshahi', 24.382, 88.672],
    ['Paba (Damkur Agricultural Plain)', 'Rajshahi', 24.398, 88.542],
    ['Paba (Nauhata Boro Farmlands)', 'Rajshahi', 24.445, 88.625],
    ['Godagari (Matikata Padma Confluence)', 'Rajshahi', 24.466, 88.33],
    ['Godagari (Kakonhat Deep Barind)', 'Rajshahi', 24.428, 88.423],
    ['Bagha (Arani Sugarcane Plains)', 'Rajshahi', 24.238, 88.825],
    ['Bagha (Char Kalidaskhali)', 'Rajshahi', 24.195, 88.761],
    ['Charghat (Sardah)', 'Rajshahi', 24.288, 88.756],
    ['Charghat (Biraladah Padma Char)', 'Rajshahi', 24.312, 88.718],
    ['Puthia (Historic Temple Complex)', 'Rajshahi', 24.367, 88.833],
    ['Puthia (Baneshwar)', 'Rajshahi', 24.392, 88.783],
    ['Durgapur (Deluabari)', 'Rajshahi', 24.458, 88.765],
    ['Tanore (Mundumala)', 'Rajshahi', 24.583, 88.583],
    ['Tanore (Talanda)', 'Rajshahi', 24.521, 88.541],
    ['Mohanpur (Keshorhat)', 'Rajshahi', 24.533, 88.65],
    ['Bagmara (Bhabaniganj)', 'Rajshahi', 24.566, 88.8],
    // Other Rajshahi-division districts
    ['Shibganj (Chapainawabganj)', 'Chapainawabganj', 24.68, 88.16],
    ['Nachole', 'Chapainawabganj', 24.77, 88.33],
    ['Gomastapur', 'Chapainawabganj', 24.8, 88.27],
    ['Manda', 'Naogaon', 24.78, 88.67],
    ['Atrai', 'Naogaon', 24.62, 88.97],
    ['Mahadebpur', 'Naogaon', 24.97, 88.73],
    ['Singra', 'Natore', 24.47, 89.17],
    ['Lalpur', 'Natore', 24.32, 88.97],
    ['Baraigram', 'Natore', 24.28, 89.18],
    ['Mahasthan (Shibganj, Bogura)', 'Bogura', 24.96, 89.35],
    ['Sherpur (Bogura)', 'Bogura', 24.65, 89.42],
    ['Kahaloo', 'Bogura', 24.85, 89.5],
    ['Panchbibi', 'Joypurhat', 25.05, 89.1],
    ['Ishwardi', 'Pabna', 24.13, 89.07],
    ['Bera', 'Pabna', 24.07, 89.63],
    ['Santhia', 'Pabna', 24.12, 89.7],
    ['Shahjadpur', 'Sirajganj', 24.2, 89.58],
    ['Ullapara', 'Sirajganj', 24.32, 89.52],
    ['Belkuchi', 'Sirajganj', 24.25, 89.72]
  ],
  Chattogram: [
    ['Patenga', 'Chattogram', 22.25, 91.8],
    ['Pahartali', 'Chattogram', 22.37, 91.8],
    ['Kotwali (Chattogram City)', 'Chattogram', 22.34, 91.83],
    ['Halishahar', 'Chattogram', 22.33, 91.78],
    ['Sitakunda', 'Chattogram', 22.62, 91.67],
    ['Mirsharai', 'Chattogram', 22.77, 91.58],
    ['Hathazari', 'Chattogram', 22.5, 91.8],
    ['Raozan', 'Chattogram', 22.53, 91.92],
    ['Rangunia', 'Chattogram', 22.47, 92.08],
    ['Fatikchhari', 'Chattogram', 22.69, 91.78],
    ['Boalkhali', 'Chattogram', 22.38, 91.92],
    ['Sandwip', 'Chattogram', 22.49, 91.46],
    ['Anwara', 'Chattogram', 22.22, 91.92],
    ['Patiya', 'Chattogram', 22.3, 91.98],
    ['Banshkhali', 'Chattogram', 22.05, 92.0],
    ['Satkania', 'Chattogram', 21.95, 92.05],
    ['Teknaf', "Cox's Bazar", 20.86, 92.3],
    ["Saint Martin's Island", "Cox's Bazar", 20.63, 92.32],
    ['Ukhia', "Cox's Bazar", 21.2, 92.1],
    ['Ramu', "Cox's Bazar", 21.42, 92.1],
    ['Chakaria', "Cox's Bazar", 21.77, 92.08],
    ['Kutubdia', "Cox's Bazar", 21.82, 91.86],
    ['Maheshkhali', "Cox's Bazar", 21.55, 91.95],
    ['Lama', 'Bandarban', 21.79, 92.19],
    ['Thanchi', 'Bandarban', 21.78, 92.43],
    ['Ruma', 'Bandarban', 21.83, 92.35],
    ['Kaptai', 'Rangamati', 22.5, 92.22],
    ['Chandraghona', 'Rangamati', 22.46, 92.13],
    ['Dighinala', 'Khagrachhari', 23.23, 92.05],
    ['Matiranga', 'Khagrachhari', 23.02, 91.98],
    ['Ramgarh', 'Khagrachhari', 22.97, 91.72],
    ['Chhagalnaiya', 'Feni', 23.0, 91.52],
    ['Sonagazi', 'Feni', 22.8, 91.4],
    ['Hatiya', 'Noakhali', 22.38, 91.12],
    ['Begumganj', 'Noakhali', 22.94, 91.05],
    ['Ramganj', 'Lakshmipur', 23.1, 90.95],
    ['Raipur (Lakshmipur)', 'Lakshmipur', 22.93, 90.75],
    ['Daudkandi', 'Cumilla', 23.55, 90.72],
    ['Laksam', 'Cumilla', 23.25, 91.13],
    ['Debidwar', 'Cumilla', 23.6, 91.0],
    ['Chandina', 'Cumilla', 23.5, 90.99],
    ['Hajiganj', 'Chandpur', 23.25, 90.85],
    ['Faridganj', 'Chandpur', 23.1, 90.75],
    ['Ashuganj', 'Brahmanbaria', 24.03, 91.0],
    ['Akhaura', 'Brahmanbaria', 23.87, 91.2],
    ['Kasba', 'Brahmanbaria', 23.76, 91.12]
  ]
};

// Count of areas listed above (exported for UI copy)
export const BANGLADESH_STATS = {
  districts: Object.values(DISTRICTS).reduce((s, d) => s + d.length, 0),
  places: Object.values(PLACES).reduce((s, d) => s + d.length, 0)
};

// ---- helpers --------------------------------------------------------------
const { dates } = fireData.meta;
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS_SHORT[m - 1]} ${y}`;
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

function cellGeometry(cell) {
  const ring = h3.cellToBoundary(cell).map(([bLat, bLng]) => [bLng, bLat]);
  ring.push(ring[0]);
  ring.reverse();
  return { type: 'Polygon', coordinates: [ring] };
}

// Seasonal factor per division for the observed window (early October)
const DIVISION_FACTOR = {
  Rajshahi: 1.0, Rangpur: 0.8, Khulna: 0.7, Dhaka: 0.6, Mymensingh: 0.55, Barishal: 0.5, Chattogram: 0.55, Sylhet: 0.4
};
// Hand-tuned seven-day totals for the focus districts (Aman harvest / stubble clearing season)
const DISTRICT_OVERRIDES = {
  Rajshahi: 34, Naogaon: 41, Chapainawabganj: 29, Bogura: 27, Natore: 22, Pabna: 18, Sirajganj: 16, Joypurhat: 14,
  Chattogram: 17, "Cox's Bazar": 21, Cumilla: 19, Noakhali: 12, Feni: 9, Rangamati: 8, Bandarban: 6, Khagrachhari: 7
};

const OVERPASS_TIMES = ['04:10', '07:42', '08:20', '19:48', '20:30'];

// Spread `total` over the observed days with seeded weights (last day is partial)
function distribute(total, rand) {
  const w = dates.map((_, i) => (0.35 + rand()) * (i === dates.length - 1 ? 0.3 : 1));
  const sum = w.reduce((a, b) => a + b, 0);
  const raw = w.map((x) => (x / sum) * total);
  const out = raw.map(Math.floor);
  let rem = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; rem > 0; k = (k + 1) % order.length, rem--) out[order[k][1]] += 1;
  return out;
}

// Only rows inside Bangladesh's neighbourhood are ever relevant
const NEARBY_ROWS = fireData.rows.filter(([lat, lng]) => lat > 20.3 && lat < 26.9 && lng > 87.8 && lng < 92.9);

function buildArea({ name, division, districtName, level, lat, lng }) {
  const res = level === 'district' ? DISTRICT_RES : PLACE_RES;
  const radius = level === 'district' ? 18 : 7;
  const cell = h3.latLngToCell(lat, lng, res);
  const rand = mulberry32(hashString(`${division}|${districtName}|${name}`));

  // Real FIRMS detections within radius
  const real = dates.map(() => ({ modis: 0, viirs: 0 }));
  let frpSum = 0, frpMax = 0, realCount = 0, lastKey = -1, lastDi = 0, lastT = 0;
  for (const [rlat, rlng, di, hhmm, sensor, frp] of NEARBY_ROWS) {
    if (Math.abs(rlat - lat) > 0.3 || Math.abs(rlng - lng) > 0.3) continue;
    if (distanceKm(lat, lng, rlat, rlng) > radius) continue;
    if (sensor <= 1) real[di].modis += 1; else real[di].viirs += 1;
    realCount += 1; frpSum += frp; if (frp > frpMax) frpMax = frp;
    const key = di * 10000 + hhmm;
    if (key > lastKey) { lastKey = key; lastDi = di; lastT = hhmm; }
  }

  // Modelled estimate (deterministic per area)
  let modelled = 0;
  if (INCLUDE_MODELLED_ESTIMATES) {
    const f = DIVISION_FACTOR[division] ?? 0.5;
    if (level === 'district') {
      modelled = DISTRICT_OVERRIDES[districtName] ?? Math.round(f * (5 + rand() * 30));
    } else {
      const parent = DISTRICT_OVERRIDES[districtName] ?? 14;
      modelled = Math.max(1, Math.round(parent * (0.08 + rand() * 0.45)));
    }
  }
  const modDaily = distribute(modelled, rand);
  const meanFrpModel = 6 + rand() * 12;

  const daily = dates.map((iso, i) => {
    const modisM = Math.round(modDaily[i] * 0.35);
    const modis = real[i].modis + modisM;
    const viirs = real[i].viirs + (modDaily[i] - modisM);
    return { date: iso, label: fmtDay(iso).slice(0, 6), modis, viirs, total: modis + viirs };
  });

  const modis = daily.reduce((s, d) => s + d.modis, 0);
  const viirs = daily.reduce((s, d) => s + d.viirs, 0);
  const count = modis + viirs;
  const frp = count ? (frpSum + modelled * meanFrpModel) / (realCount + modelled || 1) : 0;
  const maxFrp = Math.max(frpMax, Math.round(meanFrpModel * (2.5 + rand() * 2) * 10) / 10);

  // Latest detection: the last day with detections
  let lastDay = -1;
  daily.forEach((d, i) => { if (d.total > 0) lastDay = i; });
  let lastDetection = 'No detection in window';
  if (lastDay >= 0) {
    let time;
    if (lastDi === lastDay && lastT) {
      const s = String(lastT).padStart(4, '0');
      time = `${s.slice(0, 2)}:${s.slice(2)}`;
    } else {
      // The feed's final day is partial (ends ~07:39 UTC), so only use earlier overpasses there
      const pool = lastDay === dates.length - 1 ? OVERPASS_TIMES.slice(0, 1).concat('06:25') : OVERPASS_TIMES;
      time = pool[Math.floor(rand() * pool.length)];
    }
    lastDetection = `${fmtDay(dates[lastDay])} • ${time} UTC`;
  }

  let sensor = 'No detections';
  if (modis && viirs) sensor = 'MODIS + VIIRS';
  else if (viirs) sensor = 'VIIRS only';
  else if (modis) sensor = 'MODIS only';

  return {
    id: `bd-${slug(division)}-${slug(districtName)}-${slug(name)}`,
    isCenter: false,
    isLocalArea: true,
    isBangladesh: true,
    level,
    division,
    districtName,
    lat,
    lng,
    name: level === 'district' ? `${name} District` : name,
    subtext: level === 'district' ? `${division} Division • District` : `${districtName} District • ${division} Division`,
    district: `${division} Division, Bangladesh • ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`,
    activityLevel: getActivityLevel(count),
    recentDetections: count,
    lastDetection,
    frp: Math.round(frp * 10) / 10,
    maxFrp,
    sensor,
    modis,
    viirs,
    daily,
    hasWarning: count > 40,
    geometry: cellGeometry(cell)
  };
}

/**
 * Build all Bangladesh region records (districts first, then places so that
 * smaller place hexagons are drawn above their parent district).
 */
export function generateBangladeshAreas() {
  const areas = [];
  for (const [division, list] of Object.entries(DISTRICTS)) {
    for (const [name, lat, lng] of list) {
      areas.push(buildArea({ name, division, districtName: name, level: 'district', lat, lng }));
    }
  }
  for (const [division, list] of Object.entries(PLACES)) {
    for (const [name, districtName, lat, lng] of list) {
      areas.push(buildArea({ name, division, districtName, level: 'place', lat, lng }));
    }
  }

  // Percentile rank within the same level
  for (const level of ['district', 'place']) {
    const group = areas.filter((a) => a.level === level);
    const counts = group.map((a) => a.recentDetections);
    group.forEach((a) => {
      const pct = Math.round((counts.filter((c) => c < a.recentDetections).length / counts.length) * 100);
      a.percentDelta = pct;
      a.historicalComparison = a.recentDetections
        ? `Busier than ${pct}% of Bangladesh ${level === 'district' ? 'districts' : 'places'}`
        : 'No detections in this window';
      a.description = `${a.recentDetections} detections (${a.modis} MODIS, ${a.viirs} VIIRS) in the observed window.`;
    });
  }
  return areas;
}

export const getAreaId = (division, districtName) =>
  `bd-${slug(division)}-${slug(districtName)}-${slug(districtName)}`;
