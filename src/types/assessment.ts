export interface Assessment {
  id: string;
  school_id?: string;
  class_id?: string;
  category_id?: string;
  name: string;
  date?: string;
  venue?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Class {
  students_count?: number;
  level?: number;
  school_id?: string;
  garrison_id?: string;
  capacity?: number;
  id: string;
  name: string;
}

export interface CreateAssessmentInput {
  school_id?: string;
  class_id?: string;
  category_id?: string;
  name: string;
  date?: string;
  venue?: string;
}

export interface UpdateAssessmentInput {
  id: string;
  school_id?: string;
  class_id?: string;
  category_id?: string;
  name?: string;
  date?: string;
  venue?: string;
}

export interface DeleteAssessmentInput {
  id: string;
}
