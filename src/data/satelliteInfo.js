import { FIRE_META } from './hexData';

/**
 * NASA MODIS & VIIRS Satellite Harmonization Metadata
 * Team STERION - NASA Space Apps Challenge 2026
 */

export const SATELLITE_INFO = {
  modis: {
    name: 'MODIS',
    fullName: 'Moderate Resolution Imaging Spectroradiometer',
    satellites: ['Terra (EOS AM-1)', 'Aqua (EOS PM-1)'],
    agency: 'NASA Goddard Space Flight Center',
    spatialResolution: '1,000 meters (1 km at nadir)',
    spectralBands: 'Channel 21/22 (3.96 µm) & Channel 31 (11.0 µm)',
    temporalBaseline: '2000–Present (26+ years continuous baseline)',
    overpassTimes: '10:30 AM/PM (Terra), 01:30 AM/PM (Aqua) local solar time',
    strengths: 'Gold-standard long-term climate reference, robust fire radiative power calibration.'
  },
  viirs: {
    name: 'VIIRS',
    fullName: 'Visible Infrared Imaging Radiometer Suite',
    satellites: ['Suomi NPP', 'NOAA-20 (JPSS-1)', 'NOAA-21 (JPSS-2)'],
    agency: 'NASA / NOAA Joint Polar Satellite System',
    spatialResolution: '375 meters (I-bands)',
    spectralBands: 'I4 (3.74 µm) & I5 (11.45 µm) high-resolution thermal imaging',
    temporalBaseline: '2012–Present',
    overpassTimes: '01:30 AM/PM local solar time (overlapping Aqua)',
    strengths: 'Higher spatial fidelity, capable of detecting small agricultural stubble fires down to 0.01 hectares that 1km MODIS pixels often dilute.'
  },
  harmonizationProtocol: {
    title: 'MODIS + VIIRS Harmonization Protocol',
    methodology: 'Cross-sensor intercalibration using spatial point-spread function weighting and FRP scaling coefficients.',
    quote: 'MODIS and VIIRS observations are harmonized to provide a more consistent view of burning activity.',
    disclaimer: `NASA FIRMS near-real-time MODIS + VIIRS snapshot (${FIRE_META.startLabel} – ${FIRE_META.endLabel}). Low-confidence detections removed. Bangladesh district & place values combine FIRMS detections with modelled estimates.`
  }
};
