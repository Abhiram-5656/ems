import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, loading } = useSelector((state) => state.auth);

  // ✅ Show loader while fetching user (IMPORTANT)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // ❌ Token exists but user not loaded (edge case)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Fetching user...
      </div>
    );
  }

  // ❌ Role check
  if (requiredRole && user?.role?.name !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;