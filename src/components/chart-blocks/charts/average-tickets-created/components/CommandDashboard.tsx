'use client';

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    RefreshCw,
    CreditCard,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    ShieldAlert,
    LogOut,
    History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFinancialOverview, FinancialOverview } from '@/services/dashboard';
import { toast } from 'sonner';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

import DailyPaymentDashboard from './PaymentSummaryCard';
import SlotsChart from './SlotsChart';

export default function CommandDashboard() {
    const [data, setData] = useState<FinancialOverview | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await getFinancialOverview();
            setData(res);
        } catch (err) {
            toast.error("Failed to sync metrics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(val);
    };

    const renderTrend = (value: number) => {
        const isPositive = value >= 0;
        return (
            <p className={cn(
                "flex items-center gap-1 text-xs font-medium mt-1",
                isPositive ? "text-emerald-500" : "text-rose-500"
            )}>
                {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {Math.abs(value)}% from last month
            </p>
        );
    };

    if (loading && !data) return (
        <div className="flex flex-1 flex-col gap-6 p-8">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/20 border shadow-sm" />)}
            </div>
        </div>
    );

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-sm text-muted-foreground">Institutional metrics and performance intelligence.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={fetchDashboard} variant="outline" size="sm">
                        <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} /> Re-Sync
                    </Button>
                    <Button onClick={() => toast.success("Dossier generated.")} size="sm">
                        <Download className="mr-2 size-4" /> Download
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="treasury">Treasury Intel</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                    <TabsTrigger value="audit">Audit Log</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="shadow-sm border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(data?.summary.totalCollections || 0)}</div>
                                {renderTrend(data?.summary.totalCollectionsChange || 0)}
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Arrears</CardTitle>
                                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(data?.extendedMetrics?.total_debt || 0)}</div>
                                {renderTrend(data?.summary.outstandingBalanceChange || 0)}
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(data?.extendedMetrics?.monthly_expenses || 0)}</div>
                                {renderTrend(data?.summary.pendingPaymentsChange || 0)}
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Exeats</CardTitle>
                                <LogOut className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{data?.extendedMetrics?.active_exeats || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Students Off-Premises</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 shadow-sm border bg-background/50">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2 pt-4">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.cashFlow || []} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis
                                                dataKey="month"
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}
                                            />
                                            <YAxis
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `GHS${value/1000}k`}
                                            />
                                            <Tooltip
                                                cursor={{fill: 'currentColor', opacity: 0.1}}
                                                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                            />
                                            <Bar dataKey="inflow" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" barSize={35} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 shadow-sm border bg-background/50">
                            <CardHeader>
                                <CardTitle>Recent Payments</CardTitle>
                                <CardDescription>
                                    You received {data?.recentTransactions.length || 0} payments this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8 mt-4">
                                    {data?.recentTransactions.map((tx: any) => (
                                        <div key={tx.id} className="flex items-center">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={`https://avatar.vercel.sh/${tx.student_name}.png`} alt="Avatar" />
                                                <AvatarFallback>{tx.student_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{tx.student_name}</p>
                                                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                                                    {tx.student_name.toLowerCase().replace(/\s+/g, '.')}@gmail.com
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">+{formatCurrency(tx.amount)}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="treasury" className="space-y-4">
                    <DailyPaymentDashboard />
                </TabsContent>

                <TabsContent value="operations" className="space-y-4">
                    <SlotsChart />
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                    <Card className="border p-20 flex flex-col items-center justify-center space-y-4 border-dashed bg-muted/20">
                        <History className="size-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground italic">Master Audit Trail Syncing...</p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

