/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-console */
import axios from 'axios';
import { type Fee } from '../types/fee';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Invoice status types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';

// Invoice item interface
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  fee_id: string;
  description: string;
  amount: number;
  quantity: number;
  total: number;
  fee_type?: string;
  fee_details?: Partial<Fee>;
}

// Invoice interface
export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: InvoiceStatus;
  notes?: string;
  school_id?: string;
  class_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Invoice with related details
export interface InvoiceWithDetails extends Invoice {
  student_name: string;
  student_email?: string;
  student_admission_number?: string;
  class_name?: string;
  school_name?: string;
  created_by_name?: string;
  items: InvoiceItem[];
  payment_history?: {
    id: string;
    amount: number;
    date: string;
    method?: string;
    receipt_id?: string;
  }[];
}

// Interface for creating a new invoice
export interface CreateInvoicePayload {
  student_id: string;
  issue_date: string;
  due_date: string;
  items: {
    fee_id: string;
    description: string;
    amount: number;
    quantity: number;
  }[];
  notes?: string;
  school_id?: string;
  class_id?: string;
}

// Interface for updating an invoice
export interface UpdateInvoicePayload {
  student_id?: string;
  issue_date?: string;
  due_date?: string;
  status?: InvoiceStatus;
  notes?: string;
  school_id?: string;
  class_id?: string;
  items?: {
    id?: string; // Existing item ID if updating
    fee_id: string;
    description: string;
    amount: number;
    quantity: number;
  }[];
}

// Filter parameters for listing invoices
export interface InvoiceFilterParams {
  student_id?: string;
  status?: InvoiceStatus | InvoiceStatus[];
  school_id?: string;
  class_id?: string;
  issue_date_from?: string;
  issue_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

/**
 * Get all invoices with optional filters
 * @param filters Optional filter parameters
 * @returns Array of invoices
 */
export const getInvoices = async (filters?: InvoiceFilterParams): Promise<Invoice[]> => {
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
    
    const response = await axios.get<Invoice[]>(
      `${API_URL}/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch invoices');
    }
    throw error;
  }
};

/**
 * Get a single invoice by ID with full details
 * @param id Invoice ID
 * @returns Invoice with full details
 */
export const getInvoice = async (id: string): Promise<InvoiceWithDetails> => {
  try {
    const response = await axios.get<InvoiceWithDetails>(`${API_URL}/invoices/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch invoice with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Create a new invoice
 * @param invoice Invoice data
 * @returns Created invoice
 */
export const createInvoice = async (invoice: CreateInvoicePayload): Promise<InvoiceWithDetails> => {
  try {
    const response = await axios.post<InvoiceWithDetails>(`${API_URL}/invoices`, invoice);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create invoice');
    }
    throw error;
  }
};

/**
 * Update an existing invoice
 * @param id Invoice ID
 * @param invoice Updated invoice data
 * @returns Updated invoice
 */
export const updateInvoice = async (id: string, invoice: UpdateInvoicePayload): Promise<InvoiceWithDetails> => {
  try {
    const response = await axios.put<InvoiceWithDetails>(`${API_URL}/invoices/${id}`, invoice);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to update invoice with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Delete an invoice
 * @param id Invoice ID
 * @returns Success message
 */
export const deleteInvoice = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(`${API_URL}/invoices/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to delete invoice with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Mark an invoice as sent
 * @param id Invoice ID
 * @returns Updated invoice
 */
export const markInvoiceAsSent = async (id: string): Promise<InvoiceWithDetails> => {
  try {
    const response = await axios.put<InvoiceWithDetails>(`${API_URL}/invoices/${id}/mark-sent`, {});
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to mark invoice ${id} as sent`);
    }
    throw error;
  }
};

/**
 * Mark an invoice as paid
 * @param id Invoice ID
 * @param paymentDetails Payment details
 * @returns Updated invoice
 */
export const markInvoiceAsPaid = async (
  id: string,
  paymentDetails: { 
    amount: number; 
    payment_date: string; 
    payment_method?: string;
    notes?: string;
  }
): Promise<InvoiceWithDetails> => {
  try {
    const response = await axios.put<InvoiceWithDetails>(
      `${API_URL}/invoices/${id}/mark-paid`, 
      paymentDetails
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to mark invoice ${id} as paid`);
    }
    throw error;
  }
};

/**
 * Cancel an invoice
 * @param id Invoice ID
 * @param reason Reason for cancellation
 * @returns Updated invoice
 */
export const cancelInvoice = async (id: string, reason?: string): Promise<InvoiceWithDetails> => {
  try {
    const response = await axios.put<InvoiceWithDetails>(
      `${API_URL}/invoices/${id}/cancel`, 
      { reason }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to cancel invoice ${id}`);
    }
    throw error;
  }
};

/**
 * Send an invoice to the student/parent via email
 * @param id Invoice ID
 * @param emailOptions Email options
 * @returns Success message
 */
export const sendInvoiceByEmail = async (
  id: string,
  emailOptions?: { 
    to?: string[]; 
    cc?: string[]; 
    message?: string;
  }
): Promise<{ message: string }> => {
  try {
    const response = await axios.post<{ message: string }>(
      `${API_URL}/invoices/${id}/send-email`, 
      emailOptions || {}
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to send invoice ${id} by email`);
    }
    throw error;
  }
};

/**
 * Get URL for invoice PDF
 * @param id Invoice ID
 * @returns URL to invoice PDF
 */
export const getInvoicePdfUrl = (id: string): string => {
  return `${API_URL}/invoices/${id}/pdf`;
};

/**
 * Generate and download invoice PDF
 * @param id Invoice ID
 */
export const downloadInvoicePdf = async (id: string): Promise<void> => {
  try {
    // Create a direct link to the PDF and trigger download
    const link = document.createElement('a');
    link.href = getInvoicePdfUrl(id);
    link.setAttribute('download', `invoice-${id}.pdf`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    throw new Error('Failed to download invoice PDF');
  }
};

/**
 * Trigger bulk tuition invoice generation
 * @returns Response message
 */
export const generateTuitionInvoices = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post<{ message: string }>(
      `${API_URL}/invoices/generate-tuition`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to generate tuition invoices');
    }
    throw error;
  }
};


/**
 * Get invoices summary - counts by status
 * @param schoolId Optional school ID
 * @returns Invoice summary statistics
 */
export const getInvoicesSummary = async (schoolId?: string): Promise<{
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  cancelled: number;
  partially_paid: number;
  total_amount: number;
  total_paid: number;
  total_balance: number;
}> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (schoolId) {
      queryParams.append('school_id', schoolId.toString());
    }
    
    const response = await axios.get<{
      total: number;
      draft: number;
      sent: number;
      paid: number;
      overdue: number;
      cancelled: number;
      partially_paid: number;
      total_amount: number;
      total_paid: number;
      total_balance: number;
    }>(`${API_URL}/invoices/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch invoices summary');
    }
    throw error;
  }
};

export default {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsSent,
  markInvoiceAsPaid,
  cancelInvoice,
  sendInvoiceByEmail,
  getInvoicePdfUrl,
  downloadInvoicePdf,
  getInvoicesSummary,
  generateTuitionInvoices
};

