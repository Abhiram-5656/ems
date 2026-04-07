import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/apiClient';
import StatsCard from './StatsCard';
import AttendanceChart from './charts/AttendanceChart';
import DepartmentChart from './charts/DepartmentChart';
import LeaveChart from './charts/LeaveChart';
import PayrollChart from './charts/PayrollChart';

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/admin');
        setDashboard(res.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role?.name === 'ADMIN') {
      fetchDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return <div className="text-center py-8">No data available</div>;
  }

  // Calculate active employees
  const activeEmployees = dashboard.totalEmployees || 0;

  // Calculate monthly payroll total
  const monthlyPayrollTotal = dashboard.payrollSummary?.reduce(
    (total, item) => total + (item.totalNetSalary || 0),
    0
  ) || 0;

  // Calculate processed payroll count - check for any completed status
  const payrollProcessed = dashboard.payrollSummary?.reduce(
    (total, item) => {
      if (['PAID', 'APPROVED', 'GENERATED'].includes(item._id)) {
        return total + (item.count || 0);
      }
      return total;
    },
    0
  ) || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your organization's performance overview.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={activeEmployees}
          icon="👥"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatsCard
          title="Active Employees"
          value={activeEmployees}
          icon="✅"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatsCard
          title="Pending Leaves"
          value={dashboard.pendingLeaves || 0}
          icon="📄"
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <StatsCard
          title="Monthly Payroll"
          value={`$${(monthlyPayrollTotal / 1000).toFixed(1)}K`}
          icon="💰"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          subtext={`${payrollProcessed} processed`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Stats Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Attendance Stats (Today)
          </h2>
          <AttendanceChart data={dashboard.todayAttendance} />
        </div>

        {/* Department Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🏢 Department Distribution
          </h2>
          <DepartmentChart data={dashboard.departmentDistribution} />
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Statistics Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📋 Leave Statistics (This Year)
          </h2>
          <LeaveChart data={dashboard.leaveStatistics} />
        </div>

        {/* Payroll Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            💸 Payroll Status (This Month)
          </h2>
          <PayrollChart data={dashboard.payrollSummary} />
        </div>
      </div>

      {/* Recent Employees Table */}
      {dashboard.recentEmployees && dashboard.recentEmployees.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            👥 Recently Added Employees
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {dashboard.recentEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {emp.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {emp.role?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {emp.department || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      Upcoming Leaves
      {dashboard.upcomingLeaves && dashboard.upcomingLeaves.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📅 Upcoming Approved Leaves
          </h2>
          <div className="space-y-3">
            {dashboard.upcomingLeaves.map((leave) => (
              <div
                key={leave._id}
                className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(leave.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    -
                    {new Date(leave.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    {leave.leaveType}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {leave.numberOfDays} day(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
