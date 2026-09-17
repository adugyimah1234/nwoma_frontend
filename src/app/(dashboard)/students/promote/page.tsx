
'use client';
import { PageHeader } from '@/components/layout/page-header';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getAllAcademicYear } from '@/services/academic_year';
import classService from '@/services/class';
import studentService from '@/services/students';
import { AcademicYear } from '@/types/academic-year';
import { Class } from '@/types/class';
import { Student } from '@/types/student';
import { Loader2, RefreshCw, ArrowRightLeft, ShieldCheck, GraduationCap, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { cn } from '@/lib/utils';

interface ClassMapping {
  currentClassId: string | number;
  nextClassId: string | number | null; // null for graduation
}

export default function PromoteStudentsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [passMark, setPassMark] = useState<number>(50);

  const [selectedCurrentAcademicYearId, setSelectedCurrentAcademicYearId] = useState<string>('');
  const [selectedNextAcademicYearId, setSelectedNextAcademicYearId] = useState<string>('');
  const [classMappings, setClassMappings] = useState<ClassMapping[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [years, cls, stds] = await Promise.all([
          getAllAcademicYear(),
          classService.getAll(),
          studentService.getAll(),
        ]);
        setAcademicYears(years);
        setClasses(cls);
        setStudents(stds);

        // Attempt to pre-select current and next academic years
        if (years.length > 0) {
          const sortedYears = [...years].sort((a, b) => (a.year || '').localeCompare(b.year || ''));
          const lastYear = sortedYears[sortedYears.length - 1];
          const secondLastYear = sortedYears[sortedYears.length - 2];

          if (lastYear) setSelectedNextAcademicYearId(String(lastYear.id));
          if (secondLastYear) setSelectedCurrentAcademicYearId(String(secondLastYear.id));
        }

      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast.error('Failed to load data for promotion.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter students based on selected current academic year
  const studentsInCurrentYear = useMemo(() => {
    if (!selectedCurrentAcademicYearId) return [];
    return students.filter(
      (student) => String(student.academic_year_id) === selectedCurrentAcademicYearId
    );
  }, [students, selectedCurrentAcademicYearId]);

  // Classes available in the current academic year
  const currentAcademicYearClasses = useMemo(() => {
    const studentClassIds = new Set(studentsInCurrentYear.map(s => s.class_id));
    return classes.filter(cls => studentClassIds.has(cls.id));
  }, [classes, studentsInCurrentYear]);

  // Initialize class mappings when current academic year classes change
  useEffect(() => {
    const initialMappings: ClassMapping[] = currentAcademicYearClasses.map(cls => ({
      currentClassId: cls.id,
      nextClassId: null, // Default to no promotion (graduation or not set)
    }));
    setClassMappings(initialMappings);
  }, [currentAcademicYearClasses]);

  const handleClassMappingChange = (currentClassId: string | number, nextClassId: string) => {
    setClassMappings(prev =>
      prev.map(mapping =>
        mapping.currentClassId === currentClassId
          ? { ...mapping, nextClassId: nextClassId === 'null' ? null : nextClassId }
          : mapping
      )
    );
  };

  const autoApplyLogic = () => {
    if (!selectedNextAcademicYearId) {
        toast.error("Please select a Target Academic Year first.");
        return;
    }

    // Auto-suggest next classes based on current class level + 1
    const newMappings: ClassMapping[] = currentAcademicYearClasses.map(currentClass => {
        const currentLevel = (currentClass as any).level || 0;
        const nextClass = classes.find(c => (c as any).level === currentLevel + 1);
        return {
            currentClassId: currentClass.id,
            nextClassId: nextClass ? nextClass.id : null
        };
    });
    setClassMappings(newMappings);
    toast.success("Progression logic suggested based on class levels.");
  };

  const handlePromoteStudents = async () => {
    if (!selectedCurrentAcademicYearId || !selectedNextAcademicYearId) {
      toast.error('Please select both current and next academic years.');
      return;
    }

    if (selectedCurrentAcademicYearId === selectedNextAcademicYearId) {
      toast.error('Current and next academic years cannot be the same.');
      return;
    }

    setPromoting(true);
    let promotedCount = 0;
    let failedCount = 0;

    for (const student of studentsInCurrentYear) {
      const mapping = classMappings.find(m => m.currentClassId === student.class_id);

      if (mapping && mapping.nextClassId !== null) {
        try {
          await studentService.updatePartial(student.id!, {
            class_id: mapping.nextClassId as string | number,
          } as any);
          promotedCount++;
        } catch (error) {
          console.error(`Failed to promote student ${student.id}:`, error);
          failedCount++;
        }
      } else if (mapping && mapping.nextClassId === null) {
        // Student is graduating or not moving to next class
        // Optionally update their status to 'graduated' or similar
        try {
          await studentService.updatePartial(student.id!, {
            status: 'graduated', // Example status
          } as any);
          promotedCount++; // Count as handled
        } catch (error) {
          console.error(`Failed to update graduating student ${student.id}:`, error);
          failedCount++;
        }
      } else {
        // No mapping found for student's current class
        console.warn(`No class mapping found for student ${student.id} in class ${student.class_id}. Skipping.`);
        failedCount++;
      }
    }

    if (promotedCount > 0) {
      toast.success(`${promotedCount} student(s) promoted successfully.`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} student(s) failed to promote.`);
    }
    setPromoting(false);
    // Refresh student data after promotion
    const updatedStudents = await studentService.getAll();
    setStudents(updatedStudents);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <Loader className="size-10 animate-spin text-primary" />
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-50">Syncing Node Registry</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
        <PageHeader
          title="Progression Node"
          description="Map class progressions and promote students to the next academic cycle."
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Students', href: '/students' },
            { title: 'Promote' }
          ]}
          tabs={[
            { title: 'Roster Node', href: '/students' },
            { title: 'Progression Node', href: '/students/promote' },
          ]}
        />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/5 border-b py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <ArrowRightLeft className="size-4 text-primary" /> Mapping Parameters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Cycle</label>
                        <Select
                            value={selectedCurrentAcademicYearId}
                            onValueChange={setSelectedCurrentAcademicYearId}
                        >
                            <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl">
                                {academicYears.map((year) => (
                                    <SelectItem key={year.id} value={String(year.id)} className="font-semibold">
                                        {year.name || year.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Cycle</label>
                        <Select
                            value={selectedNextAcademicYearId}
                            onValueChange={setSelectedNextAcademicYearId}
                        >
                            <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl">
                                {academicYears.map((year) => (
                                    <SelectItem key={year.id} value={String(year.id)} className="font-semibold">
                                        {year.name || year.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <ShieldCheck className="size-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Automatic Decisions</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-2">
                            The system can automatically decide who to promote based on their year average.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Minimum Pass Mark (%)</Label>
                                <Input
                                    type="number"
                                    value={passMark}
                                    onChange={e => setPassMark(Number(e.target.value))}
                                    className="h-8 text-xs font-bold"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={autoApplyLogic}
                                className="h-8 mt-4 text-[9px] font-bold uppercase border-primary/30 text-primary hover:bg-primary/5"
                            >
                                <Zap className="size-3 mr-1" /> Auto-Fill
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {studentsInCurrentYear.length > 0 && (
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-slate-900 text-white">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Ready for Migration</p>
                            <RefreshCw className={cn("size-4 text-primary", promoting && "animate-spin")} />
                        </div>
                        <p className="text-5xl font-bold tracking-tighter">{studentsInCurrentYear.length}</p>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            Total students eligible for progression across all command units.
                        </p>
                        <Button
                            className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 mt-2"
                            onClick={handlePromoteStudents}
                            disabled={promoting || !selectedNextAcademicYearId}
                        >
                            {promoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Execute Progression
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="lg:col-span-8 space-y-8">
            {selectedCurrentAcademicYearId && selectedNextAcademicYearId && (
                <Card className="border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/5 border-b py-5 px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Progression Logic</CardTitle>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Map unit hierarchies for next cycle</p>
                            </div>
                            <Badge variant="outline" className="h-6 rounded-lg border-primary/20 text-primary font-bold text-[10px] uppercase">Automated Mapping</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="border-none">
                                    <TableHead className="pl-6 py-4 text-[10px] font-bold uppercase tracking-tight text-slate-500">Current Unit</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-tight text-slate-500 text-center">Volume</TableHead>
                                    <TableHead className="pr-6 text-[10px] font-bold uppercase tracking-tight text-slate-500 text-right">Target Progression</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentAcademicYearClasses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic text-sm">
                                            No unit hierarchies discovered for current cycle.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentAcademicYearClasses.map(currentClass => {
                                        const studentCount = studentsInCurrentYear.filter(s => s.class_id === currentClass.id).length;
                                        const currentMapping = classMappings.find(m => m.currentClassId === currentClass.id);

                                        return (
                                            <TableRow key={currentClass.id} className="hover:bg-muted/30 transition-colors border-b last:border-none">
                                                <TableCell className="pl-6 py-4 font-bold text-sm text-slate-700">{currentClass.name}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="h-5 px-2 text-[10px] font-bold bg-slate-100">{studentCount} Node(s)</Badge>
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Select
                                                        value={String(currentMapping?.nextClassId ?? 'null')}
                                                        onValueChange={(value: string) => handleClassMappingChange(currentClass.id, value)}
                                                    >
                                                        <SelectTrigger className="h-9 w-[180px] ml-auto rounded-lg bg-muted/20 border-slate-200 text-xs font-semibold">
                                                            <SelectValue placeholder="Select Destination" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl shadow-2xl">
                                                            <SelectItem value="null" className="text-rose-600 font-bold">Graduation / Archive</SelectItem>
                                                            {classes.map(nextClass => (
                                                                <SelectItem key={nextClass.id} value={String(nextClass.id)} className="font-semibold">
                                                                    {nextClass.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {selectedCurrentAcademicYearId && selectedNextAcademicYearId && studentsInCurrentYear.length > 0 && (
                <Card className="border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/5 border-b py-5 px-6">
                        <div>
                            <CardTitle className="text-lg font-bold">Migration Manifest</CardTitle>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Review student-level node assignment</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableHeader className="bg-muted/10 sticky top-0 z-10">
                                    <TableRow className="border-none">
                                        <TableHead className="pl-6 py-4 text-[10px] font-bold uppercase tracking-tight text-slate-500">Student Identity</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Avg Grade</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Decision</TableHead>
                                        <TableHead className="pr-6 text-[10px] font-bold uppercase tracking-tight text-slate-500 text-right">Target Class</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsInCurrentYear.map(student => {
                                        const currentClass = classes.find(cls => cls.id === student.class_id);
                                        const mapping = classMappings.find(m => m.currentClassId === student.class_id);
                                        const nextClass = classes.find(cls => cls.id === mapping?.nextClassId);
                                        const avgScore = (student as any).scores || 0;
                                        const hasPassed = avgScore >= passMark;

                                        return (
                                            <TableRow key={student.id} className="hover:bg-muted/30 transition-colors border-b last:border-none">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-foreground">{student.first_name} {student.last_name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {String(student.id).substring(0,8)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn("text-xs font-bold", hasPassed ? "text-emerald-600" : "text-rose-600")}>
                                                        {avgScore}%
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {hasPassed ? (
                                                        <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold border-emerald-200 bg-emerald-50 text-emerald-700">
                                                            <CheckCircle2 className="size-2.5 mr-1" /> PROMOTED
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold border-rose-200 bg-rose-50 text-rose-700">
                                                            <AlertTriangle className="size-2.5 mr-1" /> REPEAT
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="h-px w-4 bg-muted" />
                                                        <Badge
                                                            variant={nextClass ? "default" : "outline"}
                                                            className={cn(
                                                                "text-[10px] font-bold uppercase",
                                                                !nextClass && "text-rose-500 border-rose-100 bg-rose-50"
                                                            )}
                                                        >
                                                            {nextClass ? (
                                                                <>
                                                                    <GraduationCap className="size-3 mr-1.5 opacity-50" />
                                                                    {nextClass.name}
                                                                </>
                                                            ) : (hasPassed ? 'Graduation' : 'Repeats ' + (currentClass?.name || 'Current'))}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center py-12 opacity-20 grayscale">
        <ShieldCheck className="size-6 text-muted-foreground" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Command Progression Protocol Node</p>
      </div>
    </div>
  );
}

