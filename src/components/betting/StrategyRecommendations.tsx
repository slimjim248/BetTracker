import { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Info, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { useBets, useBettingStats, oddsToImpliedProbability } from '../../hooks/useBets';
import { getAllRecommendations, calculateExpectedValue } from '../../utils/bettingStrategies';

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

interface StrategyRecommendationsProps {
  prefilledOdds?: number;
}

export default function StrategyRecommendations({ prefilledOdds }: StrategyRecommendationsProps) {
  const [bankroll, setBankroll] = useState<string>('1000');
  const [odds, setOdds] = useState<string>('-110');
  const [winProbability, setWinProbability] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(3);

  useEffect(() => {
    if (prefilledOdds !== undefined) {
      setOdds(String(prefilledOdds));
    }
  }, [prefilledOdds]);

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

      {/* Quick Verdict */}
      {oddsNum !== 0 && bankrollNum > 0 && (
        <QuickVerdict
          bankroll={bankrollNum}
          odds={oddsNum}
          winProbability={winProbNum > 0 ? winProbNum / 100 : undefined}
          confidence={confidence}
        />
      )}

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

function QuickVerdict({
  bankroll,
  odds,
  winProbability,
  confidence,
}: {
  bankroll: number;
  odds: number;
  winProbability?: number;
  confidence: number;
}) {
  const impliedProb = oddsToImpliedProbability(odds);
  const betPercentage = confidence; // 1-5% based on confidence
  const recommendedBet = bankroll * (betPercentage / 100);

  // Determine if user has an edge (their probability vs implied)
  const hasUserProb = winProbability !== undefined && winProbability > 0 && winProbability < 1;
  const edge = hasUserProb ? winProbability - impliedProb : undefined;
  const hasEdge = edge !== undefined && edge > 0;

  // Calculate EV if we have win probability
  const ev = hasUserProb
    ? calculateExpectedValue(recommendedBet, odds, winProbability)
    : undefined;

  // Determine verdict
  let verdict: 'recommended' | 'caution' | 'skip';
  let verdictLabel: string;
  let verdictDescription: string;

  if (hasUserProb && ev) {
    if (ev.isPositiveEv && hasEdge) {
      verdict = 'recommended';
      verdictLabel = 'Bet Recommended';
      verdictDescription = `You have a ${(edge! * 100).toFixed(1)}% edge over the implied odds. This is a +EV bet.`;
    } else if (ev.isPositiveEv || (edge !== undefined && edge > -0.02)) {
      verdict = 'caution';
      verdictLabel = 'Proceed with Caution';
      verdictDescription = 'This bet is borderline. The edge is slim, so size conservatively.';
    } else {
      verdict = 'skip';
      verdictLabel = 'Skip This Bet';
      verdictDescription = `The implied probability (${(impliedProb * 100).toFixed(1)}%) exceeds your estimated win chance (${(winProbability * 100).toFixed(1)}%). Negative EV.`;
    }
  } else {
    // No win probability provided - give neutral advice based on confidence
    if (confidence >= 4) {
      verdict = 'caution';
      verdictLabel = 'High Confidence Play';
      verdictDescription = 'You feel good about this one. Enter your win probability for a more precise verdict.';
    } else if (confidence >= 2) {
      verdict = 'caution';
      verdictLabel = 'Standard Play';
      verdictDescription = 'Moderate confidence. Add your estimated win probability for an EV-based recommendation.';
    } else {
      verdict = 'skip';
      verdictLabel = 'Low Confidence - Consider Skipping';
      verdictDescription = 'Your confidence is low. Only bet small or skip entirely.';
    }
  }

  const verdictConfig = {
    recommended: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      border: 'border-green-400',
      iconBg: 'bg-green-500',
      textColor: 'text-green-900',
      labelColor: 'text-green-700',
      Icon: ThumbsUp,
    },
    caution: {
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      border: 'border-yellow-400',
      iconBg: 'bg-yellow-500',
      textColor: 'text-yellow-900',
      labelColor: 'text-yellow-700',
      Icon: Minus,
    },
    skip: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      border: 'border-red-400',
      iconBg: 'bg-red-500',
      textColor: 'text-red-900',
      labelColor: 'text-red-700',
      Icon: ThumbsDown,
    },
  };

  const config = verdictConfig[verdict];
  const VerdictIcon = config.Icon;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-lg p-5 mb-6`}>
      <div className="flex items-start gap-4">
        <div className={`${config.iconBg} p-3 rounded-full`}>
          <VerdictIcon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className={`text-lg font-bold ${config.textColor}`}>{verdictLabel}</h3>
              <p className={`text-sm ${config.labelColor}`}>{verdictDescription}</p>
            </div>
            <div className="text-right ml-4">
              <div className="text-xs text-gray-500">Recommended Bet</div>
              <div className={`text-3xl font-bold ${config.textColor}`}>
                ${recommendedBet.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {betPercentage}% of ${bankroll.toFixed(0)} bankroll
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Implied Prob.</div>
              <div className="text-sm font-bold text-gray-900">{(impliedProb * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Your Win Prob.</div>
              <div className="text-sm font-bold text-gray-900">
                {hasUserProb ? `${(winProbability * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Your Edge</div>
              <div className={`text-sm font-bold ${edge !== undefined ? (edge > 0 ? 'text-green-700' : 'text-red-700') : 'text-gray-900'}`}>
                {edge !== undefined ? `${edge > 0 ? '+' : ''}${(edge * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Expected Value</div>
              <div className={`text-sm font-bold ${ev ? (ev.isPositiveEv ? 'text-green-700' : 'text-red-700') : 'text-gray-900'}`}>
                {ev ? `${ev.ev > 0 ? '+' : ''}$${ev.ev.toFixed(2)}` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
