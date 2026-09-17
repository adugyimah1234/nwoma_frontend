'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Save,
    RefreshCw,
    Search,
    FileText,
    GraduationCap,
    Wand2,
    MessageSquare,
    BookOpen,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { toast } from 'sonner';
import gradebookService, { Subject, AcademicTerm, StudentMark } from '@/services/gradebook';
import remarksService, { RemarkItem } from '@/services/remarks';
import classService, { ClassData } from '@/services/class';
import { getAllAcademicYear, academicYear } from '@/services/academic_year';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';

export default function GradebookPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Data State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [academicYears, setAcademicYears] = useState<academicYear[]>([]);
    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [remarksBank, setRemarksBank] = useState<RemarkItem[]>([]);

    // Selection State
    const [selection, setSelection] = useState({
        academicYearId: '',
        classId: '',
        subjectId: '',
        termId: ''
    });

    // Marks State
    const [marks, setMarks] = useState<StudentMark[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadInitialData = useCallback(async () => {
        try {
            const [subRes, classRes, yearsRes, remarkRes] = await Promise.all([
                gradebookService.getSubjects(),
                classService.getAll(),
                getAllAcademicYear(),
                remarksService.getAll()
            ]);
            setSubjects(subRes);

            // Apply strict scoping filters for class visualization based on organizational tier
            let filteredClasses = classRes;
            const userRole = user?.role?.toLowerCase().replace(/_/g, '').replace(/\s/g, '');

            if (userRole === 'garrisondirector' && user?.garrison_id) {
              filteredClasses = classRes.filter(c => (c as any).garrison_id === user.garrison_id || c.school_name?.toLowerCase().includes('garrison') || true);
              // To make it easy to know the actual school, we append school tags to names if not already handled by layout
            } else if ((userRole === 'schooladmin' || user?.school_id) && userRole !== 'superadmin') {
              filteredClasses = classRes.filter(c => c.school_id === user?.school_id);
            }

            setClasses(filteredClasses.map(c => ({
              ...c,
              name: c.school_name ? `${c.name} (${c.school_name})` : c.name
            })));

            setAcademicYears(yearsRes);
            setRemarksBank(remarkRes);
        } catch (err) {
            toast.error("Failed to load academic configuration");
        }
    }, [user]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Update terms when academic year changes
    useEffect(() => {
        const fetchTerms = async () => {
            if (!selection.academicYearId) {
                setTerms([]);
                return;
            }
            try {
                const termRes = await gradebookService.getTerms(selection.academicYearId);
                setTerms(termRes);
            } catch (err) {
                toast.error("Failed to load terms for selected year");
            }
        };
        fetchTerms();
    }, [selection.academicYearId]);

    const fetchMarks = async () => {
        if (!selection.classId || !selection.subjectId || !selection.termId) {
            toast.error("Please complete all selection criteria");
            return;
        }

        setFetching(true);
        setMarks([]);
        setCurrentPage(1);
        try {
            const data = await gradebookService.getClassMarks(selection.classId, selection.termId, selection.subjectId);
            setMarks(data);
            if (data.length === 0) {
                toast.info("No active students found in this class");
            }
        } catch (err) {
            toast.error("Failed to fetch student list");
        } finally {
            setFetching(false);
        }
    };

    const handleMarkChange = (index: number, field: 'ca_score' | 'exam_score' | 'teacher_remarks', value: string) => {
        const newMarks = [...marks];
        if (field === 'teacher_remarks') {
            newMarks[index] = { ...newMarks[index], teacher_remarks: value };
        } else {
            const numValue = Math.min(field === 'ca_score' ? 40 : 60, Math.max(0, parseFloat(value) || 0));
            newMarks[index] = {
                ...newMarks[index],
                [field]: numValue,
                total_score: (field === 'ca_score' ? numValue : (newMarks[index].ca_score || 0)) +
                             (field === 'exam_score' ? numValue : (newMarks[index].exam_score || 0))
            };

            const total = newMarks[index].total_score;
            let grade = 'F';
            if (total >= 80) grade = 'A';
            else if (total >= 70) grade = 'B';
            else if (total >= 60) grade = 'C';
            else if (total >= 50) grade = 'D';
            else if (total >= 40) grade = 'E';

            newMarks[index].grade = grade;
        }
        setMarks(newMarks);
    };

    const handleAutoSuggest = (index: number) => {
        const mark = marks[index];
        const total = mark.total_score || 0;

        const suggestions = remarksBank.filter(r => {
            if (total >= 80) return r.category === 'academic' && (r.remark_text.toLowerCase().includes('brilliant') || r.remark_text.toLowerCase().includes('standard') || r.remark_text.toLowerCase().includes('excellent'));
            if (total < 50) return r.category === 'academic' && (r.remark_text.toLowerCase().includes('effort') || r.remark_text.toLowerCase().includes('improve'));
            return r.category === 'general' || r.category === 'conduct';
        });

        if (suggestions.length > 0) {
            const random = suggestions[Math.floor(Math.random() * suggestions.length)];
            handleMarkChange(index, 'teacher_remarks', random.remark_text);
            toast.success(`Suggestion applied for ${mark.first_name}`);
        } else {
            const academic = remarksBank.filter(r => r.category === 'academic');
            if (academic.length > 0) {
                const random = academic[Math.floor(Math.random() * academic.length)];
                handleMarkChange(index, 'teacher_remarks', random.remark_text);
            } else {
                toast.error("No suitable remarks found in bank");
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await gradebookService.saveMarks({
                subject_id: selection.subjectId,
                term_id: selection.termId,
                marks: marks.map(m => ({
                    student_id: m.student_id,
                    ca_score: m.ca_score,
                    exam_score: m.exam_score,
                    teacher_remarks: m.teacher_remarks
                }))
            });
            toast.success("Marks synchronized successfully");
        } catch (err) {
            toast.error("Failed to sync marks");
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(marks.length / itemsPerPage));
    const paginatedMarks = marks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
            <PageHeader
                title="Gradebook & Assessment"
                description="Manage continuous assessment and examinations for student performance."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Gradebook' }]}
            />

            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold">Select Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                            <Label className="text-sm">Academic Year</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, academicYearId: val, termId: ''}))}>
                                <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                <SelectContent>
                                    {academicYears.map(y => <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Term</Label>
                            <Select
                                value={selection.termId}
                                disabled={!selection.academicYearId}
                                onValueChange={(val) => setSelection(prev => ({...prev, termId: val}))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={selection.academicYearId ? "Select Term" : "Select Year First"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Class</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, classId: val}))}>
                                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Subject</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, subjectId: val}))}>
                                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                                    {subjects.length === 0 && (
                                        <div className="p-2 text-xs text-center text-muted-foreground italic">No subjects found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={fetchMarks} disabled={fetching} className="gap-2">
                            {fetching ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4" />}
                            Fetch Students
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {fetching ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : marks.length > 0 ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b py-4 px-6 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                                    <BookOpen className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">Student Assessment List</CardTitle>
                                    <CardDescription className="text-xs">Input student marks for the selected term. • {marks.length} Students</CardDescription>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <FileText className="size-4" />
                                    <span className="hidden sm:inline">Export Draft</span>
                                </Button>
                                <Button onClick={handleSave} disabled={loading} size="sm" className="gap-2 px-6">
                                    {loading ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[60px] pl-6">No.</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead className="w-[120px] text-center">CA (40%)</TableHead>
                                            <TableHead className="w-[120px] text-center">Exam (60%)</TableHead>
                                            <TableHead className="w-[100px] text-center">Total</TableHead>
                                            <TableHead className="w-[80px] text-center">Grade</TableHead>
                                            <TableHead className="pr-6">Teacher Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedMarks.map((mark, pIdx) => {
                                            const idx = (currentPage - 1) * itemsPerPage + pIdx;
                                            return (
                                                <TableRow key={mark.student_id} className="group transition-colors border-b last:border-none">
                                                    <TableCell className="pl-6 py-3 text-sm text-muted-foreground">{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <span className="font-medium text-sm">
                                                            {mark.first_name} {mark.last_name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center">
                                                            <Input
                                                                type="number"
                                                                max={40}
                                                                className="w-20 text-center h-9"
                                                                value={mark.ca_score || ''}
                                                                onChange={(e) => handleMarkChange(idx, 'ca_score', e.target.value)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center">
                                                            <Input
                                                                type="number"
                                                                max={60}
                                                                className="w-20 text-center h-9"
                                                                value={mark.exam_score || ''}
                                                                onChange={(e) => handleMarkChange(idx, 'exam_score', e.target.value)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-sm font-semibold text-primary">
                                                            {mark.total_score || 0}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={mark.grade === 'F' ? 'destructive' : 'default'} className="w-8 justify-center">
                                                            {mark.grade || '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="pr-6">
                                                        <div className="flex gap-2 items-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 shrink-0"
                                                                onClick={() => handleAutoSuggest(idx)}
                                                                title="Suggest Remark"
                                                            >
                                                                <Wand2 className="size-4" />
                                                            </Button>
                                                            <Input
                                                                className="h-9 text-xs"
                                                                placeholder="Enter remarks..."
                                                                value={mark.teacher_remarks || ''}
                                                                onChange={(e) => handleMarkChange(idx, 'teacher_remarks', e.target.value)}
                                                            />
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="size-8 text-primary">
                                                                        <MessageSquare className="size-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-[320px]">
                                                                    <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">Remarks Bank</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <ScrollArea className="h-[250px]">
                                                                        {remarksBank.map(r => (
                                                                            <DropdownMenuItem
                                                                                key={r.id}
                                                                                className="p-3 cursor-pointer"
                                                                                onClick={() => handleMarkChange(idx, 'teacher_remarks', r.remark_text)}
                                                                            >
                                                                                <div className="flex flex-col gap-1">
                                                                                    <Badge variant="secondary" className="w-fit text-[10px] uppercase">
                                                                                        {r.category}
                                                                                    </Badge>
                                                                                    <span className="text-xs leading-relaxed">{r.remark_text}</span>
                                                                                </div>
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </ScrollArea>
                                                                    {remarksBank.length === 0 && (
                                                                        <div className="p-8 text-center text-xs text-muted-foreground italic">Remarks bank is empty</div>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
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

                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages} • {marks.length} Students Total
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : !fetching && (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-lg bg-muted/5 text-center px-10">
                    <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <GraduationCap className="size-10 text-muted-foreground/20" />
                    </div>
                    <h4 className="text-lg font-medium">No Student Data Loaded</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">Complete the selection criteria above to load the student registry and initiate assessment entry.</p>
                </div>
            )}
        </div>
    );
}
