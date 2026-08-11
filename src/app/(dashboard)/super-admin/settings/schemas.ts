import * as z from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirm_password: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export const brandingSchema = z.object({
  primary_header: z.string().min(1, 'Primary header is required'),
  sub_header: z.string().min(1, 'Sub-header is required'),
  footer_text: z.string().min(1, 'Footer text is required'),
});

export const gradeGovSchema = z.object({
  ca_weight: z.number().min(0).max(100),
  exam_weight: z.number().min(0).max(100),
  local_autonomy: z.boolean(),
});

export const communicationSchema = z.object({
  sms_api_key: z.string().optional(),
  sms_sender_id: z.string().max(11, 'Sender ID max 11 characters'),
  email_smtp_host: z.string().optional(),
  email_smtp_port: z.string().optional(),
  email_smtp_user: z.string().optional(),
  email_smtp_pass: z.string().optional(),
  email_from_address: z.string().email().optional().or(z.literal('')),
  email_from_name: z.string().optional(),
  enable_sms_receipts: z.boolean(),
  enable_sms_admissions: z.boolean(),
  enable_email_receipts: z.boolean(),
});

export const settingsSchema = z.object({
  profile: profileSchema,
  branding: brandingSchema,
  gradeGov: gradeGovSchema,
  communications: communicationSchema,
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
