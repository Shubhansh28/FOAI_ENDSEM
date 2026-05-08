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
import { useDashboard } from '../context/DashboardContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SpeedChart() {
  const { issData } = useDashboard();
  const { isDark } = useTheme();

  const data = useMemo(() => ({
    labels: issData.speedHistory.map(s => s.time),
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: issData.speedHistory.map(s => s.speed),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  }), [issData.speedHistory]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#e2e8f0' : '#374151',
          font: { family: 'Inter', weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#e2e8f0' : '#111827',
        bodyColor: isDark ? '#94a3b8' : '#6b7280',
        borderColor: isDark ? '#334155' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: (ctx) => `Speed: ${ctx.parsed.y.toLocaleString()} km/h`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: {
          color: isDark ? '#64748b' : '#9ca3af',
          font: { family: 'Inter', size: 10 },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: {
          color: isDark ? '#64748b' : '#9ca3af',
          font: { family: 'Inter', size: 10 },
          callback: (v) => `${(v / 1000).toFixed(0)}k`,
        },
      },
    },
  }), [isDark]);

  if (issData.speedHistory.length < 2) {
    return (
      <div className={`glass-card rounded-xl p-6 ${isDark ? '' : 'shadow-md'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
          📈 ISS Speed Over Time
        </h3>
        <div className={`flex items-center justify-center h-[300px] ${isDark ? 'text-text-muted' : 'text-gray-400'}`}>
          <div className="text-center">
            <p className="text-3xl mb-2">⏳</p>
            <p className="text-sm">Collecting speed data...</p>
            <p className="text-xs mt-1">Chart will appear after 2 measurements</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-xl p-6 ${isDark ? '' : 'shadow-md'}`}>
      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
        📈 ISS Speed Over Time
      </h3>
      <div className="h-[300px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
