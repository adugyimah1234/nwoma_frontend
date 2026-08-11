'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Save,
    RefreshCw,
    Search,
    FileText,
    GraduationCap,
    Wand2,
    MessageSquare
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

export default function GradebookPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Selection State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [remarksBank, setRemarksBank] = useState<RemarkItem[]>([]);

    const [selection, setSelection] = useState({
        classId: '',
        subjectId: '',
        termId: ''
    });

    // Marks State
    const [marks, setMarks] = useState<StudentMark[]>([]);

    const loadInitialData = useCallback(async () => {
        try {
            const [subRes, classRes, termRes, remarkRes] = await Promise.all([
                gradebookService.getSubjects(),
                classService.getAll(),
                gradebookService.getTerms(),
                remarksService.getAll()
            ]);
            setSubjects(subRes);
            setClasses(classRes);
            setTerms(termRes);
            setRemarksBank(remarkRes);
        } catch (err) {
            toast.error("Failed to load academic configuration");
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const fetchMarks = async () => {
        if (!selection.classId || !selection.subjectId || !selection.termId) {
            toast.error("Please select Class, Subject, and Term");
            return;
        }

        setFetching(true);
        try {
            const data = await gradebookService.getClassMarks(selection.classId, selection.termId, selection.subjectId);
            setMarks(data);
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
            const numValue = parseFloat(value) || 0;
            newMarks[index] = {
                ...newMarks[index],
                [field]: numValue,
                total_score: (field === 'ca_score' ? numValue : newMarks[index].ca_score) +
                             (field === 'exam_score' ? numValue : newMarks[index].exam_score)
            };

            // Basic grading logic for UI feedback
            const total = newMarks[index].total_score;
            let grade = 'F';
            if (total >= 80) grade = 'A';
            else if (total >= 70) grade = 'B';
            else if (total >= 60) grade = 'C';
            else if (total >= 50) grade = 'D';

            newMarks[index].grade = grade;
        }
        setMarks(newMarks);
    };

    const handleAutoSuggest = (index: number) => {
        const mark = marks[index];
        const total = mark.total_score || 0;

        let targetCategory: string = 'general';
        if (total >= 80) targetCategory = 'academic';
        else if (total < 50) targetCategory = 'academic';
        else targetCategory = 'general';

        // Filter bank for appropriate suggestions
        const suggestions = remarksBank.filter(r => {
            if (total >= 80) return r.category === 'academic' && (r.remark_text.toLowerCase().includes('brilliant') || r.remark_text.toLowerCase().includes('standard'));
            if (total < 50) return r.category === 'academic' && (r.remark_text.toLowerCase().includes('effort') || r.remark_text.toLowerCase().includes('improve'));
            return r.category === 'general' || r.category === 'conduct';
        });

        if (suggestions.length > 0) {
            const random = suggestions[Math.floor(Math.random() * suggestions.length)];
            handleMarkChange(index, 'teacher_remarks', random.remark_text);
            toast.success(`Suggested remark applied for ${mark.first_name}`);
        } else {
            // Fallback to any academic remark if specific ones not found
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
            toast.success("Academic Registry Synchronized");
        } catch (err) {
            toast.error("Failed to sync marks");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Academic Command & Grading"
                description="Manage Continuous Assessment and Examinations for the current term."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Gradebook' }]}
            />

            <Card className="border-none shadow-sm bg-muted/20">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider">Classification</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, classId: val}))}>
                                <SelectTrigger className="bg-background"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider">Subject</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, subjectId: val}))}>
                                <SelectTrigger className="bg-background"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider">Academic Term</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, termId: val}))}>
                                <SelectTrigger className="bg-background"><SelectValue placeholder="Select Term" /></SelectTrigger>
                                <SelectContent>
                                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={fetchMarks} disabled={fetching} className="gap-2 h-10">
                            {fetching ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4" />}
                            Load Registry
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {marks.length > 0 ? (
                <div className="space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader className="border-b bg-muted/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold">Student Score Entry</CardTitle>
                                    <CardDescription>Input marks for CA (40%) and Exams (60%).</CardDescription>
                                </div>
                                <Badge variant="outline" className="font-mono text-[10px] uppercase">Class Size: {marks.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[80px] font-bold">No.</TableHead>
                                        <TableHead className="font-bold">Student Name</TableHead>
                                        <TableHead className="w-[120px] font-bold text-center">CA (40)</TableHead>
                                        <TableHead className="w-[120px] font-bold text-center">Exam (60)</TableHead>
                                        <TableHead className="w-[80px] font-bold text-center">Total</TableHead>
                                        <TableHead className="w-[60px] font-bold text-center">Grade</TableHead>
                                        <TableHead className="font-bold">Teacher Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {marks.map((mark, idx) => (
                                        <TableRow key={mark.student_id}>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                                            <TableCell className="font-semibold uppercase text-[10px] tracking-tight">
                                                {mark.first_name} {mark.last_name}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="text-center font-bold h-8"
                                                    value={mark.ca_score || ''}
                                                    onChange={(e) => handleMarkChange(idx, 'ca_score', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="text-center font-bold h-8"
                                                    value={mark.exam_score || ''}
                                                    onChange={(e) => handleMarkChange(idx, 'exam_score', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center font-black text-primary text-sm">
                                                {mark.total_score || 0}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={mark.grade === 'F' ? 'bg-red-500' : 'bg-emerald-600'} style={{fontSize: '9px'}}>
                                                    {mark.grade}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 items-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 shrink-0"
                                                        onClick={() => handleAutoSuggest(idx)}
                                                        title="Magic Suggestion"
                                                    >
                                                        <Wand2 className="size-4" />
                                                    </Button>
                                                    <Input
                                                        className="h-8 text-xs italic"
                                                        placeholder="Enter remarks..."
                                                        value={mark.teacher_remarks || ''}
                                                        onChange={(e) => handleMarkChange(idx, 'teacher_remarks', e.target.value)}
                                                    />
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700">
                                                                <MessageSquare className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[300px]">
                                                            <DropdownMenuLabel className="text-[10px] uppercase">Pick from Remarks Bank</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {remarksBank.map(r => (
                                                                <DropdownMenuItem
                                                                    key={r.id}
                                                                    className="text-xs py-2 cursor-pointer"
                                                                    onClick={() => handleMarkChange(idx, 'teacher_remarks', r.remark_text)}
                                                                >
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-bold text-[8px] uppercase text-indigo-500">{r.category}</span>
                                                                        <span className="line-clamp-2">{r.remark_text}</span>
                                                                    </div>
                                                                </DropdownMenuItem>
                                                            ))}
                                                            {remarksBank.length === 0 && (
                                                                <div className="p-4 text-center text-xs text-muted-foreground italic">Remarks bank is empty</div>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" className="gap-2">
                            <FileText className="size-4" /> Export Draft
                        </Button>
                        <Button onClick={handleSave} disabled={loading} className="gap-2 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                            {loading ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Sync to Headquarters
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/5">
                    <GraduationCap className="size-12 text-muted-foreground/20 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">Select criteria above to begin assessment entry.</p>
                </div>
            )}
        </div>
    );
}
