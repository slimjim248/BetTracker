import { BarChart3, Trophy, Target, Flame, TrendingDown } from 'lucide-react';
import { useBets } from '../../hooks/useBets';
import type { Bet, Sport, BetType } from '../../types';

interface BreakdownRow {
  label: string;
  wins: number;
  losses: number;
  pushes: number;
  total: number;
  winRate: number;
  profit: number;
}

function buildBreakdown(bets: Bet[], groupBy: (bet: Bet) => string): BreakdownRow[] {
  const groups: Record<string, { wins: number; losses: number; pushes: number; profit: number }> = {};

  for (const bet of bets) {
    if (!['won', 'lost', 'push'].includes(bet.status)) continue;

    const key = groupBy(bet);
    if (!groups[key]) {
      groups[key] = { wins: 0, losses: 0, pushes: 0, profit: 0 };
    }

    if (bet.status === 'won') {
      groups[key].wins++;
      groups[key].profit += (bet.actualPayout || 0) - bet.stake;
    } else if (bet.status === 'lost') {
      groups[key].losses++;
      groups[key].profit -= bet.stake;
    } else {
      groups[key].pushes++;
    }
  }

  return Object.entries(groups)
    .map(([label, data]) => {
      const total = data.wins + data.losses + data.pushes;
      return {
        label,
        wins: data.wins,
        losses: data.losses,
        pushes: data.pushes,
        total,
        winRate: total > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0,
        profit: data.profit,
      };
    })
    .sort((a, b) => b.total - a.total);
}

const SPORT_LABELS: Record<Sport, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  mlb: 'MLB',
  nhl: 'NHL',
  ncaaf: 'College Football',
  ncaab: 'College Basketball',
  soccer: 'Soccer',
  mma: 'MMA',
  boxing: 'Boxing',
  other: 'Other',
};

const BET_TYPE_LABELS: Record<BetType, string> = {
  moneyline: 'Moneyline',
  spread: 'Spread',
  total: 'Over/Under',
  prop: 'Prop',
  parlay: 'Parlay',
  teaser: 'Teaser',
  futures: 'Futures',
};

function BreakdownTable({ rows, emptyMessage }: { rows: BreakdownRow[]; emptyMessage: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 italic py-3">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-3 font-medium text-gray-600">Category</th>
            <th className="text-center py-2 px-2 font-medium text-gray-600">W</th>
            <th className="text-center py-2 px-2 font-medium text-gray-600">L</th>
            <th className="text-center py-2 px-2 font-medium text-gray-600">P</th>
            <th className="text-center py-2 px-2 font-medium text-gray-600">Win %</th>
            <th className="text-right py-2 pl-2 font-medium text-gray-600">Profit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 pr-3 font-medium text-gray-900">{row.label}</td>
              <td className="text-center py-2 px-2 text-green-700 font-semibold">{row.wins}</td>
              <td className="text-center py-2 px-2 text-red-700 font-semibold">{row.losses}</td>
              <td className="text-center py-2 px-2 text-gray-500">{row.pushes}</td>
              <td className="text-center py-2 px-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                    row.winRate >= 55
                      ? 'bg-green-100 text-green-800'
                      : row.winRate >= 45
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {row.winRate.toFixed(1)}%
                </span>
              </td>
              <td
                className={`text-right py-2 pl-2 font-semibold ${
                  row.profit >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {row.profit >= 0 ? '+' : ''}${row.profit.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PerformanceBreakdown() {
  const { bets } = useBets();

  const settledBets = bets.filter(b => ['won', 'lost', 'push'].includes(b.status));

  const bySport = buildBreakdown(settledBets, bet => SPORT_LABELS[bet.sport] || bet.sport);
  const byBetType = buildBreakdown(settledBets, bet => BET_TYPE_LABELS[bet.betType] || bet.betType);
  const byConfidence = buildBreakdown(settledBets, bet =>
    bet.confidence ? `${bet.confidence}/5 Confidence` : 'No Rating'
  );

  // Find best and worst categories
  const allRows = [...bySport, ...byBetType].filter(r => r.total >= 2);
  const bestCategory = allRows.length > 0 ? allRows.reduce((best, r) => r.winRate > best.winRate ? r : best) : null;
  const worstCategory = allRows.length > 0 ? allRows.reduce((worst, r) => r.winRate < worst.winRate ? r : worst) : null;

  // Current streak
  const recentSettled = bets.filter(b => b.status === 'won' || b.status === 'lost');
  let streakType: 'won' | 'lost' | null = null;
  let streakCount = 0;
  for (const bet of recentSettled) {
    if (streakType === null) {
      streakType = bet.status as 'won' | 'lost';
      streakCount = 1;
    } else if (bet.status === streakType) {
      streakCount++;
    } else {
      break;
    }
  }

  if (settledBets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Performance Breakdown</h2>
        </div>
        <p className="text-gray-500 text-sm">
          No settled bets yet. Once you start tracking and settling bets, you'll see your performance
          broken down by sport, bet type, and confidence level.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-semibold">Performance Breakdown</h2>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {streakCount > 0 && streakType && (
          <div
            className={`rounded-lg p-3 ${
              streakType === 'won' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className={`w-4 h-4 ${streakType === 'won' ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-xs font-medium text-gray-600">Current Streak</span>
            </div>
            <div className={`text-lg font-bold ${streakType === 'won' ? 'text-green-800' : 'text-red-800'}`}>
              {streakCount} {streakType === 'won' ? 'Wins' : 'Losses'}
            </div>
          </div>
        )}

        {bestCategory && bestCategory.total >= 2 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Best Category</span>
            </div>
            <div className="text-sm font-bold text-green-800">{bestCategory.label}</div>
            <div className="text-xs text-green-600">
              {bestCategory.winRate.toFixed(0)}% win rate ({bestCategory.wins}-{bestCategory.losses})
            </div>
          </div>
        )}

        {worstCategory && worstCategory.total >= 2 && worstCategory.label !== bestCategory?.label && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-gray-600">Weakest Category</span>
            </div>
            <div className="text-sm font-bold text-red-800">{worstCategory.label}</div>
            <div className="text-xs text-red-600">
              {worstCategory.winRate.toFixed(0)}% win rate ({worstCategory.wins}-{worstCategory.losses})
            </div>
          </div>
        )}
      </div>

      {/* By Sport */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">By Sport</h3>
        </div>
        <BreakdownTable rows={bySport} emptyMessage="No settled bets by sport yet" />
      </div>

      {/* By Bet Type */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">By Bet Type</h3>
        </div>
        <BreakdownTable rows={byBetType} emptyMessage="No settled bets by type yet" />
      </div>

      {/* By Confidence */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">By Confidence Level</h3>
        </div>
        <BreakdownTable rows={byConfidence} emptyMessage="No settled bets with confidence ratings yet" />
      </div>
    </div>
  );
}
