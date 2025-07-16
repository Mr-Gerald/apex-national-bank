
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRouteGuard: React.FC = () => {
  const isAdminSession = sessionStorage.getItem('isAdmin') === 'true';
  
  if (!isAdminSession) {
    // Redirect to the main login page if not an admin session
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default AdminRouteGuard;