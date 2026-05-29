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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', maxWidth: 640, margin: '0 auto' }}>
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
