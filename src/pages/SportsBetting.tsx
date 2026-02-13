import { useState } from 'react';
import { Dices, Calculator, TrendingUp, List, Lightbulb } from 'lucide-react';
import BetForm from '../components/betting/BetForm';
import BetList from '../components/betting/BetList';
import BettingStats from '../components/betting/BettingStats';
import OddsCalculator from '../components/betting/OddsCalculator';
import StrategyRecommendations from '../components/betting/StrategyRecommendations';
import LiveMatchups from '../components/betting/LiveMatchups';
import type { BetType, Sport } from '../types';

type TabType = 'overview' | 'calculator' | 'strategy';

export default function SportsBetting() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedOdds, setSelectedOdds] = useState<number | undefined>();
  const [selectedGameData, setSelectedGameData] = useState<{
    description: string;
    teams: string;
    odds: number;
    eventDate: Date;
    betType: BetType;
    sport?: Sport;
  } | undefined>();

  const handleGameSelect = (gameData: {
    description: string;
    teams: string;
    odds: number;
    eventDate: Date;
    betType: BetType;
  }) => {
    setSelectedGameData(gameData);
    setSelectedOdds(gameData.odds);
  };

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview & Tracking',
      icon: List,
      description: 'Track your bets and view performance',
    },
    {
      id: 'calculator' as TabType,
      label: 'Odds Calculator',
      icon: Calculator,
      description: 'Calculate payouts and expected value',
    },
    {
      id: 'strategy' as TabType,
      label: 'Strategy & Sizing',
      icon: Lightbulb,
      description: 'Get bet sizing recommendations',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-lg">
              <Dices className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                BetTracker
              </h1>
              <p className="text-gray-600">
                Track bets, analyze odds, and get strategy recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 border-l-4 md:border-l-0 md:border-b-4 border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <div
                        className={`font-semibold ${
                          activeTab === tab.id ? 'text-blue-900' : 'text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Dashboard */}
            <BettingStats />

            {/* Live Matchups */}
            <LiveMatchups onSelectGame={handleGameSelect} />

            {/* Bet Form */}
            <BetForm onSuccess={() => setSelectedGameData(undefined)} prefilledData={selectedGameData} />

            {/* Bet List */}
            <BetList />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <OddsCalculator prefilledOdds={selectedOdds} />

            {/* Quick Reference Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-sm border-2 border-indigo-200 p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Understanding Odds & Value
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-900">
                <div>
                  <h4 className="font-semibold mb-2">American Odds</h4>
                  <ul className="space-y-1 text-indigo-800">
                    <li>• <strong>Negative (-)</strong>: Favorite. Amount you need to bet to win $100</li>
                    <li>• <strong>Positive (+)</strong>: Underdog. Amount you win on a $100 bet</li>
                    <li>• Example: -150 means bet $150 to win $100</li>
                    <li>• Example: +200 means bet $100 to win $200</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Expected Value (EV)</h4>
                  <ul className="space-y-1 text-indigo-800">
                    <li>• Positive EV = good bet (on average)</li>
                    <li>• Negative EV = bad bet (on average)</li>
                    <li>• EV = (Win Prob × Profit) - (Loss Prob × Stake)</li>
                    <li>• Long-term success requires consistent +EV bets</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Break-Even Win Rate</h4>
                  <ul className="space-y-1 text-indigo-800">
                    <li>• -110 odds: need 52.4% win rate to break even</li>
                    <li>• +100 odds: need 50% win rate</li>
                    <li>• -200 odds: need 66.7% win rate</li>
                    <li>• +150 odds: need 40% win rate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">The Vig (Juice)</h4>
                  <ul className="space-y-1 text-indigo-800">
                    <li>• Sportsbook's commission (typically ~4-5%)</li>
                    <li>• Why both sides are often -110</li>
                    <li>• Makes it harder to profit long-term</li>
                    <li>• Shop around for better lines to reduce vig</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <StrategyRecommendations prefilledOdds={selectedOdds} />
          </div>
        )}

        {/* Responsible Gaming Notice */}
        <div className="mt-8 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Responsible Gaming Reminder</p>
              <p>
                Sports betting should be entertainment, not a way to make money. Only bet what
                you can afford to lose. If you or someone you know has a gambling problem,
                call the National Problem Gambling Helpline at 1-800-522-4700 or visit{' '}
                <a
                  href="https://www.ncpgambling.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  ncpgambling.org
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
