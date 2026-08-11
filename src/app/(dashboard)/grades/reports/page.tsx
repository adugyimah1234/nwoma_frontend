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

    // Selection State
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selection, setSelection] = useState({
        classId: '',
        termId: ''
    });

    const loadInitialData = useCallback(async () => {
        try {
            const [classRes, termRes] = await Promise.all([
                classService.getAll(),
                gradebookService.getTerms()
            ]);
            setClasses(classRes);
            setTerms(termRes);
        } catch (err) {
            toast.error("Failed to load report parameters");
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

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

        // Professional African Context Print Window
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Report_${student.first_name}_${student.last_name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.5; }
                    .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; position: relative; }
                    .header img { height: 80px; margin-bottom: 10px; }
                    .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; }
                    .header h2 { margin: 5px 0; font-size: 16px; font-weight: 700; color: #666; }

                    .student-info { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 14px; }
                    .info-box { border: 1px solid #eee; padding: 15px; border-radius: 8px; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .label { font-weight: 800; color: #666; text-transform: uppercase; font-size: 10px; }
                    .value { font-weight: 700; border-bottom: 1px solid #ddd; flex: 1; margin-left: 10px; text-align: right; }

                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
                    th { background: #f8fafc; color: #333; font-weight: 900; text-transform: uppercase; border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                    td { border: 1px solid #e2e8f0; padding: 12px; }
                    .total-cell { font-weight: 900; color: #2563eb; }
                    .grade-cell { font-weight: 900; text-align: center; }

                    .stats-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                    .stat-card { border: 2px solid #f1f5f9; padding: 15px; border-radius: 12px; text-align: center; }
                    .stat-val { font-size: 24px; font-weight: 900; color: #1e293b; }
                    .stat-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

                    .discipline-section { margin-bottom: 30px; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden; }
                    .discipline-header { background: #fee2e2; color: #991b1b; padding: 10px 15px; font-size: 11px; font-weight: 900; text-transform: uppercase; }
                    .discipline-body { padding: 15px; font-size: 12px; }
                    .log-item { margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
                    .log-item:last-child { border-bottom: none; }

                    .financial-summary { margin-bottom: 30px; border: 1px solid #e0e7ff; border-radius: 12px; overflow: hidden; }
                    .financial-header { background: #e0e7ff; color: #3730a3; padding: 10px 15px; font-size: 11px; font-weight: 900; text-transform: uppercase; }
                    .financial-body { padding: 15px; display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; text-align: center; }
                    .fin-val { font-size: 18px; font-weight: 900; color: #1e1b4b; }
                    .fin-label { font-size: 9px; font-weight: 700; color: #6366f1; text-transform: uppercase; }

                    .remarks-section { margin-top: 30px; border-top: 1px solid #eee; pt: 20px; }
                    .remark-box { margin-top: 10px; padding: 15px; background: #fafafa; border-radius: 8px; font-style: italic; font-size: 14px; min-height: 60px; }

                    .signatures { margin-top: 60px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
                    .sig-line { border-top: 1px solid #333; text-align: center; padding-top: 10px; font-weight: 700; font-size: 12px; text-transform: uppercase; }

                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                        @page { margin: 1.5cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo.png" />
                    <h1>${student.school_name || 'GARRISON BASIC SCHOOL'}</h1>
                    <h2>OFFICIAL TERMINAL REPORT - ${term.name}</h2>
                    <p style="font-size: 10px; color: #999; margin-top: 5px;">HEADQUARTERS DIRECTORATE, GHANA ARMED FORCES</p>
                </div>

                <div class="student-info">
                    <div class="info-box">
                        <div class="info-row"><span class="label">Student Name:</span><span class="value">${student.first_name} ${student.last_name}</span></div>
                        <div class="info-row"><span class="label">ID Number:</span><span class="value">GSS-${String(student.id).substring(0,6).toUpperCase()}</span></div>
                        <div class="info-row"><span class="label">Class:</span><span class="value">${student.class_name}</span></div>
                    </div>
                    <div class="info-box">
                        <div class="info-row"><span class="label">Term:</span><span class="value">${term.name}</span></div>
                        <div class="info-row"><span class="label">Attendance:</span><span class="value">95%</span></div>
                        <div class="info-row"><span class="label">Status:</span><span class="value">PROMOTED</span></div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-val">${stats.position}<sup>${getPositionSuffix(stats.position)}</sup></div>
                        <div class="stat-label">Position in Class</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-val">${stats.aggregate_score}</div>
                        <div class="stat-label">Aggregate Score</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-val">${stats.class_size}</div>
                        <div class="stat-label">Class Size</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th style="text-align: center;">CA (40%)</th>
                            <th style="text-align: center;">Exam (60%)</th>
                            <th style="text-align: center;">Total (100)</th>
                            <th style="text-align: center;">Grade</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${marks.map((m: any) => `
                            <tr>
                                <td style="font-weight: 700;">${m.subject_name}</td>
                                <td style="text-align: center;">${m.ca_score}</td>
                                <td style="text-align: center;">${m.exam_score}</td>
                                <td style="text-align: center;" class="total-cell">${m.total_score}</td>
                                <td class="grade-cell">${m.grade}</td>
                                <td style="font-size: 11px;">${m.teacher_remarks || 'Satisfactory performance.'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="financial-summary">
                    <div class="financial-header">Financial Standing (Bill Summary)</div>
                    <div class="financial-body">
                        <div>
                            <div class="fin-val">GHS ${financial.total_obligation.toFixed(2)}</div>
                            <div class="fin-label">Total Obligation</div>
                        </div>
                        <div>
                            <div class="fin-val">GHS ${financial.total_paid.toFixed(2)}</div>
                            <div class="fin-label">Total Paid</div>
                        </div>
                        <div style="border-left: 2px solid #e0e7ff;">
                            <div class="fin-val" style="color: ${financial.balance > 0 ? '#b91c1c' : '#047857'};">
                                GHS ${financial.balance.toFixed(2)}
                            </div>
                            <div class="fin-label">Balance Outstanding</div>
                        </div>
                    </div>
                </div>

                ${discipline && discipline.length > 0 ? `
                    <div class="discipline-section">
                        <div class="discipline-header">Conduct & Behavioral Audit</div>
                        <div class="discipline-body">
                            ${discipline.map((log: any) => `
                                <div class="log-item">
                                    <strong>${new Date(log.date_occurred).toLocaleDateString()}:</strong> ${log.offense} -
                                    <span style="color: #666;">Action: ${log.action_taken}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="discipline-section" style="border-color: #d1fae5;">
                        <div class="discipline-header" style="background: #d1fae5; color: #065f46;">Conduct & Behavioral Audit</div>
                        <div class="discipline-body" style="color: #065f46; font-weight: 700;">
                            Exemplary behavior recorded throughout the term. No disciplinary incidents.
                        </div>
                    </div>
                `}

                <div class="remarks-section">
                    <div class="label">Class Teacher's Remarks:</div>
                    <div class="remark-box">
                        ${marks[0]?.teacher_remarks || 'A focused and disciplined student. Shows great promise. Keep up the good work.'}
                    </div>
                </div>

                <div class="signatures">
                    <div class="sig-line">Class Teacher's Signature</div>
                    <div class="sig-line">Headmaster / Headmistress</div>
                </div>

                <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 10px; font-style: italic;">
                    Computer generated document. Official stamp required for validity. QR Code Secure ID: ${student.id}
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

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Terminal Dossier Generator"
                description="Generate and print official terminal report cards for students."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Gradebook', href: '/grades' }, { title: 'Reports' }]}
            />

            <Card className="border-none shadow-sm bg-muted/20">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider">Target Class</Label>
                            <Select onValueChange={handleClassChange}>
                                <SelectTrigger className="bg-background h-10"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider">Academic Term</Label>
                            <Select onValueChange={(val) => setSelection(prev => ({...prev, termId: val}))}>
                                <SelectTrigger className="bg-background h-10"><SelectValue placeholder="Select Term" /></SelectTrigger>
                                <SelectContent>
                                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button variant="outline" className="flex-1 gap-2 h-10 border-dashed" onClick={() => loadInitialData()}>
                                <RefreshCw className="size-4" /> Reset
                            </Button>
                            <Button
                                onClick={handleBroadcastClass}
                                disabled={broadcasting || students.length === 0}
                                className="flex-1 gap-2 h-10 bg-indigo-600 hover:bg-indigo-700 shadow-md text-white font-bold"
                            >
                                {broadcasting ? <RefreshCw className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                                Results
                            </Button>
                            <Button
                                onClick={handleBroadcastAchievement}
                                disabled={achieving || students.length === 0}
                                className="flex-1 gap-2 h-10 bg-amber-500 hover:bg-amber-600 shadow-md text-white font-bold"
                            >
                                {achieving ? <RefreshCw className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
                                Achievement
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold">Class Roster</CardTitle>
                        <CardDescription>Select a student to generate their terminal dossier.</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">Roster Size: {students.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[80px] font-bold">No.</TableHead>
                                <TableHead className="font-bold">Student Name</TableHead>
                                <TableHead className="font-bold">Gender</TableHead>
                                <TableHead className="font-bold">ID Code</TableHead>
                                <TableHead className="text-right font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <RefreshCw className="size-6 animate-spin mx-auto text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground mt-2 italic uppercase font-bold tracking-widest">Accessing Student Registry...</p>
                                    </TableCell>
                                </TableRow>
                            ) : students.length > 0 ? (
                                students.map((s, idx) => (
                                    <TableRow key={s.id} className="group transition-colors">
                                        <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                                        <TableCell className="font-semibold uppercase text-xs tracking-tight">
                                            {s.first_name} {s.last_name}
                                        </TableCell>
                                        <TableCell><Badge variant="secondary" className="text-[10px] uppercase">{s.gender}</Badge></TableCell>
                                        <TableCell className="font-mono text-[10px] text-slate-400">GSS-${String(s.id).substring(0,6).toUpperCase()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    onClick={() => handleSingleBroadcast(s.id!)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="size-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                    title="Send results via SMS"
                                                >
                                                    <Send className="size-3" />
                                                </Button>
                                                <Button
                                                    onClick={() => handlePrintReport(s.id!)}
                                                    disabled={generating}
                                                    size="sm"
                                                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md h-8"
                                                >
                                                    {generating ? <RefreshCw className="size-3 animate-spin" /> : <Printer className="size-3" />}
                                                    Print Dossier
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                        No student data found for the selected classification.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <FileText className="size-12 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Command Integrity System</p>
            </div>
        </div>
    );
}
