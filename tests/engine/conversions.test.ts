import { describe, it, expect } from 'vitest';
import {
  metersToDisplayDistance,
  displayDistanceToMeters,
  sPerKmToDisplay,
  displayPaceToSPerKm,
} from '../../src/engine/conversions';

describe('metersToDisplayDistance', () => {
  it('10000m → 10 km', () => expect(metersToDisplayDistance(10000, 'km')).toBeCloseTo(10, 5));
  it('1609.344m → 1 mi', () => expect(metersToDisplayDistance(1609.344, 'mi')).toBeCloseTo(1, 5));
  it('10000m in miles', () => expect(metersToDisplayDistance(10000, 'mi')).toBeCloseTo(6.21371, 4));
});

describe('displayDistanceToMeters', () => {
  it('10 km → 10000m', () => expect(displayDistanceToMeters(10, 'km')).toBeCloseTo(10000, 3));
  it('1 mi → 1609.344m', () => expect(displayDistanceToMeters(1, 'mi')).toBeCloseTo(1609.344, 3));
});

describe('sPerKmToDisplay', () => {
  it('240 s/km stays 240 in km mode', () => expect(sPerKmToDisplay(240, 'km')).toBeCloseTo(240, 5));
  it('240 s/km → ~386.2 s/mi in mi mode', () =>
    expect(sPerKmToDisplay(240, 'mi')).toBeCloseTo(240 * 1.609344, 3));
});

describe('displayPaceToSPerKm', () => {
  it('240 s/km (km mode) → 240 s/km', () =>
    expect(displayPaceToSPerKm(240, 'km')).toBeCloseTo(240, 5));
  it('386.2 s/mi (mi mode) → 240 s/km', () =>
    expect(displayPaceToSPerKm(240 * 1.609344, 'mi')).toBeCloseTo(240, 3));
});

describe('round-trip', () => {
  it('10K/40:00 → miles → back to km, no drift', () => {
    const distM = 10000;
    const paceKm = 240;
    const distMi = metersToDisplayDistance(distM, 'mi');
    const paceMi = sPerKmToDisplay(paceKm, 'mi');
    const backM = displayDistanceToMeters(distMi, 'mi');
    const backKm = displayPaceToSPerKm(paceMi, 'mi');
    expect(backM).toBeCloseTo(distM, 3);
    expect(backKm).toBeCloseTo(paceKm, 5);
  });
});
