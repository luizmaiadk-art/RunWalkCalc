export const METERS_PER_MILE = 1609.344;

export const STANDARD_DISTANCES = [
  { label: '400 m', value: 400 },
  { label: '1 K', value: 1000 },
  { label: '1 mi', value: METERS_PER_MILE },
  { label: '5 K', value: 5000 },
  { label: '10 K', value: 10000 },
  { label: 'Half', value: 21097.5 },
  { label: 'Marathon', value: 42195 },
] as const;

export const GALLOWAY_PRESETS = [
  { label: '4:00 / 1:00', runS: 240, walkS: 60 },
  { label: '2:00 / 1:00', runS: 120, walkS: 60 },
  { label: '0:30 / 0:30', runS: 30, walkS: 30 },
] as const;
