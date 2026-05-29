export type DistanceUnit = 'km' | 'mi';
export type TriField = 'distance' | 'time' | 'pace';
export type SegmentType = 'run' | 'walk';

export interface Segment {
  id: string;
  type: SegmentType;
  distanceM: number | null;
  durationS: number | null;
  paceSPerKm: number | null;
  derived: TriField;
  label?: string;
}

export interface RepeatBlock {
  id: string;
  repeat: number;
  children: WorkoutNode[];
}

export type WorkoutNode = Segment | RepeatBlock;

export interface Workout {
  id: string;
  name: string;
  units: DistanceUnit;
  nodes: WorkoutNode[];
}

export function isRepeatBlock(node: WorkoutNode): node is RepeatBlock {
  return 'children' in node;
}

export function isSegment(node: WorkoutNode): node is Segment {
  return 'type' in node && 'derived' in node;
}
