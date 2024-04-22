import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardTemplate from "../components/Dashboard/DashboardTemplate";
import ErrorPage from "../pages/ErrorPage";
import ProtectedRoute from "./ProtectedRoutes"; // Protected routes component
import DashboardRoutes from "./DashboardRoutes";
import { isAuthenticated } from "../utils/Auth";

const MainRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace={true} />
          ) : (
            <LoginPage />
          )
        }
      />{" "}
      <Route path="/register" element={<RegisterPage />} /> {/* Public route */}
      {/* Protected route for dashboard */}
      <Route path="/dashboard/*" element={<ProtectedRoute />}>
        <Route path="" element={<DashboardTemplate />}>
          <Route path="*" element={<DashboardRoutes />} />{" "}
          {/* All dashboard sub-routes */}
        </Route>
      </Route>
      {/* Catch-all for unmatched routes */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default MainRoutes;
