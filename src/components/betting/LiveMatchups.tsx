import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { RefreshCw, Calendar, AlertCircle, Settings } from 'lucide-react';
import type { SportsApiGame } from '../../types/sportsApi';
import type { BetType } from '../../types';
import {
  fetchUpcomingGames,
  hasApiKey,
  getDemoGames,
  formatMatchup,
  parseGameTime,
  getBestOdds,
  setApiKey,
} from '../../utils/sportsApi';

interface LiveMatchupsProps {
  onSelectGame?: (gameData: {
    description: string;
    teams: string;
    odds: number;
    eventDate: Date;
    betType: BetType;
  }) => void;
}

export default function LiveMatchups({ onSelectGame }: LiveMatchupsProps) {
  const [selectedSport, setSelectedSport] = useState<string>('basketball_nba');
  const [games, setGames] = useState<SportsApiGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);

  const hasKey = hasApiKey();

  useEffect(() => {
    loadGames();
  }, [selectedSport]);

  const loadGames = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!hasKey) {
        // Show demo data if no API key
        setGames(getDemoGames().filter(g => g.sport_key === selectedSport));
      } else {
        const data = await fetchUpcomingGames(selectedSport, {
          regions: ['us'],
          markets: ['h2h', 'spreads', 'totals'],
        });
        setGames(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = (
    game: SportsApiGame,
    team: string,
    marketType: 'h2h' | 'spreads' | 'totals'
  ) => {
    if (!onSelectGame) return;

    const bestOdds = getBestOdds(game, team, marketType);
    if (!bestOdds) {
      alert('No odds available for this selection');
      return;
    }

    let description = '';
    let betType: BetType = 'moneyline';

    if (marketType === 'h2h') {
      description = `${team} ML`;
      betType = 'moneyline';
    } else if (marketType === 'spreads') {
      const market = game.bookmakers?.[0]?.markets.find(m => m.key === 'spreads');
      const outcome = market?.outcomes.find(o => o.name === team);
      if (outcome?.point) {
        description = `${team} ${outcome.point > 0 ? '+' : ''}${outcome.point}`;
        betType = 'spread';
      }
    } else if (marketType === 'totals') {
      const market = game.bookmakers?.[0]?.markets.find(m => m.key === 'totals');
      const outcome = market?.outcomes.find(o => o.name === team);
      if (outcome?.point) {
        description = `${team} ${outcome.point}`;
        betType = 'total';
      }
    }

    onSelectGame({
      description,
      teams: formatMatchup(game),
      odds: bestOdds.odds,
      eventDate: parseGameTime(game),
      betType,
    });
  };

  const sportOptions = [
    { key: 'basketball_nba', label: 'NBA' },
    { key: 'americanfootball_nfl', label: 'NFL' },
    { key: 'baseball_mlb', label: 'MLB' },
    { key: 'icehockey_nhl', label: 'NHL' },
    { key: 'americanfootball_ncaaf', label: 'NCAA Football' },
    { key: 'basketball_ncaab', label: 'NCAA Basketball' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold">Live Matchups & Odds</h2>
          {!hasKey && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Demo Mode
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!hasKey && (
            <button
              onClick={() => setShowApiKeyPrompt(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" />
              Add API Key
            </button>
          )}
          <button
            onClick={loadGames}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* API Key Prompt */}
      {!hasKey && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Connect Live Sports Data</p>
              <p className="mb-2">
                Get free API key from{' '}
                <a
                  href="https://the-odds-api.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  The Odds API
                </a>{' '}
                (500 free requests/month) to see real upcoming games and live odds across all
                major sports.
              </p>
              <button
                onClick={() => setShowApiKeyPrompt(true)}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Add API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sport Selector */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {sportOptions.map(sport => (
          <button
            key={sport.key}
            onClick={() => setSelectedSport(sport.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSport === sport.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sport.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading games...</p>
        </div>
      )}

      {/* Games List */}
      {!loading && games.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming games found for this sport.</p>
        </div>
      )}

      {!loading && games.length > 0 && (
        <div className="space-y-4">
          {games.map(game => {
            const gameTime = parseGameTime(game);
            const hasOdds = game.bookmakers && game.bookmakers.length > 0;

            return (
              <div
                key={game.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                {/* Game Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {game.sport_title}
                    </div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {game.away_team} @ {game.home_team}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {format(gameTime, 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>

                {/* Odds */}
                {hasOdds ? (
                  <div className="space-y-2">
                    {/* Moneyline */}
                    <div className="grid grid-cols-2 gap-2">
                      {getBestOdds(game, game.away_team, 'h2h') && (
                        <button
                          onClick={() => handleSelectTeam(game, game.away_team, 'h2h')}
                          className="bg-gray-50 hover:bg-blue-50 border border-gray-300 hover:border-blue-500 rounded p-3 text-left transition-colors"
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {game.away_team} ML
                          </div>
                          <div className="font-bold text-gray-900">
                            {getBestOdds(game, game.away_team, 'h2h')?.odds! > 0 ? '+' : ''}
                            {getBestOdds(game, game.away_team, 'h2h')?.odds}
                          </div>
                        </button>
                      )}
                      {getBestOdds(game, game.home_team, 'h2h') && (
                        <button
                          onClick={() => handleSelectTeam(game, game.home_team, 'h2h')}
                          className="bg-gray-50 hover:bg-blue-50 border border-gray-300 hover:border-blue-500 rounded p-3 text-left transition-colors"
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {game.home_team} ML
                          </div>
                          <div className="font-bold text-gray-900">
                            {getBestOdds(game, game.home_team, 'h2h')?.odds! > 0 ? '+' : ''}
                            {getBestOdds(game, game.home_team, 'h2h')?.odds}
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Spreads */}
                    {game.bookmakers?.[0]?.markets.find(m => m.key === 'spreads') && (
                      <div className="grid grid-cols-2 gap-2">
                        {game.bookmakers[0].markets
                          .find(m => m.key === 'spreads')
                          ?.outcomes.map(outcome => (
                            <button
                              key={outcome.name}
                              onClick={() =>
                                handleSelectTeam(game, outcome.name, 'spreads')
                              }
                              className="bg-gray-50 hover:bg-green-50 border border-gray-300 hover:border-green-500 rounded p-3 text-left transition-colors"
                            >
                              <div className="text-xs text-gray-500 mb-1">
                                {outcome.name.split(' ').slice(-1)} Spread
                              </div>
                              <div className="font-bold text-gray-900">
                                {outcome.point! > 0 ? '+' : ''}
                                {outcome.point} ({outcome.price > 0 ? '+' : ''}
                                {outcome.price})
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Odds not available yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyPrompt && (
        <ApiKeyModal onClose={() => setShowApiKeyPrompt(false)} onSave={loadGames} />
      )}
    </div>
  );
}

// API Key Modal Component
function ApiKeyModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSave = () => {
    if (!apiKeyInput.trim()) {
      alert('Please enter an API key');
      return;
    }
    setApiKey(apiKeyInput.trim());
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Add API Key</h3>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          <p className="mb-2">
            <strong>Get your free API key:</strong>
          </p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>
              Visit{' '}
              <a
                href="https://the-odds-api.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                the-odds-api.com
              </a>
            </li>
            <li>Sign up for a free account</li>
            <li>Copy your API key from the dashboard</li>
            <li>Paste it below</li>
          </ol>
          <p className="mt-2 text-xs">Free tier: 500 requests/month</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="text"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your API key"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
