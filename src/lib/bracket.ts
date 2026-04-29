export interface BracketMatchupConfig {
  id: string;
  round: number; // 1-4
  conference: 'west' | 'east' | 'finals';
  position: number; // position within the round (0-indexed, top to bottom)
  topSeed: string; // team abbreviation
  bottomSeed: string;
  topSeedNum: number;
  bottomSeedNum: number;
}

export const BRACKET_CONFIG: BracketMatchupConfig[] = [
  // ── West Round 1 ──
  {
    id: 'W-R1-0',
    round: 1,
    conference: 'west',
    position: 0,
    topSeed: 'OKC',
    bottomSeed: 'DEN',
    topSeedNum: 1,
    bottomSeedNum: 8,
  },
  {
    id: 'W-R1-1',
    round: 1,
    conference: 'west',
    position: 1,
    topSeed: 'MIN',
    bottomSeed: 'LAL',
    topSeedNum: 4,
    bottomSeedNum: 5,
  },
  {
    id: 'W-R1-2',
    round: 1,
    conference: 'west',
    position: 2,
    topSeed: 'HOU',
    bottomSeed: 'GSW',
    topSeedNum: 3,
    bottomSeedNum: 6,
  },
  {
    id: 'W-R1-3',
    round: 1,
    conference: 'west',
    position: 3,
    topSeed: 'MEM',
    bottomSeed: 'SAC',
    topSeedNum: 2,
    bottomSeedNum: 7,
  },

  // ── West Round 2 ──
  {
    id: 'W-R2-0',
    round: 2,
    conference: 'west',
    position: 0,
    topSeed: 'OKC',
    bottomSeed: 'MIN',
    topSeedNum: 1,
    bottomSeedNum: 4,
  },
  {
    id: 'W-R2-1',
    round: 2,
    conference: 'west',
    position: 1,
    topSeed: 'HOU',
    bottomSeed: 'MEM',
    topSeedNum: 3,
    bottomSeedNum: 2,
  },

  // ── West Conference Finals ──
  {
    id: 'W-CF',
    round: 3,
    conference: 'west',
    position: 0,
    topSeed: 'OKC',
    bottomSeed: 'HOU',
    topSeedNum: 1,
    bottomSeedNum: 3,
  },

  // ── East Round 1 ──
  {
    id: 'E-R1-0',
    round: 1,
    conference: 'east',
    position: 0,
    topSeed: 'CLE',
    bottomSeed: 'MIA',
    topSeedNum: 1,
    bottomSeedNum: 8,
  },
  {
    id: 'E-R1-1',
    round: 1,
    conference: 'east',
    position: 1,
    topSeed: 'BOS',
    bottomSeed: 'ORL',
    topSeedNum: 4,
    bottomSeedNum: 5,
  },
  {
    id: 'E-R1-2',
    round: 1,
    conference: 'east',
    position: 2,
    topSeed: 'NYK',
    bottomSeed: 'DET',
    topSeedNum: 2,
    bottomSeedNum: 7,
  },
  {
    id: 'E-R1-3',
    round: 1,
    conference: 'east',
    position: 3,
    topSeed: 'IND',
    bottomSeed: 'MIL',
    topSeedNum: 3,
    bottomSeedNum: 6,
  },

  // ── East Round 2 ──
  {
    id: 'E-R2-0',
    round: 2,
    conference: 'east',
    position: 0,
    topSeed: 'CLE',
    bottomSeed: 'BOS',
    topSeedNum: 1,
    bottomSeedNum: 4,
  },
  {
    id: 'E-R2-1',
    round: 2,
    conference: 'east',
    position: 1,
    topSeed: 'NYK',
    bottomSeed: 'IND',
    topSeedNum: 2,
    bottomSeedNum: 3,
  },

  // ── East Conference Finals ──
  {
    id: 'E-CF',
    round: 3,
    conference: 'east',
    position: 0,
    topSeed: 'CLE',
    bottomSeed: 'NYK',
    topSeedNum: 1,
    bottomSeedNum: 2,
  },

  // ── NBA Finals ──
  {
    id: 'FINALS',
    round: 4,
    conference: 'finals',
    position: 0,
    topSeed: 'OKC',
    bottomSeed: 'CLE',
    topSeedNum: 1,
    bottomSeedNum: 1,
  },
];

export function getMatchupsByRoundAndConference(
  round: number,
  conference: string,
): BracketMatchupConfig[] {
  return BRACKET_CONFIG.filter(
    (m) => m.round === round && m.conference === conference,
  );
}

export function getFinalsMatchup(): BracketMatchupConfig {
  const finals = BRACKET_CONFIG.find((m) => m.round === 4 && m.conference === 'finals');
  if (!finals) {
    throw new Error('Finals matchup not found in BRACKET_CONFIG');
  }
  return finals;
}
