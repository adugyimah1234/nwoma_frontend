'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Printer,
    RefreshCw,
    FileText,
    MessageSquare,
    Send,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/page-header';
import { toast } from 'sonner';
import gradebookService, { Subject, AcademicTerm } from '@/services/gradebook';
import classService, { ClassData } from '@/services/class';
import studentService from '@/services/students';
import { Student } from '@/types/student';
import { getAllAcademicYear, academicYear } from '@/services/academic_year';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function TerminalReportsPage() {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [broadcasting, setBroadcasting] = useState(false);
    const [achieving, setAchieving] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Selection State
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [academicYears, setAcademicYears] = useState<academicYear[]>([]);
    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selection, setSelection] = useState({
        academicYearId: '',
        classId: '',
        termId: ''
    });

    const loadInitialData = useCallback(async () => {
        try {
            const [classRes, yearsRes] = await Promise.all([
                classService.getAll(),
                getAllAcademicYear()
            ]);
            setClasses(classRes);
            setAcademicYears(yearsRes);
        } catch (err) {
            toast.error("Failed to load report parameters");
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        const fetchTerms = async () => {
            if (!selection.academicYearId) {
                setTerms([]);
                return;
            }
            try {
                const res = await gradebookService.getTerms(selection.academicYearId);
                setTerms(res);
            } catch (err) {
                toast.error("Failed to load terms");
            }
        };
        fetchTerms();
    }, [selection.academicYearId]);

    const fetchStudents = async (classId: string) => {
        setLoading(true);
        try {
            const data = await studentService.getAll({ class_id: classId });
            setStudents(data);
        } catch (err) {
            toast.error("Failed to fetch class roster");
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (val: string) => {
        setSelection(prev => ({...prev, classId: val}));
        fetchStudents(val);
    };

    const handlePrintReport = async (studentId: string) => {
        if (!selection.termId) {
            toast.error("Select academic term first");
            return;
        }

        try {
            setGenerating(true);
            const reportData = await gradebookService.getStudentReport(studentId, selection.termId);
            generatePDF(reportData);
        } catch (err) {
            toast.error("Failed to generate dossier");
        } finally {
            setGenerating(false);
        }
    };

    const handleBroadcastClass = async () => {
        if (!selection.classId || !selection.termId) {
            toast.error("Select Class and Term first");
            return;
        }
        if (!confirm("This will send results via SMS to ALL active students in this class. Proceed?")) return;

        try {
            setBroadcasting(true);
            await gradebookService.broadcastResults({
                class_id: selection.classId,
                term_id: selection.termId
            });
            toast.success("Bulk SMS broadcast initiated");
        } catch (err) {
            toast.error("Broadcast failed to initialize");
        } finally {
            setBroadcasting(false);
        }
    };

    const handleBroadcastAchievement = async () => {
        if (!selection.classId || !selection.termId) {
            toast.error("Select Class and Term first");
            return;
        }
        setAchieving(true);
        try {
            await gradebookService.broadcastResults({
                class_id: selection.classId,
                term_id: selection.termId,
                type: 'achievement'
            });
            toast.success("Excellence & Progress alerts transmitted");
        } catch (err) {
            toast.error("Achievement broadcast failed");
        } finally {
            setAchieving(false);
        }
    };

    const handleSingleBroadcast = async (studentId: string) => {
        if (!selection.termId) {
            toast.error("Select term first");
            return;
        }
        try {
            toast.info("Transmitting results...");
            await gradebookService.broadcastResults({
                student_id: studentId,
                term_id: selection.termId
            });
            toast.success("SMS results delivered to guardian");
        } catch (err) {
            toast.error("Transmission failed");
        }
    };

    const generatePDF = (data: any) => {
        const { student, term, marks, stats, discipline, financial } = data;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Report_${student.first_name}_${student.last_name}</title>
                <style>
                    @page { size: A4; margin: 0.8cm; }
                    body {
                        font-family: 'Inter', -apple-system, system-ui, sans-serif;
                        margin: 0;
                        padding: 0;
                        color: #000;
                        font-size: 10px;
                        line-height: 1.2;
                    }
                    .sheet {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 8px;
                        margin-bottom: 12px;
                    }
                    .header-logo { height: 65px; width: auto; }
                    .header-text { flex: 1; text-align: center; }
                    .header-text h1 { margin: 0; font-size: 18px; text-transform: uppercase; font-weight: 900; letter-spacing: -0.5px; }
                    .header-text h2 { margin: 1px 0; font-size: 13px; font-weight: 700; color: #222; }
                    .header-text p { margin: 0; font-size: 8px; color: #444; font-weight: 600; text-transform: uppercase; }

                    .student-grid {
                        display: grid;
                        grid-template-cols: 1fr 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 12px;
                        border: 1px solid #000;
                        padding: 8px;
                    }
                    .info-group { display: flex; flex-direction: column; gap: 3px; }
                    .info-item { display: flex; align-items: baseline; }
                    .info-label { font-weight: 800; color: #000; text-transform: uppercase; font-size: 8px; min-width: 75px; }
                    .info-value { font-weight: 700; flex: 1; border-bottom: 1px dotted #000; padding-left: 5px; }

                    .main-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 12px;
                    }
                    .main-table th {
                        background: #eee;
                        color: #000;
                        font-weight: 900;
                        text-transform: uppercase;
                        border: 1px solid #000;
                        padding: 4px 6px;
                        text-align: left;
                        font-size: 8px;
                    }
                    .main-table td { border: 1px solid #000; padding: 4px 6px; font-size: 9px; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: 700; }

                    .bottom-section {
                        display: grid;
                        grid-template-cols: 1.5fr 1fr;
                        gap: 15px;
                        margin-bottom: 12px;
                    }

                    .summary-table { width: 100%; border-collapse: collapse; }
                    .summary-table td { border: 1px solid #000; padding: 4px; }
                    .summary-label { font-weight: 800; text-transform: uppercase; font-size: 8px; background: #f3f3f3; }
                    .summary-val { font-weight: 700; text-align: center; font-size: 11px; }

                    .grading-key {
                        border: 1px solid #000;
                        padding: 5px;
                    }
                    .grading-key h3 { margin: 0 0 5px 0; font-size: 8px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; }
                    .key-grid { display: grid; grid-template-cols: 1fr 1fr; font-size: 7.5px; gap: 2px; }

                    .remarks-area {
                        margin-bottom: 12px;
                    }
                    .remark-row { margin-bottom: 8px; }
                    .remark-label { font-weight: 900; text-transform: uppercase; font-size: 8px; display: block; margin-bottom: 2px; }
                    .remark-line { border-bottom: 1px solid #000; min-height: 14px; font-style: italic; padding-left: 5px; }

                    .conduct-section {
                        display: grid;
                        grid-template-cols: repeat(4, 1fr);
                        gap: 10px;
                        border: 1px solid #000;
                        padding: 5px;
                        margin-bottom: 12px;
                        background: #fafafa;
                    }
                    .conduct-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
                    .conduct-label { font-size: 7px; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
                    .conduct-val { font-weight: 700; font-size: 9px; }

                    .footer-admin {
                        display: flex;
                        justify-content: space-between;
                        font-weight: 800;
                        font-size: 9px;
                        margin-top: 10px;
                        padding-top: 10px;
                    }

                    .signatures {
                        display: grid;
                        grid-template-cols: 1fr 1fr 1fr;
                        gap: 20px;
                        margin-top: auto;
                    }
                    .sig-box { text-align: center; }
                    .sig-line { border-top: 1px solid #000; padding-top: 3px; font-weight: 800; font-size: 8px; text-transform: uppercase; }
                    .stamp-circle {
                        width: 60px;
                        height: 60px;
                        border: 1px dashed #666;
                        border-radius: 50%;
                        margin: 0 auto 5px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 7px;
                        color: #666;
                        text-transform: uppercase;
                    }

                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                        .sheet { height: 29.7cm; }
                    }
                </style>
            </head>
            <body>
                <div class="sheet">
                    <div class="header">
                        <img src="/logo.png" class="header-logo" onerror="this.style.display='none'" />
                        <div class="header-text">
                            <p style="letter-spacing: 2px; margin-bottom: 2px;">Ghana Armed Forces Education Service</p>
                            <h1>${student.school_name || 'GARRISON BASIC SCHOOL'}</h1>
                            <h2>STUDENT'S TERMINAL REPORT</h2>
                            <p>${term.name} | ACADEMIC YEAR: ${student.academic_year_name || '2023/2024'}</p>
                        </div>
                    </div>

                    <div class="student-grid">
                        <div class="info-group">
                            <div class="info-item"><span class="info-label">Student Name:</span><span class="info-value">${student.first_name} ${student.last_name}</span></div>
                            <div class="info-item"><span class="info-label">Admission No:</span><span class="info-value">GSS-${String(student.id).substring(0,6).toUpperCase()}</span></div>
                        </div>
                        <div class="info-group">
                            <div class="info-item"><span class="info-label">Class:</span><span class="info-value">${student.class_name}</span></div>
                            <div class="info-item"><span class="info-label">No. on Roll:</span><span class="info-value">${stats.class_size}</span></div>
                        </div>
                        <div class="info-group">
                            <div class="info-item"><span class="info-label">Attendance:</span><span class="info-value">95%</span></div>
                            <div class="info-item"><span class="info-label">Gender:</span><span class="info-value">${student.gender}</span></div>
                        </div>
                    </div>

                    <table class="main-table">
                        <thead>
                            <tr>
                                <th style="width: 25%">Subject</th>
                                <th class="text-center">SBA (40)</th>
                                <th class="text-center">Exam (60)</th>
                                <th class="text-center">Total (100)</th>
                                <th class="text-center">Grade</th>
                                <th class="text-center">Position</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${marks.map((m: any) => `
                                <tr>
                                    <td class="font-bold">${m.subject_name}</td>
                                    <td class="text-center">${m.ca_score}</td>
                                    <td class="text-center">${m.exam_score}</td>
                                    <td class="text-center font-bold">${m.total_score}</td>
                                    <td class="text-center font-bold">${m.grade}</td>
                                    <td class="text-center">${m.position || '-'}</td>
                                    <td style="font-size: 8px;">${m.teacher_remarks || 'Satisfactory.'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="bottom-section">
                        <div>
                            <table class="summary-table">
                                <tr>
                                    <td class="summary-label">Aggregate Score</td>
                                    <td class="summary-val">${stats.aggregate_score}</td>
                                    <td class="summary-label">Overall Position</td>
                                    <td class="summary-val">${stats.position}<sup>${getPositionSuffix(stats.position)}</sup></td>
                                </tr>
                                <tr>
                                    <td class="summary-label">Promotion Status</td>
                                    <td class="summary-val" colspan="3">
                                        ${
                                            (term.name.toLowerCase().includes('term 3') || term.name.toLowerCase().includes('final') || term.name.toLowerCase().includes('semester 2'))
                                            ? 'PROMOTED'
                                            : 'CONTINUING'
                                        }
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div class="grading-key">
                            <h3>Grading Key</h3>
                            <div class="key-grid">
                                <span>80 - 100: (A) Excellent</span>
                                <span>70 - 79: (B) Very Good</span>
                                <span>60 - 69: (C) Good</span>
                                <span>50 - 59: (D) Credit</span>
                                <span>40 - 49: (E) Pass</span>
                                <span>0 - 39: (F) Fail</span>
                            </div>
                        </div>
                    </div>

                    <div class="conduct-section">
                        <div class="conduct-item"><span class="conduct-label">Conduct</span><span class="conduct-val">EXEMPLARY</span></div>
                        <div class="conduct-item"><span class="conduct-label">Attitude</span><span class="conduct-val">POSITIVE</span></div>
                        <div class="conduct-item"><span class="conduct-label">Interest</span><span class="conduct-val">SPORTS / ARTS</span></div>
                        <div class="conduct-item"><span class="conduct-label">Form Teacher</span><span class="conduct-val">ASSIGNED</span></div>
                    </div>

                    <div class="remarks-area">
                        <div class="remark-row">
                            <span class="remark-label">Class Teacher's General Remarks:</span>
                            <div class="remark-line">${marks[0]?.teacher_remarks || 'A dedicated student with great potential. Keep it up.'}</div>
                        </div>
                        <div class="remark-row">
                            <span class="remark-label">Headteacher's Remarks:</span>
                            <div class="remark-line">Good results. Continue working hard in all subjects.</div>
                        </div>
                    </div>

                    <div class="footer-admin">
                        <span>NEXT TERM BEGINS: _____________________</span>
                        <span>DATE: ${new Date().toLocaleDateString('en-GB')}</span>
                    </div>

                    <div class="signatures">
                        <div class="sig-box">
                            <div style="height: 30px;"></div>
                            <div class="sig-line">Class Teacher</div>
                        </div>
                        <div class="sig-box">
                            <div class="stamp-circle">Official Stamp</div>
                        </div>
                        <div class="sig-box">
                            <div style="height: 30px;"></div>
                            <div class="sig-line">Headteacher</div>
                        </div>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const getPositionSuffix = (pos: number) => {
        if (pos === 1) return 'st';
        if (pos === 2) return 'nd';
        if (pos === 3) return 'rd';
        return 'th';
    };

    const totalPages = Math.ceil(students.length / itemsPerPage);
    const paginatedStudents = students.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
            <PageHeader
                title="Terminal Dossier Generator"
                description="Generate and print official terminal report cards for students."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Gradebook', href: '/grades' }, { title: 'Reports' }]}
            />

            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold">Report Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Academic Year</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, academicYearId: val, termId: ''}))}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Year" /></SelectTrigger>
                                <SelectContent>
                                    {academicYears.map(y => <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Target Class</Label>
                            <Select onValueChange={handleClassChange}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Academic Term</Label>
                            <Select
                                value={selection.termId}
                                onValueChange={(val) => setSelection(prev => ({...prev, termId: val}))}
                                disabled={!selection.academicYearId}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder={selection.academicYearId ? "Select Term" : "Select Year First"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end gap-2 md:col-span-2">
                            <Button variant="outline" size="sm" className="flex-1 gap-2 h-9 border-dashed" onClick={() => loadInitialData()}>
                                <RefreshCw className="size-3.5" /> Reset
                            </Button>
                            <Button
                                onClick={handleBroadcastClass}
                                size="sm"
                                disabled={broadcasting || students.length === 0}
                                className="flex-1 gap-2 h-9"
                            >
                                {broadcasting ? <RefreshCw className="size-3.5 animate-spin" /> : <MessageSquare className="size-3.5" />}
                                Results SMS
                            </Button>
                            <Button
                                onClick={handleBroadcastAchievement}
                                size="sm"
                                variant="secondary"
                                disabled={achieving || students.length === 0}
                                className="flex-1 gap-2 h-9"
                            >
                                {achieving ? <RefreshCw className="size-3.5 animate-spin" /> : <TrendingUp className="size-3.5" />}
                                Honors SMS
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="border-b bg-muted/10 flex flex-row items-center justify-between py-4 px-6">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-semibold">Class Roster</CardTitle>
                        <CardDescription className="text-xs">Select a student to generate their terminal dossier.</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">Students: {students.length}</Badge>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <div className="max-h-[500px] overflow-auto">
                        <Table>
                            <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[80px] pl-6">No.</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Admission No.</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-24">
                                            <RefreshCw className="size-8 animate-spin mx-auto text-muted-foreground/40" />
                                            <p className="text-sm text-muted-foreground mt-4 font-medium">Fetching Class Roster...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((s, idx) => (
                                        <TableRow key={s.id} className="group transition-colors border-b last:border-none">
                                            <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-sm">
                                                    {s.first_name} {s.last_name}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                                                    {s.gender}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground/60 uppercase">
                                                GSS-{String(s.id).substring(0,6)}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleSingleBroadcast(s.id!)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        title="Send results via SMS"
                                                    >
                                                        <Send className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handlePrintReport(s.id!)}
                                                        disabled={generating}
                                                        size="sm"
                                                        className="h-8 gap-2"
                                                    >
                                                        {generating ? <RefreshCw className="size-3.5 animate-spin" /> : <Printer className="size-3.5" />}
                                                        Generate Report
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-32 text-muted-foreground italic text-sm">
                                            No student records found for the selected parameters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                {students.length > 0 && (
                    <div className="border-t bg-muted/10 px-6 py-4 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-medium">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} students
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <FileText className="size-10 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-[0.1em]">Student Information & Academic Registry</p>
            </div>
        </div>
    );
}

