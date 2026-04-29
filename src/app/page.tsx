'use client';

import { usePolymarketData } from '@/hooks/usePolymarketData';
import { useScenario } from '@/hooks/useScenario';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { ScenarioBar } from '@/components/ScenarioBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bracket } from '@/components/Bracket';

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

      {/* Bracket */}
      <Bracket matchups={data.matchups} onTeamClick={setWinner} overrides={overrides} />
    </div>
  );
}
