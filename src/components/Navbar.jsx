import { useTheme } from '../context/ThemeContext';
import { HiSun, HiMoon } from 'react-icons/hi';
import { MdSatelliteAlt } from 'react-icons/md';

export default function Navbar({ activeTab, setActiveTab }) {
  const { isDark, toggleTheme } = useTheme();

  const tabs = [
    { id: 'iss', label: '🛰️ ISS Tracker' },
    { id: 'news', label: '📰 News' },
    { id: 'charts', label: '📊 Charts' },
  ];

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
      isDark
        ? 'bg-surface-darker/80 border-white/5'
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MdSatelliteAlt className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold gradient-text hidden sm:block">SpaceDesk</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary-light'
                    : isDark
                      ? 'text-text-muted hover:text-text-dark hover:bg-white/5'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-surface-card text-yellow-400 hover:bg-surface-hover'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
