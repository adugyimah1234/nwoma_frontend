'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    User,
    ShieldAlert,
    BookOpen,
    History,
    Plus,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Briefcase,
    MapPin,
    Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import studentService from '@/services/students';
import disciplineService, { DisciplineLog } from '@/services/discipline';
import { Student } from '@/types/student';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function StudentProfilePage() {
    const { id } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [logs, setLogs] = useState<DisciplineLog[]>([]);
    const [loading, setLoading] = useState(true);

    // New Log Form
    const [newLog, setNewLog] = useState({
        offense: '',
        action_taken: '',
        severity: 'low',
        date_occurred: new Date().toISOString().split('T')[0]
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [studentData, logData] = await Promise.all([
                studentService.getById(id as string),
                disciplineService.getByStudent(id as string)
            ]);
            setStudent(studentData);
            setLogs(logData);
        } catch (err) {
            toast.error("Failed to load student dossier");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateLog = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await disciplineService.create({
                ...newLog,
                student_id: id as string,
                severity: newLog.severity as any
            });
            toast.success("Disciplinary record updated");
            setIsDialogOpen(false);
            setNewLog({ offense: '', action_taken: '', severity: 'low', date_occurred: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (err) {
            toast.error("Failed to record incident");
        }
    };

    if (loading) return <div className="p-8 text-center italic text-muted-foreground">Accessing Command Archives...</div>;
    if (!student) return <div className="p-8 text-center text-red-500 font-bold">STUDENT RECORD NOT FOUND</div>;

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title={`${student.first_name} ${student.last_name}`}
                description={`Student ID: ${String(student.id).substring(0,8).toUpperCase()} | ${(student as any).class_name || 'Unassigned'}`}
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students', href: '/students' }, { title: 'Profile' }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Profile Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <div className="h-32 bg-indigo-600 relative">
                            <div className="absolute -bottom-12 left-6 size-24 rounded-2xl bg-slate-200 border-4 border-background flex items-center justify-center font-black text-2xl text-indigo-600">
                                {student.first_name[0]}{student.last_name[0]}
                            </div>
                        </div>
                        <CardContent className="pt-16 pb-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                        Status: {student.status}
                                    </Badge>
                                    <Badge variant="outline" className="uppercase text-[10px]">
                                        Gender: {student.gender}
                                    </Badge>
                                </div>

                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Briefcase className="size-4 text-muted-foreground" />
                                        <span className="font-medium">{(student as any).category_name || 'Standard Enrollment'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="size-4 text-muted-foreground" />
                                        <span className="text-muted-foreground line-clamp-1">{(student as any).address || 'No Address Logged'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-indigo-600 font-bold">
                                        <Phone className="size-4" />
                                        <span>{(student as any).phone_number || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-muted/20">
                        <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest">Guardian Control</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-black">Primary Guardian</p>
                                <p className="text-sm font-bold uppercase">{(student as any).guardian_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-black">Emergency Contact</p>
                                <p className="text-sm font-bold text-indigo-600">{(student as any).guardian_phone_number || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="discipline" className="w-full">
                        <TabsList className="w-full justify-start h-12 bg-muted/20 p-1 border-b rounded-none gap-2">
                            <TabsTrigger value="academic" className="gap-2 data-[state=active]:bg-background"><BookOpen className="size-4" /> Performance</TabsTrigger>
                            <TabsTrigger value="discipline" className="gap-2 data-[state=active]:bg-background"><ShieldAlert className="size-4" /> Disciplinary Log</TabsTrigger>
                            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-background"><History className="size-4" /> Audit History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="academic" className="py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-none shadow-sm bg-indigo-50/50">
                                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-indigo-600">Cumulative GPA</CardTitle></CardHeader>
                                    <CardContent><p className="text-3xl font-black">3.8 / 4.0</p></CardContent>
                                </Card>
                                <Card className="border-none shadow-sm bg-emerald-50/50">
                                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-emerald-600">Rank in Class</CardTitle></CardHeader>
                                    <CardContent><p className="text-3xl font-black">04 / 42</p></CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="discipline" className="py-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">Behavioral Record</h3>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="gap-2"><Plus className="size-4" /> Record Incident</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={handleCreateLog}>
                                            <DialogHeader>
                                                <DialogTitle>Log Disciplinary Incident</DialogTitle>
                                                <DialogDescription>Recorded incidents are permanently attached to the student's Garrison profile.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Offense / Description</Label>
                                                    <Input required value={newLog.offense} onChange={e => setNewLog({...newLog, offense: e.target.value})} placeholder="e.g. Chronic lateness" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Action Taken</Label>
                                                    <Input required value={newLog.action_taken} onChange={e => setNewLog({...newLog, action_taken: e.target.value})} placeholder="e.g. Parent notified, 2 days suspension" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label>Severity</Label>
                                                        <Select value={newLog.severity} onValueChange={v => setNewLog({...newLog, severity: v})}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="low">Low (Minor)</SelectItem>
                                                                <SelectItem value="medium">Medium</SelectItem>
                                                                <SelectItem value="high">High (Major)</SelectItem>
                                                                <SelectItem value="critical">Critical (Expulsion Risk)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Date Occurred</Label>
                                                        <Input type="date" value={newLog.date_occurred} onChange={e => setNewLog({...newLog, date_occurred: e.target.value})} />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter><Button type="submit">Record to Registry</Button></DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="space-y-4">
                                {logs.length > 0 ? logs.map(log => (
                                    <div key={log.id} className="p-4 border rounded-xl flex gap-4 bg-muted/5">
                                        <div className={`mt-1 size-8 rounded-full flex items-center justify-center shrink-0 ${
                                            log.severity === 'critical' ? 'bg-red-100 text-red-600' :
                                            log.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            <AlertTriangle className="size-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold uppercase text-sm">{log.offense}</p>
                                                <Badge variant="outline" className="text-[10px]">{log.date_occurred}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{log.action_taken}</p>
                                            <div className="pt-2 flex items-center gap-2">
                                                <span className="text-[10px] text-muted-foreground italic">Recorded by: {log.recorded_by_name || 'Registry'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-emerald-50/10">
                                        <CheckCircle2 className="size-10 text-emerald-500/30 mb-2" />
                                        <p className="text-sm font-medium text-emerald-700">Clean behavioral record found.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
