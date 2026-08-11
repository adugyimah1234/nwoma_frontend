/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { type ReceiptWithDetails } from '../types/fee';

/**
 * Open a printable receipt in a new window
 * @param receiptId The ID of the receipt to print
 * @param baseUrl The base URL of the API (optional, defaults to env variable)
 */
export const openPrintableReceipt = (receiptId: string | number, baseUrl?: string): void => {
  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const receiptUrl = `${apiUrl}/fees/receipts/${receiptId}/print`;
  
  // Open in a new window/tab
  window.open(receiptUrl, `receipt_${receiptId}`, 'width=800,height=600');
};

/**
 * Create an iframe to trigger print dialog for a receipt
 * @param receiptId The ID of the receipt to print
 * @param baseUrl The base URL of the API (optional, defaults to env variable)
 */
export const printReceipt = (receiptId: string | number, baseUrl?: string): void => {
  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const receiptUrl = `${apiUrl}/fees/receipts/${receiptId}/print`;
  
  // Create an iframe to load the receipt for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = receiptUrl;
  
  // Add event listener to trigger print when the iframe loads
  iframe.onload = () => {
    try {
      iframe.contentWindow?.print();
      // Remove the iframe after printing (after a delay)
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch (error) {
      console.error('Error printing receipt:', error);
      // If printing failed, open in a new window as fallback
      openPrintableReceipt(receiptId, baseUrl);
      document.body.removeChild(iframe);
    }
  };
  
  // Add iframe to the document to start loading
  document.body.appendChild(iframe);
};

/**
 * Generate a receipt number from a receipt ID
 * @param receiptId The ID of the receipt
 * @returns A formatted receipt number
 */
export const formatReceiptNumber = (receiptId: string | number): string => {
  if (!receiptId) return 'R-000000';
  return typeof receiptId === 'number'
    ? `R-${receiptId.toString().padStart(6, '0')}`
    : `R-${String(receiptId).slice(0, 8).toUpperCase()}`;
};

/**
 * Format a date for receipt display
 * @param date The date to format
 * @returns A formatted date string
 */
export const formatReceiptDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format receipt amount as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatReceiptAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format receipt data for display
 * @param receipt The receipt data
 * @returns Formatted receipt data for display
 */
export const formatReceiptForDisplay = (receipt: ReceiptWithDetails): Record<string, any> => {
  return {
    ...receipt,
    formatted_receipt_number: formatReceiptNumber(receipt.id),
    formatted_date: formatReceiptDate(receipt.date_issued),
    formatted_amount: formatReceiptAmount(receipt.amount),
    receipt_type_display: receipt.receipt_items && receipt.receipt_items.length > 0 
      ? receipt.receipt_items[0].receipt_type.charAt(0).toUpperCase() + receipt.receipt_items[0].receipt_type.slice(1)
      : 'N/A'
  };
};

export default {
  openPrintableReceipt,
  printReceipt,
  formatReceiptNumber,
  formatReceiptDate,
  formatReceiptAmount,
  formatReceiptForDisplay
};
