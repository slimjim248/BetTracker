import type { SportsApiGame, ApiRegion, ApiMarket } from '../types/sportsApi';

const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY_STORAGE_KEY = 'sportsApiKey';
const ENV_API_KEY = import.meta.env.VITE_ODDS_API_KEY as string | undefined;

/**
 * Get API key - checks environment variable first, then localStorage
 */
export function getApiKey(): string | null {
  return ENV_API_KEY || localStorage.getItem(API_KEY_STORAGE_KEY);
}

/**
 * Save API key to localStorage
 */
export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

/**
 * Remove API key from localStorage
 */
export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}

/**
 * Fetch upcoming games for a specific sport
 */
export async function fetchUpcomingGames(
  sportKey: string,
  options: {
    regions?: ApiRegion[];
    markets?: ApiMarket[];
    oddsFormat?: 'american' | 'decimal';
    dateFormat?: 'iso' | 'unix';
  } = {}
): Promise<SportsApiGame[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API key not configured. Please add your API key in settings.');
  }

  const {
    regions = ['us'],
    markets = ['h2h', 'spreads', 'totals'],
    oddsFormat = 'american',
    dateFormat = 'iso',
  } = options;

  const params = new URLSearchParams({
    apiKey,
    regions: regions.join(','),
    markets: markets.join(','),
    oddsFormat,
    dateFormat,
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/sports/${sportKey}/odds?${params}`
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your API key in settings.');
      }
      if (response.status === 429) {
        throw new Error(
          'API rate limit exceeded. The free tier allows 500 requests per month.'
        );
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Check remaining requests
    const remaining = response.headers.get('x-requests-remaining');
    if (remaining) {
      console.log(`API requests remaining: ${remaining}`);
    }

    const data: SportsApiGame[] = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch sports data. Please check your internet connection.');
  }
}

/**
 * Fetch all active sports
 */
export async function fetchActiveSports(): Promise<
  Array<{ key: string; title: string; group: string }>
> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/sports?apiKey=${apiKey}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.filter((sport: any) => sport.active);
  } catch (error) {
    console.error('Failed to fetch sports:', error);
    return [];
  }
}

/**
 * Get best odds from multiple bookmakers
 */
export function getBestOdds(game: SportsApiGame, team: string, market: ApiMarket = 'h2h') {
  if (!game.bookmakers || game.bookmakers.length === 0) {
    return null;
  }

  let bestOdds: { odds: number; bookmaker: string } | null = null;

  for (const bookmaker of game.bookmakers) {
    const targetMarket = bookmaker.markets.find(m => m.key === market);
    if (!targetMarket) continue;

    const outcome = targetMarket.outcomes.find(o => o.name === team);
    if (!outcome) continue;

    if (!bestOdds || outcome.price > bestOdds.odds) {
      bestOdds = {
        odds: outcome.price,
        bookmaker: bookmaker.title,
      };
    }
  }

  return bestOdds;
}

/**
 * Format game matchup string
 */
export function formatMatchup(game: SportsApiGame): string {
  return `${game.away_team} @ ${game.home_team}`;
}

/**
 * Parse date string to Date object
 */
export function parseGameTime(game: SportsApiGame): Date {
  return new Date(game.commence_time);
}

/**
 * Demo data for when API key is not configured
 */
export function getDemoGames(): SportsApiGame[] {
  return [
    {
      id: 'demo-1',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: new Date(Date.now() + 3600000).toISOString(),
      home_team: 'Los Angeles Lakers',
      away_team: 'Golden State Warriors',
      bookmakers: [
        {
          key: 'draftkings',
          title: 'DraftKings',
          last_update: new Date().toISOString(),
          markets: [
            {
              key: 'h2h',
              last_update: new Date().toISOString(),
              outcomes: [
                { name: 'Los Angeles Lakers', price: -150 },
                { name: 'Golden State Warriors', price: 130 },
              ],
            },
            {
              key: 'spreads',
              last_update: new Date().toISOString(),
              outcomes: [
                { name: 'Los Angeles Lakers', price: -110, point: -3.5 },
                { name: 'Golden State Warriors', price: -110, point: 3.5 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'demo-2',
      sport_key: 'americanfootball_nfl',
      sport_title: 'NFL',
      commence_time: new Date(Date.now() + 7200000).toISOString(),
      home_team: 'Kansas City Chiefs',
      away_team: 'Buffalo Bills',
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: new Date().toISOString(),
          markets: [
            {
              key: 'h2h',
              last_update: new Date().toISOString(),
              outcomes: [
                { name: 'Kansas City Chiefs', price: -120 },
                { name: 'Buffalo Bills', price: 100 },
              ],
            },
          ],
        },
      ],
    },
  ];
}
