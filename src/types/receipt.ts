export type ReceiptType = 'registration' | 'levy' | 'textBooks' | 'exerciseBooks' | 'furniture' | 'jersey' | 'crest' | string;

export interface ReceiptItem {
  id: string;
  receipt_id?: string;
  receipt_type: ReceiptType;
  amount: number;
}

export interface Receipt {
  id: string;
  student_id?: string;
  payment_id?: string | null;
  receipt_items?: ReceiptItem[];
  receipt_type?: ReceiptType;
  amount: number;
  issued_by?: string;
  date_issued: string;
  venue?: string;
  logo_url?: string;
  assessment_date?: string;
  class_id?: string;
  registration_id?: string;
  fee_id?: string;
  school_id?: string;
  garrison_id?: string;
  student_name?: string;
  class_name?: string;
  issued_by_name?: string;
  fullName?: string;
  school_name?: string;
  payment_date?: string;
  payment_type?: string;
  payment_method?: string;
  registration_first_name?: string;
  registration_last_name?: string;
  amount_paid?: number;
}

export interface ReceiptFilters {
  search?: string;
  receipt_type?: string;
  date_from?: string;
  date_to?: string;
  student_id?: string;
  school_id?: string;
  garrison_id?: string;
  registration_id?: string;
  class_id?: string;
}

export interface CreateReceiptPayload {
  student_id?: string;
  payment_id?: string;
  fee_id?: string;
  receipt_type: any; // backend expects array of objects or single type
  amount: number;
  date_issued?: string;
  venue?: string;
  logo_url?: string;
  assessment_date?: string;
  class_id?: string;
  school_id?: string;
  garrison_id?: string;
}
