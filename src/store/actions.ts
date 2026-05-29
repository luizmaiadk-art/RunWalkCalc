import { Segment, DistanceUnit, WorkoutNode } from '../engine/types';

export type Action =
  | { type: 'ADD_SEGMENT'; parentId: string | null; segType: 'run' | 'walk' }
  | { type: 'ADD_REPEAT_BLOCK'; parentId: string | null }
  | { type: 'ADD_NODE'; node: WorkoutNode }
  | { type: 'UPDATE_SEGMENT'; id: string; patch: Partial<Omit<Segment, 'id'>> }
  | { type: 'REMOVE_NODE'; id: string }
  | { type: 'SET_REPEAT'; id: string; count: number }
  | { type: 'REORDER_NODES'; parentId: string | null; fromIndex: number; toIndex: number }
  | { type: 'SET_UNIT'; unit: DistanceUnit }
  | { type: 'SET_NAME'; name: string }
  | { type: 'CARRY_SIMPLE_SEGMENT'; seg: Segment }
  | { type: 'LOAD_WORKOUT'; nodes: WorkoutNode[]; name: string }
  | { type: 'CLEAR' };
