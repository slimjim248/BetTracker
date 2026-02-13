import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useBets, calculatePayout } from '../../hooks/useBets';
import type { Bet, BetType, Sport } from '../../types';

type BetFormData = Omit<Bet, 'id' | 'createdAt' | 'potentialPayout'>;

const SPORTS: { value: Sport; label: string }[] = [
  { value: 'nfl', label: 'NFL' },
  { value: 'nba', label: 'NBA' },
  { value: 'mlb', label: 'MLB' },
  { value: 'nhl', label: 'NHL' },
  { value: 'ncaaf', label: 'College Football' },
  { value: 'ncaab', label: 'College Basketball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'mma', label: 'MMA' },
  { value: 'boxing', label: 'Boxing' },
  { value: 'other', label: 'Other' },
];

const BET_TYPES: { value: BetType; label: string }[] = [
  { value: 'moneyline', label: 'Moneyline' },
  { value: 'spread', label: 'Point Spread' },
  { value: 'total', label: 'Over/Under' },
  { value: 'prop', label: 'Prop Bet' },
  { value: 'parlay', label: 'Parlay' },
  { value: 'teaser', label: 'Teaser' },
  { value: 'futures', label: 'Futures' },
];

interface BetFormProps {
  onSuccess?: () => void;
  prefilledData?: {
    description?: string;
    teams?: string;
    odds?: number;
    eventDate?: Date;
    betType?: BetType;
    sport?: Sport;
  };
}

export default function BetForm({ onSuccess, prefilledData }: BetFormProps) {
  const { addBet } = useBets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BetFormData>({
    defaultValues: {
      sport: 'nfl',
      betType: 'moneyline',
      status: 'pending',
      placedAt: new Date(),
      confidence: 3,
    },
  });

  // Auto-fill form when prefilledData changes
  useEffect(() => {
    if (prefilledData) {
      if (prefilledData.description) {
        setValue('description', prefilledData.description);
      }
      if (prefilledData.teams) {
        setValue('teams', prefilledData.teams);
      }
      if (prefilledData.odds) {
        setValue('odds', prefilledData.odds);
      }
      if (prefilledData.eventDate) {
        const dateString = new Date(prefilledData.eventDate.getTime() - prefilledData.eventDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setValue('eventDate', dateString as any);
      }
      if (prefilledData.betType) {
        setValue('betType', prefilledData.betType);
      }
      if (prefilledData.sport) {
        setValue('sport', prefilledData.sport);
      }

      // Scroll to form
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [prefilledData, setValue]);

  const stake = watch('stake');
  const odds = watch('odds');
  const potentialPayout =
    stake && odds ? calculatePayout(Number(stake), Number(odds)) : 0;

  const onSubmit = async (data: BetFormData) => {
    setIsSubmitting(true);
    try {
      await addBet({
        ...data,
        stake: Number(data.stake),
        odds: Number(data.odds),
        potentialPayout,
        placedAt: new Date(data.placedAt),
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add bet:', error);
      alert('Failed to add bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={formRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-5 h-5 text-green-600" />
        <h2 className="text-xl font-semibold">Log New Bet</h2>
        {prefilledData && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Auto-filled from game
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sport *
            </label>
            <select
              {...register('sport', { required: 'Sport is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SPORTS.map(sport => (
                <option key={sport.value} value={sport.value}>
                  {sport.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bet Type *
            </label>
            <select
              {...register('betType', { required: 'Bet type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {BET_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bet Description *
          </label>
          <input
            {...register('description', {
              required: 'Description is required',
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Lakers -5.5, Chiefs ML, Over 47.5"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Teams */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matchup (Optional)
          </label>
          <input
            {...register('teams')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Lakers vs Warriors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stake */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stake ($) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('stake', {
                required: 'Stake is required',
                min: { value: 0.01, message: 'Stake must be positive' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100.00"
            />
            {errors.stake && (
              <p className="text-red-500 text-xs mt-1">{errors.stake.message}</p>
            )}
          </div>

          {/* Odds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              American Odds *
            </label>
            <input
              type="number"
              {...register('odds', {
                required: 'Odds are required',
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="-110"
            />
            {errors.odds && (
              <p className="text-red-500 text-xs mt-1">{errors.odds.message}</p>
            )}
          </div>

          {/* Potential Payout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potential Payout
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-medium">
              ${potentialPayout.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date (Optional)
            </label>
            <input
              type="datetime-local"
              {...register('eventDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sportsbook (Optional)
            </label>
            <input
              {...register('location')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Caesars, DraftKings, MGM"
            />
          </div>
        </div>

        {/* Confidence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confidence Level (1-5)
          </label>
          <input
            type="range"
            min="1"
            max="5"
            {...register('confidence')}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes about this bet..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding Bet...' : 'Add Bet'}
        </button>
      </form>
    </div>
  );
}
