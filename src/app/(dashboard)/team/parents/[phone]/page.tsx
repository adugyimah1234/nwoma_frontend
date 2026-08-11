'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    User,
    Phone,
    MapPin,
    GraduationCap,
    BookOpen,
    Wallet,
    ArrowLeft,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    RefreshCw,
    ChevronRight,
    Search,
    MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import parentService, { ParentDashboardData } from '@/services/parents';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function ParentPerformanceDashboardPage() {
    const { phone } = useParams();
    const router = useRouter();
    const [data, setData] = useState<ParentDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [broadcasting, setBroadcasting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!phone) return;
        setLoading(true);
        try {
            const res = await parentService.getDashboard(phone as string);
            setData(res);
        } catch (err) {
            toast.error("Failed to load family metrics");
        } finally {
            setLoading(false);
        }
    }, [phone]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    const handleBroadcast = async () => {
        if (!phone) return;
        setBroadcasting(true);
        try {
            await parentService.broadcastStatus(phone as string);
            toast.success("Consolidated status transmitted to guardian");
        } catch (err) {
            toast.error("Broadcast protocol failed");
        } finally {
            setBroadcasting(false);
        }
    };

    if (loading) return <div className="p-20 text-center italic text-muted-foreground animate-pulse">Syncing Family Dossier...</div>;
    if (!data) return <div className="p-20 text-center text-rose-500 font-bold">GUARDIAN PROFILE NOT FOUND</div>;

    const totalFamilyDebt = data.wards.reduce((sum, w) => sum + w.financial.balance, 0);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="size-4" /></Button>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold">GUARDIAN DOSSIER</Badge>
            </div>

            <PageHeader
                title={data.wards[0]?.student.guardian_name || 'Family Performance'}
                description={`Command Overview for Family Contact: ${data.guardian_phone}`}
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Parents', href: '/team/parents' }, { title: 'Dossier' }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Guardian Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm bg-indigo-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-300">Family Financial Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-indigo-200">Consolidated Arrears</p>
                                <p className="text-3xl font-black">{formatCurrency(totalFamilyDebt)}</p>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                                    <span>Ward Count</span>
                                    <span>{data.wards.length}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase">
                                    <span>Primary Location</span>
                                    <span className="truncate max-w-[100px]">{data.wards[0]?.student.address || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-muted/20">
                        <CardHeader><CardTitle className="text-xs font-black uppercase tracking-tighter">Quick Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start gap-2 h-9 text-xs" variant="outline"><Phone className="size-3" /> Call Guardian</Button>
                            <Button
                                onClick={handleBroadcast}
                                disabled={broadcasting}
                                className="w-full justify-start gap-2 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md"
                            >
                                {broadcasting ? <RefreshCw className="size-3 animate-spin" /> : <MessageSquare className="size-3" />}
                                Broadcast Family Status
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Ward Performance Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <GraduationCap className="size-5 text-indigo-600" /> Active Wards Profile
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.wards.map((w, idx) => (
                            <Card key={idx} className="border-none shadow-lg shadow-slate-200/50 group overflow-hidden">
                                <div className="h-1 bg-indigo-600" />
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base font-black uppercase">{w.student.first_name} {w.student.last_name}</CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">{w.student.class_name} | {w.student.school_name}</CardDescription>
                                        </div>
                                        <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black">{w.student.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Academic Snapshot */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1"><BookOpen className="size-3" /> Academic Performance</span>
                                            <span className="text-sm font-black text-indigo-600">{w.academic.average}% AVG</span>
                                        </div>
                                        <Progress value={parseFloat(w.academic.average)} className="h-1.5" />
                                    </div>

                                    {/* Financial Snapshot */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1"><Wallet className="size-3" /> Fee Ledger</span>
                                            {w.financial.balance > 0 ? (
                                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 text-[8px] font-black">OWING: {formatCurrency(w.financial.balance)}</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[8px] font-black">CLEARED</Badge>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold text-muted-foreground">Total Paid</span>
                                            <span className="font-black text-slate-800 dark:text-white">{formatCurrency(w.financial.paid)}</span>
                                        </div>
                                    </div>

                                    <Button variant="link" className="w-full text-[10px] font-black uppercase tracking-widest text-indigo-600 gap-2 h-auto p-0" onClick={() => router.push(`/students/${w.student.id}`)}>
                                        VIEW FULL ACADEMIC DOSSIER <ChevronRight className="size-3" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 justify-center py-10 opacity-20 grayscale">
                <ShieldCheck className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Family Performance & Command Registry</p>
            </div>
        </div>
    );
}
