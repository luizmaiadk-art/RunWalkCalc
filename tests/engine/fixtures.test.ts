import { describe, it, expect } from 'vitest';
import {
  solveSegment,
  sumDistanceM,
  sumDurationS,
  overallPaceSPerKm,
  runningOnlyPaceSPerKm,
  metersToDisplayDistance,
  sPerKmToDisplay,
  displayDistanceToMeters,
  formatPace,
  formatDuration,
  Segment,
  RepeatBlock,
} from '../../src/engine';

function seg(overrides: Partial<Segment>): Segment {
  return {
    id: crypto.randomUUID(),
    type: 'run',
    distanceM: null,
    durationS: null,
    paceSPerKm: null,
    derived: 'pace',
    ...overrides,
  };
}

// Fixture 1: Linear 10K / 40:00 → 4:00/km
describe('Fixture 1: 10K + 40:00 → pace 4:00/km', () => {
  it('derives pace correctly', () => {
    const result = solveSegment(seg({ distanceM: 10000, durationS: 2400, derived: 'pace' }));
    expect(result.paceSPerKm).toBeCloseTo(240, 5);
    expect(formatPace(result.paceSPerKm)).toBe('4:00');
  });
});

// Fixture 2: All three direction checks
describe('Fixture 2: direction checks', () => {
  it('pace + time → distance 10K', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, durationS: 2400, derived: 'distance' })
    );
    expect(result.distanceM).toBeCloseTo(10000, 3);
  });
  it('pace + distance → time 40:00', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, distanceM: 10000, derived: 'time' })
    );
    expect(result.durationS).toBeCloseTo(2400, 5);
    expect(formatDuration(result.durationS)).toBe('40:00');
  });
});

// Fixture 3: Imperial round-trip (no drift)
describe('Fixture 3: km ↔ mi round-trip', () => {
  const distM = 10000;
  const paceKm = 240;

  it('10K → ~6.2137 mi', () => {
    const mi = metersToDisplayDistance(distM, 'mi');
    expect(mi).toBeCloseTo(6.21371, 4);
  });
  it('4:00/km → ~6:26/mi', () => {
    const paceMi = sPerKmToDisplay(paceKm, 'mi');
    expect(formatPace(paceMi)).toBe('6:26');
  });
  it('round-trips back to original values with no drift', () => {
    const mi = metersToDisplayDistance(distM, 'mi');
    const backM = displayDistanceToMeters(mi, 'mi');
    expect(backM).toBeCloseTo(distM, 3);
  });
});

// Fixture 4: Interval workout aggregation
describe('Fixture 4: 10:00 warmup + 6×(9:00 run + 1:00 walk)', () => {
  const warmup = seg({
    type: 'run',
    durationS: 600,
    paceSPerKm: 360,
    distanceM: 600 / 0.36, // 1666.667m
    derived: 'distance',
  });
  const runRep = seg({
    type: 'run',
    durationS: 540,
    paceSPerKm: 240,
    distanceM: 540 / 0.24, // 2250m
    derived: 'distance',
  });
  const walkRep = seg({
    type: 'walk',
    durationS: 60,
    paceSPerKm: 600,
    distanceM: 60 / 0.6, // 100m
    derived: 'distance',
  });
  const block: RepeatBlock = {
    id: 'block',
    repeat: 6,
    children: [runRep, walkRep],
  };
  const nodes = [warmup, block];

  it('total distance ≈ 15767m', () => {
    expect(sumDistanceM(nodes)).toBeCloseTo(15766.7, 0);
  });

  it('total duration = 4200s (70:00)', () => {
    expect(sumDurationS(nodes)).toBe(4200);
    expect(formatDuration(sumDurationS(nodes))).toBe('1:10:00');
  });

  it('overall pace ≈ 4:26/km (≈266 s/km)', () => {
    const pace = overallPaceSPerKm(nodes);
    expect(pace).toBeCloseTo(266.4, 0);
    expect(formatPace(pace)).toBe('4:26');
  });

  it('running-only pace ≈ 4:13/km (warmup typed run)', () => {
    const pace = runningOnlyPaceSPerKm(nodes);
    expect(pace).toBeCloseTo(253.2, 0);
    expect(formatPace(pace)).toBe('4:13');
  });
});
