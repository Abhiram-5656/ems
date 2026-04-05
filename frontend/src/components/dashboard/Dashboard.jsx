import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../layout/Layout';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ✅ CENTER FIX */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-6xl px-4 md:px-6">

          {/* Content */}
          {user?.role?.name === 'ADMIN' && <AdminDashboard />}
          {user?.role?.name !== 'ADMIN' && <EmployeeDashboard />}

        </div>
      </div>
    </Layout>
  );
}