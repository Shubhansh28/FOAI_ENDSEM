import { useState, useCallback } from 'react';
import { fetchNews } from '../utils/api';
import { useDashboard } from '../context/DashboardContext';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

function getCachedNews(category) {
  try {
    const cached = localStorage.getItem(`news-${category}`);
    if (!cached) return null;
    const { articles, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`news-${category}`);
      return null;
    }
    return articles;
  } catch {
    return null;
  }
}

function setCachedNews(category, articles) {
  try {
    localStorage.setItem(`news-${category}`, JSON.stringify({
      articles,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage might be full
  }
}

export function useNews() {
  const { updateNews } = useDashboard();
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const loadNews = useCallback(async (category, forceRefresh = false) => {
    setLoading(prev => ({ ...prev, [category]: true }));
    setError(prev => ({ ...prev, [category]: null }));

    try {
      // Check cache first (unless forced refresh)
      if (!forceRefresh) {
        const cached = getCachedNews(category);
        if (cached) {
          updateNews(category, cached);
          setLoading(prev => ({ ...prev, [category]: false }));
          return;
        }
      }

      const articles = await fetchNews(category);
      setCachedNews(category, articles);
      updateNews(category, articles);
    } catch (err) {
      setError(prev => ({ ...prev, [category]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  }, [updateNews]);

  const searchNews = useCallback(async (query) => {
    setLoading(prev => ({ ...prev, search: true }));
    setError(prev => ({ ...prev, search: null }));

    try {
      const articles = await fetchNews('general', query);
      updateNews('search', articles);
    } catch (err) {
      setError(prev => ({ ...prev, search: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  }, [updateNews]);

  return { loading, error, loadNews, searchNews };
}
