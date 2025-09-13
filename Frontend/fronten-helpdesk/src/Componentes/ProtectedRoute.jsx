import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.rol)) {  // Cambiado de 'role' a 'rol'
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
export default ProtectedRoute;