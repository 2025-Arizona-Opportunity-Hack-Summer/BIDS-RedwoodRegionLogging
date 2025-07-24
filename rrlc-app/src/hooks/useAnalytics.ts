'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsData, getQuickStats, AnalyticsData, TimeRange } from '@/services/analytics';

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  quickStats: {
    applications: { total: number; change: number };
    funding: { total: number; change: number };
    events: { total: number; change: number };
    successRate: { rate: number; change: number };
  } | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  setTimeRange: (range: TimeRange | undefined) => void;
  timeRange: TimeRange | undefined;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [quickStats, setQuickStats] = useState<UseAnalyticsReturn['quickStats']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>(undefined);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both analytics data and quick stats in parallel
      const [analyticsResult, statsResult] = await Promise.all([
        getAnalyticsData(timeRange),
        getQuickStats()
      ]);

      if (analyticsResult.error) {
        setError(analyticsResult.error);
        return;
      }

      if (statsResult.error) {
        setError(statsResult.error);
        return;
      }

      setData(analyticsResult.data);
      setQuickStats(statsResult.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(typeof err === 'string' ? err : (err as Error)?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  const handleSetTimeRange = (range: TimeRange | undefined) => {
    setTimeRange(range);
  };

  // Fetch data on mount and when time range changes
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  return {
    data,
    quickStats,
    loading,
    error,
    refreshData,
    setTimeRange: handleSetTimeRange,
    timeRange
  };
}