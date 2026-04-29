import type { PolymarketEvent, PolymarketMarket } from '@/lib/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GAMMA_API = 'https://gamma-api.polymarket.com';
const CHAMPIONSHIP_EVENT_ID = '27830';
const WEST_CONF_EVENT_ID = '32756';
const EAST_CONF_EVENT_ID = '32755';

// ---------------------------------------------------------------------------
// Team name -> 3-letter abbreviation mapping
// Covers full "City Team" names and standalone team names so we can match
// Polymarket question patterns like "Will the Oklahoma City Thunder win..."
// ---------------------------------------------------------------------------

const TEAM_NAME_TO_ABBR: Record<string, string> = {
  // Eastern Conference
  'Atlanta Hawks': 'ATL',
  Hawks: 'ATL',
  'Boston Celtics': 'BOS',
  Celtics: 'BOS',
  'Brooklyn Nets': 'BKN',
  Nets: 'BKN',
  'Charlotte Hornets': 'CHA',
  Hornets: 'CHA',
  'Chicago Bulls': 'CHI',
  Bulls: 'CHI',
  'Cleveland Cavaliers': 'CLE',
  Cavaliers: 'CLE',
  Cavs: 'CLE',
  'Detroit Pistons': 'DET',
  Pistons: 'DET',
  'Indiana Pacers': 'IND',
  Pacers: 'IND',
  'Miami Heat': 'MIA',
  Heat: 'MIA',
  'Milwaukee Bucks': 'MIL',
  Bucks: 'MIL',
  'New York Knicks': 'NYK',
  Knicks: 'NYK',
  'Orlando Magic': 'ORL',
  Magic: 'ORL',
  'Philadelphia 76ers': 'PHI',
  '76ers': 'PHI',
  Sixers: 'PHI',
  'Toronto Raptors': 'TOR',
  Raptors: 'TOR',
  'Washington Wizards': 'WAS',
  Wizards: 'WAS',

  // Western Conference
  'Dallas Mavericks': 'DAL',
  Mavericks: 'DAL',
  Mavs: 'DAL',
  'Denver Nuggets': 'DEN',
  Nuggets: 'DEN',
  'Golden State Warriors': 'GSW',
  Warriors: 'GSW',
  'Houston Rockets': 'HOU',
  Rockets: 'HOU',
  'Los Angeles Clippers': 'LAC',
  Clippers: 'LAC',
  'Los Angeles Lakers': 'LAL',
  Lakers: 'LAL',
  'Memphis Grizzlies': 'MEM',
  Grizzlies: 'MEM',
  'Minnesota Timberwolves': 'MIN',
  Timberwolves: 'MIN',
  'New Orleans Pelicans': 'NOP',
  Pelicans: 'NOP',
  'Oklahoma City Thunder': 'OKC',
  Thunder: 'OKC',
  'Phoenix Suns': 'PHX',
  Suns: 'PHX',
  'Portland Trail Blazers': 'POR',
  'Trail Blazers': 'POR',
  Blazers: 'POR',
  'Sacramento Kings': 'SAC',
  Kings: 'SAC',
  'San Antonio Spurs': 'SAS',
  Spurs: 'SAS',
  'Utah Jazz': 'UTA',
  Jazz: 'UTA',
};

// Sort keys longest-first so we match "Oklahoma City Thunder" before "Thunder"
const SORTED_TEAM_KEYS = Object.keys(TEAM_NAME_TO_ABBR).sort(
  (a, b) => b.length - a.length
);

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

export async function fetchEvent(eventId: string): Promise<PolymarketEvent> {
  const res = await fetch(`${GAMMA_API}/events/${eventId}`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch event ${eventId}: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<PolymarketEvent>;
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

export function parseOutcomePrices(market: PolymarketMarket): {
  yes: number;
  no: number;
} {
  const prices: string[] = JSON.parse(market.outcomePrices);
  return {
    yes: Number(prices[0]),
    no: Number(prices[1]),
  };
}

export function parseClobTokenIds(market: PolymarketMarket): string[] {
  return JSON.parse(market.clobTokenIds) as string[];
}

// ---------------------------------------------------------------------------
// Market -> Team mapping
// ---------------------------------------------------------------------------

function extractTeamAbbreviation(text: string): string | null {
  for (const name of SORTED_TEAM_KEYS) {
    if (text.includes(name)) {
      return TEAM_NAME_TO_ABBR[name];
    }
  }
  return null;
}

export function mapMarketToTeam(
  market: PolymarketMarket
): { abbreviation: string; odds: number; tokenId: string } | null {
  const searchText = `${market.question} ${market.slug}`;
  const abbreviation = extractTeamAbbreviation(searchText);

  if (!abbreviation) {
    return null;
  }

  const { yes } = parseOutcomePrices(market);
  const tokenIds = parseClobTokenIds(market);

  return {
    abbreviation,
    odds: yes,
    tokenId: tokenIds[0],
  };
}

// ---------------------------------------------------------------------------
// Fetch all odds across the three event types
// ---------------------------------------------------------------------------

export async function fetchAllOdds(): Promise<{
  championship: Record<string, number>;
  westConf: Record<string, number>;
  eastConf: Record<string, number>;
  tokenIds: Record<string, string>;
}> {
  const [champEvent, westEvent, eastEvent] = await Promise.all([
    fetchEvent(CHAMPIONSHIP_EVENT_ID),
    fetchEvent(WEST_CONF_EVENT_ID),
    fetchEvent(EAST_CONF_EVENT_ID),
  ]);

  const championship: Record<string, number> = {};
  const westConf: Record<string, number> = {};
  const eastConf: Record<string, number> = {};
  const tokenIds: Record<string, string> = {};

  const processMarkets = (
    markets: PolymarketMarket[],
    target: Record<string, number>
  ) => {
    for (const market of markets) {
      const mapped = mapMarketToTeam(market);
      if (mapped) {
        target[mapped.abbreviation] = mapped.odds;
        tokenIds[mapped.abbreviation] = mapped.tokenId;
      }
    }
  };

  processMarkets(champEvent.markets, championship);
  processMarkets(westEvent.markets, westConf);
  processMarkets(eastEvent.markets, eastConf);

  return { championship, westConf, eastConf, tokenIds };
}

// ---------------------------------------------------------------------------
// Series odds derivation (head-to-head normalization)
// ---------------------------------------------------------------------------

export function deriveSeriesOdds(
  teamAOdds: number,
  teamBOdds: number
): { teamA: number; teamB: number } {
  const sum = teamAOdds + teamBOdds;

  if (sum === 0) {
    return { teamA: 0.5, teamB: 0.5 };
  }

  return {
    teamA: teamAOdds / sum,
    teamB: teamBOdds / sum,
  };
}

export {
  GAMMA_API,
  CHAMPIONSHIP_EVENT_ID,
  WEST_CONF_EVENT_ID,
  EAST_CONF_EVENT_ID,
  TEAM_NAME_TO_ABBR,
};
