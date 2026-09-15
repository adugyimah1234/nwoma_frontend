'use client';

import React from 'react';
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  History,
  Activity,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from '@/components/ui/stats-card';
import { motion } from 'framer-motion';

import { useFinanceOverview } from '../hooks/useFinanceOverview';
import financialReports from '@/services/financial-reports';

export default function FeesOverview() {
  const { summary, progress, transactions, loading, refreshing, refresh } = useFinanceOverview();

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-[2rem]" />
      </div>
    );
  }

  const metrics = [
    {
        title: 'Total Collections',
        value: financialReports.formatCurrency(summary?.totalCollections || 0),
        trend: { value: summary?.totalCollectionsChange || 0, label: "this month" },
        icon: DollarSign
    },
    {
        title: 'Pending Payments',
        value: financialReports.formatCurrency(summary?.pendingPayments || 0),
        trend: { value: summary?.pendingPaymentsChange || 0, label: "in queue" },
        icon: CreditCard
    },
    {
        title: 'Outstanding Balance',
        value: financialReports.formatCurrency(summary?.outstandingBalance || 0),
        trend: { value: summary?.outstandingBalanceChange || 0, label: "unpaid" },
        icon: Activity
    },
    {
        title: 'Overdue Payments',
        value: financialReports.formatCurrency(summary?.overduePayments || 0),
        trend: { value: summary?.overduePaymentsChange || 0, label: "critical" },
        icon: AlertCircle
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight uppercase">Institutional Treasury</h3>
            <p className="text-[10px] font-bold uppercase tracking-tight text-primary/60 opacity-60">Real-time revenue monitoring</p>
        </div>
        <Button variant="outline" className="h-10 rounded-xl border-2 font-bold text-xs" onClick={refresh}>
            <RefreshCw className={refreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} /> Sync
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => (
            <StatsCard key={idx} {...m} className="shadow-xl shadow-black/5 border-none rounded-3xl p-8" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Collection Progress */}
          <Card className="lg:col-span-7 border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 px-8 py-8 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold uppercase tracking-wider">Revenue Milestone</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-tight opacity-60">Cycle: {progress?.period || 'Current Term'}</CardDescription>
                        </div>
                        <Badge className="bg-primary text-white border-none font-bold text-xl px-4 py-2 rounded-2xl shadow-lg shadow-primary/20">
                            {progress?.percentage.toFixed(0)}%
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">
                            <span>Achievement Progress</span>
                            <span>Target: {financialReports.formatCurrency(progress?.target || 0)}</span>
                        </div>
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress?.percentage}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-tight text-emerald-600/60">Collected Funds</p>
                            <p className="text-2xl font-bold tracking-tight text-emerald-600">{financialReports.formatCurrency(progress?.collected || 0)}</p>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-tight text-amber-600/60">Remaining Dues</p>
                            <p className="text-2xl font-bold tracking-tight text-amber-600">{financialReports.formatCurrency(progress?.remaining || 0)}</p>
                        </div>
                    </div>
                </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-5 border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-muted/20 px-8 py-8 border-b">
                  <div className="flex items-center justify-between">
                      <div className="space-y-1">
                          <CardTitle className="text-lg font-bold uppercase tracking-wider">Treasury Feed</CardTitle>
                          <CardDescription className="text-[10px] font-bold uppercase tracking-tight opacity-60">Real-time ledger updates</CardDescription>
                      </div>
                      <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                          <Activity className="size-5 text-muted-foreground" />
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                      <div className="divide-y divide-muted-foreground/5">
                          {transactions.map((tx) => (
                              <div key={tx.id} className="p-6 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-4 min-w-0">
                                      <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                          <TrendingUp className="size-5" />
                                      </div>
                                      <div className="min-w-0">
                                          <p className="font-bold text-sm tracking-tight truncate uppercase">{tx.student_name}</p>
                                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">ID: {String(tx.id).substring(0,8)}</p>
                                      </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                      <p className="font-bold text-sm text-primary">{financialReports.formatCurrency(tx.amount)}</p>
                                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{new Date(tx.date).toLocaleDateString()}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </ScrollArea>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}

