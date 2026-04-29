'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BracketData, Matchup, MatchupTeam } from '@/lib/types';
import { BRACKET_CONFIG } from '@/lib/bracket';
import { deriveSeriesOdds } from '@/lib/polymarket';
import { PolymarketWebSocket } from '@/lib/websocket';

// ---------------------------------------------------------------------------
// Types for the API response from /api/odds
// ---------------------------------------------------------------------------

interface OddsResponse {
  championship: Record<string, number>;
  westConf: Record<string, number>;
  eastConf: Record<string, number>;
  tokenIds: Record<string, string>;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

interface UsePolymarketDataReturn {
  data: BracketData | null;
  isLoading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Helper: look up the conference odds for a team
// ---------------------------------------------------------------------------

function getConferenceOdds(
  abbreviation: string,
  conference: 'west' | 'east' | 'finals',
  odds: OddsResponse,
): number {
  // For finals matchups, use championship odds
  if (conference === 'finals') {
    return odds.championship[abbreviation] ?? 0;
  }

  const confOdds = conference === 'west' ? odds.westConf : odds.eastConf;
  return confOdds[abbreviation] ?? 0;
}

// ---------------------------------------------------------------------------
// Helper: build the full matchup list from BRACKET_CONFIG + fetched odds
// ---------------------------------------------------------------------------

function buildMatchups(odds: OddsResponse): Matchup[] {
  return BRACKET_CONFIG.map((config) => {
    const topOdds = getConferenceOdds(
      config.topSeed,
      config.conference,
      odds,
    );
    const bottomOdds = getConferenceOdds(
      config.bottomSeed,
      config.conference,
      odds,
    );

    const derived = deriveSeriesOdds(topOdds, bottomOdds);

    const topTeam: MatchupTeam = {
      abbreviation: config.topSeed,
      seed: config.topSeedNum,
      odds: derived.teamA,
      trend: 0,
      price: Math.round(derived.teamA * 100),
    };

    const bottomTeam: MatchupTeam = {
      abbreviation: config.bottomSeed,
      seed: config.bottomSeedNum,
      odds: derived.teamB,
      trend: 0,
      price: Math.round(derived.teamB * 100),
    };

    return {
      id: config.id,
      round: config.round,
      conference: config.conference,
      seriesScore: 'Projected',
      topTeam,
      bottomTeam,
    } satisfies Matchup;
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePolymarketData(): UsePolymarketDataReturn {
  const [data, setData] = useState<BracketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<BracketData['connectionStatus']>('disconnected');

  // Refs that persist across renders without triggering re-renders
  const wsRef = useRef<PolymarketWebSocket | null>(null);
  const oddsRef = useRef<OddsResponse | null>(null);
  const tokenIdToTeamRef = useRef<Record<string, string>>({});

  // -------------------------------------------------------------------
  // Rebuild BracketData from the current odds snapshot
  // -------------------------------------------------------------------
  const rebuildData = useCallback(
    (status: BracketData['connectionStatus']) => {
      if (!oddsRef.current) return;

      const matchups = buildMatchups(oddsRef.current);

      setData({
        matchups,
        lastUpdated: new Date().toISOString(),
        connectionStatus: status,
      });
    },
    [],
  );

  // -------------------------------------------------------------------
  // WebSocket price-update handler
  // -------------------------------------------------------------------
  const handlePriceUpdate = useCallback(
    (tokenId: string, price: number) => {
      const odds = oddsRef.current;
      if (!odds) return;

      const abbreviation = tokenIdToTeamRef.current[tokenId];
      if (!abbreviation) return;

      // Update the raw odds in our snapshot.
      // We update all three maps so that any matchup referencing this team
      // picks up the new value regardless of which market moved.
      if (abbreviation in odds.championship) {
        odds.championship[abbreviation] = price;
      }
      if (abbreviation in odds.westConf) {
        odds.westConf[abbreviation] = price;
      }
      if (abbreviation in odds.eastConf) {
        odds.eastConf[abbreviation] = price;
      }

      rebuildData('live');
    },
    [rebuildData],
  );

  // -------------------------------------------------------------------
  // WebSocket status handler
  // -------------------------------------------------------------------
  const handleStatusChange = useCallback(
    (status: 'live' | 'reconnecting' | 'disconnected') => {
      setConnectionStatus(status);
      setData((prev) =>
        prev ? { ...prev, connectionStatus: status } : prev,
      );
    },
    [],
  );

  // -------------------------------------------------------------------
  // Effect: fetch initial data, build matchups, open WebSocket
  // -------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch('/api/odds');
        if (!res.ok) {
          throw new Error(`Failed to fetch odds: ${res.status}`);
        }

        const odds: OddsResponse = await res.json();

        if (cancelled) return;

        // Store the odds snapshot
        oddsRef.current = odds;

        // Build a reverse map: tokenId -> team abbreviation
        const tokenMap: Record<string, string> = {};
        for (const [abbr, tokenId] of Object.entries(odds.tokenIds)) {
          tokenMap[tokenId] = abbr;
        }
        tokenIdToTeamRef.current = tokenMap;

        // Build initial matchups
        const matchups = buildMatchups(odds);

        setData({
          matchups,
          lastUpdated: odds.timestamp,
          connectionStatus: 'disconnected',
        });

        setIsLoading(false);

        // Open WebSocket with all known token IDs
        const allTokenIds = Object.values(odds.tokenIds);
        if (allTokenIds.length > 0) {
          const ws = new PolymarketWebSocket(
            handlePriceUpdate,
            handleStatusChange,
          );
          ws.connect(allTokenIds);
          wsRef.current = ws;
        }
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setIsLoading(false);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [handlePriceUpdate, handleStatusChange]);

  return { data, isLoading, error };
}
