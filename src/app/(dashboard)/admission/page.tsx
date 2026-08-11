'use client';

import { PageHeader } from '@/components/layout/page-header';
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { RefreshCcw, Printer, Edit } from "lucide-react";
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
      toast.success("Student added successfully");
      reset();
      // 4. Redis UX: trigger fresh re-fetch after mutation
      fetchData(true);
    } catch (err) {
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
    <div className="flex flex-1 flex-col gap-4 p-6 bg-slate-50/50 dark:bg-slate-950/50">
        <PageHeader
          title="Student Directory"
          description="Managed institutional enrollment and record keeping"
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Enrollment' }]}
        />

        <div className="space-y-6">
          {/* RBAC Protected Section */}
          {isAdmin && (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white dark:bg-slate-900 border-b">
                <CardTitle className="text-sm font-bold uppercase text-slate-400">Add New Enrollment</CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-slate-900">
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input {...register("first_name", { required: true })} placeholder="First Name" />
                  <Input {...register("middle_name")} placeholder="Middle Name" />
                  <Input {...register("last_name", { required: true })} placeholder="Last Name" />
                  <Input {...register("dob", { required: true })} type="date" />

                  <select {...register("gender", { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Gender</option>
                    {genderOptions.map(g => (
                      <option key={g.id} value={g.setting_key}>{g.setting_value.label}</option>
                    ))}
                  </select>

                  <select {...register("class_id", { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name.toUpperCase()} ({schools.find(s => String(s.id) === String(cls.school_id))?.name})
                      </option>
                    ))}
                  </select>

                  <div className="md:col-span-3 flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-8 shadow-md">
                      {isSubmitting ? 'Processing...' : 'Complete Enrollment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm">
            <CardHeader className="bg-white dark:bg-slate-900 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filtered Students</CardTitle>
                <p className="text-xs text-muted-foreground">Redis Cache Sync: ACTIVE</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm" className="h-9">
                  <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Sync Cache
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Printer className="w-3.5 h-3.5 mr-2" /> Print List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-800/50">
                <Input
                  placeholder="Filter by name or campus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md h-10 bg-white"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Institutional Unit</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.map((s, index) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-slate-400 font-mono text-xs">{indexOfFirst + index + 1}</TableCell>
                      <TableCell className="font-semibold">{s.first_name} {s.last_name}</TableCell>
                      <TableCell>{getNameById(classes as any, s.class_id)}</TableCell>
                      <TableCell>{getNameById(schools, s.school_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{s.admission_status}</Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {currentStudents.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                        No student records found in current cache.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="p-4 border-t bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">
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
