import { WorkoutNode, Segment, RepeatBlock } from './types';

function isRepeat(node: WorkoutNode): node is RepeatBlock {
  return 'children' in node;
}

export function sumDistanceM(nodes: WorkoutNode[]): number {
  return nodes.reduce((acc, node) => {
    if (isRepeat(node)) return acc + sumDistanceM(node.children) * node.repeat;
    return acc + (node.distanceM ?? 0);
  }, 0);
}

export function sumDurationS(nodes: WorkoutNode[]): number {
  return nodes.reduce((acc, node) => {
    if (isRepeat(node)) return acc + sumDurationS(node.children) * node.repeat;
    return acc + (node.durationS ?? 0);
  }, 0);
}

export function overallPaceSPerKm(nodes: WorkoutNode[]): number | null {
  const dist = sumDistanceM(nodes);
  const dur = sumDurationS(nodes);
  if (dist <= 0) return null;
  return dur / (dist / 1000);
}

function runDistM(nodes: WorkoutNode[]): number {
  return nodes.reduce((acc, node) => {
    if (isRepeat(node)) return acc + runDistM(node.children) * node.repeat;
    const seg = node as Segment;
    return seg.type === 'run' ? acc + (seg.distanceM ?? 0) : acc;
  }, 0);
}

function runDurS(nodes: WorkoutNode[]): number {
  return nodes.reduce((acc, node) => {
    if (isRepeat(node)) return acc + runDurS(node.children) * node.repeat;
    const seg = node as Segment;
    return seg.type === 'run' ? acc + (seg.durationS ?? 0) : acc;
  }, 0);
}

export function runningOnlyPaceSPerKm(nodes: WorkoutNode[]): number | null {
  const dist = runDistM(nodes);
  const dur = runDurS(nodes);
  if (dist <= 0) return null;
  return dur / (dist / 1000);
}
