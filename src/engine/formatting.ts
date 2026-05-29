import { DistanceUnit } from './types';
import { METERS_PER_MILE } from './constants';

function parseMmSs(input: string): number | null {
  const parts = input.trim().split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    const total = m * 60 + s;
    return total > 0 ? total : null;
  }
  if (parts.length === 3) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseInt(parts[2], 10);
    if (isNaN(h) || isNaN(m) || isNaN(s) || h < 0 || m < 0 || m >= 60 || s < 0 || s >= 60)
      return null;
    const total = h * 3600 + m * 60 + s;
    return total > 0 ? total : null;
  }
  return null;
}

export function parseTimeInput(input: string): number | null {
  return parseMmSs(input);
}

export function parsePaceInput(input: string): number | null {
  return parseMmSs(input);
}

export function parseDistanceInput(input: string, unit: DistanceUnit): number | null {
  const v = parseFloat(input);
  if (!isFinite(v) || v <= 0) return null;
  return unit === 'km' ? v * 1000 : v * METERS_PER_MILE;
}

export function formatDuration(totalS: number | null): string {
  if (totalS === null || !isFinite(totalS) || totalS <= 0) return '';
  const r = Math.round(totalS);
  const h = Math.floor(r / 3600);
  const m = Math.floor((r % 3600) / 60);
  const s = r % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatPace(sPerKm: number | null): string {
  if (sPerKm === null || !isFinite(sPerKm) || sPerKm <= 0) return '';
  const r = Math.round(sPerKm);
  const m = Math.floor(r / 60);
  const s = r % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDistance(m: number | null, unit: DistanceUnit): string {
  if (m === null || !isFinite(m) || m <= 0) return '';
  const v = unit === 'km' ? m / 1000 : m / METERS_PER_MILE;
  const str = v.toPrecision(6).replace(/\.?0+$/, '');
  return str;
}
