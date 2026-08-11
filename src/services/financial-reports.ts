import api from '@/lib/axios';
import axios from 'axios';
import { format, subDays, subMonths, startOfMonth, getYear } from 'date-fns';
import { type FeeType } from '../types/fee';
import { type InvoiceStatus } from './invoice';

// Period types for reports
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

// Report types
export type ReportType = 
  | 'income' 
  | 'outstanding_payments' 
  | 'fee_collection' 
  | 'student_statement'
  | 'class_summary'
  | 'payment_methods'
  | 'fee_types'
  | 'receivables_aging';

// Export formats
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

// Base report parameters
interface BaseReportParams {
  period?: ReportPeriod;
  start_date?: string;
  end_date?: string;
  school_id?: string;
  class_id?: string;
  student_id?: string;
  include_details?: boolean;
}

// Income report parameters
export interface IncomeReportParams extends BaseReportParams {
  group_by?: 'day' | 'week' | 'month' | 'fee_type' | 'payment_method';
  payment_method?: string;
  fee_type?: FeeType;
}

// Outstanding payments report parameters
export interface OutstandingReportParams extends BaseReportParams {
  min_days_overdue?: number;
  max_days_overdue?: number;
  min_amount?: number;
  max_amount?: number;
  sort_by?: 'amount' | 'due_date' | 'days_overdue';
  sort_direction?: 'asc' | 'desc';
}

// Fee collection report parameters
export interface FeeCollectionReportParams extends BaseReportParams {
  fee_type?: FeeType;
  group_by?: 'class' | 'grade' | 'fee_type' | 'day' | 'month';
  include_projected?: boolean;
}

// Student financial statement parameters
export interface StudentStatementParams {
  student_id: string;
  period?: ReportPeriod;
  start_date?: string;
  end_date?: string;
  include_transactions?: boolean;
  include_pending?: boolean;
}

// Class financial summary parameters
export interface ClassSummaryReportParams {
  class_id?: string;
  grade_level?: string;
  academic_year_id?: string;
  include_student_details?: boolean;
  group_by?: 'student' | 'fee_type';
}

// Aging report parameters
export interface ReceivablesAgingReportParams extends BaseReportParams {
  aging_intervals?: number[]; // E.g., [30, 60, 90] for 30, 60, 90 days
  include_student_details?: boolean;
  min_amount?: number;
}

// Data structure for income report
export interface IncomeReportData {
  summary: {
    total_income: number;
    total_transactions: number;
    average_transaction: number;
    period_label: string;
  };
  by_period: {
    period: string;
    amount: number;
    transactions: number;
  }[];
  by_fee_type?: {
    fee_type: string;
    amount: number;
    percentage: number;
  }[];
  by_payment_method?: {
    payment_method: string;
    amount: number;
    percentage: number;
  }[];
  details?: {
    id: string;
    date: string;
    student_name: string;
    fee_type: string;
    payment_method: string;
    amount: number;
    receipt_id?: string;
  }[];
}

// Data structure for outstanding payments report
export interface OutstandingPaymentsReportData {
  summary: {
    total_outstanding: number;
    total_invoices: number;
    average_amount: number;
    total_overdue: number;
    oldest_invoice_days: number;
  };
  by_age: {
    age_range: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  by_fee_type?: {
    fee_type: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  details?: {
    invoice_id: string;
    invoice_number: string;
    student_id: string;
    student_name: string;
    due_date: string;
    days_overdue: number;
    amount: number;
    balance: number;
    status: InvoiceStatus;
  }[];
}

// Data structure for fee collection report
export interface FeeCollectionReportData {
  summary: {
    total_collected: number;
    total_expected: number;
    collection_rate: number;
    total_outstanding: number;
    period_label: string;
  };
  by_fee_type: {
    fee_type: string;
    collected: number;
    expected: number;
    collection_rate: number;
    outstanding: number;
  }[];
  by_class?: {
    class_name: string;
    grade_level?: string;
    collected: number;
    expected: number;
    collection_rate: number;
    outstanding: number;
  }[];
  by_period?: {
    period: string;
    collected: number;
    expected: number;
    collection_rate: number;
  }[];
  details?: {
    fee_id: string;
    fee_type: string;
    class_name?: string;
    amount: number;
    students_count: number;
    paid_count: number;
    collection_rate: number;
  }[];
}

// Data structure for student financial statement
export interface StudentFinancialStatementData {
  student_info: {
    id: string;
    name: string;
    admission_number?: string;
    class_name?: string;
    grade_level?: string;
  };
  summary: {
    total_fees: number;
    total_paid: number;
    balance: number;
    last_payment_date?: string;
    next_payment_due?: string;
  };
  fees: {
    fee_type: string;
    amount: number;
    paid: number;
    balance: number;
    due_date?: string;
    status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  }[];
  transactions?: {
    date: string;
    description: string;
    amount: number;
    type: 'charge' | 'payment' | 'refund' | 'adjustment';
    reference?: string;
    balance: number;
  }[];
}

// Data structure for class financial summary
export interface ClassFinancialSummaryData {
  class_info: {
    id: string;
    name: string;
    grade_level?: string;
    academic_year?: string;
    student_count: number;
  };
  summary: {
    total_fees: number;
    total_collected: number;
    collection_rate: number;
    outstanding: number;
    fully_paid_students: number;
    partially_paid_students: number;
    unpaid_students: number;
  };
  by_fee_type: {
    fee_type: string;
    amount: number;
    collected: number;
    collection_rate: number;
    outstanding: number;
  }[];
  student_details?: {
    id: string;
    name: string;
    total_fees: number;
    total_paid: number;
    balance: number;
    payment_status: 'paid' | 'partial' | 'unpaid';
    last_payment_date?: string;
  }[];
}

// Data structure for receivables aging report
export interface ReceivablesAgingReportData {
  summary: {
    total_receivables: number;
    current_receivables: number;
    overdue_receivables: number;
    highest_overdue: number;
    average_days_overdue: number;
  };
  aging_buckets: {
    range: string;
    amount: number;
    percentage: number;
    invoice_count: number;
    student_count: number;
  }[];
  by_fee_type?: {
    fee_type: string;
    current: number;
    overdue: number;
    total: number;
    percentage: number;
  }[];
  student_details?: {
    id: string;
    name: string;
    current: number;
    aging_buckets: {
      range: string;
      amount: number;
    }[];
    total: number;
    oldest_invoice_days: number;
  }[];
}

// Generic report response
export interface ReportResponse<T> {
  report_data: T;
  report_metadata: {
    report_id: string;
    report_type: ReportType;
    generated_at: string;
    parameters: Record<string, any>;
    user_id?: string;
    school_id?: string;
  };
}

/**
 * Generate an income report
 * @param params Report parameters
 * @returns Income report data
 */
export const generateIncomeReport = async (params: IncomeReportParams): Promise<ReportResponse<IncomeReportData>> => {
  try {
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get<ReportResponse<IncomeReportData>>(
      `/reports/income?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to generate income report');
    }
    throw error;
  }
};

/**
 * Generate an outstanding payments report
 * @param params Report parameters
 * @returns Outstanding payments report data
 */
export const generateOutstandingPaymentsReport = async (
  params: OutstandingReportParams
): Promise<ReportResponse<OutstandingPaymentsReportData>> => {
  try {
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get<ReportResponse<OutstandingPaymentsReportData>>(
      `/reports/outstanding-payments?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to generate outstanding payments report');
    }
    throw error;
  }
};

/**
 * Generate a fee collection report
 * @param params Report parameters
 * @returns Fee collection report data
 */
export const generateFeeCollectionReport = async (
  params: FeeCollectionReportParams
): Promise<ReportResponse<FeeCollectionReportData>> => {
  try {
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get<ReportResponse<FeeCollectionReportData>>(
      `/reports/fee-collection?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to generate fee collection report');
    }
    throw error;
  }
};

/**
 * Generate a student financial statement
 * @param params Student statement parameters
 * @returns Student financial statement data
 */
export const generateStudentFinancialStatement = async (
  params: StudentStatementParams
): Promise<ReportResponse<StudentFinancialStatementData>> => {
  try {
    if (!params.student_id) {
      throw new Error('Student ID is required');
    }
    
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get<ReportResponse<StudentFinancialStatementData>>(
      `/reports/student-statement?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to generate student financial statement');
    }
    throw error;
  }
};

/**
 * Generate a class financial summary report
 * @param params Class summary parameters
 * @returns Class financial summary data
 */
export const generateClassFinancialSummary = async (
  params: ClassSummaryReportParams
): Promise<ReportResponse<ClassFinancialSummaryData>> => {
  try {
    if (!params.class_id && !params.grade_level) {
      throw new Error('Either class ID or grade level is required');
    }
    
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get<ReportResponse<ClassFinancialSummaryData>>(
      `/reports/class-summary?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to generate class financial summary');
    }
    throw error;
  }
};

/**
 * Generate a receivables aging report
 * @param params Aging report parameters
 * @returns Receivables aging report data
 */
export const generateReceivablesAgingReport = async (
  params: ReceivablesAgingReportParams
): Promise<ReportResponse<ReceivablesAgingReportData>> => {
  try {
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    
    // Handle special case for aging intervals array
    if (params.aging_intervals && Array.isArray(params.aging_intervals)) {
      params.aging_intervals.forEach(interval => {
        queryParams.append('aging_intervals', interval.toString());
      });
      
      // Remove from params to avoid double processing
      const { aging_intervals, ...restParams } = params;
      params = restParams;
    }
    
    // Process remaining parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get<ReportResponse<ReceivablesAgingReportData>>(
      `/reports/receivables-aging?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to generate receivables aging report');
    }
    throw error;
  }
};

/**
 * Export a report in the specified format
 * @param reportType The type of report to export
 * @param params Report parameters
 * @param format Export format
 * @returns URL to download the exported report
 */
export const exportReport = async (
  reportType: ReportType,
  params: Record<string, any>,
  format: ExportFormat
): Promise<string> => {
  try {
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    
    // Add report type and format
    queryParams.append('report_type', reportType);
    queryParams.append('format', format);
    
    // Process remaining parameters, handling arrays properly
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    const response = await api.get<{ export_url: string }>(
      `/reports/export?${queryParams.toString()}`
    );
    
    return response.data.export_url;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to export ${reportType} report`);
    }
    throw error;
  }
};

/**
 * Download a report directly
 * @param reportType The type of report to download
 * @param params Report parameters
 * @param format Export format
 */
export const downloadReport = async (
  reportType: ReportType,
  params: Record<string, any>,
  format: ExportFormat
): Promise<void> => {
  try {
    const exportUrl = await exportReport(reportType, params, format);
    
    // Create a direct link and trigger download
    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', `${reportType}_report.${format === 'excel' ? 'xlsx' : format}`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(`Error downloading ${reportType} report:`, error);
    throw new Error(`Failed to download ${reportType} report`);
  }
};

// ------- Utility Functions for Report Formatting -------

/**
 * Format currency values consistently
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format percentage values consistently
 * @param value Percentage value (0-100)
 * @param decimalPlaces Number of decimal places to show
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Format date values consistently
 * @param date Date to format
 * @param formatString Optional format string
 * @returns Formatted date string
 */
export const formatReportDate = (date: string | Date, formatString: string = 'MMMM d, yyyy'): string => {
  return format(typeof date === 'string' ? new Date(date) : date, formatString);
};

/**
 * Get predefined date range for report periods
 * @param period Report period
 * @returns Object with start and end dates
 */
export const getDateRangeForPeriod = (period: ReportPeriod): { start_date: string; end_date: string } => {
  const today = new Date();
  const end_date = format(today, 'yyyy-MM-dd');
  let start_date: string;
  
  switch (period) {
    case 'daily':
      start_date = format(today, 'yyyy-MM-dd');
      break;
    case 'weekly':
      start_date = format(subDays(today, 7), 'yyyy-MM-dd');
      break;
    case 'monthly':
      start_date = format(subMonths(today, 1), 'yyyy-MM-dd');
      break;
    case 'quarterly':
      start_date = format(subMonths(today, 3), 'yyyy-MM-dd');
      break;
    case 'yearly':
      start_date = format(subMonths(today, 12), 'yyyy-MM-dd');
      break;
    default:
      // Default to current month
      start_date = format(startOfMonth(today), 'yyyy-MM-dd');
  }
  
  return { start_date, end_date };
};

/**
 * Generate a friendly label for a date range
 * @param startDate Start date
 * @param endDate End date
 * @returns Friendly label (e.g., "May 2025", "Q2 2025", "May 15-30, 2025")
 */
export const generateDateRangeLabel = (startDate: string | Date, endDate: string | Date): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Same day
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return format(start, 'MMMM d, yyyy');
  }
  
  // Same month and year
  if (format(start, 'yyyy-MM') === format(end, 'yyyy-MM')) {
    return `${format(start, 'MMMM d')} - ${format(end, 'd')}, ${format(end, 'yyyy')}`;
  }
  
  // Same year
  if (getYear(start) === getYear(end)) {
    return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d')}, ${format(end, 'yyyy')}`;
  }
  
  // Different years
  return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
};

// Export all functions
export default {
  // Report generation functions
  generateIncomeReport,
  generateOutstandingPaymentsReport,
  generateFeeCollectionReport,
  generateStudentFinancialStatement,
  generateClassFinancialSummary,
  generateReceivablesAgingReport,
  
  // Export functions
  exportReport,
  downloadReport,
  
  // Utility functions
  formatCurrency,
  formatPercentage,
  formatReportDate,
  getDateRangeForPeriod,
  generateDateRangeLabel
};

