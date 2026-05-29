import { useState } from 'react';
import { DistanceUnit, Segment, RepeatBlock } from '../engine/types';
import { solveSegment } from '../engine/solver';
import { parsePaceInput, parseTimeInput } from '../engine/formatting';
import { GALLOWAY_PRESETS } from '../engine/constants';
import { useWorkout } from '../store/context';

interface Props {
  unit: DistanceUnit;
  onClose: () => void;
}

let _id = 0;
function uid() { return `p${++_id}`; }

function makeSeg(type: 'run' | 'walk', durationS: number, paceInput: string | null, unit: DistanceUnit): Segment {
  const paceSPerKm = paceInput
    ? (() => { const p = parsePaceInput(paceInput); return p ? (unit === 'km' ? p : p / 1.609344) : null; })()
    : null;
  return solveSegment({
    id: uid(), type, distanceM: null, durationS, paceSPerKm, derived: 'distance',
  });
}

export function RunWalkPreset({ unit, onClose }: Props) {
  const { dispatch } = useWorkout();
  const [runDur, setRunDur] = useState('4:00');
  const [walkDur, setWalkDur] = useState('1:00');
  const [runPace, setRunPace] = useState('5:00');
  const [walkPace, setWalkPace] = useState('8:00');
  const [repeats, setRepeats] = useState(6);

  function applyPreset(r: number, w: number) {
    setRunDur(`${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`);
    setWalkDur(`${Math.floor(w / 60)}:${String(w % 60).padStart(2, '0')}`);
  }

  function handleInsert() {
    const rDur = parseTimeInput(runDur) ?? 240;
    const wDur = parseTimeInput(walkDur) ?? 60;
    const block: RepeatBlock = {
      id: uid(),
      repeat: repeats,
      children: [
        makeSeg('run', rDur, runPace, unit),
        makeSeg('walk', wDur, walkPace, unit),
      ],
    };
    dispatch({ type: 'ADD_NODE', node: block });
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
        padding: 20, width: 'min(400px, 92vw)', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Run/Walk Preset</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: 'var(--text-3)' }}>×</button>
        </div>

        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Common Ratios</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {GALLOWAY_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.runS, p.walkS)}
                style={{ padding: '5px 10px', fontSize: 12, fontFamily: 'var(--font-num)', color: 'var(--text-2)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {[
          { label: 'Run Duration', value: runDur, set: setRunDur, paceVal: runPace, setPace: setRunPace },
          { label: 'Walk Duration', value: walkDur, set: setWalkDur, paceVal: walkPace, setPace: setWalkPace },
        ].map(row => (
          <div key={row.label}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text-3)' }}>Duration (m:ss)</label>
                <input
                  value={row.value}
                  onChange={e => row.set(e.target.value)}
                  style={{ display: 'block', width: '100%', fontFamily: 'var(--font-num)', fontSize: 16, color: 'var(--text-1)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', marginTop: 4 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text-3)' }}>Pace (min/{unit})</label>
                <input
                  value={row.paceVal}
                  onChange={e => row.setPace(e.target.value)}
                  style={{ display: 'block', width: '100%', fontFamily: 'var(--font-num)', fontSize: 16, color: 'var(--text-1)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', marginTop: 4 }}
                />
              </div>
            </div>
          </div>
        ))}

        <div>
          <label style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Repeat Count</label>
          <input
            type="number" min={1} max={99} value={repeats}
            onChange={e => setRepeats(parseInt(e.target.value, 10) || 1)}
            style={{ display: 'block', width: 80, fontFamily: 'var(--font-num)', fontSize: 18, fontWeight: 600, color: 'var(--text-1)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', marginTop: 4 }}
          />
        </div>

        <button
          onClick={handleInsert}
          style={{ padding: '10px', fontWeight: 600, fontSize: 14, color: 'var(--bg)', background: 'var(--amber)', borderRadius: 'var(--r)', letterSpacing: '0.02em' }}
        >
          Insert Block
        </button>
      </div>
    </div>
  );
}
