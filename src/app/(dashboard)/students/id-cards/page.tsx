'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    CreditCard,
    Printer,
    RefreshCw,
    Users,
    ChevronRight,
    ShieldCheck,
    Settings
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function IDCardGeneratorPage() {
    const [loading, setLoading] = useState(false);
    const [generating] = useState(false);

    const [classes, setClasses] = useState<ClassData[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [, setSelectedClassId] = useState<string>('');
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
                    body { font-family: 'Inter', sans-serif; padding: 20px; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; background: #f8fafc; }
                    .id-card {
                        width: 320px;
                        height: 200px;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        border: 1px solid #e2e8f0;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                    }
                    .card-header {
                        background: #0f172a;
                        color: white;
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        border-bottom: 2px solid #5c59e8;
                    }
                    .logo { height: 30px; width: 30px; object-fit: contain; }
                    .school-name { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
                    .motto { font-size: 7px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }

                    .card-body { flex: 1; padding: 15px; display: flex; gap: 15px; align-items: center; }
                    .photo-area {
                        width: 80px;
                        height: 90px;
                        background: #f1f5f9;
                        border-radius: 8px;
                        border: 1px solid #e2e8f0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .initials { font-size: 24px; font-weight: 700; color: #1e293b; opacity: 0.1; }

                    .student-details { flex: 1; }
                    .name { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px; }
                    .info-row { display: flex; font-size: 10px; margin-bottom: 3px; }
                    .label { color: #64748b; width: 45px; font-weight: 600; }
                    .val { color: #0f172a; font-weight: 700; }

                    .card-footer {
                        background: #f8fafc;
                        text-align: center;
                        font-size: 8px;
                        font-weight: 700;
                        padding: 5px;
                        color: #94a3b8;
                        letter-spacing: 1px;
                        border-top: 1px solid #f1f5f9;
                    }

                    @media print {
                        body { background: white; padding: 0; }
                        .id-card { break-inside: avoid; margin-bottom: 20px; box-shadow: none; border: 1px solid #ccc; }
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
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <PageHeader
                title="ID Card Generation"
                description="Produce standardized identity cards for institutional verification."
                breadcrumbs={[
                    { title: 'Home', href: '/' },
                    { title: 'Students', href: '/students' },
                    { title: 'ID Cards' }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Settings className="size-4 text-primary" /> Parameters
                            </CardTitle>
                            <CardDescription>Select unit and generation mode.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold text-muted-foreground">Unit Classification</Label>
                                <Select onValueChange={handleClassChange}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={generateBatchIDs}
                                disabled={selectedStudents.size === 0 || generating}
                                className="w-full h-11 font-bold gap-2 shadow-sm"
                            >
                                {generating ? <RefreshCw className="size-4 animate-spin" /> : <Printer className="size-4" />}
                                Generate Batch ({selectedStudents.size})
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <CreditCard className="size-4 text-primary" /> Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-[1.6/1] w-full bg-muted/30 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center p-6 text-center opacity-60">
                                <Image src="/logo.png" alt="Preview Logo" width={40} height={40} className="grayscale opacity-20 mb-4" />
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Standard Template Node</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Roster */}
                <div className="lg:col-span-8">
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 py-4 px-6">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Users className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Roster Selection</CardTitle>
                                    <CardDescription className="text-xs font-medium">Select students for production.</CardDescription>
                                </div>
                            </div>
                            {students.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase mr-2">{selectedStudents.size} Selected</span>
                                    <Button variant="outline" size="sm" onClick={toggleAll} className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                                        {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow className="border-none">
                                            <TableHead className="w-12 pl-6"></TableHead>
                                            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Full Name</TableHead>
                                            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Identity Code</TableHead>
                                            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Status</TableHead>
                                            <TableHead className="text-right pr-6"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={5} className="py-6 px-6">
                                                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : students.length > 0 ? (
                                            students.map((s) => (
                                                <TableRow
                                                    key={s.id}
                                                    className={cn(
                                                        "group cursor-pointer transition-colors border-b border-muted/50 last:border-none",
                                                        selectedStudents.has(s.id!) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                                                    )}
                                                    onClick={() => toggleStudent(s.id!)}
                                                >
                                                    <TableCell className="pl-6">
                                                        <Checkbox
                                                            checked={selectedStudents.has(s.id!)}
                                                            onCheckedChange={() => toggleStudent(s.id!)}
                                                            className="rounded-md"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-sm text-foreground tracking-tight">{s.first_name} {s.last_name}</span>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                                                        GSS-{String(s.id).substring(0,8).toUpperCase()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[9px] font-bold uppercase tracking-tight px-2 py-0">
                                                            {s.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <ChevronRight className="size-4 ml-auto text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic text-sm">
                                                    No roster records found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex items-center gap-3 justify-center py-12 opacity-20 grayscale">
                <ShieldCheck className="size-6 text-muted-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Institutional Verification Node</p>
            </div>
        </div>
    );
}

