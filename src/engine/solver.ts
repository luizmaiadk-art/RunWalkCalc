import { Segment } from './types';

export function solveSegment(seg: Segment): Segment {
  const { distanceM: d, durationS: t, paceSPerKm: p, derived } = seg;

  if (derived === 'pace') {
    if (d !== null && d > 0 && t !== null && t > 0) {
      return { ...seg, paceSPerKm: t / (d / 1000) };
    }
    return { ...seg, paceSPerKm: null };
  }

  if (derived === 'time') {
    if (p !== null && p > 0 && d !== null && d > 0) {
      return { ...seg, durationS: p * (d / 1000) };
    }
    return { ...seg, durationS: null };
  }

  if (derived === 'distance') {
    if (p !== null && p > 0 && t !== null && t > 0) {
      return { ...seg, distanceM: (t / p) * 1000 };
    }
    return { ...seg, distanceM: null };
  }

  return seg;
}
