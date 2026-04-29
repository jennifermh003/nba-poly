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

export const R1_MATCHUPS: BracketMatchupConfig[] = [
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
];

/**
 * Pick the winner of a matchup based on overrides or conference odds.
 * Returns the abbreviation of the winning team.
 */
function pickWinner(
  top: { abbr: string; seed: number },
  bottom: { abbr: string; seed: number },
  matchupId: string,
  overrides: Record<string, string>,
  confOdds: Record<string, number>,
): { abbr: string; seed: number } {
  const override = overrides[matchupId];
  if (override) {
    if (override === top.abbr) return top;
    if (override === bottom.abbr) return bottom;
    // Stale override — team not in this matchup anymore. Ignore it.
  }

  const topOdds = confOdds[top.abbr] ?? 0;
  const bottomOdds = confOdds[bottom.abbr] ?? 0;
  return topOdds >= bottomOdds ? top : bottom;
}

/**
 * Build the full bracket dynamically from R1 matchups, overrides, and odds.
 * Returns all matchups from R1 through the Finals.
 */
export function buildDynamicBracket(
  overrides: Record<string, string>,
  westConfOdds: Record<string, number>,
  eastConfOdds: Record<string, number>,
): BracketMatchupConfig[] {
  const allMatchups: BracketMatchupConfig[] = [...R1_MATCHUPS];

  // ── Pick R1 winners ──
  const westR1 = R1_MATCHUPS.filter((m) => m.conference === 'west');
  const eastR1 = R1_MATCHUPS.filter((m) => m.conference === 'east');

  const westR1Winners = westR1.map((m) =>
    pickWinner(
      { abbr: m.topSeed, seed: m.topSeedNum },
      { abbr: m.bottomSeed, seed: m.bottomSeedNum },
      m.id,
      overrides,
      westConfOdds,
    ),
  );

  const eastR1Winners = eastR1.map((m) =>
    pickWinner(
      { abbr: m.topSeed, seed: m.topSeedNum },
      { abbr: m.bottomSeed, seed: m.bottomSeedNum },
      m.id,
      overrides,
      eastConfOdds,
    ),
  );

  // ── Generate R2 matchups from R1 winners ──
  // West R2: winner of W-R1-0 vs winner of W-R1-1, winner of W-R1-2 vs winner of W-R1-3
  const westR2Matchups: BracketMatchupConfig[] = [
    {
      id: 'W-R2-0',
      round: 2,
      conference: 'west',
      position: 0,
      topSeed: westR1Winners[0].abbr,
      bottomSeed: westR1Winners[1].abbr,
      topSeedNum: westR1Winners[0].seed,
      bottomSeedNum: westR1Winners[1].seed,
    },
    {
      id: 'W-R2-1',
      round: 2,
      conference: 'west',
      position: 1,
      topSeed: westR1Winners[2].abbr,
      bottomSeed: westR1Winners[3].abbr,
      topSeedNum: westR1Winners[2].seed,
      bottomSeedNum: westR1Winners[3].seed,
    },
  ];

  const eastR2Matchups: BracketMatchupConfig[] = [
    {
      id: 'E-R2-0',
      round: 2,
      conference: 'east',
      position: 0,
      topSeed: eastR1Winners[0].abbr,
      bottomSeed: eastR1Winners[1].abbr,
      topSeedNum: eastR1Winners[0].seed,
      bottomSeedNum: eastR1Winners[1].seed,
    },
    {
      id: 'E-R2-1',
      round: 2,
      conference: 'east',
      position: 1,
      topSeed: eastR1Winners[2].abbr,
      bottomSeed: eastR1Winners[3].abbr,
      topSeedNum: eastR1Winners[2].seed,
      bottomSeedNum: eastR1Winners[3].seed,
    },
  ];

  allMatchups.push(...westR2Matchups, ...eastR2Matchups);

  // ── Pick R2 winners ──
  const westR2Winners = westR2Matchups.map((m) =>
    pickWinner(
      { abbr: m.topSeed, seed: m.topSeedNum },
      { abbr: m.bottomSeed, seed: m.bottomSeedNum },
      m.id,
      overrides,
      westConfOdds,
    ),
  );

  const eastR2Winners = eastR2Matchups.map((m) =>
    pickWinner(
      { abbr: m.topSeed, seed: m.topSeedNum },
      { abbr: m.bottomSeed, seed: m.bottomSeedNum },
      m.id,
      overrides,
      eastConfOdds,
    ),
  );

  // ── Generate Conference Finals matchups ──
  const westCF: BracketMatchupConfig = {
    id: 'W-CF',
    round: 3,
    conference: 'west',
    position: 0,
    topSeed: westR2Winners[0].abbr,
    bottomSeed: westR2Winners[1].abbr,
    topSeedNum: westR2Winners[0].seed,
    bottomSeedNum: westR2Winners[1].seed,
  };

  const eastCF: BracketMatchupConfig = {
    id: 'E-CF',
    round: 3,
    conference: 'east',
    position: 0,
    topSeed: eastR2Winners[0].abbr,
    bottomSeed: eastR2Winners[1].abbr,
    topSeedNum: eastR2Winners[0].seed,
    bottomSeedNum: eastR2Winners[1].seed,
  };

  allMatchups.push(westCF, eastCF);

  // ── Pick CF winners ──
  const westChamp = pickWinner(
    { abbr: westCF.topSeed, seed: westCF.topSeedNum },
    { abbr: westCF.bottomSeed, seed: westCF.bottomSeedNum },
    westCF.id,
    overrides,
    westConfOdds,
  );

  const eastChamp = pickWinner(
    { abbr: eastCF.topSeed, seed: eastCF.topSeedNum },
    { abbr: eastCF.bottomSeed, seed: eastCF.bottomSeedNum },
    eastCF.id,
    overrides,
    eastConfOdds,
  );

  // ── Generate Finals matchup ──
  const finals: BracketMatchupConfig = {
    id: 'FINALS',
    round: 4,
    conference: 'finals',
    position: 0,
    topSeed: westChamp.abbr,
    bottomSeed: eastChamp.abbr,
    topSeedNum: westChamp.seed,
    bottomSeedNum: eastChamp.seed,
  };

  allMatchups.push(finals);

  return allMatchups;
}
