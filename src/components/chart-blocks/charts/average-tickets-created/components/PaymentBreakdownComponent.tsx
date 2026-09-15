import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Receipt,
  Users,
  BookOpen,
  Home,
  Shirt,
  FileText,
  PenTool,
  TrendingUp,
  Activity
} from 'lucide-react';
import { getReceipts } from '@/services/receipt';
import studentService from '@/services/students';
import { getAllCategories } from '@/services/categories';
import { type Receipt as ReceiptType } from '@/types/receipt';
import { type Student } from '@/types/student';

interface PaymentStats {
  receiptTypes: {
    type: string;
    amount: number;
    count: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  receiptTypeCategories: {
    category: string;
    count: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  totalRevenue: number;
  totalReceipts: number;
  totalStudents: number;
  categoryStats?: {
    category: string;
    studentCount: number;
    totalAmount: number;
  }[];
}

const receiptTypeConfig = {
  registration: { icon: FileText, color: '#3B82F6', name: 'Registration' },
  levy: { icon: DollarSign, color: '#10B981', name: 'Levy' },
  textBooks: { icon: BookOpen, color: '#F59E0B', name: 'Text Books' },
  exerciseBooks: { icon: PenTool, color: '#EF4444', name: 'Exercise Books' },
  furniture: { icon: Home, color: '#8B5CF6', name: 'Furniture' },
  jersey_crest: { icon: Shirt, color: '#06B6D4', name: 'Jersey & Crest' }
};

const PaymentBreakdownComponent: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [receiptsRaw, students, categoryList] = await Promise.all([
          getReceipts(),
          studentService.getAll(),
          getAllCategories()
        ]);

        const categoryIdToName: Record<number, string> = Object.fromEntries(
          categoryList.map(cat => [cat.id, cat.name])
        );

        const receipts = (receiptsRaw || []).filter(
          r => r.student_id !== null && !isNaN(Number(r.amount))
        );

        // Dynamically extract all receipt types from the database receipts
        const presentTypes = Array.from(
          new Set([...Object.keys(receiptTypeConfig), ...receipts.map(r => r.receipt_type).filter(Boolean)])
        ) as string[];

        const getMeta = (type: string) => {
          const cfg = receiptTypeConfig[type as keyof typeof receiptTypeConfig];
          if (cfg) return cfg;
          const formattedName = type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
          return { icon: FileText, color: '#6B7280', name: formattedName };
        };

        const receiptTypeStats = presentTypes.map(type => {
          const typeReceipts = receipts.filter(r => r.receipt_type === type);
          const totalAmount = typeReceipts.reduce((sum, r) => sum + Number(r.amount), 0);
          const meta = getMeta(type);

          return {
            type: meta.name,
            amount: totalAmount,
            count: typeReceipts.length,
            color: meta.color,
            icon: meta.icon
          };
        }).filter(stat => stat.count > 0);

        const receiptTypeCategories = presentTypes.map(type => {
          const typeReceipts = receipts.filter(r => r.receipt_type === type);
          const uniqueStudents = new Set(typeReceipts.map(r => r.student_id)).size;
          const meta = getMeta(type);

          return {
            category: meta.name,
            count: uniqueStudents,
            color: meta.color,
            icon: meta.icon
          };
        }).filter(stat => stat.count > 0);

        const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.amount), 0);
        const totalReceipts = receipts.length;
        const totalStudents = students.length;

        const categoryMap: Record<string, { studentIds: number[] }> = {};

        students.forEach((student: Student) => {
          const catId = (student as any).category_id;
          const category = categoryIdToName[catId] || 'Unknown';
          if (!categoryMap[category]) {
            categoryMap[category] = { studentIds: [] };
          }
          categoryMap[category].studentIds.push(Number(student.id));
        });

        const categoryStats = Object.entries(categoryMap).map(([category, data]) => {
          const totalAmount = receipts
            .filter(r => data.studentIds.includes(Number(r.student_id)))
            .reduce((sum, r) => sum + Number(r.amount), 0);

          return {
            category,
            studentCount: data.studentIds.length,
            totalAmount
          };
        });

        setStats({
          receiptTypes: receiptTypeStats,
          receiptTypeCategories,
          totalRevenue,
          totalReceipts,
          totalStudents,
          categoryStats
        });
      } catch (err) {
        console.error("Error fetching payment data:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
        <Activity className="h-6 w-6 text-red-600" />
        <div>
          <h3 className="text-lg font-semibold text-red-900">Error Loading Payment Data</h3>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* You can render the stats here as you already did in your previous UI */}
    </div>
  );
};

export default PaymentBreakdownComponent;

