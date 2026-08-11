'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList,
    Calendar,
    Plus,
    Trash2,
    RefreshCw,
    User,
    ShieldCheck,
    Clock,
    AlertCircle,
    MessageSquare,
    Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import dutyService, { DutyRecord } from '@/services/duty';
import { getAllUsers, User as StaffUser } from '@/services/users';
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

export default function StaffDutyRosterPage() {
    const { isAdmin } = useAuth();
    const [roster, setRoster] = useState<DutyRecord[]>([]);
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [broadcasting, setBroadcasting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newDuty, setNewDuty] = useState({
        user_id: '',
        duty_type: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rosterData, staffData] = await Promise.all([
                dutyService.getRoster(),
                getAllUsers()
            ]);
            setRoster(rosterData);
            setStaff(staffData);
        } catch (err) {
            toast.error("Failed to load command roster");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDuty.user_id || !newDuty.duty_type) return;

        try {
            await dutyService.create(newDuty);
            toast.success("Duty assignment broadcasted");
            setIsDialogOpen(false);
            setNewDuty({
                user_id: '',
                duty_type: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                remarks: ''
            });
            fetchData();
        } catch (err) {
            toast.error("Protocol failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Relieve staff member of this duty?")) return;
        try {
            await dutyService.delete(id);
            toast.success("Assignment terminated");
            fetchData();
        } catch (err) {
            toast.error("Relief operation failed");
        }
    };

    const handleBroadcastRoster = async () => {
        if (!confirm("Send SMS reminders to all staff with duties scheduled for this week?")) return;
        setBroadcasting(true);
        try {
            const res = await dutyService.broadcastWeekly();
            toast.success(`Roster broadcast complete: ${res.count} personnel notified.`);
        } catch (err) {
            toast.error("Broadcast failed");
        } finally {
            setBroadcasting(false);
        }
    };

    const isCurrentWeek = (start: string, end: string) => {
        const today = new Date();
        const s = new Date(start);
        const e = new Date(end);
        return today >= s && today <= e;
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Staff Duty & Command Roster"
                description="Manage weekly responsibilities and operational oversight for teaching staff."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Team', href: '/team' }, { title: 'Duty Roster' }]}
            >
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button variant="outline" className="gap-2 h-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={handleBroadcastRoster} disabled={broadcasting}>
                            {broadcasting ? <RefreshCw className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                            Notify Current Personnel
                        </Button>
                    )}
                    {isAdmin && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 h-10 shadow-lg shadow-primary/20">
                                    <Plus className="size-4" /> Assign Duty
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <form onSubmit={handleCreate}>
                                    <DialogHeader>
                                        <DialogTitle>New Operational Assignment</DialogTitle>
                                        <DialogDescription>Assign a specific duty period to a staff member.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Personnel Name</Label>
                                            <Select value={newDuty.user_id} onValueChange={v => setNewDuty({...newDuty, user_id: v})}>
                                                <SelectTrigger className="h-11"><SelectValue placeholder="Select Staff Member" /></SelectTrigger>
                                                <SelectContent>
                                                    {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Duty Type</Label>
                                            <Select value={newDuty.duty_type} onValueChange={v => setNewDuty({...newDuty, duty_type: v})}>
                                                <SelectTrigger className="h-11"><SelectValue placeholder="Select Responsibility" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Master on Duty">Master on Duty (M.O.D)</SelectItem>
                                                    <SelectItem value="Morning Assembly">Morning Assembly Oversight</SelectItem>
                                                    <SelectItem value="Grounds & Sanitation">Grounds & Sanitation</SelectItem>
                                                    <SelectItem value="Lunch & Dining">Lunch & Dining Hall</SelectItem>
                                                    <SelectItem value="Closing & Security">Closing & Security</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Start Date</Label>
                                                <Input type="date" value={newDuty.start_date} onChange={e => setNewDuty({...newDuty, start_date: e.target.value})} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>End Date</Label>
                                                <Input type="date" value={newDuty.end_date} onChange={e => setNewDuty({...newDuty, end_date: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Operational Remarks (Optional)</Label>
                                            <Input placeholder="Specific instructions..." value={newDuty.remarks} onChange={e => setNewDuty({...newDuty, remarks: e.target.value})} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700">Finalize Assignment</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm bg-indigo-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-300">Active M.O.D</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <ShieldCheck className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xl font-black">
                                        {roster.find(r => isCurrentWeek(r.start_date, r.end_date))?.staff_name || 'NONE ASSIGNED'}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold text-indigo-200">Current Week Command</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-muted/20">
                        <CardHeader><CardTitle className="text-xs font-black uppercase tracking-tighter">Duty Overview</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Total Assignments</span>
                                <Badge variant="secondary">{roster.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Upcoming</span>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                    {roster.filter(r => new Date(r.start_date) > new Date()).length}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Duty Registry</CardTitle>
                                <CardDescription>Scheduled operational responsibilities across the unit.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="size-4" /></Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold">Personnel</TableHead>
                                        <TableHead className="font-bold">Assignment</TableHead>
                                        <TableHead className="font-bold">Period</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roster.map(r => {
                                        const current = isCurrentWeek(r.start_date, r.end_date);
                                        const expired = new Date(r.end_date) < new Date();
                                        return (
                                            <TableRow key={r.id} className={current ? 'bg-indigo-50/30' : ''}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                                                            {r.staff_name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span className="font-bold text-xs uppercase tracking-tight">{r.staff_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase">{r.duty_type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="size-3" /> {new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {current ? (
                                                        <Badge className="bg-indigo-600 text-[9px] font-black uppercase">Active</Badge>
                                                    ) : expired ? (
                                                        <Badge variant="secondary" className="text-[9px] font-black uppercase">Expired</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase text-emerald-600 border-emerald-200">Scheduled</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {isAdmin && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(r.id)}>
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {roster.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No duty assignments logged for this period.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex items-center gap-2 justify-center py-6 opacity-30">
                <ClipboardList className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Institutional Command Integrity</p>
            </div>
        </div>
    );
}
