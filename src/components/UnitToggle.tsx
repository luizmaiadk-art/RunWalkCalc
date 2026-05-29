import { DistanceUnit } from '../engine/types';

interface Props {
  value: DistanceUnit;
  onChange: (u: DistanceUnit) => void;
}

export function UnitToggle({ value, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      overflow: 'hidden',
    }}>
      {(['km', 'mi'] as DistanceUnit[]).map(u => (
        <button
          key={u}
          onClick={() => onChange(u)}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-num)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: value === u ? 'var(--bg)' : 'var(--text-3)',
            background: value === u ? 'var(--amber)' : 'transparent',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {u.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
