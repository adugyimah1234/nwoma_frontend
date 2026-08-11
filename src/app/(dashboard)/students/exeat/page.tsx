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
                title="Exeat & Leave Tracking"
                description="Manage student departures and monitor return compliance within the Garrison."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students', href: '/students' }, { title: 'Exeat' }]}
            >
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 h-10 shadow-lg shadow-primary/20">
                            <Plus className="size-4" /> Issue Exeat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Issue Official Exeat</DialogTitle>
                                <DialogDescription>Permission for a student to leave school premises.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Student Name</Label>
                                    <Select value={newExeat.student_id} onValueChange={v => setNewExeat({...newExeat, student_id: v})}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select Student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map(s => <SelectItem key={s.id} value={s.id!}>{s.first_name} {s.last_name} ({(s as any).class_name})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Exeat Type</Label>
                                        <Select value={newExeat.exeat_type} onValueChange={v => setNewExeat({...newExeat, exeat_type: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="day">Day Exeat</SelectItem>
                                                <SelectItem value="weekend">Weekend Leave</SelectItem>
                                                <SelectItem value="medical">Medical</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Reason</Label>
                                        <Input placeholder="Purpose of leave..." value={newExeat.reason} onChange={e => setNewExeat({...newExeat, reason: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Departure</Label>
                                        <Input type="datetime-local" value={newExeat.departure_date} onChange={e => setNewExeat({...newExeat, departure_date: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Expected Return</Label>
                                        <Input type="datetime-local" value={newExeat.expected_return_date} onChange={e => setNewExeat({...newExeat, expected_return_date: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700">Authorize Departure</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-indigo-900 text-white">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Currently Departed</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black">{exeats.filter(e => e.status === 'departed' || e.status === 'approved').length}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-rose-50/50">
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-rose-600">Overdue Returns</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-rose-700">{exeats.filter(e => e.status === 'overdue').length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800">Operational Exeat Registry</CardTitle>
                        <CardDescription>Live tracking of student movements across the command.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="size-4" /></Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold">Student</TableHead>
                                <TableHead className="font-bold">Type</TableHead>
                                <TableHead className="font-bold">Departure</TableHead>
                                <TableHead className="font-bold">Expected Return</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="text-right font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exeats.map(e => (
                                <TableRow key={e.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-bold text-xs uppercase">{e.student_name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{e.class_name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[9px] uppercase font-bold">{e.exeat_type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-[10px] font-medium">{formatDateTime(e.departure_date)}</TableCell>
                                    <TableCell className="text-[10px] font-black text-indigo-600">{formatDateTime(e.expected_return_date)}</TableCell>
                                    <TableCell>
                                        <Badge className={
                                            e.status === 'returned' ? 'bg-emerald-500' :
                                            e.status === 'overdue' ? 'bg-rose-500' :
                                            e.status === 'departed' ? 'bg-orange-500' : 'bg-indigo-600'
                                         + " text-[9px] font-black uppercase"}>
                                            {e.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {e.status !== 'returned' && (
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => handleUpdateStatus(e.id, 'returned')}>
                                                    Mark Returned
                                                </Button>
                                            )}
                                            {e.status === 'approved' && (
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => handleUpdateStatus(e.id, 'departed')}>
                                                    Mark Departed
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 size-7 p-0 text-indigo-600 hover:bg-indigo-50"
                                                onClick={() => printExeatCard(e)}
                                                title="Print Command Pass"
                                            >
                                                <Printer className="size-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {exeats.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No active exeats found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 justify-center py-6 opacity-30 grayscale">
                <LogOut className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Student Movement & Security Protocol</p>
            </div>
        </div>
    );
}
