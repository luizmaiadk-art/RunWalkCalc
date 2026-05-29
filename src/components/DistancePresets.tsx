import { STANDARD_DISTANCES } from '../engine/constants';

interface Props {
  onSelect: (meters: number) => void;
  activeM: number | null;
}

export function DistancePresets({ onSelect, activeM }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {STANDARD_DISTANCES.map(d => {
        const active = activeM !== null && Math.abs(activeM - d.value) < 1;
        return (
          <button
            key={d.label}
            onClick={() => onSelect(d.value)}
            style={{
              padding: '5px 10px',
              fontSize: 12,
              fontFamily: 'var(--font-num)',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--bg)' : 'var(--text-2)',
              background: active ? 'var(--amber)' : 'var(--surface-hi)',
              border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
