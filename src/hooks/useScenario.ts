'use client';
import { useState, useCallback } from 'react';
import { TEAMS } from '@/lib/teams';
import { R1_MATCHUPS } from '@/lib/bracket';

const DOWNSTREAM: Record<string, string[]> = {
  'W-R1-0': ['W-R2-0', 'W-CF', 'FINALS'],
  'W-R1-1': ['W-R2-0', 'W-CF', 'FINALS'],
  'W-R1-2': ['W-R2-1', 'W-CF', 'FINALS'],
  'W-R1-3': ['W-R2-1', 'W-CF', 'FINALS'],
  'W-R2-0': ['W-CF', 'FINALS'],
  'W-R2-1': ['W-CF', 'FINALS'],
  'W-CF': ['FINALS'],
  'E-R1-0': ['E-R2-0', 'E-CF', 'FINALS'],
  'E-R1-1': ['E-R2-0', 'E-CF', 'FINALS'],
  'E-R1-2': ['E-R2-1', 'E-CF', 'FINALS'],
  'E-R1-3': ['E-R2-1', 'E-CF', 'FINALS'],
  'E-R2-0': ['E-CF', 'FINALS'],
  'E-R2-1': ['E-CF', 'FINALS'],
  'E-CF': ['FINALS'],
};

function getEliminatedTeam(matchupId: string, winner: string): string | null {
  const m = R1_MATCHUPS.find((r) => r.id === matchupId);
  if (!m) return null;
  return winner === m.topSeed ? m.bottomSeed : winner === m.bottomSeed ? m.topSeed : null;
}

interface UseScenarioReturn {
  overrides: Record<string, string>;
  setWinner: (matchupId: string, teamAbbr: string) => void;
  removeOverride: (matchupId: string) => void;
  resetAll: () => void;
  overrideCount: number;
  overrideLabels: { matchupId: string; label: string }[];
}

export function useScenario(): UseScenarioReturn {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const setWinner = useCallback((matchupId: string, teamAbbr: string) => {
    setOverrides((prev) => {
      if (prev[matchupId] === teamAbbr) {
        const next = { ...prev };
        delete next[matchupId];
        return next;
      }
      const next = { ...prev, [matchupId]: teamAbbr };
      const eliminated = getEliminatedTeam(matchupId, teamAbbr);
      if (eliminated) {
        const downstream = DOWNSTREAM[matchupId] ?? [];
        for (const downId of downstream) {
          if (next[downId] === eliminated) {
            delete next[downId];
          }
        }
      }
      return next;
    });
  }, []);

  const removeOverride = useCallback((matchupId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[matchupId];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setOverrides({});
  }, []);

  const overrideCount = Object.keys(overrides).length;

  const overrideLabels = Object.entries(overrides).map(([matchupId, teamAbbr]) => {
    const team = TEAMS[teamAbbr];
    const teamName = team ? team.name : teamAbbr;
    return { matchupId, label: `${teamName} wins ${matchupId}` };
  });

  return {
    overrides,
    setWinner,
    removeOverride,
    resetAll,
    overrideCount,
    overrideLabels,
  };
}
