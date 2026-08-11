// services/feePresets.ts

import api from "@/lib/axios";

export interface FeePreset {
  id: string | number;
  type: string;
  category: string | null;
  class_name: string | null;
  amount: number;
}

export const getFeePresets = async (): Promise<FeePreset[]> => {
  const response = await api.get("/fees/presets");
  return response.data;
};
