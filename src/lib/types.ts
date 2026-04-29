export type Conference = 'west' | 'east';

export type MatchupStatus = 'confirmed' | 'projected' | 'overridden';

export interface TeamInfo {
  abbreviation: string;
  name: string;
  city: string;
  color: string;
  textColor?: string; // defaults to white
  conference: Conference;
}

export interface MatchupTeam {
  abbreviation: string;
  seed: number;
  odds: number; // 0-1
  trend: number; // positive = up
  price: number; // cents 0-100
}

export interface Matchup {
  id: string;
  round: number; // 1-4
  conference: Conference | 'finals';
  seriesScore: string; // e.g. "OKC leads 3-1" or "Projected"
  topTeam: MatchupTeam;
  bottomTeam: MatchupTeam;
  status: MatchupStatus;
}

export interface BracketData {
  matchups: Matchup[];
  lastUpdated: string; // ISO date
  connectionStatus: 'live' | 'reconnecting' | 'disconnected' | 'polling';
}

export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  outcomePrices: string; // JSON-encoded array
  outcomes: string; // JSON-encoded array
  clobTokenIds: string; // JSON-encoded array
  active: boolean;
  closed: boolean;
}

export interface PolymarketEvent {
  id: string;
  title: string;
  slug: string;
  markets: PolymarketMarket[];
}

export interface WebSocketMessage {
  type: string;
  data: {
    price: string;
    asset_id: string;
  };
}
