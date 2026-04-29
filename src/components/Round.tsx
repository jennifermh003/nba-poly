'use client';

import { Matchup as MatchupType } from '@/lib/types';
import { Matchup } from './Matchup';

interface RoundProps {
  matchups: MatchupType[];
  isR1?: boolean;
  onTeamClick?: (matchupId: string, teamAbbr: string) => void;
  overrides?: Record<string, string>;
}

export function Round({ matchups, isR1, onTeamClick, overrides }: RoundProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isR1 ? 'center' : 'space-around',
        gap: isR1 ? '20px' : undefined,
        width: '250px',
        flex: '0 0 250px',
        minHeight: 0,
      }}
    >
      {matchups.map((m) => (
        <Matchup
          key={m.id}
          matchup={m}
          onTeamClick={onTeamClick}
          overriddenWinner={overrides?.[m.id]}
        />
      ))}
    </div>
  );
}
