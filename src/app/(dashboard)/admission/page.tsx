'use client';

import { PageHeader } from '@/components/layout/page-header';
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import studentService from '@/services/students';
import { Student, CreateStudentPayload } from '@/types/student';
import schoolService from '@/services/schools';
import { toast } from 'sonner';
import settingService, { Setting } from '@/services/settings';
import classService from '@/services/class';
import { useForm } from 'react-hook-form';
import { RefreshCcw, Printer, Edit, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface NamedItem {
  id: string;
  name: string;
  year?: string;
}

export default function StudentListPage() {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<NamedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  
  const [genderOptions, setGenderOptions] = useState<Setting[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting }
  } = useForm<CreateStudentPayload>();

  const [derivedSchoolId, setDerivedSchoolId] = useState<string | null>(null);
  const watchedClassId = watch('class_id');

  useEffect(() => {
    const fetchSchoolFromClass = async () => {
      if (watchedClassId) {
        try {
          const cls = await classService.getById(watchedClassId as string);
          setDerivedSchoolId(cls.school_id as string);
        } catch (error) {
          console.error('Failed to fetch class info');
        }
      }
    };
    fetchSchoolFromClass();
  }, [watchedClassId]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [studentsData, classData, schoolData, gendersData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        schoolService.getAll(),
        settingService.getByGroup('genders')
      ]);
      setStudents(studentsData);
      setClasses(classData as any);
      setGenderOptions(gendersData);
      setSchools(schoolData as any);
      if (isRefresh) toast.success('Cache synchronized with server');
    } catch (err: any) {
      toast.error('Failed to sync data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: CreateStudentPayload) => {
    if (!derivedSchoolId) {
      toast.error('Please select a valid class');
      return;
    }

    try {
      await studentService.create({
        ...data,
        school_id: derivedSchoolId,
        status: 'active',
        scores: 0,
        registration_date: new Date().toISOString().split('T')[0],
        admission_status: 'in_school',
      });
      // toast.success("Student added successfully"); // Removed duplicate as axios interceptor handles it
      reset();
      // 4. Redis UX: trigger fresh re-fetch after mutation
      await fetchData(true);
    } catch (err) {
      console.error("Enrollment Error:", err);
      toast.error("Process interrupted. Check validation.");
    }
  };

  const handleRefresh = () => fetchData(true);

  const getNameById = (list: NamedItem[], id: string | undefined, fallback = '-') => {
    if (!id) return fallback;
    const found = list.find(item => String(item.id) === String(id));
    return found?.name || found?.year || fallback;
  };

  const filteredStudents = students.filter(s => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase();
    const matchesSearch = studentName.includes(searchLower);

    return matchesSearch;
  });

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
        <PageHeader
          title="Student Admissions"
          description="Manage student records and institutional admission status."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Admissions' }]}
        />

        <div className="space-y-8">
          {/* RBAC Protected Section */}
          {isAdmin && (
            <Card className="shadow-sm">
              <CardHeader className="border-b py-4">
                <CardTitle className="text-sm font-semibold">New Student Admission</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input {...register("first_name", { required: true })} placeholder="First Name" className="h-9" />
                  <Input {...register("middle_name")} placeholder="Middle Name" className="h-9" />
                  <Input {...register("last_name", { required: true })} placeholder="Last Name" className="h-9" />
                  <Input {...register("dob", { required: true })} type="date" className="h-9" />

                  <select {...register("gender", { required: true })} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Gender</option>
                    {genderOptions.map(g => (
                      <option key={g.id} value={g.setting_key}>{g.setting_value.label}</option>
                    ))}
                  </select>

                  <select {...register("class_id", { required: true })} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({schools.find(s => String(s.id) === String(cls.school_id))?.name})
                      </option>
                    ))}
                  </select>

                  <div className="md:col-span-3 flex justify-end pt-2">
                    <Button type="submit" disabled={isSubmitting} className="h-9 px-8 gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : 'Complete Admission'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="border-b flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg font-semibold">Student List</CardTitle>
                <CardDescription>View and manage all admitted students.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm" className="h-9">
                  <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Sync Records
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Printer className="w-3.5 h-3.5 mr-2" /> Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b bg-muted/20">
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md h-9 bg-background"
                />
              </div>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-12 pl-6">#</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right pr-6">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.map((s, index) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6 text-muted-foreground text-sm">{indexOfFirst + index + 1}</TableCell>
                      <TableCell className="font-medium text-sm">{s.first_name} {s.last_name}</TableCell>
                      <TableCell className="text-sm">{getNameById(classes as any, s.class_id)}</TableCell>
                      <TableCell className="text-sm">{getNameById(schools, s.school_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] font-semibold">{s.admission_status || 'In School'}</Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {currentStudents.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic text-sm">
                        No student records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
