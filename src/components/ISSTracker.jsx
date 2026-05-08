import { useDashboard } from '../context/DashboardContext';
import { useISS } from '../hooks/useISS';
import { useTheme } from '../context/ThemeContext';
import ISSMap from './ISSMap';
import { HiRefresh, HiLocationMarker, HiTrendingUp } from 'react-icons/hi';
import { MdSpeed, MdSatelliteAlt, MdPeople } from 'react-icons/md';

function StatCard({ icon: Icon, label, value, color, isDark }) {
  return (
    <div className={`glass-card rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${
      isDark ? '' : 'shadow-md'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="text-white text-lg" />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-medium ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-sm font-bold truncate ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ISSTracker() {
  const { issData, astronauts } = useDashboard();
  const { loading, error, refresh } = useISS();
  const { isDark } = useTheme();

  if (loading && !issData.timestamp) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
        <div className="skeleton h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
            🛰️ ISS Live Tracker
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
            Real-time International Space Station tracking
          </p>
        </div>
        <button
          id="iss-refresh-btn"
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
        >
          <HiRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-danger text-sm">{error}</p>
          <button onClick={refresh} className="text-danger text-sm font-medium hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HiLocationMarker}
          label="Latitude"
          value={`${issData.latitude.toFixed(4)}°`}
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
          isDark={isDark}
        />
        <StatCard
          icon={HiTrendingUp}
          label="Longitude"
          value={`${issData.longitude.toFixed(4)}°`}
          color="bg-gradient-to-br from-purple-500 to-pink-500"
          isDark={isDark}
        />
        <StatCard
          icon={MdSpeed}
          label="Speed"
          value={`${issData.speed.toLocaleString()} km/h`}
          color="bg-gradient-to-br from-orange-500 to-red-500"
          isDark={isDark}
        />
        <StatCard
          icon={MdSatelliteAlt}
          label="Positions Tracked"
          value={issData.positions.length}
          color="bg-gradient-to-br from-emerald-500 to-teal-500"
          isDark={isDark}
        />
      </div>

      {/* Location Name */}
      <div className={`glass-card rounded-xl p-4 ${isDark ? '' : 'shadow-md'}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
          <p className={`text-sm ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Current Location</p>
        </div>
        <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
          {issData.locationName}
        </p>
      </div>

      {/* Map */}
      <ISSMap
        latitude={issData.latitude}
        longitude={issData.longitude}
        positions={issData.positions}
      />

      {/* Astronauts */}
      <div className={`glass-card rounded-xl p-6 ${isDark ? '' : 'shadow-md'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <MdPeople className="text-white text-lg" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
              People in Space Right Now
            </h3>
            <p className={`text-sm ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
              {astronauts.number} astronaut{astronauts.number !== 1 ? 's' : ''} currently in orbit
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {astronauts.people.map((person, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                {person.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
                  {person.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>{person.craft}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
