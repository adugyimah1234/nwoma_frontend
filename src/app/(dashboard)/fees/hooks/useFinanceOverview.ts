'use client';

import { useState, useEffect, useCallback } from 'react';
import dashboardService, { type FinancialSummary, type CollectionProgress, type Transaction } from '@/services/dashboard';
import financialReports from '@/services/financial-reports';
import { toast } from 'sonner';

export function useFinanceOverview() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [progress, setProgress] = useState<CollectionProgress | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const overview = await dashboardService.getFinancialOverview();
      setSummary(overview.summary);
      setProgress(overview.collectionProgress);
      setTransactions(overview.recentTransactions);
    } catch (err) {
      toast.error("Failed to synchronize treasury data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    progress,
    transactions,
    loading,
    refreshing,
    refresh: () => fetchData(true)
  };
}
