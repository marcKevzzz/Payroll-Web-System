import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, role, isCheckingAuth } = useAuth(); // 1. Show a loading indicator while fetching auth/role details

  if (isCheckingAuth) {
    return <div className="text-center p-12">Loading User Permissions...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  } // 4. Authorized Access

  return children;
};

export default ProtectedRoute;
