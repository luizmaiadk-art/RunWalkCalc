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
