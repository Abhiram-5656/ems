import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/apiClient';
import StatsCard from './StatsCard';

export default function EmployeeDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/employee');
        setDashboard(res.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role?.name === 'EMPLOYEE') {
      fetchDashboard();
    }
  }, [user]);

  // ✅ CLEAN LOADER
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-50"></div>
      </div>
    );
  }

  // ✅ ERROR UI
  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center shadow">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-10 text-gray-500">
        No data available
      </div>
    );
  }

  const presentDays =
    dashboard.attendanceStats?.find((s) => s._id === 'PRESENT')?.count || 0;

  const absentDays =
    dashboard.attendanceStats?.find((s) => s._id === 'ABSENT')?.count || 0;

  const pendingLeavesCount = dashboard.pendingLeaves?.length || 0;

  return (
    <div className="space-y-8">

      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's your performance overview
        </p>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatsCard title="Days Present" value={presentDays} icon="✓" bgColor="bg-green-50" textColor="text-green-600" />
        <StatsCard title="Days Absent" value={absentDays} icon="✗" bgColor="bg-red-50" textColor="text-red-600" />
        <StatsCard title="Pending Leaves" value={pendingLeavesCount} icon="📄" bgColor="bg-yellow-50" textColor="text-yellow-600" />
      </div>

      {/* 🔥 CARD WRAPPER STYLE */}
      {/* Recent Attendance */}
      {dashboard.recentAttendance?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Recent Attendance</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Hours</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {dashboard.recentAttendance.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {new Date(a.date).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium
                        ${a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                          a.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                        {a.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {a.workingHours ? `${a.workingHours} hrs` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Leaves */}
      {dashboard.pendingLeaves?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">⏳ Pending Leaves</h2>

          <div className="space-y-3">
            {dashboard.pendingLeaves.map((leave) => (
              <div key={leave._id} className="flex justify-between items-center p-4 rounded-lg bg-blue-50 border">
                <div>
                  <p className="font-semibold">{leave.leaveType}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs bg-blue-200 px-3 py-1 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll */}
      {dashboard.currentPayroll && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-6">💰 Payroll</h2>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Gross</p>
              <p className="text-xl font-bold">
                ${dashboard.currentPayroll.grossSalary}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-500">Deductions</p>
              <p className="text-xl font-bold text-red-600">
                ${dashboard.currentPayroll.grossSalary - dashboard.currentPayroll.netSalary}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Net</p>
              <p className="text-xl font-bold text-green-600">
                ${dashboard.currentPayroll.netSalary}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}