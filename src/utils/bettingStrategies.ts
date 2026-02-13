import type { Bet } from '../types';
import { oddsToImpliedProbability } from '../hooks/useBets';

export interface BettingRecommendation {
  title: string;
  description: string;
  suggestedStake?: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface StrategyInputs {
  bankroll: number;
  odds: number;
  winProbability?: number;  // User's estimated probability (0-1)
  recentBets?: Bet[];
}

/**
 * Kelly Criterion - Optimal bet sizing based on edge
 * Formula: f = (bp - q) / b
 * where f = fraction of bankroll to bet
 *       b = decimal odds - 1
 *       p = probability of winning
 *       q = probability of losing (1 - p)
 */
export function kellyCalculator(inputs: StrategyInputs): BettingRecommendation {
  const { bankroll, odds, winProbability } = inputs;

  if (!winProbability || winProbability <= 0 || winProbability >= 1) {
    return {
      title: 'Kelly Criterion',
      description: 'Optimal bet sizing based on your estimated edge',
      reasoning:
        'Please provide your estimated win probability (0-100%) to calculate optimal bet size.',
      riskLevel: 'medium',
    };
  }

  const impliedProbability = oddsToImpliedProbability(odds);
  const decimalOdds = odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
  const b = decimalOdds - 1;
  const p = winProbability;
  const q = 1 - p;

  const kellyFraction = (b * p - q) / b;

  // If Kelly is negative or zero, there's no edge
  if (kellyFraction <= 0) {
    return {
      title: 'Kelly Criterion - No Edge',
      description: 'This bet has no positive expected value',
      suggestedStake: 0,
      reasoning: `Based on your win probability of ${(p * 100).toFixed(1)}% and odds of ${odds}, this bet has negative expected value. The implied probability is ${(impliedProbability * 100).toFixed(1)}%. Skip this bet.`,
      riskLevel: 'high',
    };
  }

  // Full Kelly can be aggressive, many bettors use fractional Kelly (e.g., 1/2 or 1/4)
  const fullKellyStake = bankroll * kellyFraction;
  const halfKellyStake = fullKellyStake * 0.5;
  const quarterKellyStake = fullKellyStake * 0.25;

  return {
    title: 'Kelly Criterion',
    description: 'Optimal bet sizing to maximize long-term growth',
    suggestedStake: halfKellyStake,
    reasoning: `Based on ${(p * 100).toFixed(1)}% win probability vs ${(impliedProbability * 100).toFixed(1)}% implied odds probability:
• Full Kelly: $${fullKellyStake.toFixed(2)} (${(kellyFraction * 100).toFixed(1)}% of bankroll)
• Half Kelly: $${halfKellyStake.toFixed(2)} (recommended - reduces variance)
• Quarter Kelly: $${quarterKellyStake.toFixed(2)} (conservative)

Your estimated edge: ${((p - impliedProbability) * 100).toFixed(2)}%`,
    riskLevel: kellyFraction > 0.05 ? 'high' : kellyFraction > 0.02 ? 'medium' : 'low',
  };
}

/**
 * Flat Betting - Consistent unit size
 * Conservative approach using 1-5% of bankroll
 */
export function flatBetting(inputs: StrategyInputs): BettingRecommendation {
  const { bankroll } = inputs;

  const onePercent = bankroll * 0.01;
  const twoPercent = bankroll * 0.02;
  const threePercent = bankroll * 0.03;

  return {
    title: 'Flat Betting',
    description: 'Consistent unit size for disciplined bankroll management',
    suggestedStake: twoPercent,
    reasoning: `Conservative flat betting recommendations:
• 1 Unit (1%): $${onePercent.toFixed(2)} - Very conservative
• 2 Units (2%): $${twoPercent.toFixed(2)} - Recommended standard bet
• 3 Units (3%): $${threePercent.toFixed(2)} - High confidence plays

This approach protects your bankroll and allows for ~50 bets at 2% per bet before risking depletion.`,
    riskLevel: 'low',
  };
}

/**
 * Martingale Warning - Doubling after losses (generally not recommended)
 */
export function martingaleWarning(inputs: StrategyInputs): BettingRecommendation {
  const { recentBets } = inputs;

  if (!recentBets || recentBets.length === 0) {
    return {
      title: 'Martingale System',
      description: 'Double your bet after each loss',
      reasoning:
        '⚠️ WARNING: The Martingale system is extremely risky and not recommended. It requires exponentially increasing bets and can wipe out your bankroll quickly. Even with unlimited funds, sportsbook limits prevent its effectiveness.',
      riskLevel: 'high',
    };
  }

  const recentLosses = recentBets
    .slice(0, 5)
    .filter(b => b.status === 'lost').length;

  if (recentLosses >= 2) {
    return {
      title: 'Martingale System - High Risk',
      description: 'You have recent losses - Martingale would suggest doubling',
      suggestedStake: 0,
      reasoning: `⚠️ DANGER: You've lost ${recentLosses} of your last 5 bets. Martingale would suggest increasingly large bets, but this is a path to ruin. Consider taking a break or reducing bet size instead.

Why Martingale fails:
• Requires exponential bankroll growth
• Sportsbooks have betting limits
• Long losing streaks are inevitable
• Risk of total bankroll loss is high

Recommendation: Use flat betting or Kelly Criterion instead.`,
      riskLevel: 'high',
    };
  }

  return {
    title: 'Martingale System',
    description: 'Not recommended due to high risk',
    reasoning:
      '⚠️ While you haven\'t had a recent losing streak, the Martingale system is still not recommended. Use proven strategies like Kelly Criterion or flat betting instead.',
    riskLevel: 'high',
  };
}

/**
 * Percentage of Bankroll - Simple risk management
 */
export function percentageOfBankroll(
  inputs: StrategyInputs,
  confidence: number
): BettingRecommendation {
  const { bankroll, odds } = inputs;
  const impliedProb = oddsToImpliedProbability(odds);

  // Map confidence (1-5) to percentage (1-5%)
  const percentage = confidence;
  const suggestedStake = bankroll * (percentage / 100);

  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (percentage <= 2) riskLevel = 'low';
  else if (percentage >= 4) riskLevel = 'high';

  return {
    title: 'Confidence-Based Betting',
    description: `${percentage}% of bankroll based on your confidence level`,
    suggestedStake,
    reasoning: `Your confidence: ${confidence}/5
Suggested stake: $${suggestedStake.toFixed(2)} (${percentage}% of $${bankroll.toFixed(2)} bankroll)

Implied probability from odds: ${(impliedProb * 100).toFixed(1)}%

This approach scales bet size with your confidence while maintaining bankroll discipline. Only bet what you can afford to lose.`,
    riskLevel,
  };
}

/**
 * Expected Value Calculator
 */
export function calculateExpectedValue(
  stake: number,
  odds: number,
  winProbability: number
): { ev: number; evPercentage: number; isPositiveEv: boolean } {
  const payout = odds > 0 ? stake * (1 + odds / 100) : stake * (1 + 100 / Math.abs(odds));
  const profit = payout - stake;
  const lossProbability = 1 - winProbability;

  const ev = winProbability * profit - lossProbability * stake;
  const evPercentage = (ev / stake) * 100;

  return {
    ev,
    evPercentage,
    isPositiveEv: ev > 0,
  };
}

/**
 * Get all strategy recommendations
 */
export function getAllRecommendations(
  inputs: StrategyInputs,
  confidence?: number
): BettingRecommendation[] {
  const recommendations: BettingRecommendation[] = [];

  // Always include flat betting (safest)
  recommendations.push(flatBetting(inputs));

  // Include Kelly if win probability is provided
  if (inputs.winProbability) {
    recommendations.push(kellyCalculator(inputs));
  }

  // Include confidence-based if confidence is provided
  if (confidence) {
    recommendations.push(percentageOfBankroll(inputs, confidence));
  }

  // Include martingale warning if they have recent bets
  if (inputs.recentBets && inputs.recentBets.length > 0) {
    recommendations.push(martingaleWarning(inputs));
  }

  return recommendations;
}
