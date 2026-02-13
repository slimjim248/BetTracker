import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { Bet, BetStatus, BettingStats } from '../types';

export function useBets() {
  const bets = useLiveQuery(() => db.bets.orderBy('placedAt').reverse().toArray()) || [];

  const addBet = async (bet: Omit<Bet, 'id' | 'createdAt'>) => {
    const newBet: Bet = {
      ...bet,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    await db.bets.add(newBet);
    return newBet;
  };

  const updateBet = async (id: string, updates: Partial<Bet>) => {
    await db.bets.update(id, updates);
  };

  const deleteBet = async (id: string) => {
    await db.bets.delete(id);
  };

  const settleBet = async (id: string, status: BetStatus, actualPayout?: number) => {
    await db.bets.update(id, {
      status,
      actualPayout,
      settledAt: new Date(),
    });
  };

  return {
    bets,
    addBet,
    updateBet,
    deleteBet,
    settleBet,
  };
}

export function useBettingStats(): BettingStats {
  const bets = useLiveQuery(() => db.bets.toArray()) || [];

  const settledBets = bets.filter(b => ['won', 'lost', 'push'].includes(b.status));
  const wonBets = bets.filter(b => b.status === 'won');
  const lostBets = bets.filter(b => b.status === 'lost');
  const pushBets = bets.filter(b => b.status === 'push');

  const totalStaked = settledBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalReturned = wonBets.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
  const profit = totalReturned - totalStaked;
  const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0;
  const winRate =
    settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0;

  const averageOdds =
    settledBets.length > 0
      ? settledBets.reduce((sum, bet) => sum + bet.odds, 0) / settledBets.length
      : 0;

  const biggestWin = wonBets.length > 0
    ? Math.max(...wonBets.map(b => (b.actualPayout || 0) - b.stake))
    : 0;

  const biggestLoss = lostBets.length > 0
    ? Math.max(...lostBets.map(b => b.stake))
    : 0;

  return {
    totalBets: bets.length,
    wonBets: wonBets.length,
    lostBets: lostBets.length,
    pushBets: pushBets.length,
    totalStaked,
    totalReturned,
    profit,
    roi,
    winRate,
    averageOdds,
    biggestWin,
    biggestLoss,
  };
}

// Utility function to calculate payout from American odds
export function calculatePayout(stake: number, odds: number): number {
  if (odds > 0) {
    // Positive odds (underdog): profit = stake * (odds / 100)
    return stake + stake * (odds / 100);
  } else {
    // Negative odds (favorite): profit = stake / (|odds| / 100)
    return stake + stake / (Math.abs(odds) / 100);
  }
}

// Convert American odds to decimal odds
export function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return 1 + odds / 100;
  } else {
    return 1 + 100 / Math.abs(odds);
  }
}

// Convert American odds to implied probability
export function oddsToImpliedProbability(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}
