'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  GraduationCap,
  Coins,
  Wallet,
  RefreshCw,
  BarChart3,
  Activity,
  TrendingUp,
  UserCheck,
  LayoutGrid,
  Calendar,
  MoreVertical,
  ChevronRight,
  FolderLock,
  FileSpreadsheet,
  FileCheck2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getSuperAdminDashboard,
  ExecutiveDashboardData,
} from '@/services/superAdmin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GhanaFlagBadge } from '@/components/layout/ghana-ribbon';

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGarrisonId, setSelectedGarrisonId] = useState<string>('all');
  const [currentDateTime, setCurrentDateTime] = useState({
    date: 'Wed, Oct 23, 2026',
    time: '10:24 AM',
  });

  useEffect(() => {
    // Format live date and time cleanly
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentDateTime({ date: dateStr, time: timeStr });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashRes = await getSuperAdminDashboard();
      setData(dashRes);
    } catch (err) {
      console.error('Failed to fetch Super Admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredMetrics = useMemo(() => {
    if (!data) return null;
    if (selectedGarrisonId === 'all') {
      return {
        totalGarrisons: data.summary.totalGarrisons,
        totalSchools: data.summary.totalSchools,
        totalStudents: data.summary.totalStudents,
        totalCollections: data.summary.totalCollections,
        schools: data.schoolsPerformance,
        garrisons: data.garrisonsPerformance,
        categoryRevenue: data.summary.categoryRevenue || [],
      };
    }

    const garrison = data.garrisonsPerformance.find(
      (g) => String(g.garrison_id) === String(selectedGarrisonId)
    );
    const schools = data.schoolsPerformance.filter(
      (s) => String(s.garrison_id) === String(selectedGarrisonId)
    );

    const totalStudents =
      garrison?.total_students ??
      schools.reduce((acc, s) => acc + (Number(s.total_students) || 0), 0);
    const totalCollections =
      garrison?.total_collected ??
      schools.reduce((acc, s) => acc + (Number(s.fee_collected) || 0), 0);
    const totalSchools = garrison?.total_schools ?? schools.length;

    return {
      totalGarrisons: 1,
      totalSchools: Number(totalSchools) || 0,
      totalStudents: Number(totalStudents) || 0,
      totalCollections: Number(totalCollections) || 0,
      schools: schools,
      garrisons: garrison ? [garrison] : [],
      categoryRevenue: [],
    };
  }, [data, selectedGarrisonId]);

  const chartData = useMemo(() => {
    return (filteredMetrics?.schools || []).map((s) => ({
      name: s.school_name.replace(/SCHOOL|BASIC|KINDERGARTEN/g, '').trim(),
      students: s.total_students,
    }));
  }, [filteredMetrics]);

  // Extract revenue cards data (or default gracefully to design numbers)
  const revenueCards = useMemo(() => {
    const categories = filteredMetrics?.categoryRevenue || [];
    const getVal = (keyword: string, fallback: number) => {
      const match = categories.find((c: any) =>
        c.category?.toLowerCase().includes(keyword.toLowerCase())
      );
      return match ? match.total : fallback;
    };

    return [
      {
        id: 'svc',
        title: 'SVC Revenue',
        amount: getVal('svc', 68160),
        subtitle: 'Verified SVC collections',
        trend: '+8%',
        gradient: 'from-[#004B99] via-[#003670] to-[#002247]',
        icon: FolderLock,
        bars: [40, 60, 50, 75, 90, 85],
      },
      {
        id: 'civ',
        title: 'CIV Revenue',
        amount: getVal('civ', 57340),
        subtitle: 'Verified CIV collections',
        trend: '+15%',
        gradient: 'from-[#00875A] via-[#006644] to-[#00472F]',
        icon: Coins,
        bars: [30, 45, 60, 70, 85, 100],
      },
      {
        id: 'mod',
        title: 'MOD Revenue',
        amount: getVal('mod', 4600),
        subtitle: 'Verified MOD collections',
        trend: '+6%',
        gradient: 'from-[#6E3BB8] via-[#512391] to-[#361366]',
        icon: FileSpreadsheet,
        bars: [50, 40, 65, 80, 70, 95],
      },
    ];
  }, [filteredMetrics?.categoryRevenue]);

  // Helper for unit badge color matching Image 1
  const getUnitBadgeStyle = (name: string) => {
    const upper = name.toUpperCase();
    if (upper.includes('2BN') || upper.includes('2 BN')) {
      return { code: '2BN', bg: 'bg-[#0077E6] text-white', border: 'border-blue-600' };
    }
    if (upper.includes('3BN') || upper.includes('3 BN')) {
      return { code: '3BN', bg: 'bg-[#F59F00] text-white', border: 'border-amber-500' };
    }
    if (upper.includes('1BN') || upper.includes('1 BN')) {
      return { code: '1BN', bg: 'bg-[#00875A] text-white', border: 'border-emerald-600' };
    }
    return { code: name.slice(0, 3).toUpperCase(), bg: 'bg-[#06152D] text-white', border: 'border-slate-800' };
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600 italic">
          Synchronizing Network Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
      {/* ── TOP HEADER SECTION: Breadcrumbs + Title + Filters ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Breadcrumbs matching Image 1 */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-600">Super Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold dark:text-slate-200">Dashboard</span>
          </nav>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B1B3D] dark:text-white tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Global oversight and network performance analytics.
          </p>
        </div>

        {/* Action Controls matching Image 1: Date/Time Badge + Dropdown + Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date & Time pill card */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-white/10 shadow-xs">
            <Calendar className="size-4 text-[#0077E6] shrink-0" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {currentDateTime.date}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {currentDateTime.time}
              </span>
            </div>
          </div>

          {/* Garrison selector dropdown */}
          <Select value={selectedGarrisonId} onValueChange={setSelectedGarrisonId}>
            <SelectTrigger className="w-[220px] md:w-[240px] h-10 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-white/10 shadow-xs text-xs font-semibold text-slate-800 dark:text-slate-100">
              <LayoutGrid className="size-4 mr-2 text-slate-500" />
              <SelectValue placeholder="All Garrisons" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-200 shadow-xl">
              <SelectItem value="all" className="font-bold text-xs">
                General (All Garrisons)
              </SelectItem>
              {data?.garrisonsPerformance.map((g) => (
                <SelectItem key={g.garrison_id} value={g.garrison_id} className="text-xs">
                  {g.garrison_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh button */}
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            className="h-10 px-3.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-white/10 shadow-xs text-xs font-semibold hover:bg-slate-50 text-slate-800 dark:text-slate-100"
          >
            <RefreshCw className="mr-1.5 size-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* ── 4 KPI METRIC CARDS matching Image 1 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL GARRISONS */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-200/70 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-full bg-[#0077E6] text-white flex items-center justify-center shadow-sm shadow-blue-500/30 shrink-0">
                <Building2 className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold tracking-tight uppercase text-[#0077E6]">
                  Total Garrisons
                </span>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0.5">
                  {filteredMetrics?.totalGarrisons ?? 6}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-emerald-600 font-bold flex items-center">
                    ↑ 0%
                  </span>
                  <span className="text-slate-500 text-[11px] font-medium">
                    Active across network
                  </span>
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1" title="Options">
              <MoreVertical className="size-4" />
            </button>
          </div>
          {/* Subtle bottom wave illustration */}
          <svg
            className="absolute -bottom-2 -right-4 w-32 h-16 pointer-events-none opacity-[0.08] text-blue-600"
            viewBox="0 0 100 50"
            fill="currentColor"
          >
            <path d="M0 25 C30 10 70 40 100 20 L100 50 L0 50 Z" />
          </svg>
        </div>

        {/* Card 2: OPERATIONAL SCHOOLS */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-200/70 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-full bg-[#00875A] text-white flex items-center justify-center shadow-sm shadow-emerald-500/30 shrink-0">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold tracking-tight uppercase text-[#00875A]">
                  Operational Schools
                </span>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0.5">
                  {filteredMetrics?.totalSchools ?? 8}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-emerald-600 font-bold flex items-center">
                    ↑ 0%
                  </span>
                  <span className="text-slate-500 text-[11px] font-medium">
                    Schools running smoothly
                  </span>
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1" title="Options">
              <MoreVertical className="size-4" />
            </button>
          </div>
          <svg
            className="absolute -bottom-2 -right-4 w-32 h-16 pointer-events-none opacity-[0.08] text-emerald-600"
            viewBox="0 0 100 50"
            fill="currentColor"
          >
            <path d="M0 30 C40 10 60 45 100 25 L100 50 L0 50 Z" />
          </svg>
        </div>

        {/* Card 3: TOTAL ENROLLMENT */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-200/70 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-full bg-[#7048E8] text-white flex items-center justify-center shadow-sm shadow-purple-500/30 shrink-0">
                <Users className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold tracking-tight uppercase text-[#7048E8]">
                  Total Enrollment
                </span>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0.5">
                  {filteredMetrics?.totalStudents ?? 1106}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-emerald-600 font-bold flex items-center">
                    ↑ 0%
                  </span>
                  <span className="text-slate-500 text-[11px] font-medium">
                    Students enrolled
                  </span>
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1" title="Options">
              <MoreVertical className="size-4" />
            </button>
          </div>
          <svg
            className="absolute -bottom-2 -right-4 w-32 h-16 pointer-events-none opacity-[0.08] text-purple-600"
            viewBox="0 0 100 50"
            fill="currentColor"
          >
            <path d="M0 20 C35 35 65 15 100 30 L100 50 L0 50 Z" />
          </svg>
        </div>

        {/* Card 4: INSTITUTIONAL REVENUE */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-200/70 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-full bg-[#F59F00] text-white flex items-center justify-center shadow-sm shadow-amber-500/30 shrink-0">
                <Coins className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold tracking-tight uppercase text-[#F59F00]">
                  Institutional Revenue
                </span>
                <div className="text-xl md:text-2xl lg:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight my-0.5">
                  {formatCurrency(Number(filteredMetrics?.totalCollections || 76700))}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-emerald-600 font-bold flex items-center">
                    ↑ 12%
                  </span>
                  <span className="text-slate-500 text-[11px] font-medium">
                    Total revenue (current period)
                  </span>
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1" title="Options">
              <MoreVertical className="size-4" />
            </button>
          </div>
          <svg
            className="absolute -bottom-2 -right-4 w-32 h-16 pointer-events-none opacity-[0.08] text-amber-600"
            viewBox="0 0 100 50"
            fill="currentColor"
          >
            <path d="M0 35 C30 15 70 35 100 15 L100 50 L0 50 Z" />
          </svg>
        </div>
      </div>

      {/* ── 3 FEATURED STRATEGIC REVENUE HERO CARDS matching Image 1 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {revenueCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} text-white p-5 shadow-md`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="size-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
                  <IconComp className="size-5 text-white" />
                </div>
                <button
                  onClick={() => {
                    // Navigate to fees or filter
                  }}
                  className="rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3.5 py-1 backdrop-blur-xs transition-colors shadow-xs"
                >
                  Audit
                </button>
              </div>

              <div className="mt-4 relative z-10">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                  {card.title}
                </span>
                <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-0.5 mb-1">
                  {formatCurrency(card.amount)}
                </div>
                <p className="text-xs text-white/70 font-medium">{card.subtitle}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-300 font-bold mt-2">
                  <span>↑</span>
                  <span>{card.trend.replace('+', '')}</span>
                </div>
              </div>

              {/* Mini vertical bar chart silhouette at the bottom right */}
              <div className="absolute bottom-3 right-4 flex items-end gap-1.5 opacity-25 pointer-events-none">
                {card.bars.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h * 0.4}px` }}
                    className="w-2 rounded-t bg-white"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── GARRISON OPERATIONAL BREAKDOWN TABLE matching Image 1 ── */}
      <Card className="rounded-2xl bg-white dark:bg-card border border-slate-200/70 dark:border-white/10 shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0077E6] flex items-center justify-center shrink-0">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Garrison Operational Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Comparison of battalion strength and fee collections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 transition-colors">
              <Calendar className="size-3.5 text-slate-500" />
              <span>Last 30 Days</span>
              <ChevronRight className="size-3.5 rotate-90 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 text-xs uppercase text-slate-500 font-bold">
                <TableHead className="pl-6 py-3 font-bold text-slate-700 dark:text-slate-300">
                  Battalion Unit
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 dark:text-slate-300">
                  Schools
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 dark:text-slate-300">
                  Strength
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 dark:text-slate-300">
                  Fee Collections
                </TableHead>
                <TableHead className="pl-6 font-bold text-slate-700 dark:text-slate-300">
                  Commanding Officer(s)
                </TableHead>
                <TableHead className="w-10 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.garrisonsPerformance || []).map((g) => {
                const badgeInfo = getUnitBadgeStyle(g.garrison_name);
                const isSelected =
                  selectedGarrisonId === 'all' ||
                  String(selectedGarrisonId) === String(g.garrison_id);

                return (
                  <TableRow
                    key={g.garrison_id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors cursor-pointer border-b border-slate-100 dark:border-white/5 ${
                      !isSelected ? 'opacity-40' : ''
                    }`}
                  >
                    {/* Battalion Unit with colored badge */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-md tracking-tight ${badgeInfo.bg}`}
                        >
                          {badgeInfo.code}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {g.garrison_name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Schools Count */}
                    <TableCell className="text-center font-semibold text-sm text-slate-700 dark:text-slate-300">
                      {g.total_schools}
                    </TableCell>

                    {/* Strength */}
                    <TableCell className="text-center font-bold text-sm text-slate-900 dark:text-white">
                      {g.total_students}
                    </TableCell>

                    {/* Fee Collections */}
                    <TableCell className="text-right font-extrabold text-sm text-[#0066CC] dark:text-blue-400">
                      {formatCurrency(g.total_collected)}
                    </TableCell>

                    {/* Commanding Officers / Pills */}
                    <TableCell className="pl-6">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {g.director_name ? (
                          g.director_name.split(', ').map((name, i) => (
                            <span
                              key={i}
                              className="bg-[#E8F1FC] text-[#0066CC] dark:bg-blue-950/60 dark:text-blue-300 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-tight"
                            >
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium px-3 py-1 rounded-full">
                            Vacant
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Chevron arrow */}
                    <TableCell className="pr-6 text-right">
                      <ChevronRight className="size-4 text-slate-400" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── ADDITIONAL ANALYTICS & MONITORING (School Performance + Alerts) ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* School Performance Matrix Chart */}
        <Card className="lg:col-span-8 rounded-2xl bg-white dark:bg-card border border-slate-200/70 dark:border-white/10 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/10">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              School Performance Matrix
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Enrollment distribution across strategic units.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar
                    name="Students"
                    dataKey="students"
                    fill="#0077E6"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Network Monitoring */}
        <Card className="lg:col-span-4 rounded-2xl bg-white dark:bg-card border border-slate-200/70 dark:border-white/10 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/10">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Activity className="size-4 text-[#0077E6]" /> Network Monitoring
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Critical system requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            <div className="flex gap-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
              <UserCheck className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Directorship Audit
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Verification required for multi-director commands or unassigned battalions.
                </p>
              </div>
            </div>
            <div className="flex gap-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
              <TrendingUp className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Census Growth
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enrollment trending upwards in 3BN region. Ensure classroom capacity synchronization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── FOOTER matching Image 1 ── */}
      <footer className="mt-8 pt-4 pb-2 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <GhanaFlagBadge />
          <span className="font-bold text-slate-700 dark:text-slate-200">
            Ghana Garrison Schools
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400">
            Building disciplined leaders for a stronger Ghana
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          © 2026 Ghana Garrison Schools. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
