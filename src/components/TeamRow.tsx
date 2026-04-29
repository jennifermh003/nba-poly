'use client';

import { useState } from 'react';
import { MatchupTeam } from '@/lib/types';
import { TEAMS } from '@/lib/teams';

interface TeamRowProps {
  team: MatchupTeam;
  isLeading: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TeamRow({ team, isLeading, onClick, isSelected }: TeamRowProps) {
  const teamInfo = TEAMS[team.abbreviation];
  const mutedColor = 'var(--text-muted, #9d9e9f)';
  const [hovered, setHovered] = useState(false);

  const trendFormatted =
    team.trend > 0
      ? `+${team.trend.toFixed(1)}`
      : team.trend < 0
        ? team.trend.toFixed(1)
        : null;

  const trendColor =
    team.trend > 0 ? '#0d830f' : team.trend < 0 ? '#c4280e' : undefined;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 36,
        padding: '0 10px 0 0',
        borderBottom: '1px solid rgba(0,0,0,0.03)',
        position: 'relative',
        background: isSelected ? 'rgba(13,131,15,0.08)' : isLeading ? 'rgba(13,131,15,0.04)' : hovered ? 'rgba(48,91,200,0.06)' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'background 0.1s',
      }}
    >
      {/* Seed */}
      <span
        style={{
          width: 20,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: 600,
          color: isLeading ? 'var(--text-secondary, #6c6e6f)' : mutedColor,
        }}
      >
        {team.seed}
      </span>

      {/* Logo */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 800,
          marginRight: 8,
          background: teamInfo?.color ?? '#888',
          color: teamInfo?.textColor ?? '#fff',
        }}
      >
        {team.abbreviation}
      </div>

      {/* Name */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: isSelected ? '#0d830f' : isLeading ? undefined : mutedColor,
        }}
      >
        {isSelected && '✓ '}{teamInfo?.name ?? team.abbreviation}
      </span>

      {/* Odds */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginLeft: 8,
        }}
      >
        {trendFormatted && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              minWidth: 32,
              textAlign: 'right',
              color: trendColor,
            }}
          >
            {trendFormatted}
          </span>
        )}
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 34,
            textAlign: 'right',
            color: isLeading ? undefined : mutedColor,
          }}
        >
          {Math.round(team.odds * 100)}%
        </span>
      </div>
    </div>
  );
}
