'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import studentService from '@/services/students';
import { Student } from '@/types/student';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      toast.error("Failed to load student registry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    service: students.filter(s => s.category === 'SVC').length,
    civilian: students.filter(s => s.category !== 'SVC').length,
  };

  return {
    students,
    loading,
    stats,
    refresh: fetchStudents
  };
}
