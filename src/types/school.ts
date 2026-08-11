import { type ClassData } from "@/services/class";

export interface School {
  id: string;
  garrison_id?: string;
  name: string;
  code?: string;
  address?: string;
  phone_number?: string;
  phone?: string;
  email?: string;
  website?: string;
  capacity?: number;
  status?: "active" | "inactive";
  maxCapacity?: number;
  currentCapacity?: number;
  classes?: ClassData[];
}