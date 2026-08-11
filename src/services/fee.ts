import api from "@/lib/axios";
import {
  type Fee,
  type FeeWithDetails,
  type CreateFeePayload,
  type UpdateFeePayload,
  type FeeQueryParams,
} from "@/types/fee";

// Get all fees with optional filters
export async function getAllFees(params: FeeQueryParams = {}): Promise<FeeWithDetails[]> {
  const response = await api.get("/fees", { params });
  return response.data;
}

// Get a single fee by category and class level
export async function getFee(params: FeeQueryParams): Promise<Fee> {
  const response = await api.get("/fees/get", { params });
  return response.data;
}

// Create a new fee
export async function createFee(payload: CreateFeePayload): Promise<Fee> {
  const response = await api.post("/fees", payload);
  return response.data;
}

// Update an existing fee by ID
export async function updateFee(id: string, payload: UpdateFeePayload): Promise<{ message: string }> {
  const response = await api.put(`/fees/${id}`, payload);
  return response.data;
}

// Delete a fee by ID
export async function deleteFee(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/fees/${id}`);
  return response.data;
}

// Get outstanding fees for a specific student
export async function getOutstandingFees(studentId: string): Promise<FeeWithDetails[]> {
  const response = await api.get(`/fees/outstanding/${studentId}`);
  return response.data;
}

export async function getDebtLedger(): Promise<any[]> {
    const response = await api.get('/fees/ledger');
    return response.data;
}

export async function sendBulkDebtReminders(studentIds: string[]): Promise<any> {
    const response = await api.post('/fees/reminders', { studentIds });
    return response.data;
}
