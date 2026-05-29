import { SavedWorkout } from '../hooks/usePersistence';

interface Props {
  workouts: SavedWorkout[];
  onLoad: (w: SavedWorkout) => void;
  onDelete: (id: string) => void;
}

export function WorkoutList({ workouts, onLoad, onDelete }: Props) {
  if (workouts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 4 }}>
        Saved Workouts
      </p>
      {workouts.map(w => (
        <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
          <button onClick={() => onLoad(w)} style={{ flex: 1, textAlign: 'left', fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
            {w.name}
          </button>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {new Date(w.savedAt).toLocaleDateString()}
          </span>
          <button onClick={() => onDelete(w.id)} style={{ fontSize: 14, color: 'var(--text-3)' }}>×</button>
        </div>
      ))}
    </div>
  );
}
