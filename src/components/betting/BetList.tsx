import { useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  Clock,
  Minus,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { useBets } from '../../hooks/useBets';
import type { Bet, BetStatus } from '../../types';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Pending',
  },
  won: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Won',
  },
  lost: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Lost',
  },
  push: {
    icon: Minus,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    label: 'Push',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    label: 'Cancelled',
  },
};

interface BetCardProps {
  bet: Bet;
  onSettle: (id: string, status: BetStatus, payout?: number) => void;
  onDelete: (id: string) => void;
}

function BetCard({ bet, onSettle, onDelete }: BetCardProps) {
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [actualPayout, setActualPayout] = useState(
    bet.potentialPayout.toFixed(2)
  );

  const config = STATUS_CONFIG[bet.status];
  const StatusIcon = config.icon;

  const handleSettle = (status: BetStatus) => {
    if (status === 'won') {
      onSettle(bet.id, status, parseFloat(actualPayout));
    } else if (status === 'push') {
      onSettle(bet.id, status, bet.stake);
    } else {
      onSettle(bet.id, status, 0);
    }
    setShowSettleModal(false);
  };

  const profit =
    bet.status === 'won' && bet.actualPayout
      ? bet.actualPayout - bet.stake
      : bet.status === 'lost'
      ? -bet.stake
      : 0;

  return (
    <>
      <div
        className={`bg-white rounded-lg border-2 ${config.border} p-4 hover:shadow-md transition-shadow`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {bet.sport}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 capitalize">
                {bet.betType}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {bet.description}
            </h3>
            {bet.teams && (
              <p className="text-sm text-gray-600 mt-1">{bet.teams}</p>
            )}
          </div>

          <div className={`flex items-center gap-1 ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{config.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-500">Stake</div>
            <div className="font-semibold text-gray-900">
              ${bet.stake.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Odds</div>
            <div className="font-semibold text-gray-900">
              {bet.odds > 0 ? '+' : ''}
              {bet.odds}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">
              {bet.status === 'won' ? 'Won' : 'To Win'}
            </div>
            <div className="font-semibold text-gray-900">
              $
              {bet.status === 'won' && bet.actualPayout
                ? (bet.actualPayout - bet.stake).toFixed(2)
                : (bet.potentialPayout - bet.stake).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Result</div>
            <div
              className={`font-semibold ${
                profit > 0
                  ? 'text-green-600'
                  : profit < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {profit > 0 ? '+' : ''}
              ${profit.toFixed(2)}
            </div>
          </div>
        </div>

        {bet.notes && (
          <p className="text-sm text-gray-600 mb-3 italic">"{bet.notes}"</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <div>
            Placed: {format(new Date(bet.placedAt), 'MMM d, yyyy h:mm a')}
            {bet.eventDate && (
              <span className="ml-2">
                • Event: {format(new Date(bet.eventDate), 'MMM d, yyyy h:mm a')}
              </span>
            )}
            {bet.location && <span className="ml-2">• {bet.location}</span>}
          </div>

          <div className="flex gap-2">
            {bet.status === 'pending' && (
              <button
                onClick={() => setShowSettleModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Settle
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this bet?')) {
                  onDelete(bet.id);
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settle Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Settle Bet</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{bet.description}</strong>
              </p>
              <p className="text-sm text-gray-600">Stake: ${bet.stake.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                Potential Payout: ${bet.potentialPayout.toFixed(2)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Payout (if won)
              </label>
              <input
                type="number"
                value={actualPayout}
                onChange={e => setActualPayout(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleSettle('won')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Won
              </button>
              <button
                onClick={() => handleSettle('lost')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Lost
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSettle('push')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Push
              </button>
              <button
                onClick={() => setShowSettleModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BetList() {
  const { bets, settleBet, deleteBet } = useBets();
  const [filter, setFilter] = useState<'all' | BetStatus>('all');

  const filteredBets =
    filter === 'all' ? bets : bets.filter(bet => bet.status === filter);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">My Bets</h2>
          <span className="text-sm text-gray-500">
            ({filteredBets.length} {filter !== 'all' ? filter : 'total'})
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'won'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Won
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'lost'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lost
          </button>
        </div>
      </div>

      {filteredBets.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === 'all'
              ? 'No bets logged yet. Add your first bet above!'
              : `No ${filter} bets found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBets.map(bet => (
            <BetCard
              key={bet.id}
              bet={bet}
              onSettle={settleBet}
              onDelete={deleteBet}
            />
          ))}
        </div>
      )}
    </div>
  );
}
