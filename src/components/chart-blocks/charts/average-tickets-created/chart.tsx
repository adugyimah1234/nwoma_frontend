/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartData {
  date: string;
  count: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

interface ChartProps {
  data: ChartData[];
}

const chartConfig = {
  Pending: {
    label: "Pending",
    color: "hsl(200, 95%, 68%)", // #60C2FB
  },
  Accepted: {
    label: "Accepted",
    color: "hsl(152, 84%, 40%)", // #10B981
  },
  Rejected: {
    label: "Rejected",
    color: "hsl(0, 84%, 60%)", // #EF4444
  },
} satisfies ChartConfig;

export default function Chart({ data }: ChartProps) {
  // Transform data for Recharts
  const transformedData = data.reduce((acc: any[], curr) => {
    const existingDate = acc.find(item => item.date === curr.date);
    if (existingDate) {
      existingDate[curr.status.toLowerCase()] = curr.count;
    } else {
      acc.push({
        date: curr.date,
        [curr.status.toLowerCase()]: curr.count,
      });
    }
    return acc;
  }, []);

  // Calculate trend
  const getTrend = () => {
    if (transformedData.length < 2) return 0;
    const latest = transformedData[transformedData.length - 1];
    const previous = transformedData[transformedData.length - 2];
    const totalLatest = latest.pending + latest.accepted + latest.rejected;
    const totalPrevious = previous.pending + previous.accepted + previous.rejected;
    return ((totalLatest - totalPrevious) / totalPrevious) * 100;
  };

  const trend = getTrend();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Trends</CardTitle>
        <CardDescription>
          Showing registration statistics over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
            <AreaChart
              data={transformedData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke={chartConfig.Pending.color}
                fill={chartConfig.Pending.color}
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="accepted"
                stackId="1"
                stroke={chartConfig.Accepted.color}
                fill={chartConfig.Accepted.color}
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="rejected"
                stackId="1"
                stroke={chartConfig.Rejected.color}
                fill={chartConfig.Rejected.color}
                fillOpacity={0.4}
              />
            </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend > 0 ? 'Trending up' : 'Trending down'} by {Math.abs(trend).toFixed(1)}% 
              <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {transformedData[0]?.date && new Date(transformedData[0].date).toLocaleDateString()} - 
              {transformedData[transformedData.length - 1]?.date && 
                new Date(transformedData[transformedData.length - 1].date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
