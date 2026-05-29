import { describe, it, expect } from 'vitest';
import {
  parseTimeInput,
  parsePaceInput,
  parseDistanceInput,
  formatDuration,
  formatPace,
  formatDistance,
} from '../../src/engine/formatting';

describe('parseTimeInput', () => {
  it('parses m:ss', () => expect(parseTimeInput('4:00')).toBe(240));
  it('parses h:mm:ss', () => expect(parseTimeInput('1:10:00')).toBe(4200));
  it('parses mm:ss', () => expect(parseTimeInput('40:00')).toBe(2400));
  it('returns null for empty string', () => expect(parseTimeInput('')).toBeNull());
  it('returns null for zero', () => expect(parseTimeInput('0:00')).toBeNull());
  it('returns null for garbage', () => expect(parseTimeInput('abc')).toBeNull());
  it('returns null for negative', () => expect(parseTimeInput('-1:00')).toBeNull());
});

describe('parsePaceInput', () => {
  it('parses m:ss pace', () => expect(parsePaceInput('4:00')).toBe(240));
  it('parses 6:26 pace', () => expect(parsePaceInput('6:26')).toBe(386));
  it('returns null for empty', () => expect(parsePaceInput('')).toBeNull());
  it('returns null for 0:00', () => expect(parsePaceInput('0:00')).toBeNull());
});

describe('parseDistanceInput', () => {
  it('parses km', () => expect(parseDistanceInput('10', 'km')).toBeCloseTo(10000, 0));
  it('parses miles', () =>
    expect(parseDistanceInput('6.2137', 'mi')).toBeCloseTo(10000, 0));
  it('returns null for zero', () => expect(parseDistanceInput('0', 'km')).toBeNull());
  it('returns null for negative', () => expect(parseDistanceInput('-5', 'km')).toBeNull());
  it('returns null for empty', () => expect(parseDistanceInput('', 'km')).toBeNull());
});

describe('formatDuration', () => {
  it('formats under 1 hour as m:ss', () => expect(formatDuration(2400)).toBe('40:00'));
  it('formats exactly 1 hour as h:mm:ss', () => expect(formatDuration(3600)).toBe('1:00:00'));
  it('formats 4200s as 1:10:00', () => expect(formatDuration(4200)).toBe('1:10:00'));
  it('returns empty string for null', () => expect(formatDuration(null)).toBe(''));
});

describe('formatPace', () => {
  it('formats 240 s/km as 4:00', () => expect(formatPace(240)).toBe('4:00'));
  it('formats 386 s/km as 6:26', () => expect(formatPace(386)).toBe('6:26'));
  it('returns empty for null', () => expect(formatPace(null)).toBe(''));
});

describe('formatDistance', () => {
  it('formats 10000m as 10 km', () => expect(formatDistance(10000, 'km')).toBe('10'));
  it('formats 10000m in miles', () =>
    expect(formatDistance(10000, 'mi')).toMatch(/^6\.21/));
  it('returns empty for null', () => expect(formatDistance(null, 'km')).toBe(''));
});
