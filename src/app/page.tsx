'use client';

import { usePolymarketData } from '@/hooks/usePolymarketData';
import { useScenario } from '@/hooks/useScenario';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { ScenarioBar } from '@/components/ScenarioBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bracket } from '@/components/Bracket';

const ROUND_LABELS = [
  'Round 1',
  'Conf Semis',
  'Conf Finals',
  'NBA Finals',
  'Conf Finals',
  'Conf Semis',
  'Round 1',
];

export default function Home() {
  const { overrides, setWinner, removeOverride, resetAll, overrideLabels } = useScenario();
  const { data, error } = usePolymarketData(overrides);
  const { theme, toggleTheme } = useTheme();

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--accent-red)',
        fontSize: 16,
        fontWeight: 500,
      }}>
        Error loading data: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--text-muted)',
        fontSize: 14,
        fontWeight: 500,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        Loading odds...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 32px' }}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <Header connectionStatus={data.connectionStatus} lastUpdated={data.lastUpdated} />
      <ScenarioBar
        overrideLabels={overrideLabels}
        onRemove={removeOverride}
        onReset={resetAll}
      />

      {/* Conference labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 40px',
        marginBottom: 8,
      }}>
        <span style={{
          textTransform: 'uppercase',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.5,
          color: 'var(--text-muted)',
        }}>
          Western Conference
        </span>
        <span style={{
          textTransform: 'uppercase',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.5,
          color: 'var(--text-muted)',
        }}>
          Eastern Conference
        </span>
      </div>

      {/* Round labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        {ROUND_LABELS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 32 }} />}
            <div style={{
              width: 250,
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              color: 'var(--text-muted)',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Bracket */}
      <Bracket matchups={data.matchups} onTeamClick={setWinner} overrides={overrides} />
    </div>
  );
}
