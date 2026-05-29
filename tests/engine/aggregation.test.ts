import { describe, it, expect } from 'vitest';
import {
  sumDistanceM,
  sumDurationS,
  overallPaceSPerKm,
  runningOnlyPaceSPerKm,
} from '../../src/engine/aggregation';
import { Segment, RepeatBlock, WorkoutNode } from '../../src/engine/types';

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

function block(repeat: number, children: WorkoutNode[]): RepeatBlock {
  return { id: crypto.randomUUID(), repeat, children };
}

describe('sumDistanceM', () => {
  it('sums flat segments', () => {
    const nodes = [seg({ distanceM: 5000 }), seg({ distanceM: 3000 })];
    expect(sumDistanceM(nodes)).toBeCloseTo(8000, 3);
  });
  it('multiplies repeat block children by repeat count', () => {
    const nodes = [block(3, [seg({ distanceM: 1000 })])];
    expect(sumDistanceM(nodes)).toBeCloseTo(3000, 3);
  });
  it('treats null distanceM as 0', () => {
    expect(sumDistanceM([seg({ distanceM: null })])).toBe(0);
  });
});

describe('sumDurationS', () => {
  it('sums flat segments', () => {
    const nodes = [seg({ durationS: 600 }), seg({ durationS: 300 })];
    expect(sumDurationS(nodes)).toBe(900);
  });
  it('multiplies by repeat', () => {
    const nodes = [block(6, [seg({ durationS: 600 })])];
    expect(sumDurationS(nodes)).toBe(3600);
  });
});

describe('overallPaceSPerKm', () => {
  it('computes pace from totals', () => {
    const nodes = [seg({ distanceM: 10000, durationS: 2400 })];
    expect(overallPaceSPerKm(nodes)).toBeCloseTo(240, 3);
  });
  it('returns null when no distance', () => {
    expect(overallPaceSPerKm([seg({ durationS: 600 })])).toBeNull();
  });
});

describe('runningOnlyPaceSPerKm', () => {
  it('excludes walk segments', () => {
    const nodes = [
      seg({ type: 'run', distanceM: 2250, durationS: 540 }),
      seg({ type: 'walk', distanceM: 100, durationS: 60 }),
    ];
    expect(runningOnlyPaceSPerKm(nodes)).toBeCloseTo(240, 3);
  });
  it('handles run segments inside repeat block', () => {
    const nodes = [
      block(6, [
        seg({ type: 'run', distanceM: 2250, durationS: 540 }),
        seg({ type: 'walk', distanceM: 100, durationS: 60 }),
      ]),
    ];
    const pace = runningOnlyPaceSPerKm(nodes);
    expect(pace).toBeCloseTo(240, 3);
  });
  it('returns null when no run segments have distance', () => {
    expect(runningOnlyPaceSPerKm([seg({ type: 'walk', distanceM: 500, durationS: 300 })])).toBeNull();
  });
});
