// cat > frontend/src/pages/ProfilePage.jsx << 'EOF'
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { updateProfile } from '../redux/slices/authSlice';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email'),
  phone: Yup.string().required('Phone is required'),
  department: Yup.string(),
  position: Yup.string(),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpdateProfile = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error || 'Error updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="card text-center">
            <div className="text-8xl mb-4">👤</div>
            <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-600 mt-2 text-lg">{user?.email}</p>
            <div className="mt-4">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                {user?.role?.name}
              </span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="card lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <Formik
                initialValues={{
                  firstName: user?.firstName || '',
                  lastName: user?.lastName || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  department: user?.department || '',
                  position: user?.position || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleUpdateProfile}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label">First Name</label>
                        <Field name="firstName" className="input-field" />
                        <ErrorMessage name="firstName" component="div" className="error-text" />
                      </div>

                      <div className="form-group">
                        <label className="label">Last Name</label>
                        <Field name="lastName" className="input-field" />
                        <ErrorMessage name="lastName" component="div" className="error-text" />
                      </div>

                      <div className="form-group">
                        <label className="label">Email</label>
                        <Field type="email" name="email" className="input-field" disabled />
                      </div>

                      <div className="form-group">
                        <label className="label">Phone</label>
                        <Field name="phone" className="input-field" />
                        <ErrorMessage name="phone" component="div" className="error-text" />
                      </div>

                      <div className="form-group">
                        <label className="label">Department</label>
                        <Field name="department" className="input-field" />
                      </div>

                      <div className="form-group">
                        <label className="label">Position</label>
                        <Field name="position" className="input-field" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </Form>
                )}
              </Formik>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-600">First Name</label>
                    <p className="text-lg mt-1">{user?.firstName}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600">Last Name</label>
                    <p className="text-lg mt-1">{user?.lastName}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600">Email</label>
                    <p className="text-lg mt-1">{user?.email}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600">Phone</label>
                    <p className="text-lg mt-1">{user?.phone}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600">Department</label>
                    <p className="text-lg mt-1">{user?.department || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600">Position</label>
                    <p className="text-lg mt-1">{user?.position || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600">Role</label>
                    <p className="text-lg mt-1">{user?.role?.name}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600">Member Since</label>
                    <p className="text-lg mt-1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Salary</p>
              <p className="text-2xl font-bold">${user?.salary?.toLocaleString() || '0'}</p>
            </div>

            <div>
              <p className="text-gray-600">Join Date</p>
              <p className="text-2xl font-bold">
                {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-gray-600">Last Login</p>
              <p className="text-2xl font-bold">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
// EOF