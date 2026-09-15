'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield,
    Clock,
    CheckCircle2,
    RefreshCw,
    TrendingUp,
    LogIn,
    LogOut,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

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
            toast.error("Failed to load attendance registry");
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
            toast.success(`Check-in successful. Status: ${res.status}`);
            fetchData();
        } catch (err) {
            toast.error("Check-in failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckOut = async () => {
        setProcessing(true);
        try {
            await performanceService.checkOut();
            toast.success("Check-out complete.");
            fetchData();
        } catch (err) {
            toast.error("Check-out failed");
        } finally {
            setProcessing(false);
        }
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '---';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
            <PageHeader
                title="Performance & Attendance"
                description="Track personnel reporting and classroom attendance."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Team', href: '/team' }, { title: 'Performance' }]}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="border-b bg-transparent w-full justify-start rounded-none h-auto p-0 gap-6">
                    <TabsTrigger
                        value="checkin"
                        className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                        Reporting Protocol
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger
                            value="registry"
                            className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Attendance Registry
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* CHECK-IN PROTOCOL */}
                <TabsContent value="checkin" className="mt-0 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Reporting Status</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <Shield className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">{user?.full_name}</h3>
                                        <p className="text-sm text-muted-foreground">Reporting Window: 07:00 - 08:00 AM</p>
                                    </div>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        Active
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={handleCheckIn}
                                        disabled={processing}
                                        className="h-14 font-semibold"
                                    >
                                        {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                        Check In
                                    </Button>
                                    <Button
                                        onClick={handleCheckOut}
                                        disabled={processing}
                                        variant="outline"
                                        className="h-14 font-semibold"
                                    >
                                        {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                                        Check Out
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-6 justify-center">
                                <p className="text-[11px] text-muted-foreground text-center max-w-[200px]">
                                    Late reporting is automatically logged in the system.
                                </p>
                            </CardFooter>
                        </Card>

                        <div className="md:col-span-1 lg:col-span-2 grid gap-6 sm:grid-cols-2 h-fit">
                            <Card className="shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Punctuality Rate</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="text-3xl font-bold">94.2%</div>
                                    <Progress value={94.2} className="h-2" />
                                    <p className="text-xs text-muted-foreground font-medium">Exceeding average threshold</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Late Occurrences</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="text-3xl font-bold text-destructive">02</div>
                                    <p className="text-xs text-muted-foreground font-medium mt-4 uppercase tracking-tight">Current month total</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ADMIN REGISTRY */}
                <TabsContent value="registry" className="mt-0">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                            <div>
                                <CardTitle className="text-lg font-semibold">Attendance Registry</CardTitle>
                                <CardDescription>Real-time log of all personnel reporting.</CardDescription>
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchData} className="h-8 w-8">
                                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Personnel</TableHead>
                                        <TableHead className="font-semibold text-center">Check-In</TableHead>
                                        <TableHead className="font-semibold text-center">Check-Out</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registry.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-medium">
                                                No records found for this period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {registry.map(r => (
                                        <TableRow key={r.id} className="group transition-colors hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{r.full_name}</span>
                                                    <span className="text-[11px] text-muted-foreground uppercase tracking-tight">{r.role_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-sm">{formatTime(r.check_in)}</TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">{formatTime(r.check_out)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        r.status === 'present' ? 'default' :
                                                        r.status === 'late' ? 'secondary' : 'destructive'
                                                    }
                                                    className="text-[10px] font-bold uppercase"
                                                >
                                                    {r.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs font-medium text-muted-foreground">
                                                {new Date(r.check_in).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex items-center gap-2 justify-center py-10 opacity-20">
                <Shield className="h-6 w-6" />
                <p className="text-[10px] font-bold uppercase tracking-tight">Attendance Management System</p>
            </div>
        </div>
    );
}

