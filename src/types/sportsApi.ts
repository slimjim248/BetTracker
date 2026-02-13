// Types for sports API data (The Odds API)

export interface SportsApiGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string; // 'h2h' (moneyline), 'spreads', 'totals'
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number; // American odds
  point?: number; // For spreads/totals
}

export interface SportConfig {
  key: string;
  title: string;
  group: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

// Mapped sports for our app
export const SPORTS_API_MAP: Record<string, string> = {
  nfl: 'americanfootball_nfl',
  nba: 'basketball_nba',
  mlb: 'baseball_mlb',
  nhl: 'icehockey_nhl',
  ncaaf: 'americanfootball_ncaaf',
  ncaab: 'basketball_ncaab',
  soccer: 'soccer_epl', // Premier League as default
  mma: 'mma_mixed_martial_arts',
};

export const API_REGIONS = ['us', 'us2', 'uk', 'eu', 'au'] as const;
export const API_MARKETS = ['h2h', 'spreads', 'totals'] as const;

export type ApiRegion = typeof API_REGIONS[number];
export type ApiMarket = typeof API_MARKETS[number];
