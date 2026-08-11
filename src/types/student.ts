// Student profile types
export interface StudentProfile {
  id: string;
  admission_status?: string;
  date_of_birth?: string;
  first_name: string;
  middle_name?: string;
  last_name: string; 
  dob?: Date | string;
  gender?: string;
  category_id?: string;
  class_id?: string;
  academic_year_id?: string;
  registration_date?: string;
  status?: string;
  school_id?: string;
  garrison_id?: string;
  scores?: number;
  jersey_size?: string;
}

// Guardian relationship with student
export interface Guardian {
  guardian_id: string;
  full_name: string;
  email?: string;
  relationship?: string;
  is_primary_contact?: boolean;
  contact_priority?: number;
}

// Student with basic information
export interface Student {
  id: string;
  admission_status?: string;
  date_of_birth?: string;
  first_name: string;
  academic_year_id?: string;
  student_name?: string;
  middle_name?: string;
  last_name: string; 
  dob?: Date | string;
  gender?: string;
  category_id?: string;
  class_id?: string;
  registration_date?: string;
  status?: string;
  school_id?: string;
  garrison_id?: string;
  category?: 'SVC' | 'MOD' | 'CIV' | string; 
  scores?: number;
  jersey_size?: string;
}

// Request payloads
export interface CreateStudentPayload {
  id?: string;
  admission_status?: string;
  date_of_birth?: string;
  first_name: string;
  middle_name?: string;
  last_name: string; 
  dob?: Date | string;
  gender?: string;
  category_id?: string;
  academic_year_id?: string;
  scores?: number;
  class_id?: string;
  registration_date?: string;
  status?: string;
  school_id?: string;
  garrison_id?: string;
  jersey_size?: string;
  guardians?: {
    guardian_id: string;
    relationship?: string;
    is_primary_contact?: boolean;
    contact_priority?: number;
  }[];
}

export interface UpdateStudentPayload {
  id: string;
  admission_status?: string;
  date_of_birth?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string; 
  dob?: Date | string;
  gender?: string;
  category_id?: string;
  academic_year_id?: string;
  class_id?: string;
  registration_date?: string;
  status?: string;
  school_id?: string;
  garrison_id?: string;
  jersey_size?: string;
  guardians?: {
    guardian_id: string;
    relationship?: string;
    is_primary_contact?: boolean;
    contact_priority?: number;
  }[];
}
