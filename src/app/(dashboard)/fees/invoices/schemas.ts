import * as z from 'zod';

export const receiptItemSchema = z.object({
  type: z.string().min(1, 'Payment type is required'),
  amount: z.number().min(0),
});

export const createReceiptSchema = z.object({
  student_id: z.string().optional(),
  registration_id: z.string().optional(),
  payment_id: z.string().optional(),
  receipt_type: z.array(receiptItemSchema).min(1, 'Add at least one payment option'),
  date_issued: z.string(),
  venue: z.string().optional(),
  fee_id: z.string().optional(),
  assessment_date: z.string().optional(),
  class_id: z.string().optional(),
  assessment_id: z.string().optional(),
  payment_type: z.string().optional(),
  amount: z.number().min(0),
  jersey_size: z.string().optional(),
});

export type CreateReceiptFormValues = z.infer<typeof createReceiptSchema>;
