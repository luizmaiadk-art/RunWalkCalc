import { DistanceUnit } from '../engine/types';
interface Props { value: DistanceUnit; onChange: (u: DistanceUnit) => void; }
export function UnitToggle({ value, onChange }: Props) {
  return <button onClick={() => onChange(value === 'km' ? 'mi' : 'km')}>{value.toUpperCase()}</button>;
}
