import { TrendingUp, TrendingDown, Target, DollarSign, Award } from 'lucide-react';
import { useBettingStats } from '../../hooks/useBets';

export default function BettingStats() {
  const stats = useBettingStats();

  const statCards = [
    {
      label: 'Total Profit/Loss',
      value: `$${stats.profit.toFixed(2)}`,
      icon: stats.profit >= 0 ? TrendingUp : TrendingDown,
      color: stats.profit >= 0 ? 'text-green-600' : 'text-red-600',
      bg: stats.profit >= 0 ? 'bg-green-50' : 'bg-red-50',
      border: stats.profit >= 0 ? 'border-green-200' : 'border-red-200',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      icon: Target,
      color: stats.winRate >= 55 ? 'text-green-600' : stats.winRate >= 45 ? 'text-blue-600' : 'text-red-600',
      bg: stats.winRate >= 55 ? 'bg-green-50' : stats.winRate >= 45 ? 'bg-blue-50' : 'bg-red-50',
      border: stats.winRate >= 55 ? 'border-green-200' : stats.winRate >= 45 ? 'border-blue-200' : 'border-red-200',
    },
    {
      label: 'ROI',
      value: `${stats.roi.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.roi >= 0 ? 'text-green-600' : 'text-red-600',
      bg: stats.roi >= 0 ? 'bg-green-50' : 'bg-red-50',
      border: stats.roi >= 0 ? 'border-green-200' : 'border-red-200',
    },
    {
      label: 'Total Staked',
      value: `$${stats.totalStaked.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-semibold">Betting Performance</h2>
      </div>

      {stats.totalBets === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No bets tracked yet. Start logging your bets to see your performance statistics!
          </p>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`${stat.bg} border-2 ${stat.border} rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </span>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.totalBets}</div>
              <div className="text-xs text-gray-600">Total Bets</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.wonBets}</div>
              <div className="text-xs text-gray-600">Wins</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.lostBets}</div>
              <div className="text-xs text-gray-600">Losses</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.pushBets}</div>
              <div className="text-xs text-gray-600">Pushes</div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Biggest Win</div>
              <div className="text-2xl font-bold text-purple-900">
                ${stats.biggestWin.toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="text-sm text-orange-700 mb-1">Biggest Loss</div>
              <div className="text-2xl font-bold text-orange-900">
                ${stats.biggestLoss.toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
              <div className="text-sm text-cyan-700 mb-1">Avg Odds</div>
              <div className="text-2xl font-bold text-cyan-900">
                {stats.averageOdds > 0 ? '+' : ''}
                {stats.averageOdds.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Insights</h3>
            <div className="space-y-1 text-sm text-blue-800">
              {stats.roi > 5 && (
                <p>• Great job! Your ROI of {stats.roi.toFixed(1)}% is excellent.</p>
              )}
              {stats.roi < 0 && (
                <p>
                  • You're currently down. Consider being more selective with your bets.
                </p>
              )}
              {stats.winRate >= 55 && (
                <p>
                  • Your {stats.winRate.toFixed(1)}% win rate is above the break-even point
                  for standard -110 odds (~52.4%).
                </p>
              )}
              {stats.winRate < 52.4 && stats.wonBets + stats.lostBets >= 20 && (
                <p>
                  • To break even at -110 odds, you need a ~52.4% win rate. Focus on quality
                  over quantity.
                </p>
              )}
              {stats.totalBets < 20 && (
                <p>
                  • Keep tracking! You need more bets for meaningful statistical analysis.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
