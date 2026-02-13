import Dexie, { type EntityTable } from 'dexie';
import type { Bet } from '../types';

class BetTrackerDB extends Dexie {
  bets!: EntityTable<Bet, 'id'>;

  constructor() {
    super('BetTrackerDB');

    this.version(1).stores({
      bets: 'id, sport, betType, status, placedAt, eventDate, stake, createdAt',
    });
  }
}

export const db = new BetTrackerDB();
