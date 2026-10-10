/**
 * Converts raw NASA FIRMS downloads in /data/raw into src/data/fireDetections.json
 *
 *   node scripts/build-data.mjs        (or: npm run build:data)
 *
 * Inputs (drop new FIRMS downloads into data/raw and re-run):
 *   - MODIS_C6_1_*_MCD14DL_NRT_*.txt     (MODIS Terra/Aqua, 1 km)
 *   - SUOMI_VIIRS_*.csv / J1_VIIRS_*.csv / J2_VIIRS_*.csv  (VIIRS S-NPP / NOAA-20 / NOAA-21, 375 m)
 *
 * Quality filter: VIIRS 'low' confidence and MODIS confidence < 30 are dropped.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'data', 'raw');
const OUT = path.join(ROOT, 'src', 'data', 'fireDetections.json');

const MODIS_MIN_CONFIDENCE = 30;

// sensor codes used in the compact rows
const SENSORS = ['MODIS Terra', 'MODIS Aqua', 'VIIRS S-NPP', 'VIIRS NOAA-20', 'VIIRS NOAA-21'];

function parseCsv(file) {
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  return lines.map((l) => {
    const v = l.split(',');
    const o = {};
    cols.forEach((c, i) => (o[c] = v[i]));
    return o;
  });
}

const pad4 = (t) => String(t).replace(':', '').padStart(4, '0');

const rows = [];
const stats = {};
const bump = (k, f) => ((stats[k] ||= { read: 0, kept: 0 })[f]++);

for (const name of fs.readdirSync(RAW).sort()) {
  const file = path.join(RAW, name);
  if (/^MODIS/i.test(name)) {
    for (const r of parseCsv(file)) {
      const s = r.satellite === 'T' ? 0 : 1;
      bump(SENSORS[s], 'read');
      if (Number(r.confidence) < MODIS_MIN_CONFIDENCE) continue;
      bump(SENSORS[s], 'kept');
      rows.push([r.latitude, r.longitude, r.acq_date, pad4(r.acq_time), s, r.frp, r.daynight, r.confidence]);
    }
  } else if (/VIIRS/i.test(name) && name.endsWith('.csv')) {
    const s = /^SUOMI/i.test(name) ? 2 : /^J1/i.test(name) ? 3 : 4;
    for (const r of parseCsv(file)) {
      bump(SENSORS[s], 'read');
      if (r.confidence === 'l' || r.confidence === 'low') continue;
      bump(SENSORS[s], 'kept');
      rows.push([r.latitude, r.longitude, r.acq_date, pad4(r.acq_time), s, r.frp, r.daynight, r.confidence]);
    }
  }
}

// Remove exact duplicates (same sensor, position, date, time)
const seen = new Set();
const unique = rows.filter((r) => {
  const k = `${r[0]}|${r[1]}|${r[2]}|${r[3]}|${r[4]}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

const dates = [...new Set(unique.map((r) => r[2]))].sort();

const compact = unique.map((r) => [
  Math.round(Number(r[0]) * 1e4) / 1e4,
  Math.round(Number(r[1]) * 1e4) / 1e4,
  dates.indexOf(r[2]),
  Number(r[3]),            // HHMM UTC as integer
  r[4],                    // sensor code
  Math.round(Number(r[5]) * 10) / 10, // FRP (MW)
  r[6] === 'D' ? 0 : 1,    // 0 = day, 1 = night
]);

const out = {
  meta: {
    source: 'NASA FIRMS (MODIS C6.1 NRT, VIIRS C2 NRT)',
    dates,
    sensors: SENSORS,
    rowFormat: ['lat', 'lng', 'dateIndex', 'hhmmUTC', 'sensor', 'frpMW', 'night'],
    stats,
    total: compact.length,
  },
  rows: compact,
};

fs.writeFileSync(OUT, JSON.stringify(out));
console.log('Dates:', dates.join(', '));
console.table(stats);
console.log(`Wrote ${compact.length} detections -> ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
