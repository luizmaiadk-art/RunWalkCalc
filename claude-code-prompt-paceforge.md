# Claude Code Prompt — Running Workout Calculator ("PaceForge")

> Working title is a placeholder; rename freely. Paste everything below the line into Claude Code.

---

## 0. How I want you to work

Use my installed skills/plugins deliberately:

- **superpowers** — Start with the brainstorm → plan workflow. Produce a short written plan (`docs/PLAN.md`) before writing app code. Build the calculation engine **test-first** (TDD): pure functions with Vitest specs that pass before any UI is wired to them. Work **one task at a time**, checkpoint after each milestone in §12, and stop for my review at the checkpoints I mark with ⏸.
- **frontend-design** — Use it for all UI/styling decisions. I want a distinctive, production-grade interface, not generic AI-default Tailwind. See §10 for direction.
- **playground** — Use it to live-preview and iterate on components as you build them (engine sandbox first, then the two mode screens).

Hard rule: the **calculation engine is pure, framework-agnostic TypeScript with no React imports**. React only consumes it. This keeps the math testable and portable (I may reuse it in an iOS project later).

---

## 1. Goal & scope

A single-page web app that helps runners plan workouts. Two things it must nail:

1. A **distance / time / pace "triangle" calculator** that solves in **all directions** — give any two, it computes the third, live.
2. A **workout builder** that composes many of those triangles into a structured session (warmups, interval repeats, run/walk), and aggregates them into totals.

No backend, no auth, no accounts. Local-only persistence. English UI.

---

## 2. Tech stack & project setup

- **React + Vite + TypeScript**, strict mode on.
- State: `useReducer` + Context for the workout tree (no heavy state lib needed). The engine is pure functions called by the reducer.
- **Vitest** for engine unit tests; `@testing-library/react` for a few smoke tests on the calculator inputs.
- **Vercel-ready**: standard Vite SPA build (`npm run build` → `dist/`). No router needed (tabs, not routes), so no SPA-rewrite config required. Add a minimal `README.md` with `npm install / dev / build` and a one-line Vercel deploy note.
- No external runtime APIs. No network calls.

---

## 3. Core domain model (implement these types)

Canonical internal representation is **always SI**; convert only at the UI boundary. This avoids rounding drift when toggling units.

```ts
// Canonical units: meters, seconds, seconds-per-kilometer.
type DistanceUnit = 'km' | 'mi';

type TriField = 'distance' | 'time' | 'pace';

interface Segment {
  id: string;
  type: 'run' | 'walk';
  distanceM: number | null;     // meters
  durationS: number | null;     // seconds
  paceSPerKm: number | null;    // seconds per km
  derived: TriField;            // which of the three is computed (default 'pace')
  label?: string;               // e.g. "Warmup", optional
}

interface RepeatBlock {
  id: string;
  repeat: number;               // >= 1
  children: WorkoutNode[];
}

type WorkoutNode = Segment | RepeatBlock;

interface Workout {
  id: string;
  name: string;
  units: DistanceUnit;          // display unit; canonical stays SI
  nodes: WorkoutNode[];
}
```

Rule of the triangle: exactly **two** of `{distanceM, durationS, paceSPerKm}` are user-provided at any time; `derived` names the third and it is always recomputed from the other two. With fewer than two provided, the derived value is `null` (UI shows a placeholder).

---

## 4. The calculation engine (pure + fully tested)

Implement and unit-test these. All functions pure, no side effects.

**Triangle solver** (canonical units):
- `pace = time / (distanceM / 1000)`
- `time = pace * (distanceM / 1000)`
- `distanceM = (time / pace) * 1000`
- `solveSegment(seg): Segment` — returns a copy with `derived` field recomputed; returns the value untouched (derived = null) if <2 inputs present.

**Aggregation** (recursive over the node tree; `RepeatBlock` multiplies its children's totals by `repeat`):
- `totalDistanceM(nodes)`, `totalDurationS(nodes)`
- `overallPaceSPerKm = totalDurationS / (totalDistanceM/1000)`
- `runningOnlyPaceSPerKm` — same, but summing only `type==='run'` segments (runners care about this separately from walk recoveries)

**Unit conversion** (exact factors — do not approximate):
- `1 mile = 1609.344 m`
- distance: `mi = m / 1609.344`
- pace: `sPerMile = sPerKm * 1.609344`

**Parsing / formatting**:
- Pace & time inputs accept `mm:ss` and `h:mm:ss`; format pace as `m:ss`, time as `h:mm:ss` when ≥1h else `m:ss`.
- Reject/ignore zero, negative, and unparseable values gracefully (no crashes, no NaN leaking into the UI).

**Standard distances** (meters): 400 m, 1 K (1000), 1 mile (1609.344), 5 K (5000), 10 K (10000), Half (21097.5), Marathon (42195), plus **Custom**.

### Acceptance fixtures (write these as tests)

1. **Linear:** distance 10 K, time `40:00` → pace `4:00/km`. (2400 s ÷ 10 km = 240 s/km.)
2. **Direction check:** pace `4:00/km`, time `40:00` → distance 10 K. And pace `4:00/km`, distance 10 K → time `40:00`.
3. **Imperial round-trip:** set canonical from 10 K / 40:00, toggle to miles → distance ≈ 6.2137 mi, pace ≈ `6:26/mi`; toggle back → values identical to start (no drift).
4. **Interval workout** = `10:00 @ 6:00/km` warmup, then `6×(9:00 @ 4:00/km + 1:00 @ 10:00/km)`:
   - Warmup: 600 s → 1.6667 km
   - Per rep: run 540 s → 2.25 km; recovery 60 s → 0.10 km; rep = 600 s / 2.35 km
   - 6 reps = 3600 s / 14.1 km
   - **Total = 70:00 / 15.767 km**, overall pace ≈ `4:26/km`
   - running-only (run-typed segments) pace ≈ `4:05/km` — verify your split logic against your own typing of warmup; document the assumption.

---

## 5. Interaction / UX rules

**Recalc + lock (core behavior):**
- Default `derived = 'pace'`. Editing distance or time recomputes pace live.
- Each of the three fields has a small **lock icon**. Tapping it makes that field the derived one (`solve for X`) and recomputes it from the other two. The currently-derived field is visually distinct (e.g. subtle highlight + "auto" tag) and not directly editable.
- If the user types into the derived field, switch the lock automatically (the field they're typing into becomes an input, and the previously least-recently-edited field becomes derived).

**Unit toggle:** global `km | mi` switch. Pace unit follows distance unit (`min/km` ↔ `min/mi`). Toggling **converts displayed values from canonical** — canonical store is never mutated by a toggle, so no cumulative rounding.

**Inputs:** masked entry for pace (`m:ss`) and time (`h:mm:ss`/`m:ss`); numeric for distance with the unit suffix shown.

---

## 6. Simple mode

A clean single-segment triangle calculator:
- Distance presets (chips/dropdown from §4 standard distances) + Custom.
- The three fields with the lock behavior from §5.
- Big, legible result. This is the default screen on load.

---

## 7. Advanced mode (workout builder)

- Render the `Workout.nodes` tree as an ordered, editable list.
- Add **Run segment**, **Walk segment**, or **Repeat block**; drag-to-reorder; set `repeat` count on blocks; nest segments inside a block. Support at least one level of repeat nesting (model allows arbitrary; UI can cap at one if simpler — note the choice).
- Each segment is its own triangle (full §5 behavior, including lock).
- **Live totals panel** always visible: total distance, total time, overall avg pace, running-only avg pace. Updates on every edit.
- Switching simple → advanced should carry the simple-mode segment in as the first node.

---

## 8. RunWalk preset

A quick action inside Advanced mode that generates a `RepeatBlock` of `[run segment, walk segment]`:
- Inputs: run leg (duration or distance + pace), walk leg (same), and repeat count.
- One-tap common Galloway-style ratios as starting points (e.g. run 4:00 / walk 1:00; run 2:00 / walk 1:00; run :30 / walk :30).
- Result feeds the same engine and totals — it is just a preset that builds the unified structure, not a separate code path.

---

## 9. Validation & edge cases

- <2 inputs in a segment → derived stays empty, no error noise.
- Zero/negative/garbage input → ignored, field shows placeholder, totals stay valid.
- Very long runs → time formats with hours.
- Repeat count 1 behaves like no repeat. Empty repeat block contributes 0.
- Never render `NaN`, `Infinity`, or `:NaN` anywhere.

---

## 10. Design direction (use frontend-design)

- Tool-like and confident, not a toy. Think clean athletic instrument: strong numeric hierarchy (the computed value is the hero), tabular-figure font for all numbers so digits don't jitter while typing.
- Distinct visual treatment for the derived/locked field vs. user inputs.
- Responsive; thumb-friendly on mobile (I'll often use this on my phone mid-planning).
- Light + dark mode.
- No generic centered-card-on-gradient look.

---

## 11. Persistence

- `localStorage` only. Auto-save the current workout. Allow **saving named workouts** and reloading them from a simple list. Allow reset/clear. No server, no export needed for v1 (note where I'd add CSV/JSON export later).

---

## 12. Build sequence (work top to bottom, checkpoint at ⏸)

1. `docs/PLAN.md` via the superpowers planning workflow. ⏸
2. Pure engine + Vitest: triangle solver, conversions, parse/format, aggregation. All §4 fixtures green. ⏸
3. Simple mode UI wired to engine (lock behavior, presets, unit toggle).
4. Advanced mode: node tree, run/walk segments, repeat blocks, live totals. ⏸
5. RunWalk preset.
6. Persistence (autosave + named workouts).
7. Design pass with frontend-design; dark mode; mobile polish.
8. README + Vercel build verification (`npm run build` clean). ⏸

---

## 13. Definition of done

- All §4 acceptance fixtures pass in CI-style `npm test`.
- Triangle solves correctly in all three directions in both unit systems with no drift on toggle.
- The §4.4 interval example reproduces 70:00 / 15.767 km / ~4:26/km overall.
- RunWalk preset produces a working repeated block that aggregates correctly.
- Engine has zero React imports. App builds clean for Vercel.
- No `NaN`/crash on empty, partial, or malformed input.
