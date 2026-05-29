import { DistanceUnit } from '../engine/types';
interface Props { unit: DistanceUnit; }
export function AdvancedMode({ unit }: Props) {
  return <div>AdvancedMode ({unit})</div>;
}
