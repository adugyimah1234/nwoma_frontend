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

  // Website Settings
  custom_domain?: string;
  website_logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  hero_title?: string;
  hero_subtitle?: string;
  about_text?: string;
  contact_email?: string;
  contact_phone?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  is_website_enabled?: boolean;

  // Leadership Profile
  leader_name?: string;
  leader_title?: string;
  leader_message?: string;
  leader_image_url?: string;
}