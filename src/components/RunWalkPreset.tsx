import { DistanceUnit } from '../engine/types';

interface Props {
  unit: DistanceUnit;
  onClose: () => void;
}

export function RunWalkPreset({ onClose }: Props) {
  return (
    <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: 8 }}>Run/Walk Preset (coming soon)</p>
      <button onClick={onClose} style={{ color: 'var(--amber)' }}>Close</button>
    </div>
  );
}
