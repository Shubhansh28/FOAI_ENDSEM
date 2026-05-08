import { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useNews } from '../hooks/useNews';
import { useTheme } from '../context/ThemeContext';
import NewsCard from './NewsCard';
import { HiSearch, HiRefresh, HiSortDescending } from 'react-icons/hi';

const CATEGORIES = [
  { id: 'general', label: 'General', emoji: '🌍' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'health', label: 'Health', emoji: '🏥' },
];

export default function NewsDashboard() {
  const { newsData } = useDashboard();
  const { loading, error, loadNews, searchNews } = useNews();
  const { isDark } = useTheme();

  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'source'
  const [showSearch, setShowSearch] = useState(false);

  // Load initial categories
  useEffect(() => {
    CATEGORIES.forEach(cat => loadNews(cat.id));
  }, [loadNews]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchNews(searchQuery.trim());
      setShowSearch(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
  };

  // Get articles for current view
  const currentArticles = showSearch
    ? newsData.articles['search'] || []
    : newsData.articles[activeCategory] || [];

  // Sort articles
  const sortedArticles = [...currentArticles].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
    return (a.source?.name || '').localeCompare(b.source?.name || '');
  });

  const isLoading = showSearch ? loading.search : loading[activeCategory];
  const currentError = showSearch ? error.search : error[activeCategory];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
          📰 News Dashboard
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
          Latest headlines across {CATEGORIES.length} categories • {newsData.totalArticles} articles loaded
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
          isDark
            ? 'bg-surface-card border-white/10 focus-within:border-primary'
            : 'bg-white border-gray-200 focus-within:border-primary shadow-sm'
        }`}>
          <HiSearch className={`w-4 h-4 ${isDark ? 'text-text-muted' : 'text-gray-400'}`} />
          <input
            id="news-search-input"
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent outline-none text-sm ${
              isDark ? 'text-text-dark placeholder-text-muted' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          {showSearch && (
            <button type="button" onClick={handleClearSearch}
              className="text-xs text-primary hover:text-primary-light font-medium">
              Clear
            </button>
          )}
        </div>
        <button
          type="submit"
          id="news-search-btn"
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          Search
        </button>
      </form>

      {/* Category Tabs + Sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              id={`news-category-${cat.id}`}
              onClick={() => { setActiveCategory(cat.id); setShowSearch(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                !showSearch && activeCategory === cat.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : isDark
                    ? 'bg-surface-card text-text-muted hover:bg-surface-hover'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="news-sort-btn"
            onClick={() => setSortBy(prev => prev === 'date' ? 'source' : 'date')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isDark
                ? 'bg-surface-card text-text-muted hover:bg-surface-hover'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HiSortDescending className="w-3.5 h-3.5" />
            Sort: {sortBy === 'date' ? 'Date' : 'Source'}
          </button>
          <button
            id="news-refresh-btn"
            onClick={() => showSearch ? searchNews(searchQuery) : loadNews(activeCategory, true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
          >
            <HiRefresh className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {currentError && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-danger text-sm">{currentError}</p>
          <button
            onClick={() => showSearch ? searchNews(searchQuery) : loadNews(activeCategory, true)}
            className="text-danger text-sm font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-48 rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!isLoading && sortedArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArticles.map((article, i) => (
            <NewsCard key={`${article.title}-${i}`} article={article} />
          ))}
        </div>
      )}

      {/* No articles */}
      {!isLoading && sortedArticles.length === 0 && !currentError && (
        <div className={`text-center py-16 ${isDark ? 'text-text-muted' : 'text-gray-400'}`}>
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">No articles found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
