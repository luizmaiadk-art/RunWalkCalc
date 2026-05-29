import { useEffect, useState } from 'react';
import { Segment, DistanceUnit } from '../engine/types';
import { solveSegment } from '../engine/solver';
import { TriangleInput } from './TriangleInput';
import { DistancePresets } from './DistancePresets';

function makeSegment(): Segment {
  return {
    id: 'simple',
    type: 'run',
    distanceM: null,
    durationS: null,
    paceSPerKm: null,
    derived: 'pace',
  };
}

interface Props {
  unit: DistanceUnit;
  onSegmentChange: (seg: Segment) => void;
}

export function SimpleMode({ unit, onSegmentChange }: Props) {
  const [seg, setSeg] = useState<Segment>(makeSegment);

  useEffect(() => { onSegmentChange(seg); }, [seg]);

  function handlePreset(meters: number) {
    const updated = solveSegment({ ...seg, distanceM: meters });
    setSeg(updated);
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Standard Distances
        </p>
        <DistancePresets onSelect={handlePreset} activeM={seg.distanceM} />
      </div>

      <TriangleInput segment={seg} unit={unit} onChange={setSeg} />

      <button
        onClick={() => setSeg(makeSegment())}
        style={{
          alignSelf: 'flex-start',
          fontSize: 12,
          color: 'var(--text-3)',
          padding: '4px 0',
          letterSpacing: '0.04em',
        }}
      >
        Clear
      </button>
    </div>
  );
}
