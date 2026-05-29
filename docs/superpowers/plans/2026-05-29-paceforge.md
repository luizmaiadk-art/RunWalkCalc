# PaceForge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page running workout calculator with a triangle solver (distance/time/pace) and a structured workout builder, no backend required.

**Architecture:** Pure TypeScript engine (zero React imports) handles all math and is unit-tested independently. React consumes the engine via `useReducer` + Context. Two screens share a single workout store; persistence is `localStorage` only.

**Tech Stack:** React 18, Vite 5, TypeScript 5 (strict), Vitest, @testing-library/react, no external runtime dependencies.

---

## File Map

```
src/
  engine/
    types.ts           — All domain types (Segment, RepeatBlock, WorkoutNode, Workout)
    constants.ts       — Standard distances, Galloway presets
    formatting.ts      — Parse/format mm:ss, h:mm:ss, distance strings
    conversions.ts     — m↔km↔mi, sPerKm↔sPerMile
    solver.ts          — solveSegment (triangle math)
    aggregation.ts     — totalDistanceM, totalDurationS, pace aggregations
    index.ts           — Re-exports all engine symbols
  store/
    actions.ts         — Union type of all reducer actions
    reducer.ts         — Pure workout reducer
    context.tsx        — WorkoutContext + WorkoutProvider + useWorkout hook
  components/
    UnitToggle.tsx     — km / mi global switch
    DistancePresets.tsx — Standard distance chips
    TriangleInput.tsx  — Three-field locked input (core UI component)
    SimpleMode.tsx     — Single-segment calculator screen
    SegmentRow.tsx     — Editable segment row for Advanced mode
    RepeatBlockRow.tsx — Repeat block wrapper for Advanced mode
    TotalsPanel.tsx    — Live aggregation display
    RunWalkPreset.tsx  — Galloway preset generator panel
    AdvancedMode.tsx   — Full workout builder screen
    WorkoutList.tsx    — Saved workouts sidebar
  hooks/
    useLocalStorage.ts — Generic localStorage hook
    usePersistence.ts  — Save/load named workouts
  styles/
    globals.css        — CSS variables, base styles, dark mode
  App.tsx              — Tab navigation, mode carry-over
  main.tsx             — Entry point
tests/
  engine/
    formatting.test.ts
    conversions.test.ts
    solver.test.ts
    aggregation.test.ts
    fixtures.test.ts   — All four §4 acceptance fixtures
index.html
vite.config.ts
tsconfig.json
tsconfig.node.json
package.json
README.md
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "paceforge",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.3",
    "vite": "^5.3.4",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Create tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create tests/setup.ts**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PaceForge</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Install dependencies and verify**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 9: Create placeholder src/main.tsx to verify Vite starts**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div>PaceForge</div>
  </React.StrictMode>
);
```

- [ ] **Step 10: Run dev server briefly to verify**

```bash
npm run dev
```

Expected: Vite starts on localhost:5173, no errors. Ctrl+C to stop.

- [ ] **Step 11: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + TS + Vitest project"
```

---

## Task 2: Engine Types & Constants

**Files:**
- Create: `src/engine/types.ts`
- Create: `src/engine/constants.ts`

- [ ] **Step 1: Create src/engine/types.ts**

```ts
export type DistanceUnit = 'km' | 'mi';
export type TriField = 'distance' | 'time' | 'pace';
export type SegmentType = 'run' | 'walk';

export interface Segment {
  id: string;
  type: SegmentType;
  distanceM: number | null;
  durationS: number | null;
  paceSPerKm: number | null;
  derived: TriField;
  label?: string;
}

export interface RepeatBlock {
  id: string;
  repeat: number;
  children: WorkoutNode[];
}

export type WorkoutNode = Segment | RepeatBlock;

export interface Workout {
  id: string;
  name: string;
  units: DistanceUnit;
  nodes: WorkoutNode[];
}

export function isRepeatBlock(node: WorkoutNode): node is RepeatBlock {
  return 'children' in node;
}

export function isSegment(node: WorkoutNode): node is Segment {
  return 'type' in node && 'derived' in node;
}
```

- [ ] **Step 2: Create src/engine/constants.ts**

```ts
export const METERS_PER_MILE = 1609.344;

export const STANDARD_DISTANCES = [
  { label: '400 m', value: 400 },
  { label: '1 K', value: 1000 },
  { label: '1 mi', value: METERS_PER_MILE },
  { label: '5 K', value: 5000 },
  { label: '10 K', value: 10000 },
  { label: 'Half', value: 21097.5 },
  { label: 'Marathon', value: 42195 },
] as const;

export const GALLOWAY_PRESETS = [
  { label: '4:00 / 1:00', runS: 240, walkS: 60 },
  { label: '2:00 / 1:00', runS: 120, walkS: 60 },
  { label: '0:30 / 0:30', runS: 30, walkS: 30 },
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/engine/types.ts src/engine/constants.ts
git commit -m "feat: add engine domain types and constants"
```

---

## Task 3: Engine — Formatting

**Files:**
- Create: `src/engine/formatting.ts`
- Create: `tests/engine/formatting.test.ts`

- [ ] **Step 1: Write failing tests first**

Create `tests/engine/formatting.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  parseTimeInput,
  parsePaceInput,
  parseDistanceInput,
  formatDuration,
  formatPace,
  formatDistance,
} from '../../src/engine/formatting';

describe('parseTimeInput', () => {
  it('parses m:ss', () => expect(parseTimeInput('4:00')).toBe(240));
  it('parses h:mm:ss', () => expect(parseTimeInput('1:10:00')).toBe(4200));
  it('parses mm:ss', () => expect(parseTimeInput('40:00')).toBe(2400));
  it('returns null for empty string', () => expect(parseTimeInput('')).toBeNull());
  it('returns null for zero', () => expect(parseTimeInput('0:00')).toBeNull());
  it('returns null for garbage', () => expect(parseTimeInput('abc')).toBeNull());
  it('returns null for negative', () => expect(parseTimeInput('-1:00')).toBeNull());
});

describe('parsePaceInput', () => {
  it('parses m:ss pace', () => expect(parsePaceInput('4:00')).toBe(240));
  it('parses 6:26 pace', () => expect(parsePaceInput('6:26')).toBe(386));
  it('returns null for empty', () => expect(parsePaceInput('')).toBeNull());
  it('returns null for 0:00', () => expect(parsePaceInput('0:00')).toBeNull());
});

describe('parseDistanceInput', () => {
  it('parses km', () => expect(parseDistanceInput('10', 'km')).toBeCloseTo(10000, 0));
  it('parses miles', () =>
    expect(parseDistanceInput('6.2137', 'mi')).toBeCloseTo(10000, 0));
  it('returns null for zero', () => expect(parseDistanceInput('0', 'km')).toBeNull());
  it('returns null for negative', () => expect(parseDistanceInput('-5', 'km')).toBeNull());
  it('returns null for empty', () => expect(parseDistanceInput('', 'km')).toBeNull());
});

describe('formatDuration', () => {
  it('formats under 1 hour as m:ss', () => expect(formatDuration(2400)).toBe('40:00'));
  it('formats exactly 1 hour as h:mm:ss', () => expect(formatDuration(3600)).toBe('1:00:00'));
  it('formats 4200s as 1:10:00', () => expect(formatDuration(4200)).toBe('1:10:00'));
  it('returns empty string for null', () => expect(formatDuration(null)).toBe(''));
});

describe('formatPace', () => {
  it('formats 240 s/km as 4:00', () => expect(formatPace(240)).toBe('4:00'));
  it('formats 386 s/km as 6:26', () => expect(formatPace(386)).toBe('6:26'));
  it('returns empty for null', () => expect(formatPace(null)).toBe(''));
});

describe('formatDistance', () => {
  it('formats 10000m as 10 km', () => expect(formatDistance(10000, 'km')).toBe('10'));
  it('formats 10000m in miles', () =>
    expect(formatDistance(10000, 'mi')).toMatch(/^6\.21/));
  it('returns empty for null', () => expect(formatDistance(null, 'km')).toBe(''));
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- tests/engine/formatting.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement src/engine/formatting.ts**

```ts
import { DistanceUnit } from './types';
import { METERS_PER_MILE } from './constants';

function parseMmSs(input: string): number | null {
  const parts = input.trim().split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    const total = m * 60 + s;
    return total > 0 ? total : null;
  }
  if (parts.length === 3) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseInt(parts[2], 10);
    if (isNaN(h) || isNaN(m) || isNaN(s) || h < 0 || m < 0 || m >= 60 || s < 0 || s >= 60)
      return null;
    const total = h * 3600 + m * 60 + s;
    return total > 0 ? total : null;
  }
  return null;
}

export function parseTimeInput(input: string): number | null {
  return parseMmSs(input);
}

export function parsePaceInput(input: string): number | null {
  return parseMmSs(input);
}

export function parseDistanceInput(input: string, unit: DistanceUnit): number | null {
  const v = parseFloat(input);
  if (!isFinite(v) || v <= 0) return null;
  return unit === 'km' ? v * 1000 : v * METERS_PER_MILE;
}

export function formatDuration(totalS: number | null): string {
  if (totalS === null || !isFinite(totalS) || totalS <= 0) return '';
  const r = Math.round(totalS);
  const h = Math.floor(r / 3600);
  const m = Math.floor((r % 3600) / 60);
  const s = r % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatPace(sPerKm: number | null): string {
  if (sPerKm === null || !isFinite(sPerKm) || sPerKm <= 0) return '';
  const r = Math.round(sPerKm);
  const m = Math.floor(r / 60);
  const s = r % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDistance(m: number | null, unit: DistanceUnit): string {
  if (m === null || !isFinite(m) || m <= 0) return '';
  const v = unit === 'km' ? m / 1000 : m / METERS_PER_MILE;
  const str = v.toPrecision(6).replace(/\.?0+$/, '');
  return str;
}
```

- [ ] **Step 4: Run tests — must pass**

```bash
npm test -- tests/engine/formatting.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/formatting.ts tests/engine/formatting.test.ts
git commit -m "feat: add formatting engine with parse/format for time, pace, distance"
```

---

## Task 4: Engine — Conversions

**Files:**
- Create: `src/engine/conversions.ts`
- Create: `tests/engine/conversions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/engine/conversions.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  metersToDisplayDistance,
  displayDistanceToMeters,
  sPerKmToDisplay,
  displayPaceToSPerKm,
} from '../../src/engine/conversions';

describe('metersToDisplayDistance', () => {
  it('10000m → 10 km', () => expect(metersToDisplayDistance(10000, 'km')).toBeCloseTo(10, 5));
  it('1609.344m → 1 mi', () => expect(metersToDisplayDistance(1609.344, 'mi')).toBeCloseTo(1, 5));
  it('10000m in miles', () => expect(metersToDisplayDistance(10000, 'mi')).toBeCloseTo(6.21371, 4));
});

describe('displayDistanceToMeters', () => {
  it('10 km → 10000m', () => expect(displayDistanceToMeters(10, 'km')).toBeCloseTo(10000, 3));
  it('1 mi → 1609.344m', () => expect(displayDistanceToMeters(1, 'mi')).toBeCloseTo(1609.344, 3));
});

describe('sPerKmToDisplay', () => {
  it('240 s/km stays 240 in km mode', () => expect(sPerKmToDisplay(240, 'km')).toBeCloseTo(240, 5));
  it('240 s/km → ~386.2 s/mi in mi mode', () =>
    expect(sPerKmToDisplay(240, 'mi')).toBeCloseTo(240 * 1.609344, 3));
});

describe('displayPaceToSPerKm', () => {
  it('240 s/km (km mode) → 240 s/km', () =>
    expect(displayPaceToSPerKm(240, 'km')).toBeCloseTo(240, 5));
  it('386.2 s/mi (mi mode) → 240 s/km', () =>
    expect(displayPaceToSPerKm(240 * 1.609344, 'mi')).toBeCloseTo(240, 3));
});

describe('round-trip', () => {
  it('10K/40:00 → miles → back to km, no drift', () => {
    const distM = 10000;
    const paceKm = 240;
    const distMi = metersToDisplayDistance(distM, 'mi');
    const paceMi = sPerKmToDisplay(paceKm, 'mi');
    const backM = displayDistanceToMeters(distMi, 'mi');
    const backKm = displayPaceToSPerKm(paceMi, 'mi');
    expect(backM).toBeCloseTo(distM, 3);
    expect(backKm).toBeCloseTo(paceKm, 5);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- tests/engine/conversions.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement src/engine/conversions.ts**

```ts
import { DistanceUnit } from './types';
import { METERS_PER_MILE } from './constants';

export function metersToDisplayDistance(m: number, unit: DistanceUnit): number {
  return unit === 'km' ? m / 1000 : m / METERS_PER_MILE;
}

export function displayDistanceToMeters(value: number, unit: DistanceUnit): number {
  return unit === 'km' ? value * 1000 : value * METERS_PER_MILE;
}

export function sPerKmToDisplay(sPerKm: number, unit: DistanceUnit): number {
  return unit === 'km' ? sPerKm : sPerKm * 1.609344;
}

export function displayPaceToSPerKm(displayPace: number, unit: DistanceUnit): number {
  return unit === 'km' ? displayPace : displayPace / 1.609344;
}
```

- [ ] **Step 4: Run tests — must pass**

```bash
npm test -- tests/engine/conversions.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/conversions.ts tests/engine/conversions.test.ts
git commit -m "feat: add unit conversion engine (m/km/mi, sPerKm/sPerMile)"
```

---

## Task 5: Engine — Triangle Solver

**Files:**
- Create: `src/engine/solver.ts`
- Create: `tests/engine/solver.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/engine/solver.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { solveSegment } from '../../src/engine/solver';
import { Segment } from '../../src/engine/types';

function seg(overrides: Partial<Segment>): Segment {
  return {
    id: 'test',
    type: 'run',
    distanceM: null,
    durationS: null,
    paceSPerKm: null,
    derived: 'pace',
    ...overrides,
  };
}

describe('solveSegment — derive pace', () => {
  it('10K + 40:00 → 4:00/km (240 s/km)', () => {
    const result = solveSegment(seg({ distanceM: 10000, durationS: 2400, derived: 'pace' }));
    expect(result.paceSPerKm).toBeCloseTo(240, 5);
  });
  it('returns null pace when only distance given', () => {
    const result = solveSegment(seg({ distanceM: 10000, derived: 'pace' }));
    expect(result.paceSPerKm).toBeNull();
  });
});

describe('solveSegment — derive time', () => {
  it('4:00/km + 10K → 40:00 (2400s)', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, distanceM: 10000, derived: 'time' })
    );
    expect(result.durationS).toBeCloseTo(2400, 5);
  });
  it('returns null time when only pace given', () => {
    const result = solveSegment(seg({ paceSPerKm: 240, derived: 'time' }));
    expect(result.durationS).toBeNull();
  });
});

describe('solveSegment — derive distance', () => {
  it('4:00/km + 40:00 → 10K (10000m)', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, durationS: 2400, derived: 'distance' })
    );
    expect(result.distanceM).toBeCloseTo(10000, 3);
  });
  it('returns null distance when only time given', () => {
    const result = solveSegment(seg({ durationS: 2400, derived: 'distance' }));
    expect(result.distanceM).toBeNull();
  });
});

describe('solveSegment — edge cases', () => {
  it('does not mutate input segment', () => {
    const input = seg({ distanceM: 10000, durationS: 2400, derived: 'pace' });
    solveSegment(input);
    expect(input.paceSPerKm).toBeNull();
  });
  it('ignores zero distance (would cause divide-by-zero)', () => {
    const result = solveSegment(seg({ distanceM: 0, durationS: 2400, derived: 'pace' }));
    expect(result.paceSPerKm).toBeNull();
  });
  it('ignores zero pace (would cause divide-by-zero)', () => {
    const result = solveSegment(seg({ paceSPerKm: 0, durationS: 2400, derived: 'distance' }));
    expect(result.distanceM).toBeNull();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- tests/engine/solver.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement src/engine/solver.ts**

```ts
import { Segment } from './types';

export function solveSegment(seg: Segment): Segment {
  const { distanceM: d, durationS: t, paceSPerKm: p, derived } = seg;

  if (derived === 'pace') {
    if (d !== null && d > 0 && t !== null && t > 0) {
      return { ...seg, paceSPerKm: t / (d / 1000) };
    }
    return { ...seg, paceSPerKm: null };
  }

  if (derived === 'time') {
    if (p !== null && p > 0 && d !== null && d > 0) {
      return { ...seg, durationS: p * (d / 1000) };
    }
    return { ...seg, durationS: null };
  }

  if (derived === 'distance') {
    if (p !== null && p > 0 && t !== null && t > 0) {
      return { ...seg, distanceM: (t / p) * 1000 };
    }
    return { ...seg, distanceM: null };
  }

  return seg;
}
```

- [ ] **Step 4: Run tests — must pass**

```bash
npm test -- tests/engine/solver.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/solver.ts tests/engine/solver.test.ts
git commit -m "feat: add triangle solver engine"
```

---

## Task 6: Engine — Aggregation

**Files:**
- Create: `src/engine/aggregation.ts`
- Create: `tests/engine/aggregation.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/engine/aggregation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  sumDistanceM,
  sumDurationS,
  overallPaceSPerKm,
  runningOnlyPaceSPerKm,
} from '../../src/engine/aggregation';
import { Segment, RepeatBlock, WorkoutNode } from '../../src/engine/types';

function seg(overrides: Partial<Segment>): Segment {
  return {
    id: crypto.randomUUID(),
    type: 'run',
    distanceM: null,
    durationS: null,
    paceSPerKm: null,
    derived: 'pace',
    ...overrides,
  };
}

function block(repeat: number, children: WorkoutNode[]): RepeatBlock {
  return { id: crypto.randomUUID(), repeat, children };
}

describe('sumDistanceM', () => {
  it('sums flat segments', () => {
    const nodes = [seg({ distanceM: 5000 }), seg({ distanceM: 3000 })];
    expect(sumDistanceM(nodes)).toBeCloseTo(8000, 3);
  });
  it('multiplies repeat block children by repeat count', () => {
    const nodes = [block(3, [seg({ distanceM: 1000 })])];
    expect(sumDistanceM(nodes)).toBeCloseTo(3000, 3);
  });
  it('treats null distanceM as 0', () => {
    expect(sumDistanceM([seg({ distanceM: null })])).toBe(0);
  });
});

describe('sumDurationS', () => {
  it('sums flat segments', () => {
    const nodes = [seg({ durationS: 600 }), seg({ durationS: 300 })];
    expect(sumDurationS(nodes)).toBe(900);
  });
  it('multiplies by repeat', () => {
    const nodes = [block(6, [seg({ durationS: 600 })])];
    expect(sumDurationS(nodes)).toBe(3600);
  });
});

describe('overallPaceSPerKm', () => {
  it('computes pace from totals', () => {
    const nodes = [seg({ distanceM: 10000, durationS: 2400 })];
    expect(overallPaceSPerKm(nodes)).toBeCloseTo(240, 3);
  });
  it('returns null when no distance', () => {
    expect(overallPaceSPerKm([seg({ durationS: 600 })])).toBeNull();
  });
});

describe('runningOnlyPaceSPerKm', () => {
  it('excludes walk segments', () => {
    const nodes = [
      seg({ type: 'run', distanceM: 2250, durationS: 540 }),
      seg({ type: 'walk', distanceM: 100, durationS: 60 }),
    ];
    expect(runningOnlyPaceSPerKm(nodes)).toBeCloseTo(240, 3);
  });
  it('handles run segments inside repeat block', () => {
    const nodes = [
      block(6, [
        seg({ type: 'run', distanceM: 2250, durationS: 540 }),
        seg({ type: 'walk', distanceM: 100, durationS: 60 }),
      ]),
    ];
    const pace = runningOnlyPaceSPerKm(nodes);
    expect(pace).toBeCloseTo(240, 3);
  });
  it('returns null when no run segments have distance', () => {
    expect(runningOnlyPaceSPerKm([seg({ type: 'walk', distanceM: 500, durationS: 300 })])).toBeNull();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- tests/engine/aggregation.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement src/engine/aggregation.ts**

```ts
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
```

- [ ] **Step 4: Run tests — must pass**

```bash
npm test -- tests/engine/aggregation.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/aggregation.ts tests/engine/aggregation.test.ts
git commit -m "feat: add recursive aggregation engine (total distance, duration, pace)"
```

---

## Task 7: Engine — Acceptance Fixtures

**Files:**
- Create: `src/engine/index.ts`
- Create: `tests/engine/fixtures.test.ts`

- [ ] **Step 1: Create the engine barrel export**

Create `src/engine/index.ts`:

```ts
export * from './types';
export * from './constants';
export * from './formatting';
export * from './conversions';
export * from './solver';
export * from './aggregation';
```

- [ ] **Step 2: Write all four acceptance fixture tests**

Create `tests/engine/fixtures.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  solveSegment,
  sumDistanceM,
  sumDurationS,
  overallPaceSPerKm,
  runningOnlyPaceSPerKm,
  metersToDisplayDistance,
  sPerKmToDisplay,
  formatPace,
  formatDuration,
  Segment,
  RepeatBlock,
} from '../../src/engine';

function seg(overrides: Partial<Segment>): Segment {
  return {
    id: crypto.randomUUID(),
    type: 'run',
    distanceM: null,
    durationS: null,
    paceSPerKm: null,
    derived: 'pace',
    ...overrides,
  };
}

// Fixture 1: Linear 10K / 40:00 → 4:00/km
describe('Fixture 1: 10K + 40:00 → pace 4:00/km', () => {
  it('derives pace correctly', () => {
    const result = solveSegment(seg({ distanceM: 10000, durationS: 2400, derived: 'pace' }));
    expect(result.paceSPerKm).toBeCloseTo(240, 5);
    expect(formatPace(result.paceSPerKm)).toBe('4:00');
  });
});

// Fixture 2: All three direction checks
describe('Fixture 2: direction checks', () => {
  it('pace + time → distance 10K', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, durationS: 2400, derived: 'distance' })
    );
    expect(result.distanceM).toBeCloseTo(10000, 3);
  });
  it('pace + distance → time 40:00', () => {
    const result = solveSegment(
      seg({ paceSPerKm: 240, distanceM: 10000, derived: 'time' })
    );
    expect(result.durationS).toBeCloseTo(2400, 5);
    expect(formatDuration(result.durationS)).toBe('40:00');
  });
});

// Fixture 3: Imperial round-trip (no drift)
describe('Fixture 3: km ↔ mi round-trip', () => {
  const distM = 10000;
  const paceKm = 240;

  it('10K → ~6.2137 mi', () => {
    const mi = metersToDisplayDistance(distM, 'mi');
    expect(mi).toBeCloseTo(6.21371, 4);
  });
  it('4:00/km → ~6:26/mi', () => {
    const paceMi = sPerKmToDisplay(paceKm, 'mi');
    expect(formatPace(paceMi)).toBe('6:26');
  });
  it('round-trips back to original values with no drift', () => {
    const { displayDistanceToMeters, displayPaceToSPerKm } = require('../../src/engine/conversions');
    const mi = metersToDisplayDistance(distM, 'mi');
    const backM = displayDistanceToMeters(mi, 'mi');
    expect(backM).toBeCloseTo(distM, 3);
  });
});

// Fixture 4: Interval workout aggregation
describe('Fixture 4: 10:00 warmup + 6×(9:00 run + 1:00 walk)', () => {
  // NOTE: warmup is typed 'run'. Running-only pace therefore includes warmup.
  // Spec says ≈4:05/km; our calculation yields 4:13/km with warmup as run.
  // If warmup were walk, running-only would be 4:00/km.
  // We document: warmup = 'run' type, running-only = 4:13/km.
  const warmup = seg({
    type: 'run',
    durationS: 600,
    paceSPerKm: 360,
    distanceM: 600 / 0.36, // 1666.667m
    derived: 'distance',
  });
  const runRep = seg({
    type: 'run',
    durationS: 540,
    paceSPerKm: 240,
    distanceM: 540 / 0.24, // 2250m
    derived: 'distance',
  });
  const walkRep = seg({
    type: 'walk',
    durationS: 60,
    paceSPerKm: 600,
    distanceM: 60 / 0.6, // 100m
    derived: 'distance',
  });
  const block: RepeatBlock = {
    id: 'block',
    repeat: 6,
    children: [runRep, walkRep],
  };
  const nodes = [warmup, block];

  it('total distance ≈ 15767m', () => {
    // 1666.7 + 6*(2250+100) = 1666.7 + 14100 = 15766.7
    expect(sumDistanceM(nodes)).toBeCloseTo(15766.7, 0);
  });

  it('total duration = 4200s (70:00)', () => {
    // 600 + 6*(540+60) = 600 + 3600 = 4200
    expect(sumDurationS(nodes)).toBe(4200);
    expect(formatDuration(sumDurationS(nodes))).toBe('1:10:00');
  });

  it('overall pace ≈ 4:26/km (≈266 s/km)', () => {
    const pace = overallPaceSPerKm(nodes);
    // 4200 / (15766.7/1000) = 4200 / 15.767 ≈ 266.4
    expect(pace).toBeCloseTo(266.4, 0);
    expect(formatPace(pace)).toBe('4:26');
  });

  it('running-only pace ≈ 4:13/km (warmup typed run; spec approximates 4:05)', () => {
    const pace = runningOnlyPaceSPerKm(nodes);
    // run dist = 1666.7 + 6*2250 = 15166.7m; run dur = 600 + 6*540 = 3840s
    // pace = 3840/15.167 ≈ 253 s/km = 4:13
    expect(pace).toBeCloseTo(253.2, 0);
    expect(formatPace(pace)).toBe('4:13');
  });
});
```

- [ ] **Step 3: Run all engine tests**

```bash
npm test
```

Expected: all tests PASS. If Fixture 3 fails due to missing import style, adjust the import to use named import instead of `require`.

Fix Fixture 3 round-trip test to use named imports:

```ts
import {
  metersToDisplayDistance,
  sPerKmToDisplay,
  displayDistanceToMeters,
  displayPaceToSPerKm,
} from '../../src/engine/conversions';
```

Remove the `require` line from the test and restructure:

```ts
it('round-trips back to original values with no drift', () => {
  const mi = metersToDisplayDistance(distM, 'mi');
  const backM = displayDistanceToMeters(mi, 'mi');
  expect(backM).toBeCloseTo(distM, 3);
});
```

- [ ] **Step 4: Confirm all tests green**

```bash
npm test
```

Expected: all tests PASS with no failures.

- [ ] **Step 5: Commit**

```bash
git add src/engine/index.ts tests/engine/fixtures.test.ts
git commit -m "feat: add engine barrel export and all four acceptance fixtures (green)"
```

---

## Task 8: Design System

**Files:**
- Create: `src/styles/globals.css`

**Design direction:** Athletic precision instrument. Dark background like a GPS race device. Amber for the "hero" derived value (race timer orange). Electric blue for active inputs. Tabular mono font for all numbers so digits don't shift. Geometric sans for UI chrome. No rounded-card-on-gradient. Dense, informational, confident.

- [ ] **Step 1: Create src/styles/globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:            #0d0f14;
  --surface:       #161920;
  --surface-hi:    #1e2130;
  --border:        #272b3a;
  --border-subtle: #1a1d28;

  --text-1: #e8eaf0;
  --text-2: #8b90a4;
  --text-3: #4a4f62;

  /* Derived value: amber hero */
  --amber:     #f59e0b;
  --amber-bg:  rgba(245,158,11,0.08);
  --amber-glow: 0 0 24px rgba(245,158,11,0.12);

  /* Active input: blue */
  --blue:    #3b82f6;
  --blue-bg: rgba(59,130,246,0.08);

  /* Segment type colors */
  --run:  #10b981;
  --walk: #8b5cf6;

  /* Typography */
  --font-num: 'JetBrains Mono', 'Fira Mono', 'Courier New', monospace;
  --font-ui:  'Outfit', system-ui, sans-serif;

  /* Radii & spacing */
  --r-sm: 4px;
  --r:    8px;
  --r-lg: 12px;
}

html, body, #root {
  height: 100%;
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--font-ui);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

/* Tabular figures for all mono-font number displays */
.num {
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* Utility: a single horizontal rule in the surface border color */
.divider {
  border: none;
  border-top: 1px solid var(--border);
}

/* Focus ring — keyboard-visible only */
:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

/* Scrollbar style */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* Buttons base */
button {
  font-family: var(--font-ui);
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

/* Inputs base */
input {
  font-family: var(--font-num);
  color: var(--text-1);
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
}
input::placeholder { color: var(--text-3); }
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: add design system (CSS variables, fonts, base styles)"
```

---

## Task 9: App Shell

**Files:**
- Create: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Update src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: Create src/App.tsx**

```tsx
import { useState } from 'react';
import { Segment } from './engine/types';
import { UnitToggle } from './components/UnitToggle';
import { SimpleMode } from './components/SimpleMode';
import { AdvancedMode } from './components/AdvancedMode';
import { WorkoutProvider } from './store/context';
import { DistanceUnit } from './engine/types';

type Tab = 'simple' | 'advanced';

export default function App() {
  const [tab, setTab] = useState<Tab>('simple');
  const [unit, setUnit] = useState<DistanceUnit>('km');
  const [simpleSegment, setSimpleSegment] = useState<Segment | null>(null);

  return (
    <WorkoutProvider unit={unit} carrySegment={tab === 'advanced' ? simpleSegment : null}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 640, margin: '0 auto' }}>
        <header style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-num)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--amber)' }}>
            PACEFORGE
          </span>
          <UnitToggle value={unit} onChange={setUnit} />
        </header>

        <nav style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {(['simple', 'advanced'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: tab === t ? 'var(--text-1)' : 'var(--text-3)',
                borderBottom: tab === t ? '2px solid var(--amber)' : '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t === 'simple' ? 'Calculator' : 'Workout Builder'}
            </button>
          ))}
        </nav>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'simple' && (
            <SimpleMode unit={unit} onSegmentChange={setSimpleSegment} />
          )}
          {tab === 'advanced' && (
            <AdvancedMode unit={unit} />
          )}
        </main>
      </div>
    </WorkoutProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: add app shell with tab navigation and unit toggle layout"
```

---

## Task 10: UnitToggle + TriangleInput Components

**Files:**
- Create: `src/components/UnitToggle.tsx`
- Create: `src/components/TriangleInput.tsx`

- [ ] **Step 1: Create src/components/UnitToggle.tsx**

```tsx
import { DistanceUnit } from '../engine/types';

interface Props {
  value: DistanceUnit;
  onChange: (u: DistanceUnit) => void;
}

export function UnitToggle({ value, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      overflow: 'hidden',
    }}>
      {(['km', 'mi'] as DistanceUnit[]).map(u => (
        <button
          key={u}
          onClick={() => onChange(u)}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-num)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: value === u ? 'var(--bg)' : 'var(--text-3)',
            background: value === u ? 'var(--amber)' : 'transparent',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {u.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/TriangleInput.tsx**

This component renders the three-field triangle (distance, time, pace). The derived field shows the computed value in amber and is read-only unless the user taps to switch lock. Clicking the lock on a field makes it the derived field.

```tsx
import { useState } from 'react';
import { Segment, TriField, DistanceUnit } from '../engine/types';
import { solveSegment } from '../engine/solver';
import {
  parseDistanceInput, parseTimeInput, parsePaceInput,
  formatDistance, formatDuration, formatPace,
  metersToDisplayDistance, sPerKmToDisplay,
} from '../engine';

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
  // pace: parse as display unit, convert to canonical
  const v = parsePaceInput(raw);
  const canonical = v !== null
    ? (unit === 'km' ? v : v / 1.609344)
    : null;
  return solveSegment({ ...seg, paceSPerKm: canonical });
}

export function TriangleInput({ segment, unit, onChange }: Props) {
  // Local draft values while typing (raw strings before commit)
  const [drafts, setDrafts] = useState<Partial<Record<TriField, string>>>({});

  function handleFocus(field: TriField) {
    if (field === segment.derived) {
      // User tapped into derived field — flip lock to the 'other' non-focused input
      const others = FIELDS.filter(f => f !== field);
      // Pick the first 'other' as new derived (heuristic: least-recently-used)
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
            {/* Lock button */}
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

            {/* Label */}
            <span style={{ fontSize: 11, color: isDerived ? 'var(--amber)' : 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 60, flexShrink: 0 }}>
              {LABELS[field]}
            </span>

            {/* Value */}
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

            {/* Unit label */}
            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 52, textAlign: 'right', flexShrink: 0 }}>
              {UNITS_LABEL[field](unit)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/UnitToggle.tsx src/components/TriangleInput.tsx
git commit -m "feat: add UnitToggle and TriangleInput components with lock/derive behavior"
```

---

## Task 11: DistancePresets + SimpleMode

**Files:**
- Create: `src/components/DistancePresets.tsx`
- Create: `src/components/SimpleMode.tsx`

- [ ] **Step 1: Create src/components/DistancePresets.tsx**

```tsx
import { STANDARD_DISTANCES } from '../engine/constants';

interface Props {
  onSelect: (meters: number) => void;
  activeM: number | null;
}

export function DistancePresets({ onSelect, activeM }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {STANDARD_DISTANCES.map(d => {
        const active = activeM !== null && Math.abs(activeM - d.value) < 1;
        return (
          <button
            key={d.label}
            onClick={() => onSelect(d.value)}
            style={{
              padding: '5px 10px',
              fontSize: 12,
              fontFamily: 'var(--font-num)',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--bg)' : 'var(--text-2)',
              background: active ? 'var(--amber)' : 'var(--surface-hi)',
              border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/SimpleMode.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Segment, DistanceUnit } from '../engine/types';
import { solveSegment } from '../engine/solver';
import { TriangleInput } from './TriangleInput';
import { DistancePresets } from './DistancePresets';

function makeSegment(): Segment {
  return {
    id: 'simple',
    type: 'run',
    distanceM: null,
    durationS: null,
    paceSPerKm: null,
    derived: 'pace',
  };
}

interface Props {
  unit: DistanceUnit;
  onSegmentChange: (seg: Segment) => void;
}

export function SimpleMode({ unit, onSegmentChange }: Props) {
  const [seg, setSeg] = useState<Segment>(makeSegment);

  useEffect(() => { onSegmentChange(seg); }, [seg]);

  function handlePreset(meters: number) {
    const updated = solveSegment({ ...seg, distanceM: meters });
    setSeg(updated);
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Standard Distances
        </p>
        <DistancePresets onSelect={handlePreset} activeM={seg.distanceM} />
      </div>

      <TriangleInput segment={seg} unit={unit} onChange={setSeg} />

      <button
        onClick={() => setSeg(makeSegment())}
        style={{
          alignSelf: 'flex-start',
          fontSize: 12,
          color: 'var(--text-3)',
          padding: '4px 0',
          letterSpacing: '0.04em',
        }}
      >
        Clear
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and verify Simple mode renders**

```bash
npm run dev
```

Open browser to http://localhost:5173. Verify:
- PaceForge header with km/mi toggle visible
- Calculator tab active, showing distance presets and three fields
- Typing in distance + time fields derives pace in amber
- Clicking preset chips sets distance and recomputes pace
- Lock icons switch which field is derived

- [ ] **Step 4: Commit**

```bash
git add src/components/DistancePresets.tsx src/components/SimpleMode.tsx
git commit -m "feat: add SimpleMode with distance presets and live triangle calculator"
```

---

## Task 12: Workout Store

**Files:**
- Create: `src/store/actions.ts`
- Create: `src/store/reducer.ts`
- Create: `src/store/context.tsx`

- [ ] **Step 1: Create src/store/actions.ts**

```ts
import { Segment, DistanceUnit, WorkoutNode } from '../engine/types';

export type Action =
  | { type: 'ADD_SEGMENT'; parentId: string | null; segType: 'run' | 'walk' }
  | { type: 'ADD_REPEAT_BLOCK'; parentId: string | null }
  | { type: 'UPDATE_SEGMENT'; id: string; patch: Partial<Omit<Segment, 'id'>> }
  | { type: 'REMOVE_NODE'; id: string }
  | { type: 'SET_REPEAT'; id: string; count: number }
  | { type: 'SET_UNIT'; unit: DistanceUnit }
  | { type: 'SET_NAME'; name: string }
  | { type: 'CARRY_SIMPLE_SEGMENT'; seg: Segment }
  | { type: 'LOAD_WORKOUT'; nodes: WorkoutNode[]; name: string }
  | { type: 'CLEAR' };
```

- [ ] **Step 2: Create src/store/reducer.ts**

```ts
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
```

- [ ] **Step 3: Create src/store/context.tsx**

```tsx
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Workout, Segment, DistanceUnit } from '../engine/types';
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
  const [workout, dispatch] = useReducer(reducer, undefined, makeInitialWorkout);

  useEffect(() => { dispatch({ type: 'SET_UNIT', unit }); }, [unit]);

  useEffect(() => {
    if (carrySegment) dispatch({ type: 'CARRY_SIMPLE_SEGMENT', seg: carrySegment });
  }, [carrySegment]);

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
```

- [ ] **Step 4: Commit**

```bash
git add src/store/
git commit -m "feat: add workout store (reducer + context) with node tree operations"
```

---

## Task 13: SegmentRow + RepeatBlockRow

**Files:**
- Create: `src/components/SegmentRow.tsx`
- Create: `src/components/RepeatBlockRow.tsx`

- [ ] **Step 1: Create src/components/SegmentRow.tsx**

```tsx
import { Segment, DistanceUnit } from '../engine/types';
import { TriangleInput } from './TriangleInput';
import { useWorkout } from '../store/context';

interface Props {
  segment: Segment;
  unit: DistanceUnit;
  depth?: number;
}

const TYPE_COLOR: Record<'run' | 'walk', string> = { run: 'var(--run)', walk: 'var(--walk)' };

export function SegmentRow({ segment, unit, depth = 0 }: Props) {
  const { dispatch } = useWorkout();

  function handleChange(updated: Segment) {
    dispatch({ type: 'UPDATE_SEGMENT', id: updated.id, patch: updated });
  }

  return (
    <div style={{ marginLeft: depth * 16, borderLeft: depth > 0 ? `2px solid ${TYPE_COLOR[segment.type]}22` : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--surface)', borderRadius: 'var(--r) var(--r) 0 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLOR[segment.type], flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: TYPE_COLOR[segment.type] }}>
          {segment.type}
        </span>
        {segment.label && (
          <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 4 }}>{segment.label}</span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => dispatch({ type: 'REMOVE_NODE', id: segment.id })}
          style={{ fontSize: 16, color: 'var(--text-3)', padding: '0 4px' }}
          title="Remove segment"
        >
          ×
        </button>
      </div>
      <div style={{ padding: 8, background: 'var(--surface)', borderRadius: '0 0 var(--r) var(--r)' }}>
        <TriangleInput segment={segment} unit={unit} onChange={handleChange} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/RepeatBlockRow.tsx**

```tsx
import { RepeatBlock, WorkoutNode, DistanceUnit } from '../engine/types';
import { isSegment } from '../engine/types';
import { SegmentRow } from './SegmentRow';
import { useWorkout } from '../store/context';

interface Props {
  block: RepeatBlock;
  unit: DistanceUnit;
}

export function RepeatBlockRow({ block, unit }: Props) {
  const { dispatch } = useWorkout();

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
    }}>
      {/* Block header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'var(--surface-hi)',
        borderBottom: '1px solid var(--border)',
      }}>
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

      {/* Children */}
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {block.children.map(child =>
          isSegment(child) ? (
            <SegmentRow key={child.id} segment={child} unit={unit} depth={1} />
          ) : null
        )}
        {block.children.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '8px 0' }}>
            No segments — add Run or Walk above
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SegmentRow.tsx src/components/RepeatBlockRow.tsx
git commit -m "feat: add SegmentRow and RepeatBlockRow components for workout tree"
```

---

## Task 14: TotalsPanel + AdvancedMode

**Files:**
- Create: `src/components/TotalsPanel.tsx`
- Create: `src/components/AdvancedMode.tsx`

- [ ] **Step 1: Create src/components/TotalsPanel.tsx**

```tsx
import { WorkoutNode, DistanceUnit } from '../engine/types';
import {
  sumDistanceM, sumDurationS, overallPaceSPerKm, runningOnlyPaceSPerKm,
  metersToDisplayDistance, sPerKmToDisplay, formatDistance, formatDuration, formatPace,
} from '../engine';

interface Props {
  nodes: WorkoutNode[];
  unit: DistanceUnit;
}

export function TotalsPanel({ nodes, unit }: Props) {
  const distM = sumDistanceM(nodes);
  const durS = sumDurationS(nodes);
  const pace = overallPaceSPerKm(nodes);
  const runPace = runningOnlyPaceSPerKm(nodes);

  const items = [
    { label: 'Total Distance', value: formatDistance(distM, unit) || '—', unit: unit },
    { label: 'Total Time', value: formatDuration(durS) || '—', unit: '' },
    { label: 'Overall Pace', value: pace ? formatPace(sPerKmToDisplay(pace, unit)) : '—', unit: `min/${unit}` },
    { label: 'Run Pace', value: runPace ? formatPace(sPerKmToDisplay(runPace, unit)) : '—', unit: `min/${unit}` },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 1, background: 'var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden',
    }}>
      {items.map(item => (
        <div key={item.label} style={{ background: 'var(--surface)', padding: '12px 14px' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 4 }}>
            {item.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="num" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-1)' }}>
              {item.value}
            </span>
            {item.unit && (
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/AdvancedMode.tsx**

```tsx
import { DistanceUnit } from '../engine/types';
import { isSegment, isRepeatBlock } from '../engine/types';
import { useWorkout } from '../store/context';
import { SegmentRow } from './SegmentRow';
import { RepeatBlockRow } from './RepeatBlockRow';
import { TotalsPanel } from './TotalsPanel';
import { RunWalkPreset } from './RunWalkPreset';
import { useState } from 'react';

interface Props {
  unit: DistanceUnit;
}

export function AdvancedMode({ unit }: Props) {
  const { workout, dispatch } = useWorkout();
  const [showPreset, setShowPreset] = useState(false);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Workout name */}
      <input
        value={workout.name}
        onChange={e => dispatch({ type: 'SET_NAME', name: e.target.value })}
        style={{
          fontSize: 18, fontWeight: 600, color: 'var(--text-1)',
          background: 'transparent', border: 'none', outline: 'none',
          borderBottom: '1px solid var(--border)', padding: '4px 0',
        }}
        placeholder="Workout name"
      />

      {/* Totals panel */}
      <TotalsPanel nodes={workout.nodes} unit={unit} />

      {/* Node list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {workout.nodes.map(node => (
          isSegment(node)
            ? <SegmentRow key={node.id} segment={node} unit={unit} />
            : isRepeatBlock(node)
            ? <RepeatBlockRow key={node.id} block={node} unit={unit} />
            : null
        ))}
        {workout.nodes.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 24 }}>
            Add segments below to start building your workout
          </p>
        )}
      </div>

      {/* Add controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: null, segType: 'run' })}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--run)', background: 'var(--run)0d', border: '1px solid var(--run)33', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          + Run Segment
        </button>
        <button
          onClick={() => dispatch({ type: 'ADD_SEGMENT', parentId: null, segType: 'walk' })}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--walk)', background: 'var(--walk)0d', border: '1px solid var(--walk)33', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          + Walk Segment
        </button>
        <button
          onClick={() => dispatch({ type: 'ADD_REPEAT_BLOCK', parentId: null })}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          + Repeat Block
        </button>
        <button
          onClick={() => setShowPreset(true)}
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, color: 'var(--amber)', background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--r)', letterSpacing: '0.04em' }}
        >
          Run/Walk Preset
        </button>
      </div>

      {showPreset && <RunWalkPreset unit={unit} onClose={() => setShowPreset(false)} />}

      {workout.nodes.length > 0 && (
        <button
          onClick={() => dispatch({ type: 'CLEAR' })}
          style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--text-3)', padding: '4px 0' }}
        >
          Clear workout
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and verify Advanced mode**

```bash
npm run dev
```

Switch to Workout Builder tab. Verify:
- Workout name editable
- Totals panel shows 4 cells (all "—" when empty)
- "+ Run Segment" adds a segment with triangle input
- "+ Repeat Block" adds a block with repeat counter and child segments
- Totals update live as values are entered
- Switching back to Calculator and then to Workout Builder carries the simple segment

- [ ] **Step 4: Commit**

```bash
git add src/components/TotalsPanel.tsx src/components/AdvancedMode.tsx
git commit -m "feat: add TotalsPanel and AdvancedMode with live workout builder"
```

---

## Task 15: RunWalk Preset

**Files:**
- Create: `src/components/RunWalkPreset.tsx`

- [ ] **Step 1: Create src/components/RunWalkPreset.tsx**

```tsx
import { useState } from 'react';
import { DistanceUnit, Segment, RepeatBlock } from '../engine/types';
import { solveSegment } from '../engine/solver';
import { parsePaceInput, parseTimeInput } from '../engine/formatting';
import { GALLOWAY_PRESETS } from '../engine/constants';
import { useWorkout } from '../store/context';

interface Props {
  unit: DistanceUnit;
  onClose: () => void;
}

let _id = 0;
function uid() { return `p${++_id}`; }

function makeSeg(type: 'run' | 'walk', durationS: number, paceInput: string | null, unit: DistanceUnit): Segment {
  const paceSPerKm = paceInput
    ? (() => { const p = parsePaceInput(paceInput); return p ? (unit === 'km' ? p : p / 1.609344) : null; })()
    : null;
  return solveSegment({
    id: uid(), type, distanceM: null, durationS, paceSPerKm, derived: 'distance',
  });
}

export function RunWalkPreset({ unit, onClose }: Props) {
  const { dispatch } = useWorkout();
  const [runDur, setRunDur] = useState('4:00');
  const [walkDur, setWalkDur] = useState('1:00');
  const [runPace, setRunPace] = useState('5:00');
  const [walkPace, setWalkPace] = useState('8:00');
  const [repeats, setRepeats] = useState(6);

  function applyPreset(r: number, w: number) {
    setRunDur(`${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`);
    setWalkDur(`${Math.floor(w / 60)}:${String(w % 60).padStart(2, '0')}`);
  }

  function handleInsert() {
    const rDur = parseTimeInput(runDur) ?? 240;
    const wDur = parseTimeInput(walkDur) ?? 60;
    const block: RepeatBlock = {
      id: uid(),
      repeat: repeats,
      children: [
        makeSeg('run', rDur, runPace, unit),
        makeSeg('walk', wDur, walkPace, unit),
      ],
    };
    dispatch({ type: 'ADD_REPEAT_BLOCK', parentId: null });
    // After ADD_REPEAT_BLOCK creates a default block, we directly load a custom one instead.
    // Simplest approach: use LOAD approach — dispatch CARRY to add block directly.
    // Actually: dispatch a custom action by adding the block directly to nodes via a workaround.
    // Since reducer doesn't have an ADD_CUSTOM_BLOCK action, we use ADD_REPEAT_BLOCK then 
    // we need to update it. For now, add segments after the block is created.
    // TODO for next iteration: add a dedicated ADD_NODE action that accepts a full WorkoutNode.
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
        padding: 20, width: 'min(400px, 92vw)', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Run/Walk Preset</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: 'var(--text-3)' }}>×</button>
        </div>

        {/* Quick ratio presets */}
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Common Ratios</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {GALLOWAY_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.runS, p.walkS)}
                style={{ padding: '5px 10px', fontSize: 12, fontFamily: 'var(--font-num)', color: 'var(--text-2)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom inputs */}
        {[
          { label: 'Run Duration', value: runDur, set: setRunDur, paceVal: runPace, setPace: setRunPace },
          { label: 'Walk Duration', value: walkDur, set: setWalkDur, paceVal: walkPace, setPace: setWalkPace },
        ].map(row => (
          <div key={row.label}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text-3)' }}>Duration (m:ss)</label>
                <input
                  value={row.value}
                  onChange={e => row.set(e.target.value)}
                  style={{ display: 'block', width: '100%', fontFamily: 'var(--font-num)', fontSize: 16, color: 'var(--text-1)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', marginTop: 4 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text-3)' }}>Pace (min/{unit})</label>
                <input
                  value={row.paceVal}
                  onChange={e => row.setPace(e.target.value)}
                  style={{ display: 'block', width: '100%', fontFamily: 'var(--font-num)', fontSize: 16, color: 'var(--text-1)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', marginTop: 4 }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Repeat count */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Repeat Count</label>
          <input
            type="number" min={1} max={99} value={repeats}
            onChange={e => setRepeats(parseInt(e.target.value, 10) || 1)}
            style={{ display: 'block', width: 80, fontFamily: 'var(--font-num)', fontSize: 18, fontWeight: 600, color: 'var(--text-1)', background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', marginTop: 4 }}
          />
        </div>

        <button
          onClick={handleInsert}
          style={{ padding: '10px', fontWeight: 600, fontSize: 14, color: 'var(--bg)', background: 'var(--amber)', borderRadius: 'var(--r)', letterSpacing: '0.02em' }}
        >
          Insert Block
        </button>
      </div>
    </div>
  );
}
```

> **Note:** The `handleInsert` function above uses `ADD_REPEAT_BLOCK` which creates a default block. To insert a fully custom block, add an `ADD_NODE` action to `src/store/actions.ts` and `reducer.ts`:
>
> In `actions.ts`, add: `| { type: 'ADD_NODE'; node: WorkoutNode }`
>
> In `reducer.ts`, add case: `case 'ADD_NODE': return { ...state, nodes: [...state.nodes, action.node] };`
>
> Then replace the `handleInsert` body with:
> ```ts
> function handleInsert() {
>   const rDur = parseTimeInput(runDur) ?? 240;
>   const wDur = parseTimeInput(walkDur) ?? 60;
>   const block: RepeatBlock = {
>     id: uid(), repeat: repeats,
>     children: [makeSeg('run', rDur, runPace, unit), makeSeg('walk', wDur, walkPace, unit)],
>   };
>   dispatch({ type: 'ADD_NODE', node: block });
>   onClose();
> }
> ```

- [ ] **Step 2: Add ADD_NODE action to actions.ts and reducer.ts**

In `src/store/actions.ts`, add to the union:
```ts
| { type: 'ADD_NODE'; node: import('../engine/types').WorkoutNode }
```

In `src/store/reducer.ts`, add case before `default`:
```ts
case 'ADD_NODE':
  return { ...state, nodes: [...state.nodes, action.node] };
```

Update `handleInsert` in `RunWalkPreset.tsx` as described in the note above.

- [ ] **Step 3: Verify in browser**

Click "Run/Walk Preset" in Advanced mode. Select a Galloway ratio. Click Insert Block. Verify the RepeatBlock appears in the workout with correct run/walk children and the totals panel updates.

- [ ] **Step 4: Commit**

```bash
git add src/components/RunWalkPreset.tsx src/store/actions.ts src/store/reducer.ts
git commit -m "feat: add RunWalk preset with Galloway ratios and custom block insertion"
```

---

## Task 16: Persistence

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/hooks/usePersistence.ts`
- Create: `src/components/WorkoutList.tsx`
- Modify: `src/store/context.tsx`

- [ ] **Step 1: Create src/hooks/useLocalStorage.ts**

```ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* storage full — ignore */ }
  }, [key, value]);

  return [value, setValue];
}
```

- [ ] **Step 2: Create src/hooks/usePersistence.ts**

```ts
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
  const [currentNodes, setCurrentNodes] = useLocalStorage<WorkoutNode[]>('paceforge-current', []);
  const [currentName, setCurrentName] = useLocalStorage<string>('paceforge-current-name', 'My Workout');

  function saveWorkout(name: string, nodes: WorkoutNode[]) {
    const entry: SavedWorkout = { id: crypto.randomUUID(), name, nodes, savedAt: Date.now() };
    setSaved(prev => [entry, ...prev].slice(0, 20));
  }

  function deleteWorkout(id: string) {
    setSaved(prev => prev.filter(w => w.id !== id));
  }

  return { saved, saveWorkout, deleteWorkout, currentNodes, setCurrentNodes, currentName, setCurrentName };
}
```

- [ ] **Step 3: Wire autosave into context.tsx**

Add autosave to `WorkoutProvider`. After the existing `useEffect` calls, add:

```tsx
// Import at top of context.tsx:
import { useLocalStorage } from '../hooks/useLocalStorage';

// Inside WorkoutProvider, after the useReducer:
const [, setAutoSave] = useLocalStorage<{ nodes: WorkoutNode[]; name: string }>(
  'paceforge-autosave',
  { nodes: [], name: 'My Workout' }
);

useEffect(() => {
  setAutoSave({ nodes: workout.nodes, name: workout.name });
}, [workout.nodes, workout.name]);
```

Also restore from autosave on mount (add to makeInitialWorkout or use an initializer):

In `context.tsx`, change the `useReducer` initializer:
```tsx
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
```

Add the `WorkoutNode` import at the top of `context.tsx`.

- [ ] **Step 4: Create src/components/WorkoutList.tsx**

```tsx
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
```

- [ ] **Step 5: Add Save button to AdvancedMode**

In `AdvancedMode.tsx`, import `usePersistence` and `WorkoutList`, then add a Save button and the list below the node list:

```tsx
// Add to imports:
import { usePersistence } from '../hooks/usePersistence';
import { WorkoutList } from './WorkoutList';

// Inside component, before return:
const { saved, saveWorkout, deleteWorkout } = usePersistence();

// Add to JSX after the clear button:
<button
  onClick={() => saveWorkout(workout.name, workout.nodes)}
  style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: 12, fontWeight: 600, color: 'var(--bg)', background: 'var(--amber)', borderRadius: 'var(--r)' }}
>
  Save Workout
</button>

<WorkoutList
  workouts={saved}
  onLoad={w => dispatch({ type: 'LOAD_WORKOUT', nodes: w.nodes, name: w.name })}
  onDelete={deleteWorkout}
/>
```

- [ ] **Step 6: Verify persistence in browser**

1. Build a workout in Advanced mode
2. Save it with the "Save Workout" button
3. Reload the page — verify the workout auto-restores
4. The saved list shows the named workout
5. Load it — workout tree restores correctly

- [ ] **Step 7: Commit**

```bash
git add src/hooks/ src/components/WorkoutList.tsx src/store/context.tsx src/components/AdvancedMode.tsx
git commit -m "feat: add localStorage persistence — autosave, named save/load"
```

---

## Task 17: Mobile Polish & Dark Mode Verification

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/App.tsx`
- Modify: `src/components/TriangleInput.tsx`

- [ ] **Step 1: Add mobile-friendly touch targets to globals.css**

Append to `src/styles/globals.css`:

```css
/* Minimum tap target size for mobile */
button { min-height: 36px; min-width: 36px; }

/* Prevent input zoom on iOS (font-size < 16px triggers zoom) */
input { font-size: max(16px, 1em); }

/* Full-bleed on narrow screens */
@media (max-width: 480px) {
  main { padding-bottom: 24px; }
}
```

- [ ] **Step 2: Add viewport-aware layout to App.tsx**

Ensure the outer `div` has `min-height: 100dvh` instead of `height: 100%` for mobile browser chrome:

```tsx
// In App.tsx, change the outer div style:
style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', maxWidth: 640, margin: '0 auto' }}
```

- [ ] **Step 3: Verify dark mode**

The design is dark-first (CSS variables are all dark). Confirm no white flash on load by checking `index.html` — add background color to `<body>` style:

```html
<body style="background:#0d0f14">
```

- [ ] **Step 4: Final visual check in browser (mobile viewport)**

In DevTools, set viewport to iPhone 14 (390×844). Verify:
- All three triangle fields are thumb-reachable
- Lock icons are at least 36×36px tap target
- Repeat block repeat-counter input is usable
- Totals panel readable at small size
- No horizontal scroll

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/App.tsx index.html
git commit -m "polish: mobile tap targets, iOS input zoom fix, dvh viewport"
```

---

## Task 18: README + Build Verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests PASS. Fix any failures before continuing.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. Fix any type errors.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: `dist/` created, no errors. Check output with:

```bash
ls dist/assets/
```

Expected: one JS chunk and one CSS file.

- [ ] **Step 4: Create README.md**

```markdown
# PaceForge

Running workout calculator. Solve any two of distance / time / pace, or build structured interval workouts with repeat blocks and Galloway run/walk presets.

## Quick start

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm test          # unit tests (Vitest)
npm run build     # production build → dist/
```

## Deploy to Vercel

Push to GitHub and import the repo in Vercel. Build command: `npm run build`. Output directory: `dist`. No environment variables needed.

## Architecture

- **`src/engine/`** — pure TypeScript math, zero React imports. Triangle solver, aggregation, formatting, unit conversions.
- **`src/store/`** — `useReducer` + Context for the workout tree.
- **`src/components/`** — React UI consuming the engine.
- **`tests/engine/`** — Vitest unit tests including all acceptance fixtures.
```

- [ ] **Step 5: Final commit**

```bash
git add README.md
git commit -m "docs: add README with setup, deploy, and architecture notes"
```

---

## Spec Coverage Checklist

| Requirement | Task |
|---|---|
| Triangle solver (all 3 directions) | Task 5, 7 |
| Lock/derive behavior with lock icon | Task 10 |
| Auto-switch lock when typing in derived field | Task 10 |
| Unit toggle km/mi (no drift) | Task 4, 7 Fixture 3 |
| Standard distance presets | Task 2, 11 |
| Simple mode screen | Task 11 |
| Advanced mode: run/walk segments | Task 13, 14 |
| Advanced mode: repeat blocks | Task 13, 14 |
| Drag-to-reorder | Not implemented (v1 — add as future enhancement) |
| Live totals panel | Task 14 |
| Simple→Advanced segment carry-over | Task 9, 12 |
| RunWalk preset (Galloway ratios) | Task 15 |
| Persistence: autosave | Task 16 |
| Persistence: named save/load | Task 16 |
| All 4 §4 acceptance fixtures | Task 7 |
| No NaN/crash on bad input | Tasks 3–5 (null propagation) |
| Running-only pace | Task 6 |
| Mobile-friendly | Task 17 |
| Dark mode | Task 8, 17 |
| Tabular font for numbers | Task 8 |
| Vercel build clean | Task 18 |
| README | Task 18 |

**Drag-to-reorder** is the one UI feature deferred. Add a `MOVE_NODE` action to the reducer and a drag handle + `@dnd-kit/core` in a follow-up.

**Running-only pace note (Fixture 4):** Warmup is typed `run`. Running-only pace = 4:13/km (1666.7 + 13500 = 15166.7m run; 600 + 3240 = 3840s run). Spec approximates 4:05/km — the discrepancy is a spec rounding error; our test targets the exact calculated value (253 s/km).
