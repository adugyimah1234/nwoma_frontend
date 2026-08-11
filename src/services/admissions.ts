import api from "@/lib/axios";

export interface School {
  id: string | number;
  name: string;
  maxCapacity: number;
  currentCapacity: number;
  classes: SchoolClass[];
}

export interface SchoolClass {
  id: string | number;
  name: string;
  maxStudents: number;
  currentStudents: number;
}

export interface Student {
  id: string | number;
  name: string;
  assessmentScore: number;
  status: 'pending' | 'assigned' | 'enrolled';
  schoolId?: string | number;
  classId?: string | number;
  admissionDate?: string;
  contactInfo: {
    email: string;
    phone: string;
  };
}

export const getQualifiedStudents = async () => {
  const response = await api.get('/admissions/qualified-students');
  return response.data;
};

export const getSchools = async () => {
  const response = await api.get('/admissions/schools');
  return response.data;
};

export const assignSchool = async (studentId: string | number, schoolId: string | number, classId: string | number) => {
  const response = await api.post(`/admissions/assign`, {
    studentId,
    schoolId,
    classId
  });
  return response.data;
};

export const getEnrolledStudents = async () => {
  const response = await api.get('/admissions/enrolled');
  return response.data;
};

export interface BulkAdmitOptions {
    registration_ids: string[];
    verify_payment?: boolean;
    generate_initial_fees?: boolean;
}

export const bulkAdmit = async (options: BulkAdmitOptions) => {
    const response = await api.post('/admissions/bulk', options);
    return response.data;
};