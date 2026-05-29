import { DistanceUnit, Segment } from '../engine/types';
interface Props { unit: DistanceUnit; onSegmentChange: (seg: Segment) => void; }
export function SimpleMode({ unit }: Props) {
  return <div>SimpleMode ({unit})</div>;
}
