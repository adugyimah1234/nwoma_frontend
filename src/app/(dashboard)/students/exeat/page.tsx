'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    LogOut,
    Plus,
    RefreshCw,
    Printer,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import exeatService, { ExeatRecord } from '@/services/exeat';
import studentService from '@/services/students';
import { Student } from '@/types/student';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function ExeatTrackingPage() {
    const { isAdmin } = useAuth();
    const [exeats, setExeats] = useState<ExeatRecord[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newExeat, setNewExeat] = useState({
        student_id: '',
        exeat_type: 'day',
        departure_date: new Date().toISOString().slice(0, 16),
        expected_return_date: new Date().toISOString().slice(0, 16),
        reason: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [exeatData, studentData] = await Promise.all([
                exeatService.getAll(),
                studentService.getAll()
            ]);
            setExeats(exeatData);
            setStudents(studentData);
        } catch (err) {
            toast.error("Failed to load exeat records");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExeat.student_id) return;

        try {
            await exeatService.create(newExeat);
            toast.success("Exeat issued and recorded");
            setIsDialogOpen(false);
            setNewExeat({
                student_id: '',
                exeat_type: 'day',
                departure_date: new Date().toISOString().slice(0, 16),
                expected_return_date: new Date().toISOString().slice(0, 16),
                reason: ''
            });
            fetchData();
        } catch (err) {
            toast.error("Process failed");
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await exeatService.updateStatus(id, status);
            toast.success(`Student status updated to ${status}`);
            fetchData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const printExeatCard = (exeat: ExeatRecord) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Exeat_Pass_${exeat.student_name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a1a; }
                    .pass-container {
                        max-width: 500px;
                        margin: 0 auto;
                        border: 3px solid #1e1b4b;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: #1e1b4b;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-bottom: 5px solid #fbbf24;
                    }
                    .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
                    .header p { margin: 5px 0 0; font-size: 10px; opacity: 0.8; font-weight: 700; }

                    .content { padding: 30px; }
                    .student-name { font-size: 24px; font-weight: 900; text-transform: uppercase; text-align: center; margin-bottom: 20px; color: #1e1b4b; }

                    .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .info-item { border-bottom: 1px solid #eee; padding-bottom: 10px; }
                    .label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; }
                    .value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 4px; }

                    .reason-box { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px dashed #cbd5e1; margin-bottom: 30px; }
                    .reason-text { font-size: 12px; font-style: italic; color: #475569; }

                    .status-stamp {
                        border: 4px double #059669;
                        color: #059669;
                        padding: 10px 20px;
                        font-weight: 900;
                        text-transform: uppercase;
                        transform: rotate(-10deg);
                        display: inline-block;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        opacity: 0.8;
                    }

                    .footer {
                        padding: 20px;
                        background: #f1f5f9;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        font-size: 10px;
                    }
                    .signature-line { border-top: 1px solid #333; width: 150px; text-align: center; padding-top: 5px; font-weight: 700; }

                    .qr-code { width: 60px; height: 60px; background: #ddd; display: flex; align-items: center; justify-content: center; font-size: 8px; text-align: center; }

                    @media print {
                        body { padding: 0; }
                        .pass-container { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="pass-container">
                    <div class="header">
                        <h1>GARRISON COMMAND PASS</h1>
                        <p>HEADQUARTERS DIRECTORATE, GHANA ARMED FORCES</p>
                    </div>

                    <div class="content">
                        <div style="text-align: right;">
                            <div class="status-stamp">AUTHORIZED</div>
                        </div>

                        <div class="student-name">${exeat.student_name}</div>

                        <div class="info-grid">
                            <div class="info-item">
                                <div class="label">Classification</div>
                                <div class="value">${exeat.class_name}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Exeat Type</div>
                                <div class="value" style="text-transform: capitalize;">${exeat.exeat_type} Pass</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Departure Date</div>
                                <div class="value">${formatDateTime(exeat.departure_date)}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Expected Return</div>
                                <div class="value" style="color: #b91c1c;">${formatDateTime(exeat.expected_return_date)}</div>
                            </div>
                        </div>

                        <div class="label">Authorized Reason for Leave:</div>
                        <div class="reason-box">
                            <div class="reason-text">"${exeat.reason || 'Personal / General Leave protocol.'}"</div>
                        </div>

                        <div class="signatures">
                            <div class="signature-line">Authorizing Officer</div>
                        </div>
                    </div>

                    <div class="footer">
                        <div>
                            <strong>Ref ID:</strong> ${exeat.id.substring(0,12).toUpperCase()}<br>
                            <em>Verification required at Main Gate.</em>
                        </div>
                        <div class="qr-code">SECURE<br>QR CODE</div>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        printWindow.document.body.innerHTML = html;
        printWindow.document.close();
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Movement Logistics"
                description="Manage student departures and monitor return compliance within the Garrison."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students', href: '/students' }, { title: 'Exeat' }]}
            >
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 h-10 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-wider px-6">
                            <Plus className="size-3.5" /> Issue Exeat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Issue Official Exeat</DialogTitle>
                                <DialogDescription className="text-xs font-medium">Generate permission for a student to leave school premises.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Student Selection</Label>
                                    <Select value={newExeat.student_id} onValueChange={v => setNewExeat({...newExeat, student_id: v})}>
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10"><SelectValue placeholder="Select Student" /></SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            {students.map(s => <SelectItem key={s.id} value={s.id!}>{s.first_name} {s.last_name} ({(s as any).class_name})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Exeat Type</Label>
                                        <Select value={newExeat.exeat_type} onValueChange={v => setNewExeat({...newExeat, exeat_type: v})}>
                                            <SelectTrigger className="rounded-xl bg-muted/30 border-muted-foreground/10"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100">
                                                <SelectItem value="day">Day Exeat</SelectItem>
                                                <SelectItem value="weekend">Weekend Leave</SelectItem>
                                                <SelectItem value="medical">Medical</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Purpose/Reason</Label>
                                        <Input
                                            placeholder="Enter reason..."
                                            className="rounded-xl bg-muted/30 border-muted-foreground/10 h-10"
                                            value={newExeat.reason}
                                            onChange={e => setNewExeat({...newExeat, reason: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Departure</Label>
                                        <Input
                                            type="datetime-local"
                                            className="rounded-xl bg-muted/30 border-muted-foreground/10 h-10"
                                            value={newExeat.departure_date}
                                            onChange={e => setNewExeat({...newExeat, departure_date: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Expected Return</Label>
                                        <Input
                                            type="datetime-local"
                                            className="rounded-xl bg-muted/30 border-muted-foreground/10 h-10 text-destructive font-bold"
                                            value={newExeat.expected_return_date}
                                            onChange={e => setNewExeat({...newExeat, expected_return_date: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full h-12 text-sm font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl shadow-indigo-100">Authorize Departure</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-widest opacity-70">Currently Departed</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{exeats.filter(e => e.status === 'departed' || e.status === 'approved').length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-destructive/10 border-destructive/20 shadow-none">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-widest text-destructive">Overdue Returns</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-destructive">{exeats.filter(e => e.status === 'overdue').length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 py-4 px-6">
                    <div>
                        <CardTitle className="text-base font-bold">Operational Exeat Registry</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-tight">Live tracking of student movements</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={fetchData} className="size-8"><RefreshCw className="size-3.5" /></Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="border-none">
                                    <TableHead className="font-bold text-xs uppercase tracking-tight pl-6">Student</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-tight">Type</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-tight">Departure</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-tight text-indigo-600">Expected Return</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-tight">Status</TableHead>
                                    <TableHead className="text-right font-bold text-xs uppercase tracking-tight pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} className="py-6 px-6">
                                                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : exeats.map(e => (
                                    <TableRow key={e.id} className="hover:bg-muted/30 transition-colors border-b last:border-none">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="font-bold text-sm text-foreground tracking-tight">{e.student_name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">{e.class_name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200">{e.exeat_type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-[11px] font-medium text-slate-500">{formatDateTime(e.departure_date)}</TableCell>
                                        <TableCell className="text-[11px] font-bold text-indigo-600">{formatDateTime(e.expected_return_date)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "text-[10px] font-bold uppercase",
                                                    e.status === 'returned' && "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none",
                                                    e.status === 'overdue' && "bg-destructive/10 text-destructive border-destructive/20 shadow-none",
                                                    e.status === 'departed' && "bg-amber-50 text-amber-700 border-amber-100 shadow-none",
                                                    e.status === 'approved' && "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-none"
                                                )}
                                            >
                                                {e.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                {e.status !== 'returned' && (
                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold uppercase bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" onClick={() => handleUpdateStatus(e.id, 'returned')}>
                                                        Return
                                                    </Button>
                                                )}
                                                {e.status === 'approved' && (
                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold uppercase bg-amber-50/50 border-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white transition-all shadow-sm" onClick={() => handleUpdateStatus(e.id, 'departed')}>
                                                        Depart
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    onClick={() => printExeatCard(e)}
                                                    title="Print Pass"
                                                >
                                                    <Printer className="size-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {exeats.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic text-sm">No exeat records discovered in command node.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 justify-center py-6 opacity-30 grayscale">
                <LogOut className="size-8" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Student Movement & Security Protocol</p>
            </div>
        </div>
    );
}

