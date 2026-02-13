// Bet types for sports betting tracking

export type BetType =
  | 'moneyline'    // Straight win/loss
  | 'spread'       // Point spread
  | 'total'        // Over/Under
  | 'prop'         // Proposition bet
  | 'parlay'       // Multiple bets combined
  | 'teaser'       // Adjusted point spreads
  | 'futures';     // Long-term outcome

export type BetStatus = 'pending' | 'won' | 'lost' | 'push' | 'cancelled';

export type Sport =
  | 'nfl'
  | 'nba'
  | 'mlb'
  | 'nhl'
  | 'ncaaf'    // College Football
  | 'ncaab'    // College Basketball
  | 'soccer'
  | 'mma'
  | 'boxing'
  | 'other';

export interface Bet {
  id: string;

  // Basic info
  sport: Sport;
  betType: BetType;
  description: string;  // e.g., "Lakers -5.5" or "Chiefs ML"

  // Financial
  stake: number;        // Amount wagered
  odds: number;         // American odds (e.g., -110, +150)
  potentialPayout: number;  // Calculated payout if won
  actualPayout?: number;    // Actual payout received (if won)

  // Game details
  teams?: string;       // e.g., "Lakers vs Warriors"
  eventDate?: Date;     // When the game/event occurs

  // Status
  status: BetStatus;
  placedAt: Date;       // When bet was placed
  settledAt?: Date;     // When bet was settled

  // Optional metadata
  notes?: string;
  location?: string;    // Which sportsbook
  confidence?: number;  // 1-5 rating

  createdAt: Date;
}

export interface BettingStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pushBets: number;
  totalStaked: number;
  totalReturned: number;
  profit: number;
  roi: number;          // Return on investment percentage
  winRate: number;      // Percentage of bets won
  averageOdds: number;
  biggestWin: number;
  biggestLoss: number;
}
