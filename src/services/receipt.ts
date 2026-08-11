import api from "@/lib/axios";
import { type CreateReceiptPayload, type Receipt, type ReceiptFilters } from "@/types/receipt";

// API Calls

// Get all receipts with optional filters
export async function getReceipts(filters: ReceiptFilters = {}): Promise<Receipt[]> {
  const config = filters && Object.keys(filters).length > 0 ? { params: filters } : {};
  const response = await api.get("/fees/receipts", config);
  return response.data;
}

// Get single receipt by ID
export async function getReceipt(id: string): Promise<Receipt> {
  const response = await api.get(`/fees/receipts/${id}`);
  return response.data;
}

// Create a new receipt
export async function createReceipt(payload: CreateReceiptPayload): Promise<Receipt> {
  const response = await api.post("/fees/receipts", payload);
  return response.data; // Interceptor unwraps data.data
}

// Get printable version (HTML) of a receipt
export async function getPrintableReceipt(id: string): Promise<string> {
  const response = await api.get(`/fees/receipts/${id}/print`, {
    headers: { Accept: "text/html" }
  });
  return response.data;
}

export async function uploadReceiptLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await api.post("/fees/receipts/upload-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.logo_url;
}
