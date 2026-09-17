/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Download,
  MoreHorizontal,
  Printer,
  User,
  RefreshCw,
  CheckCircle2,
  Trash2,
  GraduationCap,
  Calendar,
  Building2,
  Trophy,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import studentService from '@/services/students';
import registrationService from '@/services/registrations';
import classService, { type ClassData } from '@/services/class';
import schoolService from '@/services/schools';
import { type Category, getAllCategories } from '@/services/categories';
import { type School } from '@/types/school';
import { Student } from '@/types/student';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function ShortlistedPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSchoolId, setActiveSchoolId] = useState<string>('');
  const [cutoffScore, setCutoffScore] = useState<number>(50);
  const [activeClassTab, setActiveClassTab] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return '—';
    const category = categories.find(c =>
      String(c.id) === String(categoryId) ||
      c.code === categoryId ||
      c.name === categoryId
    );
    return category ? category.name : (categoryId || '—');
  };

  const getCategoryBadge = (categoryId: string | undefined) => {
    const name = getCategoryName(categoryId);
    const category = categories.find(c =>
      String(c.id) === String(categoryId) ||
      c.code === categoryId ||
      c.name === categoryId
    );
    const code = category?.code || 'CIV';

    const colors: Record<string, string> = {
      'SVC': 'bg-blue-50 text-blue-700 border-blue-100',
      'MOD': 'bg-purple-50 text-purple-700 border-purple-100',
      'CIV': 'bg-slate-50 text-slate-700 border-slate-100',
    };

    return (
      <Badge variant="secondary" className={cn("px-2 py-0 h-5 font-bold text-[10px] uppercase tracking-tight", colors[code] || colors['CIV'])}>
        {name}
      </Badge>
    );
  };

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const handleConfirmAdmission = async (student: any) => {
    try {
      if (student.admission_status === 'pending') {
        const dob = student.date_of_birth
          ? new Date(student.date_of_birth).toISOString().split('T')[0]
          : '';

        const studentPayload: any = {
          first_name: student.first_name,
          last_name: student.last_name,
          middle_name: student.middle_name ?? '',
          school_id: student.school_id,
          admission_status: 'admitted',
          academic_year_id: (student.academic_year_id ?? '3').toString(),
          dob: dob,
          gender: student.gender,
          scores: student.scores ?? 0,
          registration_date: student.registration_date || new Date().toISOString().split('T')[0],
          category_id: student.category,
          class_id: student.class_id || student.class_applying_for,
          status: 'inactive',
          // Preserve Guardian Intelligence
          guardian_name: student.guardian_name,
          guardian_phone_number: student.guardian_phone_number,
          address: student.address,
          email: student.email,
          relationship: student.relationship
        };

        await Promise.all([
          studentService.create(studentPayload),
          registrationService.updatePartial(String(student.id), { status: "approved" })
        ]);

        toast({ title: "Admission", description: `${student.first_name} promoted to admitted successfully.` });
      } else {
        await studentService.updatePartial(student.id, { status: 'active' });
        toast({ title: "Success", description: "Admission confirmed successfully." });
      }

      setStudents(prev => prev.filter(s => s.id !== student.id));
    } catch (err) {
      console.error("Failed to process admission:", err);
      toast({ title: "Error", description: "Failed to process admission.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allStudents, allClasses, allCategories, schoolList, allRegistrations] = await Promise.all([
          studentService.getAll(),
          classService.getAll(),
          getAllCategories(),
          schoolService.getAll(),
          registrationService.getAll()
        ]);

        const admittedStudents = allStudents.filter((s: Student) =>
            s.admission_status === 'admitted' && s.status !== 'active'
        );

        const pendingRegistrations = allRegistrations
          .filter(r => {
            const status = (r.status || '').toLowerCase();
            const pStatus = (r.payment_status || '').toLowerCase();
            return status === 'pending' && (pStatus === 'paid' || pStatus === 'partial');
          })
          .map(r => ({
            ...r,
            category_id: r.category,
            admission_status: 'pending',
            scores: r.scores || 0,
            registration_date: r.registration_date || (r as any).created_at
          }));

        setStudents([...admittedStudents, ...pendingRegistrations] as any[]);
        setClasses(allClasses);
        setCategories(allCategories);
        setSchools(schoolList);

        if (schoolList.length > 0 && !activeSchoolId) {
          setActiveSchoolId(schoolList[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getClassName = (classId: string | number | undefined): string => {
    if (!classId) return '—';
    const classItem = classes.find(c => String(c.id) === String(classId));
    return classItem ? classItem.name : '—';
  };

  const getSchoolName = (schoolId: string | number | undefined): string => {
    if (!schoolId) return '—';
    const school = schools.find(s => String(s.id) === String(schoolId));
    return school ? school.name : '—';
  };

  const handleExport = (schoolId: string | number) => {
    const selectedClassTab = activeClassTab[schoolId] || 'all';
    const filtered = students.filter((s: Student) => {
      const fullName = `${s.first_name} ${s.middle_name ?? ''} ${s.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesClass = selectedClassTab === 'all' || String(s.class_id) === selectedClassTab;
      const matchesSchool = String(s.school_id) === String(schoolId);
      const matchesCutoff = (s.scores ?? 0) >= cutoffScore;
      return matchesSearch && matchesClass && matchesSchool && matchesCutoff;
    });

    if (filtered.length === 0) {
      toast({ title: "Info", description: "No candidates matching induction parameters for export." });
      return;
    }

    const schoolName = getSchoolName(schoolId).replace(/\s+/g, '-');
    const className =
      selectedClassTab === 'all'
        ? 'AllClasses'
        : classes.find(c => String(c.id) === selectedClassTab)?.name.replace(/\s+/g, '-') || 'Class';

    const exportData = filtered.map((s) => ({
      Name: `${s.first_name} ${s.middle_name ?? ''} ${s.last_name}`,
      Score: `${s.scores}%`,
      Class: getClassName(s.class_id),
      Category: getCategoryName(s.category_id),
      Status: s.status,
      AdmissionStatus: s.admission_status,
      Gender: s.gender,
      DOB: s.dob,
      RegisteredOn: s.registration_date
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    XLSX.writeFile(workbook, `admitted-students-${schoolName}-${className}.xlsx`);
  };

  const printAdmittedList = (schoolId: string | number, classId: string, studentsList: Student[]) => {
    const admitted = studentsList.filter((s) =>
      String(s.school_id) === String(schoolId) &&
      (classId === 'all' || String(s.class_id) === classId) &&
      `${s.first_name} ${s.middle_name ?? ''} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (s.scores ?? 0) >= cutoffScore
    );

    const schoolName = getSchoolName(schoolId);
    const className = classId === 'all' ? 'All Classes' : getClassName(classId);

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    const tableRows = admitted.map((s) => `
      <tr>
        <td style="border:1px solid #e2e8f0;padding:12px;">${s.first_name} ${s.middle_name ?? ''} ${s.last_name}</td>
        <td style="border:1px solid #e2e8f0;padding:12px;">${getClassName(s.class_id)}</td>
        <td style="border:1px solid #e2e8f0;padding:12px;">${getCategoryName(s.category_id)}</td>
        <td style="border:1px solid #e2e8f0;padding:12px;text-align:center;">${s.scores}%</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
      <head>
        <title>Shortlisted Candidates - ${schoolName}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 32px; }
          h2 { margin: 0; color: #0f172a; }
          .meta { font-size: 14px; color: #64748b; margin-top: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { background: #f8fafc; text-align: left; padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
          td { border: 1px solid #e2e8f0; padding: 12px; font-size: 14px; }
          .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Shortlisted Candidates</h2>
          <div class="meta">${schoolName} • ${className} • Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Category</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">Confidential Academic Document • NWOMA Garrison SMS</div>
      </body>
      </html>
    `;

    printWindow.document.body.innerHTML = htmlContent;
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
  };

  const columns: DataTableColumn<Student>[] = [
    {
      key: 'name',
      header: 'Student Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">
                {row.first_name} {row.middle_name ? `${row.middle_name} ` : ''}{row.last_name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">ID: {String(row.id).substring(0,8).toUpperCase()}</span>
          </div>
        </div>
      )
    },
    {
      key: 'scores',
      header: 'Score',
      className: 'text-center w-[100px]',
      cell: (row) => (
        <div className="flex items-center justify-center gap-1.5">
           <Trophy className={cn("size-3.5", (row.scores ?? 0) >= 70 ? "text-amber-500" : "text-muted-foreground/40")} />
           <Badge variant={(row.scores ?? 0) >= 60 ? "secondary" : "outline"} className="font-mono text-xs px-2">
             {row.scores}%
           </Badge>
        </div>
      )
    },
    {
      key: 'class_id',
      header: 'Assigned Class',
      className: 'w-[150px]',
      cell: (row: any) => (
        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight bg-muted/30 border-muted-foreground/10 px-2 h-5">
          <GraduationCap className="size-3 mr-1 text-muted-foreground" />
          {row.class_id ? getClassName(row.class_id) : (row.class_applying_for || 'Pending')}
        </Badge>
      )
    },
    {
      key: 'category_id',
      header: 'Category',
      className: 'w-[140px]',
      cell: (row) => getCategoryBadge(row.category_id)
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[140px]',
      cell: (row) => {
        const isAdmitted = row.admission_status === 'admitted';
        return (
            <div className="flex items-center gap-2">
              <div className={cn("size-1.5 rounded-full",
                isAdmitted ? "bg-emerald-500" : "bg-blue-500"
              )} />
              <div className="flex flex-col">
                <span className={cn("text-[11px] font-bold uppercase tracking-tight",
                  isAdmitted ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                )}>
                  {isAdmitted ? 'Qualified' : 'New Applicant'}
                </span>
                <span className="text-[9px] text-muted-foreground leading-none">
                    {isAdmitted ? 'Passed Evaluation' : 'Registration Paid'}
                </span>
              </div>
            </div>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right pr-4 w-[160px]',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
           <Button
             variant={row.admission_status === 'pending' ? "default" : "outline"}
             size="sm"
             onClick={() => handleConfirmAdmission(row)}
             className={cn(
                "h-8 text-[10px] font-bold px-3 transition-all uppercase tracking-wider",
                row.admission_status === 'pending'
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
             )}
           >
             {row.admission_status === 'pending' ? 'Admit Now' : 'Enroll'}
           </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Student Management</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewProfile(row)} className="cursor-pointer">
                <User className="mr-2 size-4 text-primary" />
                <span className="font-medium">View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleConfirmAdmission(row)} className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30">
                <CheckCircle2 className="mr-2 size-4" />
                <span className="font-semibold">{row.admission_status === 'pending' ? 'Fast-Track Admission' : 'Finalize Enrollment'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStudentToRemove(row)} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 size-4" />
                <span className="font-medium">Remove Candidate</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
      <PageHeader
        title="Admission Candidates"
        description="Review and process applicants who have cleared the entrance evaluation phase."
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Assessments', href: '/assessments' }, { title: 'Shortlisted' }]}
        tabs={[
          { title: 'Intelligence Node', href: '/assessments' },
          { title: 'Results Registry', href: '/assessments/results' },
          { title: 'Qualified Registry', href: '/assessments/shortlisted' },
        ]}
      />

      <div className="flex flex-col gap-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 px-6">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <GraduationCap className="size-5 text-primary" />
                        Qualified Applicants
                    </CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">Final filtering and induction oversight</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search qualified roster..."
                            className="h-10 pl-9 rounded-xl border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Cutoff %</span>
                        <Separator orientation="vertical" className="h-4 mx-1" />
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={cutoffScore}
                            onChange={(e) => setCutoffScore(Number(e.target.value) || 0)}
                            className="w-12 h-6 border-none bg-transparent p-0 text-center font-bold text-sm focus-visible:ring-0 shadow-none"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-muted/10 px-6 py-1 border-y">
                    <Tabs
                        value={activeSchoolId}
                        onValueChange={(val) => {
                            setActiveSchoolId(val);
                        }}
                        className="w-full"
                    >
                        <TabsList className="h-12 p-0 bg-transparent gap-8 overflow-x-auto no-scrollbar flex justify-start border-none">
                            {schools.map((school) => (
                                <TabsTrigger
                                    key={school.id}
                                    value={school.id.toString()}
                                    className="px-0 py-3 rounded-none border-b-2 border-transparent font-bold text-[11px] uppercase tracking-wider text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent transition-all whitespace-nowrap"
                                >
                                    {school.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {loading ? (
                    <div className="p-24 text-center flex flex-col items-center gap-5">
                        <div className="p-4 rounded-full bg-primary/5 animate-pulse">
                            <RefreshCw className="size-10 animate-spin text-primary/40" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground">Syncing Database...</p>
                            <p className="text-xs text-muted-foreground">Retrieving latest shortlisted records from the garrison network</p>
                        </div>
                    </div>
                ) : (
                    schools.map((school) => {
                        if (activeSchoolId !== school.id.toString()) return null;

                        const selectedClassTab = activeClassTab[school.id] || 'all';
                        const schoolClasses = classes.filter((cls) => String(cls.school_id) === String(school.id));

                        const currentFilteredStudents = students.filter((s: Student) =>
                            String(s.school_id) === String(school.id) &&
                            (selectedClassTab === 'all' || String(s.class_id) === selectedClassTab) &&
                            `${s.first_name} ${s.middle_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
                            (s.scores ?? 0) >= cutoffScore
                        );

                        return (
                            <div key={school.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="p-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-muted/20 p-4 rounded-xl border border-border/40">
                                        <Tabs
                                            value={selectedClassTab}
                                            onValueChange={(val) => setActiveClassTab((prev) => ({ ...prev, [school.id]: val }))}
                                            className="w-full sm:w-auto"
                                        >
                                            <TabsList className="bg-background/50 border h-9 p-1 rounded-lg">
                                                <TabsTrigger value="all" className="px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wide">All Units</TabsTrigger>
                                                {schoolClasses.map((c) => (
                                                    <TabsTrigger key={c.id} value={c.id.toString()} className="px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wide">{c.name}</TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </Tabs>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            {currentFilteredStudents.length > 0 && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (confirm(`Are you sure you want to process admission for all ${currentFilteredStudents.length} candidates?`)) {
                                                            try {
                                                                await Promise.all(currentFilteredStudents.map(s => handleConfirmAdmission(s)));
                                                                toast({ title: "Success", description: "All candidates processed successfully." });
                                                            } catch (err) {
                                                                toast({ title: "Partial failure", description: "Some records could not be processed.", variant: "destructive" });
                                                            }
                                                        }
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 font-bold text-xs"
                                                >
                                                    <CheckCircle2 className="size-4 mr-2" />
                                                    Bulk Admit
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => printAdmittedList(school.id, selectedClassTab, students)}
                                                className="h-9 px-3"
                                                title="Print List"
                                            >
                                                <Printer className="size-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExport(school.id)}
                                                className="h-9 px-4 font-bold text-xs"
                                            >
                                                <Download className="mr-2 h-4 w-4" /> Export
                                            </Button>
                                        </div>
                                    </div>

                                    <DataTable
                                        data={currentFilteredStudents as any[]}
                                        columns={columns as any}
                                        loading={loading}
                                        rowKey="id"
                                        emptyMessage="No candidates matching the current criteria were found for this unit."
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
          </Card>
      </div>

          <Dialog open={showProfile} onOpenChange={setShowProfile}>
            <DialogContent className="max-w-2xl sm:rounded-2xl">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border-4 border-background">
                        {selectedStudent?.first_name[0]}{selectedStudent?.last_name[0]}
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold">{selectedStudent?.first_name} {selectedStudent?.last_name}</DialogTitle>
                        <DialogDescription className="text-xs font-mono uppercase tracking-tight">Student Intelligence Profile</DialogDescription>
                    </div>
                </div>
              </DialogHeader>
              <Separator />
              {selectedStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
                  <ProfileItem icon={User} label="Full Identity" value={`${selectedStudent.first_name} ${selectedStudent.middle_name ?? ''} ${selectedStudent.last_name}`} />
                  <ProfileItem icon={Calendar} label="Date of Birth" value={selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                  <ProfileItem icon={User} label="Gender" value={selectedStudent.gender || '—'} />
                  <ProfileItem icon={Trophy} label="Assessment Score" value={`${selectedStudent.scores ?? 0}%`} highlight={ (selectedStudent.scores ?? 0) >= 70 } />
                  <ProfileItem icon={Building2} label="Institutional School" value={getSchoolName(selectedStudent.school_id)} />
                  <ProfileItem icon={GraduationCap} label="Assigned Level" value={getClassName(selectedStudent.class_id)} />
                  <ProfileItem icon={Filter} label="Fee Category" value={getCategoryName(selectedStudent.category_id)} />
                  <ProfileItem icon={Calendar} label="Registration Date" value={selectedStudent.registration_date ? new Date(selectedStudent.registration_date).toLocaleDateString() : '—'} />
                </div>
              )}
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
            <AlertDialogContent className="sm:rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Purge Candidate Record?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This will permanently remove <strong className="text-foreground">{studentToRemove?.first_name} {studentToRemove?.last_name}</strong> from the shortlist database. This action is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (!studentToRemove) return;
                    try {
                      await studentService.remove(String(studentToRemove.id));
                      setStudents(prev => prev.filter(s => s.id !== studentToRemove.id));
                      setStudentToRemove(null);
                      toast({ title: "Purged", description: "Record successfully removed." });
                    } catch (err) {
                      console.error("Failed to remove student:", err);
                      toast({ title: "Error", description: "Failed to remove student record.", variant: "destructive" });
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                >
                  Confirm Removal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value, highlight = false }: { icon: any, label: string, value: string | number, highlight?: boolean }) {
    return (
        <div className="flex items-start gap-3 group">
            <div className="mt-1 p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{label}</p>
                <p className={cn("text-sm font-semibold", highlight ? "text-primary" : "text-foreground")}>{value || '—'}</p>
            </div>
        </div>
    );
}

