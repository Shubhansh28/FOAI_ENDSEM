import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useDashboard } from '../context/DashboardContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function NewsChart() {
  const { newsData } = useDashboard();
  const { isDark } = useTheme();

  const data = useMemo(() => {
    // Exclude 'search' from the category distribution
    const categories = Object.keys(newsData.articles).filter(k => k !== 'search');
    const counts = categories.map(cat => newsData.articles[cat]?.length || 0);
    
    // Filter out categories with 0 articles
    const activeCategories = [];
    const activeCounts = [];
    categories.forEach((cat, i) => {
      if (counts[i] > 0) {
        activeCategories.push(cat.charAt(0).toUpperCase() + cat.slice(1));
        activeCounts.push(counts[i]);
      }
    });

    return {
      labels: activeCategories,
      datasets: [
        {
          data: activeCounts,
          backgroundColor: [
            '#6366f1', // primary
            '#06b6d4', // accent
            '#10b981', // success
            '#f59e0b', // warning
            '#ef4444', // danger
            '#8b5cf6', // purple
            '#ec4899', // pink
          ],
          borderColor: isDark ? '#1e293b' : '#ffffff',
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [newsData.articles, isDark]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#e2e8f0' : '#374151',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          padding: 20,
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
        bodyFont: { family: 'Inter', size: 13 },
      },
    },
  }), [isDark]);

  if (data.labels.length === 0) {
    return (
      <div className={`glass-card rounded-xl p-6 ${isDark ? '' : 'shadow-md'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
          🍩 News Distribution
        </h3>
        <div className={`flex items-center justify-center h-[300px] ${isDark ? 'text-text-muted' : 'text-gray-400'}`}>
          <div className="text-center">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">No news data available</p>
            <p className="text-xs mt-1">Load news to see distribution</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-xl p-6 ${isDark ? '' : 'shadow-md'}`}>
      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
        🍩 News Distribution
      </h3>
      <div className="h-[300px] relative">
        <Doughnut data={data} options={options} />
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-32">
          <span className={`text-3xl font-bold ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
            {data.datasets[0].data.reduce((a, b) => a + b, 0)}
          </span>
          <span className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
            Total Articles
          </span>
        </div>
      </div>
    </div>
  );
}
