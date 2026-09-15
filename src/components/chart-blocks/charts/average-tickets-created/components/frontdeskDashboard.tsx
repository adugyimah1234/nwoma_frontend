import { View, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { fill, stroke, strokeWidth } from "tailwindcss/defaultTheme";

// =============================================================================
// FRONT DESK DASHBOARD COMPONENT (Registration focused)
// =============================================================================

const FrontDeskDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState({
    todayRegistrations: 0,
    weeklyRegistrations: 0,
    monthlyRegistrations: 0
  });

  useEffect(() => {
    const fetchFrontDeskStats = async () => {
      try {
        setLoading(true);
        // Fetch basic registration stats for front desk
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30); // Last 30 days
        
        // You would call your registration service here
        // const data = await registrationService.getBasicStats(start.toISOString(), end.toISOString());
        
        // Mock data for demonstration
        const mockData = {
          totalRegistered: 245,
          totalPending: 18,
          totalAccepted: 201,
          totalRejected: 26,
          todayCount: 12,
          weeklyCount: 67,
          monthlyCount: 245
        };
        
        setStats(mockData);
        setTodayStats({
          todayRegistrations: mockData.todayCount,
          weeklyRegistrations: mockData.weeklyCount,
          monthlyRegistrations: mockData.monthlyCount
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchFrontDeskStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
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
        
        {/* Front Desk Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Front Desk Dashboard</h1>
          <p className="text-gray-600">Registration tracking and applicant management</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Today's Registrations */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Registrations</p>
                <p className="text-3xl font-bold text-blue-600">{todayStats.todayRegistrations}</p>
                <p className="text-sm text-gray-500 mt-1">New applicants today</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* This Week */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-green-600">{todayStats.weeklyRegistrations}</p>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-purple-600">{todayStats.monthlyRegistrations}</p>
                <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.totalPending || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Overview */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-900">Approved</span>
                </div>
                <span className="text-green-900 font-bold">{stats?.totalAccepted || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-yellow-900">Pending</span>
                </div>
                <span className="text-yellow-900 font-bold">{stats?.totalPending || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-900">Rejected</span>
                </div>
                <span className="text-red-900 font-bold">{stats?.totalRejected || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">Register New Applicant</div>
                <div className="text-sm text-blue-700">Add a new registration</div>
              </button>
              
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="font-medium text-gray-900">View Pending Applications</div>
                <div className="text-sm text-gray-700">Review applications awaiting approval</div>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">Search Applicants</div>
                <div className="text-sm text-green-700">Find specific registration records</div>
              </button>
            </div>
          </div>
        </div>

        {/* Role-specific notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            👥 <strong>Front Desk Access:</strong> Registration tracking, applicant counts, and basic status overview.
          </p>
        </div>
      </div>
    </div>
  );
};
