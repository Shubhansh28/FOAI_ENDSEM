import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchISSPosition, fetchAstronauts, reverseGeocode } from '../utils/api';
import { calculateSpeed, formatTime } from '../utils/helpers';
import { useDashboard } from '../context/DashboardContext';

export function useISS() {
  const { updateISS, updateAstronauts } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const positionsRef = useRef([]);
  const speedHistoryRef = useRef([]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const pos = await fetchISSPosition();

      // Calculate speed from last position
      const lastPos = positionsRef.current[positionsRef.current.length - 1];
      const speed = pos.velocity || (lastPos ? calculateSpeed(lastPos, pos) : 0);

      // Keep last 15 positions for trajectory
      const newPositions = [...positionsRef.current, pos].slice(-15);
      positionsRef.current = newPositions;

      // Keep last 30 speed measurements for chart
      const newSpeedEntry = { speed, time: formatTime(pos.timestamp), timestamp: pos.timestamp };
      const newSpeedHistory = [...speedHistoryRef.current, newSpeedEntry].slice(-30);
      speedHistoryRef.current = newSpeedHistory;

      // Get location name
      const locationName = await reverseGeocode(pos.latitude, pos.longitude);

      updateISS({
        latitude: pos.latitude,
        longitude: pos.longitude,
        speed,
        locationName,
        positions: newPositions,
        speedHistory: newSpeedHistory,
        timestamp: pos.timestamp,
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [updateISS]);

  const fetchAstronautData = useCallback(async () => {
    try {
      const data = await fetchAstronauts();
      updateAstronauts(data);
    } catch (err) {
      console.error('Failed to fetch astronauts:', err);
    }
  }, [updateAstronauts]);

  // Auto-fetch every 15 seconds
  useEffect(() => {
    const initialFetch = setTimeout(() => {
      fetchData();
      fetchAstronautData();
    }, 0);
    const interval = setInterval(fetchData, 15000);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchData, fetchAstronautData]);

  return { loading, error, refresh: fetchData };
}
