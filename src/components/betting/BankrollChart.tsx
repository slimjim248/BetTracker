import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { TrendingUp } from 'lucide-react';
import { useBets } from '../../hooks/useBets';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface BankrollChartProps {
  startingBankroll?: number;
}

export default function BankrollChart({ startingBankroll = 1000 }: BankrollChartProps) {
  const { bets } = useBets();

  const chartData = useMemo(() => {
    // Get settled bets sorted by settlement date (oldest first)
    const settledBets = bets
      .filter(b => ['won', 'lost', 'push'].includes(b.status) && b.settledAt)
      .sort((a, b) => new Date(a.settledAt!).getTime() - new Date(b.settledAt!).getTime());

    if (settledBets.length === 0) return null;

    let runningBankroll = startingBankroll;
    const labels: string[] = ['Start'];
    const values: number[] = [startingBankroll];

    for (const bet of settledBets) {
      if (bet.status === 'won') {
        runningBankroll += (bet.actualPayout || 0) - bet.stake;
      } else if (bet.status === 'lost') {
        runningBankroll -= bet.stake;
      }
      // Push doesn't change bankroll

      labels.push(format(new Date(bet.settledAt!), 'MMM d'));
      values.push(runningBankroll);
    }

    return { labels, values, currentBankroll: runningBankroll };
  }, [bets, startingBankroll]);

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Bankroll Over Time</h2>
        </div>
        <p className="text-gray-500 text-sm">
          No settled bets yet. Once you settle bets, you'll see your bankroll trend over time.
        </p>
      </div>
    );
  }

  const isUp = chartData.currentBankroll >= startingBankroll;
  const change = chartData.currentBankroll - startingBankroll;
  const changePercent = (change / startingBankroll) * 100;

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Bankroll',
        data: chartData.values,
        borderColor: isUp ? '#16a34a' : '#dc2626',
        backgroundColor: isUp ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: isUp ? '#16a34a' : '#dc2626',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Bankroll: $${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => `$${value}`,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Bankroll Over Time</h2>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Bankroll</div>
          <div className={`text-2xl font-bold ${isUp ? 'text-green-700' : 'text-red-700'}`}>
            ${chartData.currentBankroll.toFixed(2)}
          </div>
          <div className={`text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}${change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
          </div>
        </div>
      </div>

      <div style={{ height: '300px' }}>
        <Line data={data} options={options} />
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        Based on ${startingBankroll} starting bankroll and {chartData.values.length - 1} settled bets
      </div>
    </div>
  );
}
