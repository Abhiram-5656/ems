// cat > frontend/src/pages/LeavesPage.jsx << 'EOF'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import * as leaveAPI from '../api/leaveAPI';

const validationSchema = Yup.object().shape({
  leaveType: Yup.string().required('Leave type is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required'),
  reason: Yup.string().required('Reason is required').min(10, 'Reason must be at least 10 characters'),
});

export default function LeavesPage() {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchLeaves();
    if (user?.role?.name === 'ADMIN' || user?.role?.name === 'HR' || user?.role?.name === 'MANAGER') {
      fetchPendingLeaves();
    }
  }, [page, user]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getLeaveApplications({ page, limit: 10 });
      setLeaves(res.data.data);
      setTotalPages(res.data.pagination.pages);

      // Calculate stats
      const stats = {
        pending: res.data.data.filter(l => l.status === 'PENDING').length,
        approved: res.data.data.filter(l => l.status === 'APPROVED').length,
        rejected: res.data.data.filter(l => l.status === 'REJECTED').length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await leaveAPI.getPendingLeaves({ limit: 100 });
      setPendingLeaves(res.data.data);
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
    }
  };

  const handleApplyLeave = async (values, { setSubmitting, resetForm }) => {
    try {
      const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);
      const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      await leaveAPI.applyLeave({
        ...values,
        numberOfDays,
      });
      resetForm();
      setShowForm(false);
      await fetchLeaves();
    } catch (error) {
      console.error('Error applying leave:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.approveLeave(leaveId);
      await fetchPendingLeaves();
      await fetchLeaves();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await leaveAPI.rejectLeave(leaveId, { rejectionReason: reason });
        await fetchPendingLeaves();
        await fetchLeaves();
      } catch (error) {
        console.error('Error rejecting leave:', error);
      }
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave?')) {
      try {
        await leaveAPI.cancelLeave(leaveId);
        await fetchLeaves();
      } catch (error) {
        console.error('Error cancelling leave:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Leaves Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            + Apply Leave
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Pending</h3>
            <p className="text-3xl font-bold mt-2 text-yellow-500">{stats.pending || 0}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Approved</h3>
            <p className="text-3xl font-bold mt-2 text-green-500">{stats.approved || 0}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Rejected</h3>
            <p className="text-3xl font-bold mt-2 text-red-500">{stats.rejected || 0}</p>
          </div>
        </div>

        {showForm && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
            <Formik
              initialValues={{
                leaveType: 'CASUAL',
                startDate: '',
                endDate: '',
                reason: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleApplyLeave}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Leave Type</label>
                      <Field as="select" name="leaveType" className="input-field">
                        <option value="CASUAL">Casual</option>
                        <option value="SICK">Sick</option>
                        <option value="EARNED">Earned</option>
                        <option value="MATERNITY">Maternity</option>
                        <option value="PERSONAL">Personal</option>
                      </Field>
                    </div>

                    <div></div>

                    <div className="form-group">
                      <label className="label">Start Date</label>
                      <Field type="date" name="startDate" className="input-field" />
                      <ErrorMessage name="startDate" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">End Date</label>
                      <Field type="date" name="endDate" className="input-field" />
                      <ErrorMessage name="endDate" component="div" className="error-text" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Reason</label>
                    <Field as="textarea" name="reason" className="input-field" placeholder="Enter reason for leave..." rows="4" />
                    <ErrorMessage name="reason" component="div" className="error-text" />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-secondary bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {/* Pending Leaves for Approval */}
        {(user?.role?.name === 'ADMIN' || user?.role?.name === 'HR' || user?.role?.name === 'MANAGER') && pendingLeaves.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Pending Leave Requests</h2>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>From - To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="font-semibold">{leave.employee?.firstName} {leave.employee?.lastName}</td>
                      <td>
                        <span className="badge badge-warning bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td>{leave.numberOfDays}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <button
                          onClick={() => handleApproveLeave(leave._id)}
                          className="btn-success text-xs px-2 py-1 mr-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave._id)}
                          className="btn-danger text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My Leave Requests */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Leave Requests</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leave requests found
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>From - To</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave.leaveType}</td>
                        <td>
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td>{leave.numberOfDays}</td>
                        <td>{leave.reason}</td>
                        <td>
                          <span className={`badge px-2 py-1 rounded text-xs font-semibold ${
                            leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                        <td>
                          {leave.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelLeave(leave._id)}
                              className="btn-danger text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded ${
                        page === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
// EOF