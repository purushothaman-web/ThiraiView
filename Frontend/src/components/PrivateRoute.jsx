// src/components/PrivateRoute.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    // Not logged in, redirect to login page
    const redirectTo = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectTo} replace />;
  }

  // Logged in, render children components
  return children;
};

export default PrivateRoute;
