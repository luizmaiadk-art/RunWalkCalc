import { createContext, useContext, ReactNode } from 'react';
import { Segment, DistanceUnit } from '../engine/types';
const WorkoutContext = createContext<null>(null);
interface ProviderProps { children: ReactNode; unit: DistanceUnit; carrySegment: Segment | null; }
export function WorkoutProvider({ children }: ProviderProps) {
  return <WorkoutContext.Provider value={null}>{children}</WorkoutContext.Provider>;
}
export function useWorkout() { return useContext(WorkoutContext); }
