'use client';
import { useState, useCallback } from 'react';
import { TEAMS } from '@/lib/teams';

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
      // Toggle behavior: if the override already matches, remove it
      if (prev[matchupId] === teamAbbr) {
        const next = { ...prev };
        delete next[matchupId];
        return next;
      }
      return { ...prev, [matchupId]: teamAbbr };
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
