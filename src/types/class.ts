/**
 * Types for the school management system's classes and assessments
 */

/**
 * Basic class interface
 */
export interface Class {
  level?: number;
  id: string;
  name: string;
  grade_level?: string;
  academic_year_id?: string;
  school_id?: string;
  garrison_id?: string;
  teacher_id?: string;
  capacity?: number;
  current_students?: number;
  sections?: Section[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Section interface
 */
export interface Section {
  id: string;
  name: string;
  class_id: string;
  teacher_id?: string;
  capacity?: number;
  current_students?: number;
}

/**
 * Assessment interface
 */
export interface ClassAssessment {
  id: string;
  class_id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  date?: string;
  description?: string;
  total_marks?: number;
  venue?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Class with assessments
 */
export interface ClassWithAssessments extends Class {
  assessments: ClassAssessment[];
}

/**
 * DTO interfaces
 */
export interface CreateClassDTO {
  name: string;
  grade_level?: string;
  academic_year_id?: string;
  school_id?: string;
  garrison_id?: string;
  teacher_id?: string;
  capacity?: number;
}

export interface UpdateClassDTO {
  name?: string;
  grade_level?: string;
  teacher_id?: string;
  capacity?: number;
}

export interface CreateSectionDTO {
  name: string;
  class_id: string;
  teacher_id?: string;
  capacity?: number;
}

export interface UpdateSectionDTO {
  name?: string;
  teacher_id?: string;
  capacity?: number;
}

export interface CreateAssessmentDTO {
  name: string;
  date?: string;
  category_id?: string;
  description?: string;
  total_marks?: number;
  venue?: string;
}

export interface UpdateAssessmentDTO {
  name?: string;
  date?: string;
  category_id?: string;
  description?: string;
  total_marks?: number;
  venue?: string;
}

/**
 * Filter interfaces
 */
export interface ClassFilters {
  academic_year_id?: string;
  school_id?: string;
  garrison_id?: string;
  grade_level?: string;
  teacher_id?: string;
  category_id?: string;
}

/**
 * Response interfaces
 */
export interface CreateResponse {
  id: string;
  message: string;
}

export interface UpdateResponse {
  message: string;
  changes?: number;
}

export interface DeleteResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}
