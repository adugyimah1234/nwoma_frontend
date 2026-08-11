/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Payment method types
export type PaymentMethodType = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'online_payment' | 'mobile_payment' | 'other';

// Payment status types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'voided';

// Transaction types
export type TransactionType = 'payment' | 'refund' | 'adjustment' | 'waiver' | 'reversal';

// Payment interface
export interface Payment {
  id: string | number;
  student_id: string | number;
  invoice_id?: string | number;
  fee_id?: string | number;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethodType;
  reference_number?: string;
  status: PaymentStatus;
  notes?: string;
  created_by?: string | number;
  created_at: string;
  updated_at: string;
  receipt_id?: string | number;
  school_id?: string | number;
}

// Payment with related details
export interface PaymentWithDetails extends Payment {
  student_name: string;
  student_admission_number?: string;
  invoice_number?: string;
  fee_type?: string;
  fee_description?: string;
  created_by_name?: string;
  receipt_number?: string;
  school_name?: string;
  transactions?: PaymentTransaction[];
}

// Payment transaction (used for recording payment history/audit)
export interface PaymentTransaction {
  id: string | number;
  payment_id: string | number;
  transaction_type: TransactionType;
  amount: number;
  date: string;
  status: PaymentStatus;
  reference_number?: string;
  processed_by?: string | number;
  processed_by_name?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Interface for creating a new payment
export interface CreatePaymentPayload {
  student_id: string | number;
  invoice_id?: string | number;
  fee_id?: string | number;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethodType;
  reference_number?: string;
  notes?: string;
  school_id?: string | number;
  generate_receipt?: boolean;
}

// Interface for refunding a payment
export interface RefundPaymentPayload {
  amount: number;
  reason: string;
  refund_date: string;
  refund_method?: PaymentMethodType;
  reference_number?: string;
}

// Interface for payment adjustment
export interface AdjustPaymentPayload {
  adjustment_amount: number; // Positive for increase, negative for decrease
  reason: string;
  adjustment_date: string;
  notes?: string;
}

// Filter parameters for listing payments
export interface PaymentFilterParams {
  student_id?: string | number;
  invoice_id?: string | number;
  fee_id?: string | number;
  status?: PaymentStatus | PaymentStatus[];
  payment_method?: PaymentMethodType | PaymentMethodType[];
  school_id?: string | number;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

/**
 * Get all payments with optional filters
 * @param filters Optional filter parameters
 * @returns Array of payments
 */
export const getPayments = async (filters?: PaymentFilterParams): Promise<PaymentWithDetails[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle array values (like multiple statuses)
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await axios.get<PaymentWithDetails[]>(
      `${API_URL}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch payments');
    }
    throw error;
  }
};

/**
 * Get a single payment by ID with full details
 * @param id Payment ID
 * @returns Payment with full details
 */
export const getPayment = async (id: string | number): Promise<PaymentWithDetails> => {
  try {
    const response = await axios.get<PaymentWithDetails>(`${API_URL}/payments/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch payment with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Create a new payment
 * @param payment Payment data
 * @returns Created payment
 */
export const createPayment = async (payment: CreatePaymentPayload): Promise<PaymentWithDetails> => {
  try {
    const response = await axios.post<PaymentWithDetails>(`${API_URL}/payments`, payment);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create payment');
    }
    throw error;
  }
};

/**
 * Get payment transactions history
 * @param paymentId Payment ID
 * @returns Array of payment transactions
 */
export const getPaymentTransactions = async (paymentId: string | number): Promise<PaymentTransaction[]> => {
  try {
    const response = await axios.get<PaymentTransaction[]>(`${API_URL}/payments/${paymentId}/transactions`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch transactions for payment ID ${paymentId}`);
    }
    throw error;
  }
};

/**
 * Process a refund for a payment
 * @param paymentId Payment ID
 * @param refundData Refund details
 * @returns Updated payment with refund details
 */
export const refundPayment = async (paymentId: string | number, refundData: RefundPaymentPayload): Promise<PaymentWithDetails> => {
  try {
    const response = await axios.post<PaymentWithDetails>(
      `${API_URL}/payments/${paymentId}/refund`, 
      refundData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to process refund for payment ID ${paymentId}`);
    }
    throw error;
  }
};

/**
 * Void a payment
 * @param paymentId Payment ID
 * @param reason Reason for voiding the payment
 * @returns Updated payment
 */
export const voidPayment = async (paymentId: string | number, reason: string): Promise<PaymentWithDetails> => {
  try {
    const response = await axios.post<PaymentWithDetails>(
      `${API_URL}/payments/${paymentId}/void`, 
      { reason }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to void payment ID ${paymentId}`);
    }
    throw error;
  }
};

/**
 * Adjust a payment amount
 * @param paymentId Payment ID
 * @param adjustmentData Adjustment details
 * @returns Updated payment
 */
export const adjustPayment = async (paymentId: string | number, adjustmentData: AdjustPaymentPayload): Promise<PaymentWithDetails> => {
  try {
    const response = await axios.post<PaymentWithDetails>(
      `${API_URL}/payments/${paymentId}/adjust`, 
      adjustmentData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to adjust payment ID ${paymentId}`);
    }
    throw error;
  }
};

/**
 * Get payment history for a student
 * @param studentId Student ID
 * @returns Array of payments with details
 */
export const getStudentPaymentHistory = async (studentId: string | number): Promise<PaymentWithDetails[]> => {
  try {
    const response = await axios.get<PaymentWithDetails[]>(`${API_URL}/payments/student/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch payment history for student ID ${studentId}`);
    }
    throw error;
  }
};

/**
 * Generate receipt for a payment
 * @param paymentId Payment ID
 * @returns Receipt details
 */
export const generateReceipt = async (paymentId: string | number): Promise<{ 
  receipt_id: string | number; 
  receipt_number: string;
  message: string;
}> => {
  try {
    const response = await axios.post<{ 
      receipt_id: string | number; 
      receipt_number: string;
      message: string;
    }>(`${API_URL}/payments/${paymentId}/generate-receipt`, {});
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to generate receipt for payment ID ${paymentId}`);
    }
    throw error;
  }
};

/**
 * Process a bulk payment (multiple fees in one payment)
 * @param bulkPaymentData Bulk payment data
 * @returns Created payments
 */
export const processBulkPayment = async (bulkPaymentData: {
  student_id: string | number;
  total_amount: number;
  payment_date: string;
  payment_method: PaymentMethodType;
  reference_number?: string;
  notes?: string;
  items: {
    fee_id?: string | number;
    invoice_id?: string | number;
    amount: number;
    description?: string;
  }[];
  school_id?: string | number;
  generate_receipt?: boolean;
}): Promise<{
  payments: PaymentWithDetails[];
  total_amount: number;
  payment_count: number;
  receipt_id?: string | number;
  receipt_number?: string;
}> => {
  try {
    const response = await axios.post<{
      payments: PaymentWithDetails[];
      total_amount: number;
      payment_count: number;
      receipt_id?: string | number;
      receipt_number?: string;
    }>(`${API_URL}/payments/bulk`, bulkPaymentData);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to process bulk payment');
    }
    throw error;
  }
};

/**
 * Get payment methods available in the system
 * @returns Array of available payment methods
 */
export const getPaymentMethods = async (): Promise<{
  id: string | number;
  name: string;
  type: PaymentMethodType;
  description?: string;
  is_active: boolean;
  requires_reference: boolean;
  instructions?: string;
}[]> => {
  try {
    const response = await axios.get<{
      id: string | number;
      name: string;
      type: PaymentMethodType;
      description?: string;
      is_active: boolean;
      requires_reference: boolean;
      instructions?: string;
    }[]>(`${API_URL}/payment-methods`);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch payment methods');
    }
    throw error;
  }
};

export default {
  getPayments,
  getPayment,
  createPayment,
  getPaymentTransactions,
  refundPayment,
  voidPayment,
  adjustPayment,
  getStudentPaymentHistory,
  generateReceipt,
  processBulkPayment,
  getPaymentMethods
};

