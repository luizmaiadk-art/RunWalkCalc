import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Workout, Segment, DistanceUnit, WorkoutNode } from '../engine/types';
import { reducer, makeInitialWorkout } from './reducer';
import { Action } from './actions';

interface WorkoutContextValue {
  workout: Workout;
  dispatch: React.Dispatch<Action>;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
  unit: DistanceUnit;
  carrySegment: Segment | null;
}

export function WorkoutProvider({ children, unit, carrySegment }: ProviderProps) {
  const [workout, dispatch] = useReducer(reducer, undefined, () => {
    try {
      const raw = localStorage.getItem('paceforge-autosave');
      if (raw) {
        const saved = JSON.parse(raw) as { nodes: WorkoutNode[]; name: string };
        return { ...makeInitialWorkout(), nodes: saved.nodes, name: saved.name };
      }
    } catch { /* ignore */ }
    return makeInitialWorkout();
  });

  useEffect(() => { dispatch({ type: 'SET_UNIT', unit }); }, [unit]);

  useEffect(() => {
    if (carrySegment) dispatch({ type: 'CARRY_SIMPLE_SEGMENT', seg: carrySegment });
  }, [carrySegment]);

  useEffect(() => {
    try {
      localStorage.setItem('paceforge-autosave', JSON.stringify({ nodes: workout.nodes, name: workout.name }));
    } catch { /* ignore */ }
  }, [workout.nodes, workout.name]);

  return (
    <WorkoutContext.Provider value={{ workout, dispatch }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used inside WorkoutProvider');
  return ctx;
}
