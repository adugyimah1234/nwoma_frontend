import api from '@/lib/axios';

// Types for dashboard data
export interface FinancialSummary {
  totalCollections: number;
  totalCollectionsChange: number;
  pendingPayments: number;
  pendingPaymentsChange: number;
  outstandingBalance: number;
  outstandingBalanceChange: number;
  overduePayments: number;
  overduePaymentsChange: number;
}

export interface CollectionProgress {
  target: number;
  collected: number;
  remaining: number;
  percentage: number;
  period: string; // e.g., 'May 2025', 'Q2 2025', etc.
}

export interface Transaction {
  id: string;
  student_id: string;
  student_name: string;
  amount: number;
  type: 'payment' | 'pending' | 'overdue' | 'refund';
  date: string;
  receipt_id?: string;
  payment_id?: string;
  fee_type?: string;
}

export interface FinancialOverview {
  summary: FinancialSummary;
  collectionProgress: CollectionProgress;
  recentTransactions: Transaction[];
  extendedMetrics?: {
      total_debt: number;
      monthly_expenses: number;
      active_exeats: number;
  };
  cashFlow?: {
      month: string;
      inflow: number;
      outflow: number;
  }[];
}

/**
 * Get financial summary data
 */
export const getFinancialSummary = async (
  schoolId?: string,
  period?: { start?: string; end?: string } | string
): Promise<FinancialSummary> => {
    // Build query parameters
    const params: any = {};
    
    if (schoolId) params.school_id = schoolId;
    
    if (period) {
      if (typeof period === 'string') {
        params.period = period;
      } else {
        if (period.start) params.start_date = period.start;
        if (period.end) params.end_date = period.end;
      }
    }

    const response = await api.get<FinancialSummary>('/dashboard/financial-summary', { params });
    return response.data;
};

/**
 * Get collection progress data
 */
export const getCollectionProgress = async (
  schoolId?: string,
  period?: string
): Promise<CollectionProgress> => {
    const params: any = {};
    if (schoolId) params.school_id = schoolId;
    if (period) params.period = period;
    
    const response = await api.get<CollectionProgress>('/dashboard/collection-progress', { params });
    return response.data;
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (
  limit: number = 10,
  schoolId?: string
): Promise<Transaction[]> => {
    const params: any = { limit };
    if (schoolId) params.school_id = schoolId;
    
    const response = await api.get<Transaction[]>('/dashboard/recent-transactions', { params });
    return response.data;
};

/**
 * Get complete financial overview with all dashboard data
 */
export const getFinancialOverview = async (
  schoolId?: string,
  period?: string
): Promise<FinancialOverview> => {
    const params: any = {};
    if (schoolId) params.school_id = schoolId;
    if (period) params.period = period;
    
    const response = await api.get<FinancialOverview>('/dashboard/financial-overview', { params });
    return response.data;
};

/**
 * Get monthly fee collection data for charts
 */
export const getMonthlyFeeCollectionData = async (
  year?: number,
  schoolId?: string
): Promise<{ month: string; collected: number; target: number }[]> => {
    const params: any = { year: year || new Date().getFullYear() };
    if (schoolId) params.school_id = schoolId;
    
    const response = await api.get<{ month: string; collected: number; target: number }[]>('/dashboard/monthly-collection', { params });
    return response.data;
};

/**
 * Get fee type distribution data for charts
 */
export const getFeeTypeDistribution = async (
  schoolId?: string,
  period?: { start?: string; end?: string } | string
): Promise<{ feeType: string; amount: number; percentage: number }[]> => {
    const params: any = {};
    if (schoolId) params.school_id = schoolId;
    
    if (period) {
      if (typeof period === 'string') {
        params.period = period;
      } else {
        if (period.start) params.start_date = period.start;
        if (period.end) params.end_date = period.end;
      }
    }

    const response = await api.get<{ feeType: string; amount: number; percentage: number }[]>('/dashboard/fee-distribution', { params });
    return response.data;
};

// Export all functions
export default {
  getFinancialSummary,
  getCollectionProgress,
  getRecentTransactions,
  getFinancialOverview,
  getMonthlyFeeCollectionData,
  getFeeTypeDistribution
};

