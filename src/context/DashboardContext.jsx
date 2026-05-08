/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [issData, setIssData] = useState({
    latitude: 0,
    longitude: 0,
    speed: 0,
    locationName: 'Loading...',
    positions: [],
    speedHistory: [],
    timestamp: null,
  });

  const [astronauts, setAstronauts] = useState({ number: 0, people: [] });

  const [newsData, setNewsData] = useState({
    articles: {},      // { category: [articles] }
    totalArticles: 0,
  });

  const updateISS = useCallback((data) => {
    setIssData(prev => ({ ...prev, ...data }));
  }, []);

  const updateAstronauts = useCallback((data) => {
    setAstronauts(data);
  }, []);

  const updateNews = useCallback((category, articles) => {
    setNewsData(prev => {
      const updated = { ...prev.articles, [category]: articles };
      const total = Object.values(updated).reduce((sum, arr) => sum + arr.length, 0);
      return { articles: updated, totalArticles: total };
    });
  }, []);

  return (
    <DashboardContext.Provider value={{
      issData, updateISS,
      astronauts, updateAstronauts,
      newsData, updateNews,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
