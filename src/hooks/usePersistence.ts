import { useLocalStorage } from './useLocalStorage';
import { WorkoutNode } from '../engine/types';

export interface SavedWorkout {
  id: string;
  name: string;
  nodes: WorkoutNode[];
  savedAt: number;
}

export function usePersistence() {
  const [saved, setSaved] = useLocalStorage<SavedWorkout[]>('paceforge-workouts', []);

  function saveWorkout(name: string, nodes: WorkoutNode[]) {
    const entry: SavedWorkout = { id: crypto.randomUUID(), name, nodes, savedAt: Date.now() };
    setSaved(prev => [entry, ...prev].slice(0, 20));
  }

  function deleteWorkout(id: string) {
    setSaved(prev => prev.filter(w => w.id !== id));
  }

  return { saved, saveWorkout, deleteWorkout };
}
