import { describe, it, expect } from 'vitest';
import { solveSegment } from '../../src/engine/solver';
import { Segment } from '../../src/engine/types';

function seg(overrides: Partial<Segment>): Segment {
  return {
    id: 'test',
    type: 'run',
    distanceM: null,
    durationS: null,
    paceSPerKm: null,
    derived: 'pace',
    ...overrides,
  };
}

describe('solveSegment — derive pace', () => {
  it('10K + 40:00 → 4:00/km (240 s/km)', () => {
    const result = solveSegment(seg({ distanceM: 10000, durationS: 2400, derived: 'pace' }));
    expect(result.paceSPerKm).toBeCloseTo(240, 5);
  });
  it('returns null pace when only distance given', () => {
    const result = solveSegment(seg({ distanceM: 10000, derived: 'pace' }));
    expect(result.paceSPerKm).toBeNull();
  });
});

describe('solveSegment — derive time', () => {
  it('4:00/km + 10K → 40:00 (2400s)', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, distanceM: 10000, derived: 'time' })
    );
    expect(result.durationS).toBeCloseTo(2400, 5);
  });
  it('returns null time when only pace given', () => {
    const result = solveSegment(seg({ paceSPerKm: 240, derived: 'time' }));
    expect(result.durationS).toBeNull();
  });
});

describe('solveSegment — derive distance', () => {
  it('4:00/km + 40:00 → 10K (10000m)', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, durationS: 2400, derived: 'distance' })
    );
    expect(result.distanceM).toBeCloseTo(10000, 3);
  });
  it('returns null distance when only time given', () => {
    const result = solveSegment(seg({ durationS: 2400, derived: 'distance' }));
    expect(result.distanceM).toBeNull();
  });
});

describe('solveSegment — edge cases', () => {
  it('does not mutate input segment', () => {
    const input = seg({ distanceM: 10000, durationS: 2400, derived: 'pace' });
    solveSegment(input);
    expect(input.paceSPerKm).toBeNull();
  });
  it('ignores zero distance (would cause divide-by-zero)', () => {
    const result = solveSegment(seg({ distanceM: 0, durationS: 2400, derived: 'pace' }));
    expect(result.paceSPerKm).toBeNull();
  });
  it('ignores zero pace (would cause divide-by-zero)', () => {
    const result = solveSegment(seg({ paceSPerKm: 0, durationS: 2400, derived: 'distance' }));
    expect(result.distanceM).toBeNull();
  });
});
