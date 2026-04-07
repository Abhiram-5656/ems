// cat > frontend/src/pages/EmployeesPage.jsx << 'EOF'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import * as employeeAPI from '../api/employeeAPI';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const createValidationSchema = (isEditing) => {
  return Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
    password: isEditing 
      ? Yup.string().min(6, 'Password must be at least 6 characters')
      : Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    department: Yup.string(),
    position: Yup.string(),
    salary: Yup.number(),
  });
};

export default function EmployeesPage() {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [search, page]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getAllEmployees({ search, page, limit: 10 });
      setEmployees(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (values, { setSubmitting, resetForm }) => {
    try {
      await employeeAPI.createEmployee(values);
      resetForm();
      setShowForm(false);
      await fetchEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (values, { setSubmitting }) => {
    try {
      // Don't send empty password to backend
      const updateData = { ...values };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await employeeAPI.updateEmployee(editingId, updateData);
      setEditingId(null);
      setShowForm(false);
      await fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.deleteEmployee(id);
        await fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employees</h1>
          {(user?.role?.name === 'ADMIN' || user?.role?.name === 'HR') && (
            <button
              onClick={() => {
                setEditingId(null);
                setEditingEmployee(null);
                setShowForm(!showForm);
              }}
              className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              + Add Employee
            </button>
          )}
        </div>

        {showForm && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <Formik
              initialValues={editingEmployee || {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                department: '',
                position: '',
                salary: '',
              }}
              enableReinitialize={true}
              validationSchema={createValidationSchema(!!editingId)}
              onSubmit={editingId ? handleUpdateEmployee : handleCreateEmployee}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">First Name</label>
                      <Field name="firstName" className="input-field" placeholder="First name" />
                      <ErrorMessage name="firstName" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">Last Name</label>
                      <Field name="lastName" className="input-field" placeholder="Last name" />
                      <ErrorMessage name="lastName" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">Email</label>
                      <Field type="email" name="email" className="input-field" placeholder="Email" />
                      <ErrorMessage name="email" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">Phone</label>
                      <Field type="tel" name="phone" className="input-field" placeholder="Phone" />
                      <ErrorMessage name="phone" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">Password {editingId && '(leave blank to keep current)'}</label>
                      <Field type="password" name="password" className="input-field" placeholder="Password" />
                      <ErrorMessage name="password" component="div" className="error-text" />
                    </div>

                    <div className="form-group">
                      <label className="label">Department</label>
                      <Field name="department" className="input-field" placeholder="Department" />
                    </div>

                    <div className="form-group">
                      <label className="label">Position</label>
                      <Field name="position" className="input-field" placeholder="Position" />
                    </div>

                    <div className="form-group">
                      <label className="label">Salary</label>
                      <Field type="number" name="salary" className="input-field" placeholder="Salary" />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingEmployee(null);
                        setEditingId(null);
                      }}
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

        <div className="card">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search employees by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees found
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Salary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp._id}>
                        <td className="font-semibold">{emp.firstName} {emp.lastName}</td>
                        <td>{emp.email}</td>
                        <td>{emp.phone}</td>
                        <td>{emp.department || '-'}</td>
                        <td>{emp.position || '-'}</td>
                        <td>${emp.salary?.toLocaleString() || '-'}</td>
                        <td>
                          {(user?.role?.name === 'ADMIN' || user?.role?.name === 'HR') && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(emp._id);
                                  setEditingEmployee({
                                    firstName: emp.firstName || '',
                                    lastName: emp.lastName || '',
                                    email: emp.email || '',
                                    phone: emp.phone || '',
                                    password: '',
                                    department: emp.department || '',
                                    position: emp.position || '',
                                    salary: emp.salary || '',
                                  });
                                  setShowForm(true);
                                }}
                                className="btn-secondary text-xs px-2 py-1 mr-2 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp._id)}
                                className="btn-danger text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </button>
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