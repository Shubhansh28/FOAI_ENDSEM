import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ISSTracker from './components/ISSTracker';
import NewsDashboard from './components/NewsDashboard';
import ChartsPage from './components/ChartsPage';
import Chatbot from './components/Chatbot';

export default function App() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('iss');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-surface-darker text-text-dark' : 'bg-gray-50 text-text-light'
    }`}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#0f172a',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'iss' && <ISSTracker />}
        {activeTab === 'news' && <NewsDashboard />}
        {activeTab === 'charts' && <ChartsPage />}
      </main>

      <Chatbot />
    </div>
  );
}
