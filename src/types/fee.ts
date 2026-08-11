import { type Receipt } from './receipt';

/**
 * Fee-related type definitions for the school management system
 */

// Fee types as defined in the database
export type FeeType = 'registration' | 'admission' | 'tuition' | 'assessment' | string;

// Base fee structure
export interface Fee {
  id: string;
  category_id?: string;
  fee_type: FeeType;
  amount: number;
  description?: string;
  effective_date?: string;
  school_id?: string;
  garrison_id?: string;
}

// Fee with related information (category and class names)
export interface FeeWithDetails extends Fee {
  status?: string; // e.g., 'active', 'inactive'
  category_name?: string;
  academic_year_id?: string;
  class_id?: string;
  class_name?: string;
  school_name?: string;
}

// Payment record
export interface Payment {
  id: string;
  student_id: string;
  fee_id?: string;
  amount_paid: number;
  payment_date: string;
  installment_number?: number;
  recorded_by?: string;
  school_id?: string;
  garrison_id?: string;
}

// Payment with related information
export interface PaymentWithDetails extends Payment {
  student_name?: string;
  fee_type?: FeeType;
  fee_description?: string;
  recorded_by_name?: string;
  school_name?: string;
}

// Receipt types match fee types
export type ReceiptType = FeeType;

// Receipt with related information
export interface ReceiptWithDetails extends Receipt {
  student_name?: string;
  payment_details?: Payment;
  issued_by_name?: string;
  class_name?: string;
  school_name?: string;
}

// Request payloads
export interface CreateFeePayload {
  category_id?: string;
  class_id?: string;
  fee_type: FeeType;
  amount: number;
  description?: string;
  effective_date?: string;
  school_id?: string;
  garrison_id?: string;
  academic_year_id?: string;
}

export interface UpdateFeePayload {
  category_id?: string;
  class_id?: string;
  academic_year_id?: string;
  fee_type?: FeeType;
  amount?: number;
  description?: string;
  effective_date?: string;
  school_id?: string;
  garrison_id?: string;
}

export interface CreatePaymentPayload {
  student_id: string;
  fee_id?: string;
  amount_paid: number;
  payment_date?: string;
  installment_number?: number;
  school_id?: string;
  garrison_id?: string;
}

export interface CreateReceiptPayload {
  student_id?: string;
  payment_id?: string;
  receipt_type: ReceiptType;
  amount: number;
  date_issued?: string;
  venue?: string;
  logo_url?: string;
  assessment_date?: string;
  class_id?: string;
  school_id?: string;
  garrison_id?: string;
}

// Query parameters
export interface FeeQueryParams {
  category?: string;
  classLevel?: string;
  school_id?: string;
  garrison_id?: string;
  fee_type?: FeeType;
}

export interface PaymentQueryParams {
  student_id?: string;
  fee_id?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  school_id?: string;
  garrison_id?: string;
}

export interface ReceiptQueryParams {
  student_id?: string;
  payment_id?: string;
  receipt_type?: ReceiptType;
  date_from?: string;
  date_to?: string;
  school_id?: string;
  garrison_id?: string;
}
