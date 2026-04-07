import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import * as leaveAPI from '../api/leaveAPI';

export default function AdminLeavesPage() {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');

  useEffect(() => {
    fetchAllLeaves();
  }, [page, statusFilter, searchEmployee]);

  const fetchAllLeaves = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(searchEmployee && { searchEmployee }),
      };

      const res = await leaveAPI.getAllLeaves(params);
      setLeaves(res.data.data);
      setStats(res.data.summary);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      alert('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    if (window.confirm('Approve this leave request?')) {
      try {
        await leaveAPI.approveLeave(leaveId);
        await fetchAllLeaves();
        alert('Leave approved successfully!');
      } catch (error) {
        console.error('Error approving leave:', error);
        alert(error.response?.data?.message || 'Failed to approve leave');
      }
    }
  };

  const handleRejectLeave = async (leaveId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason && reason.trim()) {
      try {
        await leaveAPI.rejectLeave(leaveId, { rejectionReason: reason });
        await fetchAllLeaves();
        alert('Leave rejected successfully!');
      } catch (error) {
        console.error('Error rejecting leave:', error);
        alert(error.response?.data?.message || 'Failed to reject leave');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user || (user.role?.name !== 'ADMIN' && user.role?.name !== 'HR')) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Access Denied: Only Admins and HR can view this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Leaves Management</h1>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="card bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Requests</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
          </div>
          <div className="card bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
          </div>
          <div className="card bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
          </div>
          <div className="card bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
          <div className="card bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-600">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Cancelled</h3>
            <p className="text-3xl font-bold text-gray-600">{stats.cancelled || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-lg font-bold">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Employee
              </label>
              <input
                type="text"
                value={searchEmployee}
                onChange={(e) => {
                  setSearchEmployee(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by employee name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Leaves Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : leaves.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No leave requests found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      From → To
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-semibold">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {leave.employee?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-semibold">
                            {formatDate(leave.startDate)}
                          </p>
                          <p className="text-xs text-gray-600">
                            to {formatDate(leave.endDate)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">
                        {leave.numberOfDays}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <p className="max-w-xs truncate" title={leave.reason}>
                          {leave.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {leave.status === 'PENDING' && (
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() => handleApproveLeave(leave._id)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-semibold transition"
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleRejectLeave(leave._id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition"
                              title="Reject"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        {leave.status !== 'PENDING' && (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded font-semibold transition"
            >
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded font-semibold transition ${
                    page === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded font-semibold transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
