'use client';

import { useState } from 'react';
import { Matchup as MatchupType, MatchupStatus } from '@/lib/types';
import { TeamRow } from './TeamRow';

interface MatchupProps {
  matchup: MatchupType;
  isFinals?: boolean;
  onTeamClick?: (matchupId: string, teamAbbr: string) => void;
  overriddenWinner?: string;
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

export function Matchup({ matchup, isFinals = false, onTeamClick, overriddenWinner }: MatchupProps) {
  const [hovered, setHovered] = useState(false);

  const tag = getMatchupTag(matchup);
  const status: MatchupStatus = matchup.status;

  const statusBorder =
    status === 'confirmed'
      ? 'var(--card-border)'
      : status === 'projected'
        ? '1.5px dashed #c0c2c5'
        : '1.5px dashed #f59e0b';

  const statusOpacity =
    status === 'confirmed' ? 1 : status === 'projected' ? 0.75 : 0.85;

  const cardStyle: React.CSSProperties = isFinals
    ? {
        width: 250,
        background: 'var(--card-bg, #fff)',
        borderRadius: 4,
        border: status === 'confirmed' ? '2px solid rgba(48,91,200,0.15)' : statusBorder,
        boxShadow: hovered
          ? '0 0 0 2px var(--accent-blue, #305bc8), 0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        opacity: statusOpacity,
        transition: 'opacity 0.15s, border-color 0.15s',
      }
    : {
        width: 250,
        background: 'var(--card-bg, #fff)',
        borderRadius: 4,
        border: statusBorder,
        boxShadow: hovered
          ? '0 0 0 2px var(--accent-blue, #305bc8), 0 2px 8px rgba(0,0,0,0.1)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        opacity: statusOpacity,
        transition: 'opacity 0.15s, border-color 0.15s',
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
            borderBottom: '1px solid var(--bracket-line-color, rgba(0,0,0,0.04))',
            background: 'rgba(48,91,200,0.03)',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: 'var(--accent-blue, #305bc8)',
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
        onClick={onTeamClick ? () => onTeamClick(matchup.id, matchup.topTeam.abbreviation) : undefined}
        isSelected={overriddenWinner === matchup.topTeam.abbreviation}
      />
      <TeamRow
        team={matchup.bottomTeam}
        isLeading={matchup.bottomTeam.odds > matchup.topTeam.odds}
        onClick={onTeamClick ? () => onTeamClick(matchup.id, matchup.bottomTeam.abbreviation) : undefined}
        isSelected={overriddenWinner === matchup.bottomTeam.abbreviation}
      />
    </div>
  );
}
