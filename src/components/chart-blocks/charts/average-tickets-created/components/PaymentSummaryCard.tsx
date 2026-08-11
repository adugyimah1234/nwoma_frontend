'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  BookOpen,
  GraduationCap,
  Shirt,
  Home,
  Calculator,
  TrendingUp,
  BarChart3,
  CreditCard,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { getReceipts } from '@/services/receipt';
import { Category, getAllCategories } from '@/services/categories';
import { Student } from '@/types/student';
import studentService from '@/services/students';
import { type Receipt } from '../../../../../types/receipt';

export default function DailyPaymentDashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [receiptData, categoryData, studentData] = await Promise.all([
          getReceipts(),
          getAllCategories(),
          studentService.getAll()
        ]);
        
        const allowedTypes = ["registration", "levy", "textBooks", "exerciseBooks", "furniture", "jersey", "crest"];

        setReceipts(
          receiptData.map((receipt: any) => ({
            ...receipt,
            receipt_items: (receipt.receipt_items || [])
              .filter((item: any) => allowedTypes.includes(item.receipt_type))
          }))
        );
        setCategories(categoryData);
        setStudents(studentData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryConfig = {
    registration: { name: 'Registration', color: 'hsl(var(--primary))', icon: GraduationCap },
    levy: { name: 'School Levy', color: '#10b981', icon: Calculator },
    textBooks: { name: 'Text Books', color: '#f59e0b', icon: BookOpen },
    exerciseBooks: { name: 'Exercise Books', color: '#ef4444', icon: BookOpen },
    furniture: { name: 'Furniture', color: '#8b5cf6', icon: Home },
    crest: { name: 'Crest', color: '#06b6d4', icon: Shirt },
    jersey: { name: 'Jersey', color: '#86d800', icon: Shirt }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(amount);
  };

  const getDateRange = () => {
    if (viewMode === 'all') return { start: new Date('2000-01-01'), end: new Date('2999-12-31') };
    const selected = selectedDate ? new Date(selectedDate) : new Date();
    
    switch (viewMode) {
      case 'daily':
        return {
          start: new Date(new Date(selected).setHours(0, 0, 0, 0)),
          end: new Date(new Date(selected).setHours(23, 59, 59, 999))
        };
      case 'weekly': {
        const weekStart = new Date(selected);
        weekStart.setDate(selected.getDate() - selected.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return { start: weekStart, end: weekEnd };
      }
      case 'monthly':
        return {
          start: new Date(selected.getFullYear(), selected.getMonth(), 1, 0, 0, 0, 0),
          end: new Date(selected.getFullYear(), selected.getMonth() + 1, 0, 23, 59, 59, 999)
        };
      default:
        return { start: new Date('2000-01-01'), end: new Date('2999-12-31') };
    }
  };

  const summary = useMemo(() => {
    const { start, end } = getDateRange();
    const currentReceipts = receipts.filter(r => {
      const d = new Date(r.date_issued);
      return d >= start && d <= end;
    });

    const currentTotal = currentReceipts.reduce((sum, r) => sum + (r.receipt_items?.reduce((s, item) => s + Number(item.amount || 0), 0) ?? 0), 0);

    const categoryMap: Record<string, { amount: number; count: number }> = {};
    currentReceipts.forEach((r) => {
      r.receipt_items?.forEach((item) => {
        const key = item.receipt_type;
        if (!categoryMap[key]) categoryMap[key] = { amount: 0, count: 0 };
        categoryMap[key].amount += Number(item.amount || 0);
        categoryMap[key].count += 1;
      });
    });

    const categoriesSummary = Object.entries(categoryConfig)
      .map(([key, config]) => {
        const cat = categoryMap[key] || { amount: 0, count: 0 };
        return {
          name: config.name,
          shortName: config.name.replace('School ', ''),
          amount: cat.amount,
          count: cat.count,
          percentage: currentTotal > 0 ? (cat.amount / currentTotal) * 100 : 0,
          color: config.color,
          icon: config.icon,
        };
      })
      .filter((cat) => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return {
      totalRevenue: currentTotal,
      totalTransactions: currentReceipts.length,
      categories: categoriesSummary,
    };
  }, [receipts, selectedDate, viewMode]);

  if (loading) return (
      <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-muted/50" />
          ))}
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Treasury Intel</h3>
            <p className="text-sm text-muted-foreground">Revenue breakdown and collection performance.</p>
        </div>

        <div className="flex items-center gap-2">
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={viewMode === 'all'}
            />
            <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
                <option value="all">All Logs</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processed funds in period</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified receipts issued</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Intake</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue / summary.totalTransactions || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Value per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
            <CardDescription>Revenue share across payment classifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.categories} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="shortName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 500 }}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `GHS ${val/1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={32}>
                    {summary.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Resource Allocation</CardTitle>
                <CardDescription>Detailed breakdown of funds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {summary.categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted/50">
                            <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-sm font-medium leading-none">
                                <span>{cat.name}</span>
                                <span>{cat.percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={cat.percentage} className="h-1.5" />
                        </div>
                    </div>
                ))}
                {summary.categories.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                        <BarChart3 className="h-8 w-8 text-muted-foreground/20" />
                        <p className="mt-2 text-xs text-muted-foreground">No data for selected period</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
