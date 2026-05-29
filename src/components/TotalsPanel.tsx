import { WorkoutNode, DistanceUnit } from '../engine/types';
import {
  sumDistanceM, sumDurationS, overallPaceSPerKm, runningOnlyPaceSPerKm,
} from '../engine/aggregation';
import { sPerKmToDisplay } from '../engine/conversions';
import { formatDistance, formatDuration, formatPace } from '../engine/formatting';

interface Props {
  nodes: WorkoutNode[];
  unit: DistanceUnit;
}

export function TotalsPanel({ nodes, unit }: Props) {
  const distM = sumDistanceM(nodes);
  const durS = sumDurationS(nodes);
  const pace = overallPaceSPerKm(nodes);
  const runPace = runningOnlyPaceSPerKm(nodes);

  const items = [
    { label: 'Total Distance', value: formatDistance(distM, unit) || '—', unit: unit },
    { label: 'Total Time', value: formatDuration(durS) || '—', unit: '' },
    { label: 'Overall Pace', value: pace ? formatPace(sPerKmToDisplay(pace, unit)) : '—', unit: `min/${unit}` },
    { label: 'Run Pace', value: runPace ? formatPace(sPerKmToDisplay(runPace, unit)) : '—', unit: `min/${unit}` },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 1, background: 'var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden',
    }}>
      {items.map(item => (
        <div key={item.label} style={{ background: 'var(--surface)', padding: '12px 14px' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 4 }}>
            {item.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="num" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-1)' }}>
              {item.value}
            </span>
            {item.unit && (
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
