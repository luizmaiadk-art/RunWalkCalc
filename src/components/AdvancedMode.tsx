import { useState } from 'react';
import { DistanceUnit, isSegment, isRepeatBlock } from '../engine/types';
import { useWorkout } from '../store/context';
import { SegmentRow } from './SegmentRow';
import { RepeatBlockRow } from './RepeatBlockRow';
import { TotalsPanel } from './TotalsPanel';
import { RunWalkPreset } from './RunWalkPreset';

interface Props {
  unit: DistanceUnit;
}

export function AdvancedMode({ unit }: Props) {
  const { workout, dispatch } = useWorkout();
  const [showPreset, setShowPreset] = useState(false);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input
        value={workout.name}
        onChange={e => dispatch({ type: 'SET_NAME', name: e.target.value })}
        style={{
          fontSize: 18, fontWeight: 600, color: 'var(--text-1)',
          background: 'transparent', border: 'none', outline: 'none',
          borderBottom: '1px solid var(--border)', padding: '4px 0',
        }}
        placeholder="Workout name"
      />

      <TotalsPanel nodes={workout.nodes} unit={unit} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {workout.nodes.map(node => (
          isSegment(node)
            ? <SegmentRow key={node.id} segment={node} unit={unit} />
            : isRepeatBlock(node)
            ? <RepeatBlockRow key={node.id} block={node} unit={unit} />
            : null
        ))}
        {workout.nodes.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 24 }}>
            Add segments below to start building your workout
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: null, segType: 'run' })}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--run)', background: 'var(--run)0d', border: '1px solid var(--run)33', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          + Run Segment
        </button>
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: null, segType: 'walk' })}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--walk)', background: 'var(--walk)0d', border: '1px solid var(--walk)33', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          + Walk Segment
        </button>
        <button
          onClick={() => dispatch({ type: 'ADD_REPEAT_BLOCK', parentId: null })}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          + Repeat Block
        </button>
        <button
          onClick={() => setShowPreset(true)}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--amber)', background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          Run/Walk Preset
        </button>
      </div>

      {showPreset && <RunWalkPreset unit={unit} onClose={() => setShowPreset(false)} />}

      {workout.nodes.length > 0 && (
        <button
          onClick={() => dispatch({ type: 'CLEAR' })}
          style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--text-3)', padding: '4px 0' }}
        >
          Clear workout
        </button>
      )}
    </div>
  );
}
