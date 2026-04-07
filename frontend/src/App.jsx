import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, lazy, Suspense } from "react";

// ✅ Lazy Imports (Code Splitting)
const Login = lazy(() => import("./components/auth/Login"));
const Register = lazy(() => import("./components/auth/Register"));
const ForgotPassword = lazy(() =>
  import("./components/auth/ForgotPassword")
);

const Dashboard = lazy(() =>
  import("./components/dashboard/Dashboard")
);
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const LeavesPage = lazy(() => import("./pages/LeavesPage"));
const AdminLeavesPage = lazy(() =>
  import("./pages/AdminLeavesPage")
);
const AttendancePage = lazy(() =>
  import("./pages/AttendancePage")
);
const PayrollPage = lazy(() => import("./pages/PayrollPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const NotFound = lazy(() => import("./pages/NotFound"));

// Normal imports (keep these)
import ProtectedRoute from "./components/common/ProtectedRoute";
import { fetchCurrentUser } from "./redux/slices/authSlice";

import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user, loading } = useSelector(
    (state) => state.auth
  );

  // ✅ Fetch user if token exists
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);

  // ✅ Prevent blank screen while loading
  if (token && !user && loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      {/* ✅ Suspense Wrapper */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="spinner"></div>
          </div>
        }
      >
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <LeavesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-leaves"
            element={
              <ProtectedRoute>
                <AdminLeavesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <PayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
