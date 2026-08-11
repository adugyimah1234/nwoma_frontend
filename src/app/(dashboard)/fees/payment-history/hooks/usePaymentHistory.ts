'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from "date-fns";
import { getReceipts } from "@/services/receipt";
import studentService from "@/services/students";
import schoolService from "@/services/schools";
import classService, { ClassData } from "@/services/class";
import registrationService, { type RegistrationData } from "@/services/registrations";
import { getAllCategories, Category } from "@/services/categories";
import { Receipt } from "@/types/receipt";
import { Student } from "@/types/student";

export function usePaymentHistory() {
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [applicants, setApplicants] = useState<RegistrationData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [activeSchool, setActiveSchool] = useState<string | null>(null);
  const [activeClassTab, setActiveClassTab] = useState<Record<string, string>>({});
  const [activeReceiptTab, setActiveReceiptTab] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [s, c, st, apps, cats] = await Promise.all([
        schoolService.getAll(),
        classService.getAll(),
        studentService.getAll(),
        registrationService.getAll(),
        getAllCategories()
      ]);
      setSchools(s);
      setClasses(c);
      setStudents(st);
      setApplicants(apps);
      setCategories(cats);
      if (s.length > 0) setActiveSchool(s[0].id.toString());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      const filters: any = {};
      if (search) filters.search = search;
      if (date) filters.date_from = format(date, "yyyy-MM-dd");
      const data = await getReceipts(filters);
      setReceipts(data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  }, [search, date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  return {
    schools,
    classes,
    students,
    receipts,
    applicants,
    categories,
    loading,
    search,
    setSearch,
    date,
    setDate,
    activeSchool,
    setActiveSchool,
    activeClassTab,
    setActiveClassTab,
    activeReceiptTab,
    setActiveReceiptTab,
    refresh: fetchReceipts
  };
}
