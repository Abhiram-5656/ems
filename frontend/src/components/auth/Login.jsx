import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login } from "../../redux/slices/authSlice.js";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(login(values)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // ✅ FULL WIDTH FIX
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 px-4">
      {/* ✅ CARD */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
          EMS Login
        </h1>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              {/* ✅ FORGOT PASSWORD LINK */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline font-medium text center"
                >
                  Forgot username or password?
                </Link>
              </div>
            </Form>
          )}
        </Formik>

        {/* FOOTER */}
        <p className="text-center mt-5 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
