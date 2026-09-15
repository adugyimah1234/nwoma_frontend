'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3,
    TrendingUp,
    Package,
    RefreshCw,
    ShoppingBag,
    Download,
    Calendar,
    PieChart,
    ArrowUpRight,
    Wallet,
    Layers,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import inventoryService from '@/services/inventory';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { StatsCard } from '@/components/ui/stats-card';

export default function InventoryReportPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await inventoryService.getReport();
            setReport(data);
        } catch (err) {
            toast.error("Failed to load strategic intelligence");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    if (loading) return (
        <div className="flex flex-1 items-center justify-center h-[500px]">
            <div className="flex flex-col items-center gap-2">
                <RefreshCw className="size-8 animate-spin text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-tight">Analyzing Logistics...</p>
            </div>
        </div>
    );

    const COLORS = ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6 bg-slate-50/30 dark:bg-slate-950/30">
            <PageHeader
                title="Inventory Strategic Report"
                description="Analysis of provision sales, stock valuation, and category performance."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Store', href: '/fees/store' }, { title: 'Report' }]}
            >
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={fetchData}><RefreshCw className="size-3.5" /> Refresh Intelligence</Button>
                    <Button size="sm" className="gap-2"><Download className="size-3.5" /> Export Data</Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(report?.total_revenue || 0)}
                    icon={Wallet}
                    description="Life-to-date collections"
                />
                <StatsCard
                    title="Stock Valuation"
                    value={formatCurrency(report?.potential_revenue || 0)}
                    icon={Package}
                    description="Potential store revenue"
                />
                <StatsCard
                    title="Items Processed"
                    value={report?.category_breakdown.reduce((sum: any, c: any) => sum + c.count, 0)}
                    icon={Layers}
                    description="Confirmed provision sales"
                />
                <StatsCard
                    title="Activity Index"
                    value={`${report?.timeline?.length || 0}d`}
                    icon={Activity}
                    description="Active sales reporting"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Performance */}
                <Card className="shadow-none border border-border/60">
                    <CardHeader className="bg-muted/10 border-b py-5">
                        <div className="flex items-center gap-2">
                            <PieChart className="size-4 text-primary" />
                            <CardTitle className="text-base font-semibold uppercase tracking-tight">Category Distribution</CardTitle>
                        </div>
                        <CardDescription className="text-xs">Revenue contribution by provision type.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={report?.category_breakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="category" tick={{fontSize: 10, fontWeight: 600}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'none', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}
                                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                                    />
                                    <Bar dataKey="amount" radius={[2, 2, 0, 0]} barSize={32}>
                                        {report?.category_breakdown.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill="currentColor" className="text-muted-foreground/40" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Timeline */}
                <Card className="shadow-none border border-border/60">
                    <CardHeader className="bg-muted/10 border-b py-5">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-4 text-primary" />
                            <CardTitle className="text-base font-semibold uppercase tracking-tight">Sales Trajectory</CardTitle>
                        </div>
                        <CardDescription className="text-xs">Logistics outflow over the last active cycle.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={report?.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 600}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'none' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="currentColor"
                                        className="text-primary"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: 'currentColor', strokeWidth: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2 justify-center py-10 opacity-20">
                <BarChart3 className="size-6" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Logistics Intelligence & Strategic Oversight</p>
            </div>
        </div>
    );
}

