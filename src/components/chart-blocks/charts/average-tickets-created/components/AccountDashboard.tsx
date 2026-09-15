// =============================================================================
// ACCOUNTANT DASHBOARD COMPONENT (Financial focused)
// =============================================================================

import overview from "@/app/(dashboard)/fees/components/overview";
import { time } from "console";
import { View } from "lucide-react";
import { Average } from "next/font/google";
import { useState, useEffect } from "react";
import { fill, stroke, strokeWidth } from "tailwindcss/defaultTheme";
import { LoadingSpinner } from '@/components/chart-blocks/charts/average-tickets-created/components/LoadingSpinner'
const AccountantDashboard: React.FC = () => {
  const [financialStats, setFinancialStats] = useState({
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    totalCollected: 0,
    outstandingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancialStats = async () => {
      try {
        setLoading(true);
        
        // Mock financial data for demonstration
        const mockFinancialData = {
          todayRevenue: 15250.00,
          weeklyRevenue: 89750.00,
          monthlyRevenue: 285600.00,
          pendingPayments: 12450.00,
          totalCollected: 847200.00,
          outstandingAmount: 23150.00
        };
        
        setFinancialStats(mockFinancialData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch financial statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h3>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        
        {/* Accountant Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Accountant Dashboard</h1>
          <p className="text-gray-600">Financial overview and payment tracking</p>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Today's Revenue */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ${financialStats.todayRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Daily collections</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Weekly Revenue */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Weekly Revenue</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${financialStats.weeklyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${financialStats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Current month</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">
                  ${financialStats.pendingPayments.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Awaiting payment</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Collected */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Collected</p>
                <p className="text-3xl font-bold text-indigo-600">
                  ${financialStats.totalCollected.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Outstanding Amount */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Outstanding</p>
                <p className="text-3xl font-bold text-red-600">
                  ${financialStats.outstandingAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Overdue payments</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Actions and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Payment Summary */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Collection Rate</span>
                <span className="font-semibold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Average Transaction</span>
                <span className="font-semibold text-gray-900">$125.50</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Processing Fees</span>
                <span className="font-semibold text-red-600">$1,247.80</span>
              </div>
            </div>
          </div>

          {/* Quick Financial Actions */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">Generate Financial Report</div>
                <div className="text-sm text-green-700">Export payment summaries</div>
              </button>
              
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">View Payment History</div>
                <div className="text-sm text-blue-700">Review transaction records</div>
              </button>
              
              <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="font-medium text-yellow-900">Track Outstanding</div>
                <div className="text-sm text-yellow-700">Manage overdue payments</div>
              </button>
            </div>
          </div>
        </div>

        {/* Role-specific notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            💰 <strong>Accountant Access:</strong> Financial metrics, payment tracking, and revenue analytics.
          </p>
        </div>
      </div>
    </div>
  );
};
