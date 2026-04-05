// cat > frontend/src/pages/PayrollPage.jsx << 'EOF'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import * as payrollAPI from '../api/payrollAPI';
import * as employeeAPI from '../api/employeeAPI';

const validationSchema = Yup.object().shape({
  employeeId: Yup.string().required('Employee is required'),
  month: Yup.number().required('Month is required').min(1).max(12),
  year: Yup.number().required('Year is required'),
  baseSalary: Yup.number().required('Base salary is required').positive(),
});

export default function PayrollPage() {
  const { user } = useSelector((state) => state.auth);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({ month: '', year: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPayrolls();
    if (user?.role?.name === 'ADMIN' || user?.role?.name === 'HR') {
      fetchEmployees();
    }
  }, [page, filters, user]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const res = await payrollAPI.getPayroll({
        page,
        limit: 10,
        month: filters.month || '',
        year: filters.year || '',
      });
      setPayrolls(res.data.data);
      setSummary(res.data.summary || {});
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      setMessage({ type: 'error', text: 'Failed to load payroll records' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAllEmployees({ limit: 1000 });
      setEmployees(res.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMessage({ type: 'error', text: 'Failed to load employees' });
    }
  };

  const handleCreatePayroll = async (values, { setSubmitting, resetForm }) => {
    try {
      setMessage({ type: '', text: '' });
      
      const response = await payrollAPI.createPayroll({
        employeeId: values.employeeId,
        month: parseInt(values.month),
        year: parseInt(values.year),
        baseSalary: parseFloat(values.baseSalary),
        allowances: {
          hra: parseFloat(values.hra) || 0,
          da: parseFloat(values.da) || 0,
          medical: parseFloat(values.medical) || 0,
        },
        deductions: {
          providentFund: parseFloat(values.pf) || 0,
          tax: parseFloat(values.tax) || 0,
          insurance: parseFloat(values.insurance) || 0,
        },
        notes: values.notes || '',
      });
      
      setMessage({ type: 'success', text: 'Payroll created successfully!' });
      resetForm();
      setShowForm(false);
      
      // Wait 500ms before fetching to ensure backend has processed
      setTimeout(() => {
        fetchPayrolls();
      }, 500);
    } catch (error) {
      console.error('Error creating payroll:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create payroll';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    try {
      setMessage({ type: '', text: '' });
      await payrollAPI.approvePayroll(payrollId);
      setMessage({ type: 'success', text: 'Payroll approved successfully!' });
      await fetchPayrolls();
    } catch (error) {
      console.error('Error approving payroll:', error);
      setMessage({ type: 'error', text: 'Failed to approve payroll' });
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    try {
      setMessage({ type: '', text: '' });
      await payrollAPI.markPayrollAsPaid(payrollId);
      setMessage({ type: 'success', text: 'Payroll marked as paid!' });
      await fetchPayrolls();
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      setMessage({ type: 'error', text: 'Failed to mark payroll as paid' });
    }
  };

  const handleDeletePayroll = async (payrollId) => {
    if (window.confirm('Are you sure you want to delete this payroll? (Only DRAFT payrolls can be deleted)')) {
      try {
        setMessage({ type: '', text: '' });
        await payrollAPI.deletePayroll(payrollId);
        setMessage({ type: 'success', text: 'Payroll deleted successfully!' });
        await fetchPayrolls();
      } catch (error) {
        console.error('Error deleting payroll:', error);
        const errorMsg = error.response?.data?.message || 'Failed to delete payroll';
        setMessage({ type: 'error', text: errorMsg });
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          {(user?.role?.name === 'ADMIN' || user?.role?.name === 'HR') && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setMessage({ type: '', text: '' });
              }}
              className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              + Create Payroll
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Total Gross</h3>
            <p className="text-3xl font-bold mt-2 text-blue-500">
              ${summary.totalGross?.toLocaleString() || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Total Deductions</h3>
            <p className="text-3xl font-bold mt-2 text-red-500">
              ${summary.totalDeductions?.toLocaleString() || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-semibold">Total Net</h3>
            <p className="text-3xl font-bold mt-2 text-green-500">
              ${summary.totalNet?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Create Payroll Form */}
        {showForm && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Create Payroll</h2>
            <Formik
              initialValues={{
                employeeId: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                baseSalary: '',
                hra: '',
                da: '',
                medical: '',
                pf: '',
                tax: '',
                insurance: '',
                notes: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleCreatePayroll}
            >
              {({ isSubmitting, values }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="label">Employee</label>
                      <Field as="select" name="employeeId" className="input-field">
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.firstName} {emp.lastName} - {emp.email}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="employeeId" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">Month</label>
                      <Field type="number" name="month" min="1" max="12" className="input-field" />
                      <ErrorMessage name="month" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">Year</label>
                      <Field type="number" name="year" className="input-field" />
                      <ErrorMessage name="year" component="div" className="error-text" />
                    </div>
                  </div>

                  <h3 className="font-bold mt-6">Salary Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="label">Base Salary</label>
                      <Field type="number" name="baseSalary" className="input-field" placeholder="0" />
                      <ErrorMessage name="baseSalary" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">HRA</label>
                      <Field type="number" name="hra" className="input-field" placeholder="0" />
                    </div>

                    <div className="form-group">
                      <label className="label">DA</label>
                      <Field type="number" name="da" className="input-field" placeholder="0" />
                    </div>

                    <div className="form-group">
                      <label className="label">Medical</label>
                      <Field type="number" name="medical" className="input-field" placeholder="0" />
                    </div>
                  </div>

                  <h3 className="font-bold mt-6">Deductions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="label">Provident Fund</label>
                      <Field type="number" name="pf" className="input-field" placeholder="0" />
                    </div>

                    <div className="form-group">
                      <label className="label">Tax</label>
                      <Field type="number" name="tax" className="input-field" placeholder="0" />
                    </div>

                    <div className="form-group">
                      <label className="label">Insurance</label>
                      <Field type="number" name="insurance" className="input-field" placeholder="0" />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded">
                    <div className="flex justify-between text-lg">
                      <span>Gross Salary:</span>
                      <span className="font-bold">
                        ${(
                          (parseFloat(values.baseSalary) || 0) +
                          (parseFloat(values.hra) || 0) +
                          (parseFloat(values.da) || 0) +
                          (parseFloat(values.medical) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg mt-2">
                      <span>Total Deductions:</span>
                      <span className="font-bold">
                        ${(
                          (parseFloat(values.pf) || 0) +
                          (parseFloat(values.tax) || 0) +
                          (parseFloat(values.insurance) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg mt-2 pt-2 border-t border-blue-200">
                      <span>Net Salary:</span>
                      <span className="font-bold text-green-600">
                        ${(
                          (parseFloat(values.baseSalary) || 0) +
                          (parseFloat(values.hra) || 0) +
                          (parseFloat(values.da) || 0) +
                          (parseFloat(values.medical) || 0) -
                          (parseFloat(values.pf) || 0) -
                          (parseFloat(values.tax) || 0) -
                          (parseFloat(values.insurance) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Notes</label>
                    <Field as="textarea" name="notes" className="input-field" placeholder="Add notes..." rows="3" />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Payroll'}
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

        {/* Filters */}
        {(user?.role?.name === 'ADMIN' || user?.role?.name === 'HR') && (
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => {
                    setFilters({ ...filters, month: e.target.value });
                    setPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => {
                    setFilters({ ...filters, year: e.target.value });
                    setPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Payroll List */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Payroll Records</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payroll records found
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Month/Year</th>
                      <th>Base Salary</th>
                      <th>Gross</th>
                      <th>Deductions</th>
                      <th>Net</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((payroll) => (
                      <tr key={payroll._id}>
                        <td className="font-semibold">
                          {payroll.employee?.firstName} {payroll.employee?.lastName}
                        </td>
                        <td>{payroll.month}/{payroll.year}</td>
                        <td>${payroll.baseSalary?.toLocaleString()}</td>
                        <td>${payroll.grossSalary?.toLocaleString()}</td>
                        <td>${(payroll.grossSalary - payroll.netSalary)?.toLocaleString()}</td>
                        <td className="font-semibold text-green-600">
                          ${payroll.netSalary?.toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge px-2 py-1 rounded text-xs font-semibold ${
                            payroll.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                            payroll.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            payroll.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payroll.status}
                          </span>
                        </td>
                        <td>
                          {(user?.role?.name === 'ADMIN' || user?.role?.name === 'HR') && (
                            <>
                              {payroll.status === 'DRAFT' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePayroll(payroll._id)}
                                    className="btn-success text-xs px-2 py-1 mr-2 bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleDeletePayroll(payroll._id)}
                                    className="btn-danger text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              {payroll.status === 'APPROVED' && (
                                <button
                                  onClick={() => handleMarkAsPaid(payroll._id)}
                                  className="btn-success text-xs px-2 py-1 mr-2 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </>
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