import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminLayout from './AdminLayout';

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const token = localStorage.getItem('token');
  const isAuthCheckPending = token && !user;

  if (isAuthCheckPending) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to={isAuthenticated ? '/' : '/login'} replace />;
  }

  return <AdminLayout />;
};

export default AdminRoute;
