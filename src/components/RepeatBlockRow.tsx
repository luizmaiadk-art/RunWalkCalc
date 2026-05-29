import { RepeatBlock, DistanceUnit, isSegment } from '../engine/types';
import { SegmentRow } from './SegmentRow';
import { useWorkout } from '../store/context';

interface Props {
  block: RepeatBlock;
  unit: DistanceUnit;
}

export function RepeatBlockRow({ block, unit }: Props) {
  const { dispatch } = useWorkout();

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'var(--surface-hi)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>
          Repeat
        </span>
        <input
          type="number"
          min={1}
          max={99}
          value={block.repeat}
          onChange={e => dispatch({ type: 'SET_REPEAT', id: block.id, count: parseInt(e.target.value, 10) || 1 })}
          style={{
            width: 44, textAlign: 'center', fontFamily: 'var(--font-num)',
            fontWeight: 600, fontSize: 16, color: 'var(--text-1)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)', padding: '2px 4px',
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>×</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: block.id, segType: 'run' })}
          style={{ fontSize: 11, color: 'var(--run)', padding: '3px 8px', border: '1px solid var(--run)33', borderRadius: 'var(--r-sm)', background: 'var(--run)0d' }}
        >
          + Run
        </button>
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: block.id, segType: 'walk' })}
          style={{ fontSize: 11, color: 'var(--walk)', padding: '3px 8px', border: '1px solid var(--walk)33', borderRadius: 'var(--r-sm)', background: 'var(--walk)0d' }}
        >
          + Walk
        </button>
        <button
          onClick={() => dispatch({ type: 'REMOVE_NODE', id: block.id })}
          style={{ fontSize: 16, color: 'var(--text-3)', padding: '0 4px' }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {block.children.map(child =>
          isSegment(child) ? (
            <SegmentRow key={child.id} segment={child} unit={unit} depth={1} />
          ) : null
        )}
        {block.children.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '8px 0' }}>
            No segments — add Run or Walk above
          </p>
        )}
      </div>
    </div>
  );
}
