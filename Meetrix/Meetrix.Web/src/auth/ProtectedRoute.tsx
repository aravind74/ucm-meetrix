import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};