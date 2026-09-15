/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  Clock,
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';
import { 
  Area, 
  AreaChart, 
  Bar,
  BarChart,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import registrationService from '@/services/registrations';
import SlotsChart from './components/SlotsChart';
import DailyPaymentDashboard from './components/PaymentSummaryCard';
import { useAuth } from '@/contexts/AuthContext';
import { getAllRoles } from '@/services/roles';
import PaymentBreakdownComponent from './components/PaymentBreakdownComponent';
import CategoryStatsCards from './components/CategoryStatsCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RegistrationStats {
  totalRegistered: number;
  totalPending: number;
  totalAccepted: number;
  totalRejected: number;
  metrics: {
    date: string;
    count: number;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

// Type definitions
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  trendValue?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={trend === 'up' ? 'text-emerald-500 font-medium' : 'text-destructive font-medium'}>
              {trend === 'up' ? '+' : ''}{trendValue?.toFixed(1)}%
            </span>
            <span>vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Card Component
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children, className = "" }) => (
  <Card className={className}>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

// Main Dashboard Component
export default function ProfessionalDashboard() {

  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    const loadRole = async () => {
      const roles = await getAllRoles();
      const role = roles.find(r => String(r.id) === user?.role_id);
      setRoleName(role?.name?.toLowerCase() || '');
    };
    if (user?.role_id) loadRole();
  }, [user?.role_id]);

  const userRole = (user?.role || roleName || '').toLowerCase().replace(/_/g, '');
  const isAdmin = ['admin', 'garrisondirector', 'accountant', 'frontdesk', 'teacher', 'staff'].includes(userRole);




  // Fetch data when component mounts or time range changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // Always use the "all" range
        const start = new Date(2000, 0, 1).toISOString();
        const end = new Date().toISOString();
        const data = await registrationService.getStats(start, end);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Transform metrics data for charts
  const getChartData = () => {
    if (!stats) return [];
    
    const grouped = stats.metrics.reduce((acc, metric) => {
      const existing = acc.find(item => item.date === metric.date);
      if (existing) {
        existing[metric.status] = metric.count;
      } else {
        acc.push({
          date: metric.date,
          pending: metric.status === 'pending' ? metric.count : 0,
          approved: metric.status === 'approved' ? metric.count : 0,
          rejected: metric.status === 'rejected' ? metric.count : 0,
        });
      }
      return acc;
    }, [] as any[]);
    
    return grouped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get pie chart data
  const getPieData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Approved', value: stats.totalAccepted, color: '#10B981' },
      { name: 'Pending', value: stats.totalPending, color: '#F59E0B' },
      { name: 'Rejected', value: stats.totalRejected, color: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  // Calculate acceptance rate
  const acceptanceRate = stats && stats.totalRegistered > 0 
    ? Math.round((stats.totalAccepted / stats.totalRegistered) * 100) 
    : 0;

  // Calculate trend (simplified - comparing first and last data points)
  const getTrend = () => {
    const chartData = getChartData();
    if (chartData.length < 2) return { value: 0, direction: 'up' as const };
    
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const firstTotal = first.pending + first.approved + first.rejected;
    const lastTotal = last.pending + last.approved + last.rejected;
    
    if (firstTotal === 0) return { value: 0, direction: 'up' as const };
    
    const change = ((lastTotal - firstTotal) / firstTotal) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' as const : 'down' as const
    };
  };

  const trend = getTrend();
  const chartData = getChartData();
  const pieData = getPieData();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto space-y-4">
        


        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <MetricCard
                title="Total Applications"
                value={stats?.totalRegistered ?? 0}
                icon={Users}
                trend={trend.direction}
                trendValue={trend.value}
                color="blue"
              />
              <MetricCard
                title="Approved"
                value={stats?.totalAccepted ?? 0}
                icon={UserCheck}
                trend="up"
                trendValue={8.2}
                color="green"
              />
              <MetricCard
                title="Pending Review"
                value={stats?.totalPending ?? 0}
                icon={Clock}
                trend="down"
                trendValue={3.1}
                color="yellow"
              />
              <MetricCard
                title="Acceptance Rate"
                value={acceptanceRate}
                icon={Activity}
                trend="up"
                trendValue={2.4}
                color="blue"
              />
            </>
          )}
        </div>
<div className="p-6">
  {isAdmin ? (
    <>
       <DailyPaymentDashboard />
      <SlotsChart />
    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
          {/* Area Chart */}
          <ChartCard 
            title="Registration Trends" 
            description="Daily registration statistics over time"
            className="lg:col-span-2"
          >
            {loading ? (
              <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : (
              <ChartContainer config={{
                approved: { label: 'Approved', color: '#10B981' },
                pending: { label: 'Pending', color: '#F59E0B' },
                rejected: { label: 'Rejected', color: '#EF4444' },
              }} className="h-[300px] w-full">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stackId="1"
                    stroke="var(--color-approved)"
                    fill="var(--color-approved)"
                    fillOpacity={0.6}
                    name="Approved"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke="var(--color-pending)"
                    fill="var(--color-pending)"
                    fillOpacity={0.6}
                    name="Pending"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stackId="1"
                    stroke="var(--color-rejected)"
                    fill="var(--color-rejected)"
                    fillOpacity={0.6}
                    name="Rejected"
                  />
                </AreaChart>
              </ChartContainer>
                )}
                </ChartCard>
                
                {/* Pie Chart */}
                <ChartCard 
                title="Status Distribution" 
                description="Current application status breakdown"
                >
                {loading ? (
                  <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : (
              <>
                <ChartContainer config={{
                  Approved: { label: 'Approved', color: '#10B981' },
                  Pending: { label: 'Pending', color: '#F59E0B' },
                  Rejected: { label: 'Rejected', color: '#EF4444' },
                }} className="h-[250px] w-full">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {item.value} ({Math.round((item.value / (stats?.totalRegistered ?? 1)) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
          </div>
    </>

        ) : (
          <div className="text-center py-10 text-red-500">
            Access restricted. You do not have permission to view this section.
          </div>
        )}
      </div>
          
          {/* Bar Chart */}
        <ChartCard 
          title="Weekly Performance" 
          description="Comparison of application processing by day"
        >
          {loading ? (
            <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-gray-500">Loading chart...</div>
            </div>
          ) : (
            <ChartContainer config={{
              approved: { label: 'Approved', color: '#10B981' },
              pending: { label: 'Pending', color: '#F59E0B' },
              rejected: { label: 'Rejected', color: '#EF4444' },
            }} className="h-[300px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'short' 
                  })}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="approved" fill="var(--color-approved)" name="Approved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="var(--color-pending)" name="Pending" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="var(--color-rejected)" name="Rejected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
