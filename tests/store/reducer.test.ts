import { describe, it, expect } from 'vitest';
import { reducer, makeInitialWorkout } from '../../src/store/reducer';
import { WorkoutNode, Segment, RepeatBlock } from '../../src/engine/types';

function seg(id: string): Segment {
  return { id, type: 'run', distanceM: null, durationS: null, paceSPerKm: null, derived: 'pace' };
}

function block(id: string, children: WorkoutNode[]): RepeatBlock {
  return { id, repeat: 3, children };
}

describe('REORDER_NODES', () => {
  it('moves a top-level node forward', () => {
    const state = { ...makeInitialWorkout(), nodes: [seg('a'), seg('b'), seg('c')] };
    const next = reducer(state, { type: 'REORDER_NODES', parentId: null, fromIndex: 0, toIndex: 2 });
    expect(next.nodes.map(n => n.id)).toEqual(['b', 'c', 'a']);
  });

  it('moves a top-level node backward', () => {
    const state = { ...makeInitialWorkout(), nodes: [seg('a'), seg('b'), seg('c')] };
    const next = reducer(state, { type: 'REORDER_NODES', parentId: null, fromIndex: 2, toIndex: 0 });
    expect(next.nodes.map(n => n.id)).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op when from === to', () => {
    const state = { ...makeInitialWorkout(), nodes: [seg('a'), seg('b')] };
    const next = reducer(state, { type: 'REORDER_NODES', parentId: null, fromIndex: 1, toIndex: 1 });
    expect(next.nodes).toEqual(state.nodes);
  });

  it('moves a child inside a repeat block', () => {
    const state = {
      ...makeInitialWorkout(),
      nodes: [block('r1', [seg('x'), seg('y'), seg('z')])],
    };
    const next = reducer(state, { type: 'REORDER_NODES', parentId: 'r1', fromIndex: 0, toIndex: 2 });
    const children = (next.nodes[0] as RepeatBlock).children;
    expect(children.map(n => n.id)).toEqual(['y', 'z', 'x']);
  });

  it('does not mutate other nodes when reordering a block child', () => {
    const state = {
      ...makeInitialWorkout(),
      nodes: [seg('top'), block('r1', [seg('x'), seg('y')])],
    };
    const next = reducer(state, { type: 'REORDER_NODES', parentId: 'r1', fromIndex: 0, toIndex: 1 });
    expect(next.nodes[0].id).toBe('top');
  });
});
