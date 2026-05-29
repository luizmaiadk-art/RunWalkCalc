import { DistanceUnit } from './types';
import { METERS_PER_MILE } from './constants';

export function metersToDisplayDistance(m: number, unit: DistanceUnit): number {
  return unit === 'km' ? m / 1000 : m / METERS_PER_MILE;
}

export function displayDistanceToMeters(value: number, unit: DistanceUnit): number {
  return unit === 'km' ? value * 1000 : value * METERS_PER_MILE;
}

export function sPerKmToDisplay(sPerKm: number, unit: DistanceUnit): number {
  return unit === 'km' ? sPerKm : sPerKm * 1.609344;
}

export function displayPaceToSPerKm(displayPace: number, unit: DistanceUnit): number {
  return unit === 'km' ? displayPace : displayPace / 1.609344;
}
