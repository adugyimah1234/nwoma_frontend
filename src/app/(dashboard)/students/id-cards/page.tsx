'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    CreditCard,
    Printer,
    RefreshCw,
    Search,
    Users,
    ChevronRight,
    Building2,
    ShieldCheck,
    CheckSquare,
    Square
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/page-header';
import { toast } from 'sonner';
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

export default function IDCardGeneratorPage() {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [classes, setClasses] = useState<ClassData[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStudents, setSelectedIds] = useState<Set<string>>(new Set());

    const loadInitialData = useCallback(async () => {
        try {
            const classRes = await classService.getAll();
            setClasses(classRes);
        } catch (err) {
            toast.error("Failed to load classifications");
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
            setSelectedIds(new Set()); // Reset selection
        } catch (err) {
            toast.error("Failed to fetch roster");
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (val: string) => {
        setSelectedClassId(val);
        fetchStudents(val);
    };

    const toggleStudent = (id: string) => {
        const newSet = new Set(selectedStudents);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedStudents.size === students.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(students.map(s => s.id!)));
        }
    };

    const generateBatchIDs = () => {
        if (selectedStudents.size === 0) {
            toast.error("Select at least one student");
            return;
        }

        const selectedData = students.filter(s => selectedStudents.has(s.id!));
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const cardsHtml = selectedData.map(s => `
            <div class="id-card">
                <div class="card-header">
                    <img src="/logo.png" class="logo" />
                    <div class="header-text">
                        <div class="school-name">GARRISON BASIC SCHOOL</div>
                        <div class="motto">Discipline and Excellence</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="photo-area">
                        <div class="initials">${s.first_name[0]}${s.last_name[0]}</div>
                    </div>
                    <div class="student-details">
                        <div class="name">${s.first_name} ${s.last_name}</div>
                        <div class="info-row"><span class="label">ID NO:</span> <span class="val">GSS-${String(s.id).substring(0,8).toUpperCase()}</span></div>
                        <div class="info-row"><span class="label">CLASS:</span> <span class="val">${(s as any).class_name || 'N/A'}</span></div>
                        <div class="info-row"><span class="label">GENDER:</span> <span class="val">${s.gender}</span></div>
                    </div>
                </div>
                <div class="card-footer">
                    OFFICIAL STUDENT IDENTITY CARD
                </div>
            </div>
        `).join('');

        const html = `
            <html>
            <head>
                <title>Student_ID_Batch</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 20px; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; background: #f0f2f5; }
                    .id-card {
                        width: 320px;
                        height: 200px;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        border: 1px solid #ddd;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                    }
                    .card-header {
                        background: #1e1b4b;
                        color: white;
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        border-bottom: 2px solid #fbbf24;
                    }
                    .logo { height: 30px; width: 30px; object-fit: contain; }
                    .school-name { font-size: 11px; font-weight: 900; letter-spacing: 0.5px; }
                    .motto { font-size: 7px; color: #fbbf24; text-transform: uppercase; font-weight: 700; }

                    .card-body { flex: 1; padding: 15px; display: flex; gap: 15px; align-items: center; }
                    .photo-area {
                        width: 80px;
                        height: 90px;
                        background: #f3f4f6;
                        border-radius: 8px;
                        border: 2px solid #e5e7eb;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .initials { font-size: 24px; font-weight: 900; color: #1e1b4b; opacity: 0.2; }

                    .student-details { flex: 1; }
                    .name { font-size: 14px; font-weight: 900; color: #1e1b4b; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 2px; }
                    .info-row { display: flex; font-size: 10px; margin-bottom: 3px; }
                    .label { color: #6b7280; width: 45px; font-weight: 700; }
                    .val { color: #111827; font-weight: 800; }

                    .card-footer {
                        background: #f8fafc;
                        text-align: center;
                        font-size: 8px;
                        font-weight: 900;
                        padding: 5px;
                        color: #64748b;
                        letter-spacing: 2px;
                        border-top: 1px solid #f1f5f9;
                    }

                    @media print {
                        body { background: white; padding: 0; }
                        .id-card { break-inside: avoid; margin-bottom: 20px; box-shadow: none; border: 1px solid #000; }
                    }
                </style>
            </head>
            <body>
                ${cardsHtml}
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Garrison ID Batch Generator"
                description="Produce standardized digital identity cards for student verification."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students', href: '/students' }, { title: 'ID Cards' }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm bg-indigo-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600">Unit Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase">Classification</Label>
                                <Select onValueChange={handleClassChange}>
                                    <SelectTrigger className="bg-background h-11"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={generateBatchIDs}
                                disabled={selectedStudents.size === 0 || generating}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 font-bold"
                            >
                                {generating ? <RefreshCw className="size-4 animate-spin" /> : <Printer className="size-4" />}
                                Generate {selectedStudents.size} Cards
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest">ID Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-[1.6/1] w-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center opacity-40">
                                <CreditCard className="size-10 mb-2" />
                                <p className="text-[10px] font-medium">Standard 85mm x 54mm Template</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card className="border-none shadow-sm h-full overflow-hidden">
                        <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Class Enrollment List</CardTitle>
                                <CardDescription>Select individual students or the entire class for ID production.</CardDescription>
                            </div>
                            {students.length > 0 && (
                                <Button variant="outline" size="sm" onClick={toggleAll} className="h-8 gap-2">
                                    {selectedStudents.size === students.length ? <CheckSquare className="size-3" /> : <Square className="size-3" />}
                                    {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead className="font-bold">Student Name</TableHead>
                                        <TableHead className="font-bold">ID Number</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20">
                                                <RefreshCw className="size-6 animate-spin mx-auto text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground mt-2 italic font-bold">Syncing Roster...</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : students.length > 0 ? (
                                        students.map((s) => (
                                            <TableRow
                                                key={s.id}
                                                className={`group transition-colors cursor-pointer ${selectedStudents.has(s.id!) ? 'bg-indigo-50/50' : ''}`}
                                                onClick={() => toggleStudent(s.id!)}
                                            >
                                                <TableCell>
                                                    {selectedStudents.has(s.id!) ?
                                                        <CheckSquare className="size-4 text-indigo-600" /> :
                                                        <Square className="size-4 text-slate-300" />
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-xs uppercase tracking-tight">{s.first_name} {s.last_name}</div>
                                                </TableCell>
                                                <TableCell className="font-mono text-[10px] text-slate-400">GSS-${String(s.id).substring(0,8).toUpperCase()}</TableCell>
                                                <TableCell><Badge variant="secondary" className="text-[9px] uppercase font-bold">{s.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <ChevronRight className="size-4 ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                                No students found. Select a class to begin.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex items-center gap-2 justify-center py-10 opacity-20 grayscale">
                <ShieldCheck className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Official Command Verification System</p>
            </div>
        </div>
    );
}
