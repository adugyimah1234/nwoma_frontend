/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';

import { PageHeader } from '@/components/layout/page-header';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import registrationService, { type RegistrationData } from '@/services/registrations';
import studentService from '@/services/students';
import { type Student, type CreateStudentPayload } from '@/types/student';
import classService, { type ClassData } from '@/services/class';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import schoolService from '@/services/schools';
import { type School } from '@/types/school';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getAllRoles } from '@/services/roles';
import { getAllCategories } from '@/services/categories';
import { getAllAcademicYear } from '@/services/academic_year';
import {
  Search,
  Upload,
  UserPlus,
  Save,
  Filter,
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const [applicants, setApplicants] = useState<RegistrationData[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [passMark, setPassMark] = useState<number>(50);
  const [classSlots, setClassSlots] = useState<Record<string | number, number>>({});
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<{ id: string | number; name: string; code: string }[]>([]);
  const [selectedAppliedClass, setSelectedAppliedClass] = useState<string>('all');
  const [promotingId, setPromotingId] = useState<string | number | null>(null);
  const [searchName, setSearchName] = useState('');

  const isAdmin = userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'administrator';

  useEffect(() => {
    const fetchInitial = async () => {
      if (!token) return;

      try {
        const [applicantData, schoolData, roleData, categoryData] = await Promise.all([
          registrationService.getAll(),
          schoolService.getAll(),
          getAllRoles(),
          getAllCategories()
        ]);
        setApplicants(applicantData);
        setSchools(schoolData);
        setCategories(categoryData as any);

        if (user?.role_id && roleData.length > 0) {
          const userRoleData = roleData.find(role => String(role.id) === user.role_id);
          setUserRole(userRoleData?.name || '');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchInitial();
  }, [token, user?.role_id]);

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const students = await studentService.getAll();
        setAllStudents(students);
      } catch (error) {
        console.error('Error fetching all students:', error);
      }
    };
    fetchAllStudents();
  }, []);

  const handleSchoolChange = async (index: number, schoolId: string) => {
    if (schoolId) {
      const filtered = await classService.getBySchool(schoolId);
      const slotMap: Record<string | number, number> = {};
      for (const cls of filtered) {
        slotMap[cls.id] = allStudents.filter(s => String(s.class_id) === String(cls.id)).length;
      }
      setClasses(filtered);
      setClassSlots(slotMap);
    } else {
      setClasses([]);
      setClassSlots({});
    }

    const updated = [...applicants];
    updated[index].school_id = schoolId;
    updated[index].class_id = undefined;
    setApplicants(updated);
  };

  const handleClassSelect = async (index: number, classId: string) => {
    const cls = classes.find((c) => String(c.id) === classId);
    const currentStudentCount = allStudents.filter(s => String(s.class_id) === classId).length;

    if (cls && cls.slots !== undefined && currentStudentCount >= cls.slots) {
      toast.warning(`Class "${cls.name}" is full (${currentStudentCount}/${cls.slots} slots).`);
      return;
    }

    const updated = [...applicants];
    updated[index].class_id = classId;
    setApplicants(updated);

    setClassSlots(prev => ({
      ...prev,
      [classId]: currentStudentCount,
    }));
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<{ Name: string; Score: number }>(sheet);

        const updated = [...applicants];
        let updatedCount = 0;

        for (let i = 0; i < updated.length; i++) {
          const applicant = updated[i];
          const fullName = `${applicant.first_name} ${applicant.last_name}`.toLowerCase();
          const match = parsed.find(p => p.Name?.toLowerCase() === fullName);

          if (match && !isNaN(match.Score)) {
            applicant.scores = match.Score;
            updatedCount++;

            try {
              if (applicant.id) {
                await registrationService.update(String(applicant.id), {
                  ...applicant,
                  scores: match.Score,
                });
              }
            } catch (error) {
              console.error(`Error updating score for ${fullName}:`, error);
            }
          }
        }

        setApplicants(updated);
        toast.success(`Updated ${updatedCount} student scores from Excel`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        toast.error('Failed to process Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePromote = async () => {
    const updatedApplicants = [...applicants];
    let createdCount = 0;

    // Filtering logic simplified for bulk promotion
    const toPromote = updatedApplicants.filter(a => {
        const passed = (a.scores ?? 0) >= passMark;
        return a.status === 'pending' && passed && a.school_id && a.class_id;
    });

    if (toPromote.length === 0) {
        toast.info("No candidates ready for promotion. Ensure schools and classes are assigned.");
        return;
    }

    toast.promise(
        Promise.all(toPromote.map(a => handleSinglePromote(a, true))),
        {
            loading: `Promoting ${toPromote.length} candidates...`,
            success: "Promotion batch completed.",
            error: "Batch promotion encountered errors."
        }
    );
  };

  const handleSinglePromote = async (applicant: RegistrationData, isBatch = false) => {
    if (!isBatch) setPromotingId(applicant.id ?? null);

    try {
      const hasPassed = (applicant.scores ?? 0) >= passMark;

      if (!hasPassed) {
        if (!isBatch) toast.error(`${applicant.first_name} did not meet the pass mark.`);
        return;
      }

      if (!applicant.school_id || !applicant.class_id) {
          if (!isBatch) toast.warning(`Please assign a school and class for ${applicant.first_name}.`);
          return;
      }

      const dob = applicant.date_of_birth
        ? format(new Date(applicant.date_of_birth), 'yyyy-MM-dd')
        : '';

      const studentPayload: CreateStudentPayload = {
        first_name: applicant.first_name,
        last_name: applicant.last_name,
        school_id: applicant.school_id as string,
        admission_status: 'admitted',
        academic_year_id: (applicant.academic_year_id ?? '3').toString(),
        dob: dob,
        gender: applicant.gender,
        scores: applicant.scores ?? 0,
        registration_date: format(new Date(applicant.registration_date ?? ''), 'yyyy-MM-dd'),
        category_id: applicant.category,
        class_id: (applicant.class_id as string),
        status: 'inactive',
        middle_name: applicant.middle_name ?? ''
      };

      await Promise.all([
        studentService.create(studentPayload),
        registrationService.updatePartial(String(applicant.id), { status: "approved" })
      ]);

      if (!isBatch) {
          toast.success(`${applicant.first_name} promoted successfully.`);
          const refreshed = await registrationService.getAll();
          setApplicants(refreshed);
      }
    } catch (err: any) {
      console.error(`Promotion error:`, err);
      if (!isBatch) toast.error(`Failed to promote ${applicant.first_name}`);
    } finally {
      if (!isBatch) setPromotingId(null);
    }
  };

  const categoryOrder = ['SVC', 'MOD', 'CIV'];

  const pendingApplicants = useMemo(() => {
    return applicants
      .filter((a) => {
        const matchesStatus = (a.status || '').toLowerCase() === 'pending';
        const pStatus = (a.payment_status || '').toLowerCase();
        const isPaymentValid = pStatus === 'paid' || pStatus === 'partial';
        const matchesAppliedClass = selectedAppliedClass === 'all' || a.class_applying_for === selectedAppliedClass;

        const category = categories.find(c =>
            String(c.id) === String(a.category) ||
            c.code === a.category ||
            c.name === a.category
        );
        const matchesCategory = !category || categoryOrder.includes((category.code || '').toUpperCase());

        const fullName = `${a.first_name} ${a.middle_name ?? ''} ${a.last_name}`.toLowerCase();
        const searchTerm = searchName.trim().toLowerCase();
        const matchesSearch = !searchTerm || fullName.includes(searchTerm);

        return matchesStatus && isPaymentValid && matchesAppliedClass && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const aCat = categories.find(c => String(c.id) === String(a.category) || c.code === a.category);
        const bCat = categories.find(c => String(c.id) === String(b.category) || c.code === b.category);

        const aIndex = (aCat && aCat.code) ? categoryOrder.indexOf(aCat.code.toUpperCase()) : -1;
        const bIndex = (bCat && bCat.code) ? categoryOrder.indexOf(bCat.code.toUpperCase()) : -1;

        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });
  }, [applicants, selectedAppliedClass, categories, searchName]);

  const uniqueAppliedClasses = Array.from(
    new Set(applicants.map((a) => a.class_applying_for).filter(Boolean))
  );

  const handleSaveScores = async () => {
    let updatedCount = 0;
    for (const applicant of applicants) {
      if (applicant.id && applicant.scores !== undefined) {
        try {
          await registrationService.update(String(applicant.id), {
            ...applicant,
            scores: applicant.scores,
          });
          updatedCount++;
        } catch (error) {
          console.error(`Error saving score:`, error);
        }
      }
    }
    if (updatedCount > 0) {
      toast.success(`${updatedCount} scores saved.`);
      const refreshed = await registrationService.getAll();
      setApplicants(refreshed);
    }
  };

  const getCategoryDisplay = (applicant: RegistrationData) => {
    const category = categories.find(c =>
        String(c.id) === String(applicant.category) ||
        c.code === applicant.category ||
        c.name === applicant.category
    );

    if (!category) return <Badge variant="outline" className="text-[10px] opacity-60">Unknown</Badge>;

    const colors: Record<string, string> = {
        'SVC': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'MOD': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'CIV': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    };

    return (
        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0 border-none", colors[category.code] || "bg-muted text-muted-foreground")}>
            {category.name}
        </Badge>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      <PageHeader
        title="Entrance Assessment Results"
        description="Review applicant scores and process placement decisions for the current academic cycle."
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Assessments', href: '/assessments' }, { title: 'Results' }]}
        tabs={[
          { title: 'Overview', href: '/assessments' },
          { title: 'Results & Placement', href: '/assessments/results' },
          { title: 'Admitted Students', href: '/assessments/shortlisted' },
        ]}
      />

      <div className="space-y-6">
        {/* Controls Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-white dark:bg-slate-900/50 border-b pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary" />
                    Pending Placements
                </CardTitle>
                <CardDescription className="text-xs font-medium">Manage scoring and unit allocation for {pendingApplicants.length} active applicants.</CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by candidate name..."
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    className="w-full sm:w-64 h-10 pl-9 bg-muted/20 border-none"
                  />
                </div>

                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
                   <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Pass Mark</span>
                   <Separator orientation="vertical" className="h-4 mx-1" />
                   <Input
                     type="number"
                     value={passMark}
                     onChange={(e) => setPassMark(parseInt(e.target.value) || 0)}
                     className="w-12 h-6 border-none bg-transparent p-0 text-center font-bold text-sm focus-visible:ring-0 shadow-none"
                   />
                </div>

                <Select value={selectedAppliedClass} onValueChange={setSelectedAppliedClass}>
                    <SelectTrigger className="w-[160px] h-10 bg-muted/20 border-none">
                        <Filter className="size-3.5 mr-2 opacity-50" />
                        <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Applied Classes</SelectItem>
                        {uniqueAppliedClasses.map((clsName) => (
                            <SelectItem key={clsName} value={clsName}>{clsName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
               <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:w-72">
                        <div className="relative flex items-center">
                            <label className="flex flex-1 items-center justify-center gap-2 px-4 h-10 rounded-lg border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-all">
                                <Upload className="size-4 text-primary" />
                                <span className="text-xs font-semibold text-primary">Import Scores (Excel)</span>
                                <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
                            </label>
                        </div>
                    </div>
               </div>

               <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleSaveScores} className="h-10 px-4 font-bold text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                        <Save className="size-4 mr-2" />
                        Save All Scores
                    </Button>
                    {isAdmin && (
                        <Button size="sm" onClick={handlePromote} className="h-10 px-6 font-bold text-xs bg-primary">
                            <UserPlus className="size-4 mr-2" />
                            Promote Passed
                        </Button>
                    )}
               </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-white dark:bg-slate-900/50 overflow-hidden">
                <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-12 text-center text-[10px] font-bold uppercase tracking-widest">#</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Full Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Applied For</TableHead>
                    <TableHead className="w-28 text-[10px] font-bold uppercase tracking-widest text-center">Score %</TableHead>
                    {isAdmin && <TableHead className="text-[10px] font-bold uppercase tracking-widest">Institutional Unit</TableHead>}
                    {isAdmin && <TableHead className="text-[10px] font-bold uppercase tracking-widest">Target Class</TableHead>}
                    <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-center">Verdict</TableHead>
                    {isAdmin && <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest pr-6">Action</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingApplicants.map((applicant, idx) => {
                    const originalIndex = applicants.findIndex(a => a.id === applicant.id);
                    const passed = (applicant.scores ?? 0) >= passMark;

                    return (
                        <TableRow key={applicant.id} className="group hover:bg-muted/10 transition-colors border-border/40">
                        <TableCell className="text-muted-foreground font-mono text-[10px] text-center">{idx + 1}</TableCell>
                        <TableCell>{getCategoryDisplay(applicant)}</TableCell>
                        <TableCell className="py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-foreground uppercase tracking-tight">{applicant.first_name} {applicant.last_name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">REG-{String(applicant.id).substring(0,6).toUpperCase()}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center font-medium text-xs text-muted-foreground">{applicant.class_applying_for || 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                                <Input
                                    type="number"
                                    value={applicant.scores === undefined || applicant.scores === null ? '' : applicant.scores}
                                    onChange={(e) => {
                                        const updated = [...applicants];
                                        updated[originalIndex].scores = parseFloat(e.target.value);
                                        setApplicants(updated);
                                    }}
                                    className="h-9 w-20 text-center text-xs font-bold bg-muted/10 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                                    placeholder="0"
                                />
                            </div>
                        </TableCell>
                        {isAdmin && (
                            <TableCell>
                            <select
                                title="Select School"
                                className="h-9 rounded-lg border-none bg-muted/20 px-2 py-1 text-xs w-full max-w-[150px] text-foreground font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary/20"
                                value={applicant.school_id ?? ''}
                                onChange={(e) => handleSchoolChange(originalIndex, e.target.value)}
                            >
                                <option value="">Select Unit</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            </TableCell>
                        )}
                        {isAdmin && (
                            <TableCell>
                            <select
                                title="Select Class"
                                value={applicant.class_id ?? ''}
                                onChange={(e) => handleClassSelect(originalIndex, e.target.value)}
                                className="h-9 rounded-lg border-none bg-muted/20 px-2 py-1 text-xs w-full max-w-[150px] text-foreground font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary/20"
                            >
                                <option value="">Select Class</option>
                                {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({classSlots[String(cls.id)] ?? 0}/{cls.slots})
                                </option>
                                ))}
                            </select>
                            </TableCell>
                        )}
                        <TableCell className="text-center">
                            {passed ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="size-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Passed</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                                    <AlertCircle className="size-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Failed</span>
                                </div>
                            )}
                        </TableCell>
                        {isAdmin && (
                            <TableCell className="text-right pr-6">
                            {applicant.status === 'pending' && (
                                <Button
                                    onClick={() => handleSinglePromote(applicant)}
                                    size="sm"
                                    disabled={promotingId === applicant.id || !applicant.school_id || !applicant.class_id || !passed}
                                    className="h-8 rounded-lg px-4 font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-30"
                                >
                                    {promotingId === applicant.id ? '...' : 'Promote'}
                                </Button>
                            )}
                            </TableCell>
                        )}
                        </TableRow>
                    );
                    })}
                </TableBody>
                </Table>
                {pendingApplicants.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-3">
                        <XCircle className="size-12 text-muted-foreground opacity-20" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground">No active applicants found</p>
                            <p className="text-xs text-muted-foreground">Adjust your filters or synchronization settings</p>
                        </div>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
