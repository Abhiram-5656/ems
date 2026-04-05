// cat > frontend/src/pages/AttendancePage.jsx << 'EOF'
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import * as attendanceAPI from '../api/attendanceAPI';

const validationSchema = Yup.object().shape({
  date: Yup.date().required('Date is required'),
  status: Yup.string().required('Status is required'),
  checkInTime: Yup.string(),
  checkOutTime: Yup.string(),
});

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState([]);
  const [totalWorkingHours, setTotalWorkingHours] = useState(0);

  useEffect(() => {
    fetchAttendance();
  }, [page]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getEmployeeAttendance({ page, limit: 10 });
      setAttendanceRecords(res.data.data);
      setStats(res.data.stats || []);
      setTotalWorkingHours(res.data.totalWorkingHours || 0);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (values, { setSubmitting, resetForm }) => {
    try {
      await attendanceAPI.markAttendance(values);
      resetForm();
      await fetchAttendance();
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatCount = (status) => {
    const statsArray = Array.isArray(stats) ? stats : [];
    const stat = statsArray.find((s) => s._id === status);
    return stat ? stat.count : 0;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attendance Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Present</h3>
            <p className="text-3xl font-bold mt-2 text-green-500">{getStatCount('PRESENT')}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Absent</h3>
            <p className="text-3xl font-bold mt-2 text-red-500">{getStatCount('ABSENT')}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Half Day</h3>
            <p className="text-3xl font-bold mt-2 text-yellow-500">{getStatCount('HALF_DAY')}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Leave</h3>
            <p className="text-3xl font-bold mt-2 text-blue-500">{getStatCount('LEAVE')}</p>
          </div>
        </div>

        {/* Mark Attendance Form */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
          <Formik
            initialValues={{
              date: new Date().toISOString().split('T')[0],
              status: 'PRESENT',
              checkInTime: '',
              checkOutTime: '',
              notes: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleMarkAttendance}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Date</label>
                    <Field type="date" name="date" className="input-field" />
                    <ErrorMessage name="date" component="div" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label className="label">Status</label>
                    <Field as="select" name="status" className="input-field">
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="LEAVE">Leave</option>
                      <option value="SICK">Sick</option>
                    </Field>
                    <ErrorMessage name="status" component="div" className="error-text" />
                  </div>

                  <div className="form-group">
                    <label className="label">Check-in Time</label>
                    <Field type="time" name="checkInTime" className="input-field" />
                  </div>

                  <div className="form-group">
                    <label className="label">Check-out Time</label>
                    <Field type="time" name="checkOutTime" className="input-field" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Notes</label>
                  <Field 
                    as="textarea" 
                    name="notes" 
                    className="input-field" 
                    placeholder="Add notes..." 
                    rows="3" 
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  {isSubmitting ? 'Saving...' : 'Mark Attendance'}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Attendance Summary */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Attendance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Total Days Recorded</p>
              <p className="text-3xl font-bold">
                {Array.isArray(stats) ? stats.reduce((sum, stat) => sum + stat.count, 0) : 0}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Working Hours</p>
              <p className="text-3xl font-bold">{totalWorkingHours}</p>
            </div>
            <div>
              <p className="text-gray-600">Average Hours/Day</p>
              <p className="text-3xl font-bold">
                {Array.isArray(stats) && stats.reduce((sum, stat) => sum + stat.count, 0) > 0
                  ? (totalWorkingHours / stats.reduce((sum, stat) => sum + stat.count, 0)).toFixed(2)
                  : '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No attendance records found</p>
              <p className="text-sm mt-2">Start by marking your attendance above</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Working Hours</th>
                      <th>Notes</th>
                      <th>Approved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record._id}>
                        <td className="font-semibold">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`badge px-2 py-1 rounded text-xs font-semibold ${
                            record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                            record.status === 'HALF_DAY' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'LEAVE' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          {record.checkInTime 
                            ? new Date(record.checkInTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : '-'
                          }
                        </td>
                        <td>
                          {record.checkOutTime 
                            ? new Date(record.checkOutTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : '-'
                          }
                        </td>
                        <td>
                          {record.workingHours 
                            ? `${record.workingHours} hrs`
                            : '-'
                          }
                        </td>
                        <td className="text-sm text-gray-600 max-w-xs truncate">
                          {record.notes || '-'}
                        </td>
                        <td>
                          {record.approvedBy ? (
                            <span className="text-green-600 font-semibold">✓ Approved</span>
                          ) : (
                            <span className="text-yellow-600 font-semibold">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded transition-colors ${
                        page === p
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing page {page} of {totalPages}
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded text-left">
              📥 Import Attendance
            </button>
            <button className="btn-secondary bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded text-left">
              📥 Download Report
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
// EOF