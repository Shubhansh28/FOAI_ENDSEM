import { useDashboard } from '../context/DashboardContext';
import { useTheme } from '../context/ThemeContext';
import SpeedChart from './SpeedChart';
import NewsChart from './NewsChart';
import ISSMap from './ISSMap';

export default function ChartsPage() {
  const { isDark } = useTheme();
  const { issData } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
          📊 Data Visualization
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
          Interactive charts and real-time ISS map
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpeedChart />
        <NewsChart />
      </div>

      {/* Full-width ISS Map */}
      <div className={`glass-card rounded-xl p-6 ${isDark ? '' : 'shadow-md'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
          🗺️ ISS Live Map
        </h3>
        <ISSMap
          latitude={issData.latitude}
          longitude={issData.longitude}
          positions={issData.positions}
        />
        <div className={`mt-4 flex flex-wrap gap-4 text-sm ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
          <span>📍 Lat: {issData.latitude.toFixed(4)}°</span>
          <span>📍 Lon: {issData.longitude.toFixed(4)}°</span>
          <span>🚀 Speed: {issData.speed.toLocaleString()} km/h</span>
          <span>📌 {issData.positions.length} positions tracked</span>
        </div>
      </div>
    </div>
  );
}
