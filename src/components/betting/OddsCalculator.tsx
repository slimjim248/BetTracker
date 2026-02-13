import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Percent } from 'lucide-react';
import {
  calculatePayout,
  americanToDecimal,
  oddsToImpliedProbability,
} from '../../hooks/useBets';
import { calculateExpectedValue } from '../../utils/bettingStrategies';

interface OddsCalculatorProps {
  prefilledOdds?: number;
}

export default function OddsCalculator({ prefilledOdds }: OddsCalculatorProps) {
  const [stake, setStake] = useState<string>('100');
  const [odds, setOdds] = useState<string>('-110');
  const [winProbability, setWinProbability] = useState<string>('');

  useEffect(() => {
    if (prefilledOdds !== undefined) {
      setOdds(String(prefilledOdds));
    }
  }, [prefilledOdds]);

  const stakeNum = parseFloat(stake) || 0;
  const oddsNum = parseFloat(odds) || 0;
  const winProbNum = parseFloat(winProbability) || 0;

  const payout = oddsNum !== 0 ? calculatePayout(stakeNum, oddsNum) : 0;
  const profit = payout - stakeNum;
  const decimalOdds = oddsNum !== 0 ? americanToDecimal(oddsNum) : 0;
  const impliedProb = oddsNum !== 0 ? oddsToImpliedProbability(oddsNum) : 0;

  const hasWinProb = winProbNum > 0 && winProbNum <= 100;
  const ev = hasWinProb
    ? calculateExpectedValue(stakeNum, oddsNum, winProbNum / 100)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Odds Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stake Amount ($)
            </label>
            <input
              type="number"
              value={stake}
              onChange={e => setStake(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
              step="0.01"
            />
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
            <p className="text-xs text-gray-500 mt-1">
              Negative for favorites (-110), positive for underdogs (+150)
            </p>
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
              Enter your estimated win % to see expected value
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Total Payout</div>
            <div className="text-3xl font-bold text-blue-900">
              ${payout.toFixed(2)}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              Profit: ${profit.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                <TrendingUp className="w-3 h-3" />
                Decimal Odds
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {decimalOdds.toFixed(2)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                <Percent className="w-3 h-3" />
                Implied Prob
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {(impliedProb * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Expected Value */}
          {hasWinProb && ev && (
            <div
              className={`rounded-lg p-4 ${
                ev.isPositiveEv
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  ev.isPositiveEv ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {ev.isPositiveEv ? '✓ Positive EV' : '✗ Negative EV'}
              </div>
              <div
                className={`text-2xl font-bold ${
                  ev.isPositiveEv ? 'text-green-900' : 'text-red-900'
                }`}
              >
                ${ev.ev.toFixed(2)}
              </div>
              <div
                className={`text-sm ${
                  ev.isPositiveEv ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {ev.evPercentage.toFixed(2)}% expected return
              </div>
              <p
                className={`text-xs mt-2 ${
                  ev.isPositiveEv ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {ev.isPositiveEv
                  ? 'Your estimated probability suggests this bet has positive expected value.'
                  : 'Your estimated probability suggests this bet has negative expected value. Consider skipping it.'}
              </p>
            </div>
          )}

          {/* Quick Reference */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <div className="font-medium mb-2">Quick Reference:</div>
            <div className="space-y-1">
              <div>• Even odds: +100 or -100</div>
              <div>• Common favorite: -110 (bet $110 to win $100)</div>
              <div>• Common underdog: +110 (bet $100 to win $110)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
