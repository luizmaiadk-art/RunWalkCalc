import { Segment, DistanceUnit } from '../engine/types';
import { TriangleInput } from './TriangleInput';
import { useWorkout } from '../store/context';

interface Props {
  segment: Segment;
  unit: DistanceUnit;
  depth?: number;
}

const TYPE_COLOR: Record<'run' | 'walk', string> = { run: 'var(--run)', walk: 'var(--walk)' };

export function SegmentRow({ segment, unit, depth = 0 }: Props) {
  const { dispatch } = useWorkout();

  function handleChange(updated: Segment) {
    dispatch({ type: 'UPDATE_SEGMENT', id: updated.id, patch: updated });
  }

  return (
    <div style={{ marginLeft: depth * 16, borderLeft: depth > 0 ? `2px solid ${TYPE_COLOR[segment.type]}22` : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--surface)', borderRadius: 'var(--r) var(--r) 0 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLOR[segment.type], flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: TYPE_COLOR[segment.type] }}>
          {segment.type}
        </span>
        {segment.label && (
          <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 4 }}>{segment.label}</span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => dispatch({ type: 'REMOVE_NODE', id: segment.id })}
          style={{ fontSize: 16, color: 'var(--text-3)', padding: '0 4px' }}
          title="Remove segment"
        >
          ×
        </button>
      </div>
      <div style={{ padding: 8, background: 'var(--surface)', borderRadius: '0 0 var(--r) var(--r)' }}>
        <TriangleInput segment={segment} unit={unit} onChange={handleChange} />
      </div>
    </div>
  );
}
