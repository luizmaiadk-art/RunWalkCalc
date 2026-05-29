import { RepeatBlock, DistanceUnit, isSegment } from '../engine/types';
import { SegmentRow } from './SegmentRow';
import { useWorkout } from '../store/context';
import { useSortable, SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  block: RepeatBlock;
  unit: DistanceUnit;
}

export function RepeatBlockRow({ block, unit }: Props) {
  const { dispatch } = useWorkout();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleChildDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = block.children.map(n => n.id);
    const fromIndex = ids.indexOf(active.id as string);
    const toIndex = ids.indexOf(over.id as string);
    if (fromIndex === -1 || toIndex === -1) return;
    dispatch({ type: 'REORDER_NODES', parentId: block.id, fromIndex, toIndex });
  }

  const wrapperStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    overflow: 'hidden',
  };

  return (
    <div ref={setNodeRef} style={wrapperStyle}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'var(--surface-hi)',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', color: 'var(--text-3)', fontSize: 14, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
          title="Drag to reorder"
        >
          <span aria-hidden="true">⠿</span>
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>
          Repeat
        </span>
        <input
          type="number"
          min={1}
          max={99}
          value={block.repeat}
          onChange={e => dispatch({ type: 'SET_REPEAT', id: block.id, count: parseInt(e.target.value, 10) || 1 })}
          style={{
            width: 44, textAlign: 'center', fontFamily: 'var(--font-num)',
            fontWeight: 600, fontSize: 16, color: 'var(--text-1)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)', padding: '2px 4px',
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>×</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: block.id, segType: 'run' })}
          style={{ fontSize: 11, color: 'var(--run)', padding: '3px 8px', border: '1px solid var(--run)33', borderRadius: 'var(--r-sm)', background: 'var(--run)0d' }}
        >
          + Run
        </button>
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: block.id, segType: 'walk' })}
          style={{ fontSize: 11, color: 'var(--walk)', padding: '3px 8px', border: '1px solid var(--walk)33', borderRadius: 'var(--r-sm)', background: 'var(--walk)0d' }}
        >
          + Walk
        </button>
        <button
          onClick={() => dispatch({ type: 'REMOVE_NODE', id: block.id })}
          style={{ fontSize: 16, color: 'var(--text-3)', padding: '0 4px' }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd}>
          <SortableContext items={block.children.map(n => n.id)} strategy={verticalListSortingStrategy}>
            {block.children.map(child =>
              isSegment(child) ? (
                <SegmentRow key={child.id} segment={child} unit={unit} depth={1} />
              ) : null
            )}
          </SortableContext>
        </DndContext>
        {block.children.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '8px 0' }}>
            No segments — add Run or Walk above
          </p>
        )}
      </div>
    </div>
  );
}
