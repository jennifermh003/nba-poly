'use client';

import { Matchup as MatchupType } from '@/lib/types';
import { Matchup } from './Matchup';

interface RoundProps {
  matchups: MatchupType[];
  isR1?: boolean;
}

export function Round({ matchups, isR1 }: RoundProps) {
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
      {matchups.map((matchup) => (
        <Matchup key={matchup.id} matchup={matchup} />
      ))}
    </div>
  );
}
