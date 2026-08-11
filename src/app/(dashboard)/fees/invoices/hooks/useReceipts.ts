'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getReceipts } from '@/services/receipt';
import studentService from '@/services/students';
import registrationService from '@/services/registrations';
import { getAllCategories } from '@/services/categories';
import classService from '@/services/class';
import { Receipt } from '@/types/receipt';
import { Student } from '@/types/student';
import { RegistrationData } from '@/services/registrations';
import { Category } from '@/services/categories';
import { toast } from 'sonner';

interface ReceiptFilters {
  search?: string;
  receipt_type?: string;
  date_from?: string;
  date_to?: string;
  student_id?: string;
}

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [searchInput, setSearchInput] = useState("");

  const [applicants, setApplicants] = useState<RegistrationData[]>([]);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<{ id: string | number; name: string }[]>([]);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReceipts(filters);
      setReceipts(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching receipts:", err);
      setError("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  useEffect(() => {
    async function loadData() {
      try {
        const [appData, studData, catData, clsData] = await Promise.all([
          registrationService.getAll(),
          studentService.getAll(),
          getAllCategories(),
          classService.getAll()
        ]);
        setApplicants(appData);
        setRealStudents(studData);
        setCategories(catData);
        setClasses(clsData);
      } catch (err) {
        console.error("Failed to load directory data", err);
      }
    }
    loadData();
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const searchTerm = searchInput.toLowerCase().trim();
      if (!searchTerm) return true;

      const student = realStudents.find((s) => Number(s.id) === Number(receipt.student_id));
      const studentName = student
        ? `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.toLowerCase()
        : '';

      const applicant = applicants.find((a) => Number(a.id) === Number(receipt.registration_id));
      const applicantName = applicant
        ? `${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name}`.toLowerCase()
        : '';

      const receiptId = `r-${receipt.id.toString().padStart(6, '0')}`;

      return (
        studentName.includes(searchTerm) ||
        applicantName.includes(searchTerm) ||
        receiptId.includes(searchTerm) ||
        receipt.id.toString().includes(searchTerm)
      );
    });
  }, [receipts, searchInput, realStudents, applicants]);

  return {
    receipts,
    filteredReceipts,
    loading,
    error,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    applicants,
    realStudents,
    categories,
    classes,
    refresh: fetchReceipts
  };
}
