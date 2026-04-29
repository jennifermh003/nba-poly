'use client';

import { useState } from 'react';
import { Matchup as MatchupType } from '@/lib/types';
import { TeamRow } from './TeamRow';

interface MatchupProps {
  matchup: MatchupType;
  isFinals?: boolean;
}

function getMatchupTag(matchup: MatchupType): string {
  const conf = matchup.conference === 'west' ? 'W' : 'E';

  switch (matchup.round) {
    case 1:
      return `${conf}1 · ${matchup.topTeam.seed} vs ${matchup.bottomTeam.seed}`;
    case 2:
      return `${conf} Semis`;
    case 3:
      return matchup.conference === 'west' ? 'WCF' : 'ECF';
    case 4:
      return 'Finals';
    default:
      return '';
  }
}

export function Matchup({ matchup, isFinals = false }: MatchupProps) {
  const [hovered, setHovered] = useState(false);

  const tag = getMatchupTag(matchup);

  const cardStyle: React.CSSProperties = isFinals
    ? {
        width: 250,
        background: 'var(--card-bg, #fff)',
        borderRadius: 4,
        border: '2px solid rgba(48,91,200,0.15)',
        boxShadow: hovered
          ? '0 0 0 2px #305bc8, 0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }
    : {
        width: 250,
        background: 'var(--card-bg, #fff)',
        borderRadius: 4,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: hovered
          ? '0 0 0 2px #305bc8, 0 2px 8px rgba(0,0,0,0.1)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isFinals && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 10px',
            borderBottom: '1px solid rgba(0,0,0,0.04)',
            background: 'rgba(48,91,200,0.03)',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: '#305bc8',
            }}
          >
            🏆 NBA FINALS
          </span>
        </div>
      )}

      {/* Meta bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '5px 10px 4px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: 'var(--text-muted, #9d9e9f)',
          }}
        >
          {tag}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--text-secondary, #6c6e6f)',
          }}
        >
          {matchup.seriesScore}
        </span>
      </div>

      {/* Team rows */}
      <TeamRow
        team={matchup.topTeam}
        isLeading={matchup.topTeam.odds > matchup.bottomTeam.odds}
      />
      <TeamRow
        team={matchup.bottomTeam}
        isLeading={matchup.bottomTeam.odds > matchup.topTeam.odds}
      />
    </div>
  );
}
