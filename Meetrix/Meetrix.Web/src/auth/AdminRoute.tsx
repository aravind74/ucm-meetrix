import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Props = {
  children: JSX.Element;
};

export const AdminRoute: React.FC<Props> = ({ children }) => {
  const { auth } = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (auth.role?.toLowerCase() !== "admin") {
    // could redirect to /rooms or show "Forbidden"
    return <Navigate to="/rooms" replace />;
  }

  return children;
};
