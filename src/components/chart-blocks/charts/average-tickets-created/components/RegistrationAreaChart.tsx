import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ChartData {
  date: string;
  approved: number;
  pending: number;
  rejected: number;
}

const chartConfig = {
  approved: { label: 'Approved', color: '#10B981' },
  pending: { label: 'Pending', color: '#F59E0B' },
  rejected: { label: 'Rejected', color: '#EF4444' },
};

const RegistrationAreaChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <ChartContainer config={chartConfig} className="h-[300px] w-full">
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis
        dataKey="date"
        tick={{ fontSize: 12, fill: '#6b7280' }}
        tickFormatter={(value) =>
          new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      />
      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Area type="monotone" dataKey="approved" stackId="1" stroke="var(--color-approved)" fill="var(--color-approved)" fillOpacity={0.6} name="Approved" />
      <Area type="monotone" dataKey="pending" stackId="1" stroke="var(--color-pending)" fill="var(--color-pending)" fillOpacity={0.6} name="Pending" />
      <Area type="monotone" dataKey="rejected" stackId="1" stroke="var(--color-rejected)" fill="var(--color-rejected)" fillOpacity={0.6} name="Rejected" />
    </AreaChart>
  </ChartContainer>
);

export default RegistrationAreaChart;

