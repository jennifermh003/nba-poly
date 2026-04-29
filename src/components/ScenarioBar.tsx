'use client';

interface ScenarioBarProps {
  overrideLabels: { matchupId: string; label: string }[];
  onRemove: (matchupId: string) => void;
  onReset: () => void;
}

export function ScenarioBar({ overrideLabels, onRemove, onReset }: ScenarioBarProps) {
  if (overrideLabels.length === 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', margin: '0 40px 12px',
      background: 'var(--card-bg, #fff)',
      border: '1px solid rgba(0,0,0,0.06)', borderRadius: 6,
      fontSize: 11, flexWrap: 'wrap',
    }}>
      <span style={{ color: 'var(--text-secondary, #6c6e6f)', fontWeight: 600 }}>What if:</span>
      {overrideLabels.map(({ matchupId, label }) => (
        <span key={matchupId} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', background: 'rgba(48,91,200,0.08)',
          border: '1px solid rgba(48,91,200,0.3)', borderRadius: 12,
          fontSize: 10, fontWeight: 600, color: 'var(--accent-blue, #305bc8)',
        }}>
          {label}
          <span onClick={() => onRemove(matchupId)}
            style={{ cursor: 'pointer', color: 'var(--text-muted, #9d9e9f)', fontSize: 12 }}>×</span>
        </span>
      ))}
      <span onClick={onReset} style={{
        marginLeft: 'auto', fontSize: 10, fontWeight: 600,
        color: 'var(--accent-blue, #305bc8)', cursor: 'pointer', textDecoration: 'underline',
      }}>Reset to market odds</span>
    </div>
  );
}
