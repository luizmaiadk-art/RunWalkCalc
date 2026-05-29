import { useState } from 'react';
import { Segment, TriField, DistanceUnit } from '../engine/types';
import { solveSegment } from '../engine/solver';
import {
  parseDistanceInput, parseTimeInput, parsePaceInput,
  formatDistance, formatDuration, formatPace,
} from '../engine/formatting';
import { metersToDisplayDistance, sPerKmToDisplay } from '../engine/conversions';

interface Props {
  segment: Segment;
  unit: DistanceUnit;
  onChange: (seg: Segment) => void;
}

const FIELDS: TriField[] = ['distance', 'time', 'pace'];
const LABELS: Record<TriField, string> = { distance: 'Distance', time: 'Time', pace: 'Pace' };
const UNITS_LABEL: Record<TriField, (u: DistanceUnit) => string> = {
  distance: u => u,
  time: () => 'h:mm:ss',
  pace: u => `min/${u}`,
};

function getDisplayValue(seg: Segment, field: TriField, unit: DistanceUnit): string {
  if (field === 'distance') return formatDistance(seg.distanceM, unit);
  if (field === 'time') return formatDuration(seg.durationS);
  return formatPace(seg.paceSPerKm !== null ? sPerKmToDisplay(seg.paceSPerKm, unit) : null);
}

function applyInput(seg: Segment, field: TriField, raw: string, unit: DistanceUnit): Segment {
  if (field === 'distance') {
    const v = parseDistanceInput(raw, unit);
    return solveSegment({ ...seg, distanceM: v });
  }
  if (field === 'time') {
    const v = parseTimeInput(raw);
    return solveSegment({ ...seg, durationS: v });
  }
  const v = parsePaceInput(raw);
  const canonical = v !== null
    ? (unit === 'km' ? v : v / 1.609344)
    : null;
  return solveSegment({ ...seg, paceSPerKm: canonical });
}

export function TriangleInput({ segment, unit, onChange }: Props) {
  const [drafts, setDrafts] = useState<Partial<Record<TriField, string>>>({});

  function handleFocus(field: TriField) {
    if (field === segment.derived) {
      const others = FIELDS.filter(f => f !== field);
      const newDerived = others[0] as TriField;
      const updated = solveSegment({ ...segment, derived: newDerived });
      onChange(updated);
    }
    setDrafts(d => ({ ...d, [field]: getDisplayValue(segment, field, unit) }));
  }

  function handleChange(field: TriField, value: string) {
    setDrafts(d => ({ ...d, [field]: value }));
  }

  function handleBlur(field: TriField) {
    const raw = drafts[field];
    if (raw !== undefined) {
      const updated = applyInput(segment, field, raw, unit);
      onChange(updated);
    }
    setDrafts(d => { const n = { ...d }; delete n[field]; return n; });
  }

  function handleLockClick(field: TriField) {
    if (field === segment.derived) return;
    const updated = solveSegment({ ...segment, derived: field });
    onChange(updated);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {FIELDS.map(field => {
        const isDerived = field === segment.derived;
        const hasDraft = drafts[field] !== undefined;
        const displayVal = hasDraft ? drafts[field]! : getDisplayValue(segment, field, unit);

        return (
          <div
            key={field}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: isDerived ? 'var(--amber-bg)' : 'var(--surface)',
              border: `1px solid ${isDerived ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
              borderRadius: 'var(--r)',
              boxShadow: isDerived ? 'var(--amber-glow)' : 'none',
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
          >
            <button
              onClick={() => handleLockClick(field)}
              title={isDerived ? 'Solving for this field' : 'Lock: solve for this field'}
              style={{
                width: 20, height: 20,
                color: isDerived ? 'var(--amber)' : 'var(--text-3)',
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {isDerived ? '⊛' : '○'}
            </button>

            <span style={{ fontSize: 11, color: isDerived ? 'var(--amber)' : 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 60, flexShrink: 0 }}>
              {LABELS[field]}
            </span>

            <input
              className="num"
              value={displayVal}
              onFocus={() => handleFocus(field)}
              onChange={e => handleChange(field, e.target.value)}
              onBlur={() => handleBlur(field)}
              readOnly={isDerived && !hasDraft}
              placeholder={isDerived ? 'auto' : '—'}
              style={{
                flex: 1,
                fontSize: isDerived ? 24 : 20,
                fontWeight: isDerived ? 600 : 400,
                color: isDerived ? 'var(--amber)' : 'var(--text-1)',
                textAlign: 'right',
              }}
            />

            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 52, textAlign: 'right', flexShrink: 0 }}>
              {UNITS_LABEL[field](unit)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
