'use client';

import React, { useEffect, useState } from 'react';
import { Users, BarChart2 } from 'lucide-react';
import { getAllCategories, Category } from '@/services/categories';
import studentService from '@/services/students';
import { getReceipts } from '@/services/receipt';
import { Receipt } from '@/types/receipt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCategoryStats } from '@/services/receiptItemService';

interface StatEntry {
  code: string;
  studentCount: number;
  totalPaid: number;
  color: 'green' | 'yellow' | 'blue';
}

interface ReceiptTypeStat {
  receipt_type: string;
  total_amount: number;
  count: number;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'green' | 'yellow' | 'blue';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <Card className={cn('rounded-2xl shadow-md border-0', {
      'bg-green-100': color === 'green',
      'bg-yellow-100': color === 'yellow',
      'bg-blue-100': color === 'blue',
    })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-700" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">GHS {value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
};

const CategoryStatsCards: React.FC = () => {
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [receiptStats, setReceiptStats] = useState<ReceiptTypeStat[]>([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const [students, categories, receipts]: [any[], Category[], Receipt[]] = await Promise.all([
          studentService.getAll(),
          getAllCategories(),
          getReceipts({ receipt_type: 'levy' })
        ]);

        const colorCycle: Array<'green' | 'yellow' | 'blue'> = ['green', 'yellow', 'blue'];

        const computedStats: StatEntry[] = categories.map((category, index) => {
          const studentsInCategory = students.filter(
            (s) => Number(s.category_id) === Number(category.id)
          );
          const studentIds = new Set(studentsInCategory.map((s) => Number(s.id)));

          const receiptsForCategory = receipts.filter(
            (r) => r.receipt_type === 'levy' && studentIds.has(Number(r.student_id))
          );

          const uniqueStudentsPaid = new Set(
            receiptsForCategory.map((r) => Number(r.student_id))
          ).size;

          const totalPaid = receiptsForCategory.reduce(
            (sum, r) => sum + Number(r.amount ?? 0),
            0
          );

          const color = colorCycle[index % colorCycle.length];

          return {
            code: category.code ?? `Category ${category.id}`,
            studentCount: uniqueStudentsPaid,
            totalPaid,
            color,
          };
        });

        setStats(computedStats);
      } catch (err) {
        console.error('Failed to load category levy stats:', err);
      }
    };

    const fetchReceiptStats = async () => {
      try {
        const data = await getCategoryStats();
        setReceiptStats(data);
      } catch (error) {
        console.error('Failed to load receipt type stats:', error);
      }
    };

    fetchCategoryData();
    fetchReceiptStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 🧮 Category-based levy stats */}
      {stats.map((stat) => (
        <div key={stat.code} className="space-y-2">
          <MetricCard
            title={`${stat.code} Revenue`}
            value={stat.totalPaid}
            icon={Users}
            color={stat.color}
          />
          <p className="text-sm text-gray-600 ml-4">
            {stat.studentCount} student{stat.studentCount !== 1 ? 's' : ''} paid
          </p>
        </div>
      ))}

      {/* 🧾 Receipt-type breakdown */}
      {receiptStats.map((entry, index) => {
        const colorCycle: Array<'green' | 'yellow' | 'blue'> = ['green', 'yellow', 'blue'];
        return (
          <div key={entry.receipt_type} className="space-y-2">
            <MetricCard
              title={`${entry.receipt_type} Total`}
              value={entry.total_amount}
              icon={BarChart2}
              color={colorCycle[index % colorCycle.length]}
            />
            <p className="text-sm text-gray-600 ml-4">
              {entry.count} entr{entry.count !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryStatsCards;

