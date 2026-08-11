'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3,
    TrendingUp,
    Package,
    RefreshCw,
    PieChart,
    ArrowUpRight,
    ShoppingBag,
    Wallet,
    Download,
    Calendar
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

    if (loading) return <div className="p-20 text-center italic text-muted-foreground animate-pulse">Analyzing Inventory Logistics...</div>;

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Inventory Strategic Report"
                description="Analysis of provision sales, stock valuation, and category performance."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Store', href: '/fees/store' }, { title: 'Report' }]}
            >
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={fetchData}><RefreshCw className="size-4" /> Refresh Intelligence</Button>
                    <Button className="gap-2"><Download className="size-4" /> Export Logistics</Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-indigo-900 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Total Sales Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black">{formatCurrency(report?.total_revenue || 0)}</p>
                        <p className="text-[10px] uppercase font-bold text-indigo-200 mt-1 flex items-center gap-1"><TrendingUp className="size-3" /> Life-to-date collections</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-emerald-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Stock Valuation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black">{formatCurrency(report?.potential_revenue || 0)}</p>
                        <p className="text-[10px] uppercase font-bold text-emerald-100 mt-1 flex items-center gap-1"><Package className="size-3" /> Potential store revenue</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transactions Logged</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-slate-800">{report?.category_breakdown.reduce((sum: any, c: any) => sum + c.count, 0)}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Confirmed provision sales</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Performance */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Category Distribution</CardTitle>
                        <CardDescription>Revenue contribution by provision type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={report?.category_breakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="category" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={40}>
                                        {report?.category_breakdown.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Timeline */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Sales Trajectory</CardTitle>
                        <CardDescription>Logistics outflow over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={report?.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2 justify-center py-10 opacity-20 grayscale">
                <BarChart3 className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Logistics Intelligence & Command Oversight</p>
            </div>
        </div>
    );
}
