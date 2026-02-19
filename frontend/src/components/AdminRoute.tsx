import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const token = localStorage.getItem('token');
  const isAuthCheckPending = token && !user;

  // While the app is starting and checking the token, the user object won't be available yet.
  // This shows a loading screen during that check.
  if (isAuthCheckPending) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If the check is done and the user is not authenticated OR is not an admin, redirect.
  if (!isAuthenticated || user?.role !== 'admin') {
    // Redirect non-admins to the home page.
    // Redirect unauthenticated users to the login page.
    return <Navigate to={isAuthenticated ? '/' : '/login'} replace />;
  }

  // If all checks pass, render the admin content.
  return <Outlet />;
};

export default AdminRoute;