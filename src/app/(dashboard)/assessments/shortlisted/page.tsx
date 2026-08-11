/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';
import { PageHeader } from '@/components/layout/page-header';

import { useEffect, useState } from 'react';
import {
  Search,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { motion } from 'framer-motion';
import { Printer, User, Filter, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import studentService from '@/services/students';
import classService, { type ClassData } from '@/services/class';
import { type School } from '@/types/school';
import schoolService from '@/services/schools';
import { type Category, getAllCategories } from '@/services/categories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Student } from '@/types/student';


export default function ShortlistedPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSchoolId, setActiveSchoolId] = useState<string>(''); // school ID as string
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [cutoffScore, setCutoffScore] = useState<number>(60);
  const [activeClassTab, setActiveClassTab] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return '—';
    const category = categories.find(c => String(c.id) === String(categoryId));
    return category ? category.name : 'Unknown';
  };

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const handleConfirmAdmission = async (student: Student) => {
    try {
      await studentService.updatePartial(student.id, { status: 'active' });
      setStudents(prev => prev.filter(s => s.id !== student.id));
      toast({ title: "Admission confirmed successfully." });
    } catch (err) {
      console.error("Failed to confirm admission:", err);
      toast({ title: "Failed to confirm admission.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allStudents, allClasses, allCategories, schoolList] = await Promise.all([
          studentService.getAll(),
          classService.getAll(),
          getAllCategories(),
          schoolService.getAll()
        ]);

        // Filter: only show candidates who are admitted but NOT yet fully active
        const shortlisted = allStudents.filter((s: Student) =>
            s.admission_status === 'admitted' && s.status !== 'active'
        );

        setStudents(shortlisted);
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
  }, []); // Remove activeSchoolId dependency to prevent infinite re-fetch on school switch

  const getClassName = (classId: string | number | undefined): string => {
    if (!classId) return '—';
    const classItem = classes.find(c => String(c.id) === String(classId));
    return classItem ? `${classItem.name} ` : '—';
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
      toast({ title: "No candidates matching induction parameters for export." });
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

    XLSX.writeFile(workbook, `students-${schoolName}-${className}.xlsx`);
  };

  const printAdmittedList = (schoolId: string | number, classId: string, studentsList: Student[]) => {
    const admitted = studentsList.filter((s) =>
      String(s.school_id) === String(schoolId) &&
      (classId === 'all' || String(s.class_id) === classId) &&
      `${s.first_name} ${s.middle_name ?? ''} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (s.scores ?? 0) >= cutoffScore
    );

    const schoolName = getSchoolName(schoolId);
    const className = classId === 'all' ? 'All Classes' : getClassName(Number(classId));

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    const tableRows = admitted.map((s) => `
      <tr>
        <td style="border:1px solid #ccc;padding:8px;">${s.first_name} ${s.middle_name ?? ''} ${s.last_name}</td>
        <td style="border:1px solid #ccc;padding:8px;">${getClassName(s.class_id)}</td>
        <td style="border:1px solid #ccc;padding:8px;">${getCategoryName(s.category_id)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
      <head>
        <title>Admitted Students</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h2>Admitted Students - ${schoolName} (${className})</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.body.innerHTML = htmlContent;
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const columns: DataTableColumn<Student>[] = [
    {
      key: 'name',
      header: 'Identity',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-[10px]">
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div>
            <div className="font-bold text-sm">{row.first_name} {row.middle_name ?? ''} {row.last_name}</div>
            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">ID: {String(row.id).substring(0,8).toUpperCase()}</div>
          </div>
        </div>
      )
    },
    {
      key: 'scores',
      header: 'Score',
      className: 'text-center',
      cell: (row) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.scores}%
        </Badge>
      )
    },
    {
      key: 'class_id',
      header: 'Class',
      cell: (row) => (
        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-none bg-muted/50 px-3 py-1">
          {getClassName(row.class_id)}
        </Badge>
      )
    },
    {
      key: 'category_id',
      header: 'Category',
      cell: (row) => (
        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-none bg-primary/5 text-primary px-3 py-1">
          {getCategoryName(row.category_id)}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className={cn("size-2 rounded-full", row.status === 'inactive' ? "bg-amber-500" : "bg-emerald-500")} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{row.status}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right pr-6',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/5">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Operations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewProfile(row)} className="rounded-xl h-11 font-bold">
              <User className="mr-3 size-4 text-primary" /> View Intelligence
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleConfirmAdmission(row)} className="rounded-xl h-11 font-bold text-emerald-600 focus:text-emerald-600">
              <CheckCircle2 className="mr-3 size-4" /> Confirm Admission
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStudentToRemove(row)} className="rounded-xl h-11 font-bold text-destructive focus:text-destructive">
              <Trash2 className="mr-3 size-4" /> Remove Registry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
      <PageHeader
        title="Admitted Applicants"
        description="Students who have passed placement and been admitted to the network nodes."
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Assessments', href: '/assessments' }, { title: 'Admitted' }]}
        tabs={[
          { title: 'Overview', href: '/assessments' },
          { title: 'Results & Placement', href: '/assessments/results' },
          { title: 'Admitted Students', href: '/assessments/shortlisted' },
        ]}
      />

      <div className="flex flex-col gap-8">
          {/* Dashboard Intelligence Filter */}
          <Card className="border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-muted/20 border-b py-8 px-6 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-black tracking-tight uppercase tracking-wider">Candidate Intelligence</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60 opacity-60">Strategic filtering for induction oversight</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">
                            <Search className="h-4 w-4" />
                        </span>
                        <Input
                            placeholder="Identify by name..."
                            className="h-12 pl-12 rounded-2xl bg-background border-none shadow-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 bg-background p-1.5 rounded-2xl border border-muted-foreground/5 shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3">Cutoff</span>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={cutoffScore}
                            onChange={(e) => setCutoffScore(Number(e.target.value) || 0)}
                            className="w-16 h-9 border-none bg-muted/30 text-center font-black rounded-xl"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-muted/10 p-2 border-b">
                    <Tabs
                        value={activeSchoolId}
                        onValueChange={(val) => {
                            setActiveSchoolId(val);
                            setSelectedClassId('all');
                        }}
                        className="w-full"
                    >
                        <TabsList className="h-auto p-1 bg-transparent gap-1 overflow-x-auto no-scrollbar flex justify-start">
                            {schools.map((school) => (
                                <TabsTrigger
                                    key={school.id}
                                    value={school.id.toString()}
                                    className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap"
                                >
                                    {school.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <RefreshCw className="size-8 animate-spin text-primary/20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Registry...</p>
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
                                <div className="p-6 sm:p-10 space-y-8">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <Tabs
                                            value={selectedClassTab}
                                            onValueChange={(val) => setActiveClassTab((prev) => ({ ...prev, [school.id]: val }))}
                                            className="w-full sm:w-auto"
                                        >
                                            <TabsList className="bg-muted/30 border h-auto p-1 rounded-2xl flex-wrap">
                                                <TabsTrigger value="all" className="px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest">Global Units</TabsTrigger>
                                                {schoolClasses.map((c) => (
                                                    <TabsTrigger key={c.id} value={c.id.toString()} className="px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest">{c.name}</TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </Tabs>

                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {currentFilteredStudents.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={async () => {
                                                        if (confirm(`Are you sure you want to confirm admission for all ${currentFilteredStudents.length} candidates?`)) {
                                                            try {
                                                                await Promise.all(currentFilteredStudents.map(s => studentService.updatePartial(s.id, { status: 'active' })));
                                                                const confirmedIds = currentFilteredStudents.map(s => s.id);
                                                                setStudents(prev => prev.filter(s => !confirmedIds.includes(s.id)));
                                                                toast({ title: "All admissions confirmed successfully." });
                                                            } catch (err) {
                                                                toast({ title: "Partial confirmation failure.", variant: "destructive" });
                                                            }
                                                        }
                                                    }}
                                                    className="h-12 rounded-2xl border-none bg-emerald-500/10 text-emerald-600 font-black uppercase tracking-widest text-[9px] px-6 hover:bg-emerald-500 hover:text-white transition-all flex-1 sm:flex-none"
                                                >
                                                    Confirm All
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={() => printAdmittedList(school.id, selectedClassTab, students)}
                                                className="h-12 w-12 rounded-2xl border-none bg-muted/50 hover:bg-primary/5 p-0"
                                            >
                                                <Printer className="size-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleExport(school.id)}
                                                className="h-12 rounded-2xl border-none bg-muted/50 hover:bg-primary/5 font-black uppercase tracking-widest text-[9px] px-6 flex-1 sm:flex-none"
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
                                        emptyMessage="No candidates matching induction parameters found for this unit."
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Student Profile</DialogTitle>
              </DialogHeader>
              {selectedStudent && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {selectedStudent.first_name} {selectedStudent.middle_name ?? ''} {selectedStudent.last_name}</div>
                  <div><strong>DOB:</strong> {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : '—'}</div>
                  <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                  <div><strong>Scores:</strong> {selectedStudent.scores}%</div>
                  <div><strong>Admission Status:</strong> {selectedStudent.admission_status}</div>
                  <div><strong>Status:</strong> {selectedStudent.status}</div>
                  <div><strong>Class:</strong> {getClassName(selectedStudent.class_id)}</div>
                  <div><strong>School:</strong> {getSchoolName(selectedStudent.school_id)}</div>
                  <div><strong>Category:</strong> {getCategoryName(selectedStudent.category_id)}</div>
                  <div><strong>Registered On:</strong> {selectedStudent.registration_date ? new Date(selectedStudent.registration_date).toLocaleDateString() : '—'}</div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to remove <strong>{studentToRemove?.first_name} {studentToRemove?.last_name}</strong> from the list. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (!studentToRemove) return;
                    try {
                      await studentService.remove(String(studentToRemove.id));
                      setStudents(prev => prev.filter(s => s.id !== studentToRemove.id)); // 👈 Update list
                      setStudentToRemove(null);
                    } catch (err) {
                      console.error("Failed to remove student:", err);
                    }
                  }}
                >
                  Confirm Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    </div>
  );
}
