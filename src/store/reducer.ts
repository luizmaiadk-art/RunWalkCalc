import { Workout, WorkoutNode, Segment, RepeatBlock } from '../engine/types';
import { solveSegment } from '../engine/solver';
import { Action } from './actions';

let _id = 0;
function uid(): string { return `n${++_id}`; }

function makeSegment(type: 'run' | 'walk'): Segment {
  return { id: uid(), type, distanceM: null, durationS: null, paceSPerKm: null, derived: 'pace' };
}

function isRepeat(n: WorkoutNode): n is RepeatBlock { return 'children' in n; }

function updateNode(nodes: WorkoutNode[], id: string, fn: (n: WorkoutNode) => WorkoutNode): WorkoutNode[] {
  return nodes.map(n => {
    if (n.id === id) return fn(n);
    if (isRepeat(n)) return { ...n, children: updateNode(n.children, id, fn) };
    return n;
  });
}

function removeNode(nodes: WorkoutNode[], id: string): WorkoutNode[] {
  return nodes
    .filter(n => n.id !== id)
    .map(n => isRepeat(n) ? { ...n, children: removeNode(n.children, id) } : n);
}

function addToParent(nodes: WorkoutNode[], parentId: string | null, newNode: WorkoutNode): WorkoutNode[] {
  if (parentId === null) return [...nodes, newNode];
  return nodes.map(n => {
    if (n.id === parentId && isRepeat(n)) return { ...n, children: [...n.children, newNode] };
    if (isRepeat(n)) return { ...n, children: addToParent(n.children, parentId, newNode) };
    return n;
  });
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export function makeInitialWorkout(): Workout {
  return { id: uid(), name: 'My Workout', units: 'km', nodes: [] };
}

export function reducer(state: Workout, action: Action): Workout {
  switch (action.type) {
    case 'ADD_SEGMENT':
      return { ...state, nodes: addToParent(state.nodes, action.parentId, makeSegment(action.segType)) };

    case 'ADD_REPEAT_BLOCK':
      return {
        ...state,
        nodes: addToParent(state.nodes, action.parentId, {
          id: uid(), repeat: 3,
          children: [makeSegment('run'), makeSegment('walk')],
        }),
      };

    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.node] };

    case 'UPDATE_SEGMENT':
      return {
        ...state,
        nodes: updateNode(state.nodes, action.id, n => {
          if (isRepeat(n)) return n;
          const patched = { ...n, ...action.patch } as Segment;
          return solveSegment(patched);
        }),
      };

    case 'REMOVE_NODE':
      return { ...state, nodes: removeNode(state.nodes, action.id) };

    case 'REORDER_NODES': {
      if (action.fromIndex === action.toIndex) return state;
      if (action.parentId === null) {
        return { ...state, nodes: arrayMove(state.nodes, action.fromIndex, action.toIndex) };
      }
      return {
        ...state,
        nodes: state.nodes.map(n =>
          isRepeat(n) && n.id === action.parentId
            ? { ...n, children: arrayMove(n.children, action.fromIndex, action.toIndex) }
            : n
        ),
      };
    }

    case 'SET_REPEAT':
      return {
        ...state,
        nodes: updateNode(state.nodes, action.id, n =>
          isRepeat(n) ? { ...n, repeat: Math.max(1, action.count) } : n
        ),
      };

    case 'SET_UNIT':
      return { ...state, units: action.unit };

    case 'SET_NAME':
      return { ...state, name: action.name };

    case 'CARRY_SIMPLE_SEGMENT':
      if (state.nodes.length > 0) return state;
      return { ...state, nodes: [{ ...action.seg, id: uid() }] };

    case 'LOAD_WORKOUT':
      return { ...state, nodes: action.nodes, name: action.name };

    case 'CLEAR':
      return { ...makeInitialWorkout(), units: state.units };

    default:
      return state;
  }
}
