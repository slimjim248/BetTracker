import { useState } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useBets, useBettingStats } from '../../hooks/useBets';
import { getAllRecommendations } from '../../utils/bettingStrategies';

const RISK_LEVEL_CONFIG = {
  low: {
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-300',
    icon: CheckCircle,
  },
  medium: {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: Info,
  },
  high: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: AlertTriangle,
  },
};

export default function StrategyRecommendations() {
  const [bankroll, setBankroll] = useState<string>('1000');
  const [odds, setOdds] = useState<string>('-110');
  const [winProbability, setWinProbability] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(3);

  const { bets } = useBets();
  const stats = useBettingStats();

  const bankrollNum = parseFloat(bankroll) || 0;
  const oddsNum = parseFloat(odds) || 0;
  const winProbNum = parseFloat(winProbability) || 0;

  const recommendations = getAllRecommendations(
    {
      bankroll: bankrollNum,
      odds: oddsNum,
      winProbability: winProbNum > 0 ? winProbNum / 100 : undefined,
      recentBets: bets.slice(0, 10),
    },
    confidence
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h2 className="text-xl font-semibold">Strategy & Bet Sizing</h2>
      </div>

      {/* Input Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-4">
          Enter Bet Details for Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Bankroll ($)
            </label>
            <input
              type="number"
              value={bankroll}
              onChange={e => setBankroll(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000"
              step="0.01"
            />
            {stats.totalStaked > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                You've staked ${stats.totalStaked.toFixed(2)} total
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              American Odds
            </label>
            <input
              type="number"
              value={odds}
              onChange={e => setOdds(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="-110"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Win Probability (%) - Optional
            </label>
            <input
              type="number"
              value={winProbability}
              onChange={e => setWinProbability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="55"
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">
              For Kelly Criterion and EV calculations
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Level (1-5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={confidence}
              onChange={e => setConfidence(parseInt(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Low)</span>
              <span className="font-medium text-gray-700">{confidence}</span>
              <span>5 (High)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 mb-3">
          Recommended Bet Sizing Strategies
        </h3>

        {recommendations.map((rec, index) => {
          const config = RISK_LEVEL_CONFIG[rec.riskLevel];
          const RiskIcon = config.icon;

          return (
            <div
              key={index}
              className={`border-2 ${config.border} ${config.bg} rounded-lg p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <div className={`flex items-center gap-1 ${config.color}`}>
                      <RiskIcon className="w-4 h-4" />
                      <span className="text-xs font-medium capitalize">
                        {rec.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>

                {rec.suggestedStake !== undefined && rec.suggestedStake > 0 && (
                  <div className="ml-4 text-right">
                    <div className="text-xs text-gray-600">Suggested Stake</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${rec.suggestedStake.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 p-3 bg-white bg-opacity-60 rounded border border-gray-200">
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {rec.reasoning}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* General Tips */}
      <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-700" />
          <h3 className="font-semibold text-yellow-900">
            General Betting Strategy Tips
          </h3>
        </div>
        <div className="space-y-2 text-sm text-yellow-900">
          <p>
            <strong>1. Shop for lines:</strong> Different sportsbooks offer different odds.
            Even a half-point can matter.
          </p>
          <p>
            <strong>2. Bankroll management is key:</strong> Never bet more than you can
            afford to lose. Most pros recommend 1-5% per bet.
          </p>
          <p>
            <strong>3. Track everything:</strong> Keep detailed records to identify patterns
            in your betting and improve over time.
          </p>
          <p>
            <strong>4. Avoid parlays:</strong> While exciting, parlays have much worse
            expected value than straight bets.
          </p>
          <p>
            <strong>5. Don't chase losses:</strong> Emotional betting after losses is the
            fastest way to deplete your bankroll.
          </p>
          <p>
            <strong>6. Focus on value:</strong> Bet when you think the odds are better than
            they should be, not just on your favorite team.
          </p>
        </div>
      </div>
    </div>
  );
}
