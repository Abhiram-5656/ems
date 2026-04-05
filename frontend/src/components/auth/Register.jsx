
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { verifySignupOTP } from '../../redux/slices/authSlice';
import * as authAPI from '../../api/authAPI';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const otpValidationSchema = Yup.object().shape({
  otp: Yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [step, setStep] = useState('register');
  const [userData, setUserData] = useState(null);
  const [otpError, setOtpError] = useState('');

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      setUserData({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      await authAPI.sendSignupOTP({
        email: values.email,
        verificationMethod: 'email',
      });

      setStep('otp');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPVerification = async (values, { setSubmitting }) => {
    try {
      await dispatch(
        verifySignupOTP({
          ...userData,
          code: values.otp,
          verificationMethod: 'email',
        })
      ).unwrap();

      navigate('/dashboard');
    } catch (err) {
      setOtpError(err || 'OTP verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Verify Email
          </h1>

          <p className="text-center text-gray-600 mb-6">
            An OTP has been sent to {userData?.email}
          </p>

          {otpError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {otpError}
            </div>
          )}

          <Formik
            initialValues={{ otp: '' }}
            validationSchema={otpValidationSchema}
            onSubmit={handleOTPVerification}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="form-group">
                  <label className="label">OTP</label>
                  <Field
                    type="text"
                    name="otp"
                    className="input-field text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                  />
                  <ErrorMessage name="otp" component="div" className="error-text" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </Form>
            )}
          </Formik>

          <button
            onClick={() => setStep('register')}
            className="w-full mt-4 text-blue-500 font-semibold hover:underline"
          >
            Back to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 text-white">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">First Name</label>
                  <Field
                    type="text"
                    name="firstName"
                    className="input-field"
                    placeholder="First name"
                  />
                  <ErrorMessage name="firstName" component="div" className="error-text" />
                </div>

                <div className="form-group">
                  <label className="label">Last Name</label>
                  <Field
                    type="text"
                    name="lastName"
                    className="input-field"
                    placeholder="Last name"
                  />
                  <ErrorMessage name="lastName" component="div" className="error-text" />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label className="label">Phone</label>
                <Field
                  type="tel"
                  name="phone"
                  className="input-field"
                  placeholder="Enter your phone"
                />
                <ErrorMessage name="phone" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="Enter password"
                />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label className="label">Confirm Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className="input-field"
                  placeholder="Confirm password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error-text" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
