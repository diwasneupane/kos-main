import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainRoutes from "./routes/Routes";
import LoginPage from "./pages/LoginPage";
import "./assets/css/main.css";

const App = () => {
  const isAuthenticated = localStorage.getItem("authToken") !== null;

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/*" element={<MainRoutes />} />
      ) : (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
};

export default App;
