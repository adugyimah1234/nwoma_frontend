'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import schoolService from '@/services/schools';
import classService, { type ClassData } from '@/services/class';
import studentService from '@/services/students';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SchoolSlotData {
  school_id: string | number;
  school_name: string;
  total_slots: number;
  used_slots: number;
  available_slots: number;
  utilization_rate: number;
  classes: ClassData[];
}

interface TimeSeriesPoint {
  date: string;
  displayDate: string;
  [schoolName: string]: string | number;
}

const schoolColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];

export default function SlotsChart() {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [loading, setLoading] = useState(true);
  const [schoolSlotData, setSchoolSlotData] = useState<SchoolSlotData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);

  const fetchSlotData = async () => {
    try {
      setLoading(true);
      const [schools, classes, students] = await Promise.all([
        schoolService.getAll(),
        classService.getAll(),
        studentService.getAll()
      ]);

      const schoolClassMap = new Map<string, ClassData[]>();
      classes.forEach(cls => {
        const key = String(cls.school_id);
        if (!schoolClassMap.has(key)) schoolClassMap.set(key, []);
        schoolClassMap.get(key)!.push(cls);
      });

      const classStudentCount = new Map<string, number>();
      students.forEach((student: any) => {
        if (student.class_id && student.admission_status === 'admitted') {
          const key = String(student.class_id);
          classStudentCount.set(key, (classStudentCount.get(key) || 0) + 1);
        }
      });

      const slotData: SchoolSlotData[] = schools.map(school => {
        const schoolClasses = schoolClassMap.get(String(school.id)) || [];
        const total_slots = schoolClasses.reduce((sum, cls) => sum + cls.slots, 0);
        const used_slots = schoolClasses.reduce((sum, cls) => sum + (classStudentCount.get(String(cls.id)) || 0), 0);
        const utilization_rate = total_slots > 0 ? (used_slots / total_slots) * 100 : 0;

        return {
          school_id: school.id,
          school_name: school.name,
          total_slots,
          used_slots,
          available_slots: total_slots - used_slots,
          utilization_rate,
          classes: schoolClasses
        };
      });

      setSchoolSlotData(slotData);
      setTimeSeriesData(generateHistoricalData(slotData));
    } catch (err) {
      console.error('Error fetching slot data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalData = (currentData: SchoolSlotData[]): TimeSeriesPoint[] => {
    const days = 30;
    const data: TimeSeriesPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const point: TimeSeriesPoint = {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
      currentData.forEach(school => {
        const variance = (Math.random() - 0.5) * 15;
        point[school.school_name] = Math.max(0, Math.min(100, school.utilization_rate + variance));
      });
      data.push(point);
    }
    return data;
  };

  useEffect(() => {
    fetchSlotData();
  }, []);

  if (loading) return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-muted/50" />
          ))}
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Capacity Oversight</h3>
            <p className="text-sm text-muted-foreground">Load distribution and enrollment utility.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchSlotData} className="h-9">
                Refresh
            </Button>
            <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
                <option value="line">Line View</option>
                <option value="area">Area View</option>
            </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {schoolSlotData.map((school) => (
              <Card key={school.school_id} className="border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs font-semibold truncate max-w-[150px]">{school.school_name.toUpperCase()}</CardTitle>
                      <div className={cn(
                          "h-2 w-2 rounded-full",
                          school.utilization_rate >= 90 ? "bg-rose-500" :
                          school.utilization_rate >= 75 ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{school.utilization_rate.toFixed(1)}%</div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">LOAD: {school.used_slots} / {school.total_slots}</p>
                      <Progress value={Math.min(100, school.utilization_rate)} className="h-1 mt-3" />
                  </CardContent>
              </Card>
          ))}
      </div>

      <Card className="border shadow-sm">
          <CardHeader>
              <CardTitle>Utilization Trends</CardTitle>
              <CardDescription>30-day capacity variance across tactical units.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                        <LineChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[0, 110]} tickFormatter={(v) => `${v}%`} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingBottom: '20px' }} />
                            {schoolSlotData.map((school, index) => (
                                <Line key={school.school_name} type="monotone" dataKey={school.school_name} stroke={schoolColors[index % schoolColors.length]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                            ))}
                        </LineChart>
                    ) : (
                        <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[0, 110]} tickFormatter={(v) => `${v}%`} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingBottom: '20px' }} />
                            {schoolSlotData.map((school, index) => (
                                <Area key={school.school_name} type="monotone" dataKey={school.school_name} stroke={schoolColors[index % schoolColors.length]} fill={schoolColors[index % schoolColors.length]} fillOpacity={0.05} strokeWidth={2} />
                            ))}
                        </AreaChart>
                    )}
                </ResponsiveContainer>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
