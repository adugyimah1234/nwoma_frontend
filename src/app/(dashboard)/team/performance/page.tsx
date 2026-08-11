'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Search,
    Calendar,
    Users,
    TrendingUp,
    MapPin,
    LogIn,
    LogOut,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import performanceService, { AttendanceRecord } from '@/services/performance';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffPerformancePage() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('checkin');
    const [registry, setRegistry] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await performanceService.getRegistry();
            setRegistry(data);
        } catch (err) {
            toast.error("Failed to load command registry");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCheckIn = async () => {
        setProcessing(true);
        try {
            const res = await performanceService.checkIn();
            toast.success(`Check-in protocol verified. Status: ${res.status.toUpperCase()}`);
            fetchData();
        } catch (err) {
            toast.error("Protocol authentication failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckOut = async () => {
        setProcessing(true);
        try {
            await performanceService.checkOut();
            toast.success("Check-out finalized. Duty complete.");
            fetchData();
        } catch (err) {
            toast.error("Check-out protocol failed");
        } finally {
            setProcessing(false);
        }
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '---';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Staff Performance & Attendance"
                description="Digital command tracking for personnel reporting and classroom attendance."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Team', href: '/team' }, { title: 'Performance' }]}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/20 border p-1 h-12 inline-flex items-center gap-1 rounded-xl">
                    <TabsTrigger value="checkin" className="gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-background">
                        <Clock className="size-4" /> Reporting Protocol
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="registry" className="gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-background">
                            <Shield className="size-4" /> Command Registry
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* CHECK-IN PROTOCOL */}
                <TabsContent value="checkin" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="md:col-span-1 border-none shadow-xl shadow-slate-200/50 bg-indigo-900 text-white overflow-hidden">
                            <div className="h-2 bg-yellow-500" />
                            <CardHeader>
                                <div className="size-12 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
                                    <Shield className="size-6 text-yellow-400" />
                                </div>
                                <CardTitle className="text-xl font-black">Reporting Hub</CardTitle>
                                <CardDescription className="text-indigo-200">Personnel: {user?.full_name}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pb-10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-indigo-300">Reporting Window</p>
                                            <p className="text-sm font-bold">07:00 - 08:00 AM</p>
                                        </div>
                                        <Badge className="bg-emerald-500 text-white border-none">ACTIVE</Badge>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={handleCheckIn}
                                            disabled={processing}
                                            className="flex-1 h-20 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white border-none flex-col gap-1 shadow-2xl shadow-emerald-500/20"
                                        >
                                            <LogIn className="size-6" />
                                            <span className="font-black text-[10px] uppercase">Verify Check-In</span>
                                        </Button>
                                        <Button
                                            onClick={handleCheckOut}
                                            disabled={processing}
                                            variant="outline"
                                            className="flex-1 h-20 rounded-3xl border-white/20 bg-white/5 text-white hover:bg-white/10 flex-col gap-1"
                                        >
                                            <LogOut className="size-6" />
                                            <span className="font-black text-[10px] uppercase">Finalize Duty</span>
                                        </Button>
                                    </div>
                                </div>

                                <p className="text-[10px] text-indigo-300 italic leading-relaxed text-center px-4">
                                    "Personnel reporting after 08:00 AM will be automatically flagged as LATE in the command registry."
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 border-none shadow-sm h-fit">
                            <CardHeader className="border-b bg-muted/5">
                                <CardTitle className="text-base font-bold">Performance Intel</CardTitle>
                                <CardDescription>Your current academic cycle reporting statistics.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Punctuality Rate</span>
                                        <TrendingUp className="size-3 text-emerald-500" />
                                    </div>
                                    <p className="text-3xl font-black">94.2%</p>
                                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[94%]" />
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Late Occurrences</span>
                                        <AlertCircle className="size-3 text-rose-500" />
                                    </div>
                                    <p className="text-3xl font-black text-rose-600">02</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">This Month</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ADMIN REGISTRY */}
                <TabsContent value="registry" className="mt-0">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-800">Operational Attendance Registry</CardTitle>
                                <CardDescription>Real-time audit of all personnel reporting across the unit.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="size-4" /></Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow>
                                        <TableHead className="font-bold">Personnel</TableHead>
                                        <TableHead className="font-bold text-center">Check-In</TableHead>
                                        <TableHead className="font-bold text-center">Check-Out</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="font-bold">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registry.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-bold text-xs uppercase">{r.full_name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{r.role_name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-black text-xs">{formatTime(r.check_in)}</TableCell>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">{formatTime(r.check_out)}</TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    r.status === 'present' ? 'bg-emerald-500' :
                                                    r.status === 'late' ? 'bg-orange-500' : 'bg-rose-500'
                                                + " text-[9px] font-black uppercase"}>
                                                    {r.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[10px] font-bold text-slate-500">
                                                {new Date(r.check_in).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex items-center gap-2 justify-center py-6 opacity-30 grayscale">
                <Shield className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Personnel Command Integrity System</p>
            </div>
        </div>
    );
}
