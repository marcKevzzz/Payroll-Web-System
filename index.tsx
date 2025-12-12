// src/App.tsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// import { Dashboard } from "./src/pages/Dashboard";
import EmployeeManager from "./src/pages/EmployeeManager";
import { DTRManager } from "./src/pages/DTRManager";
import { PayrollCalculator } from "./src/pages/PayrollCalculator";
import { MainLayout } from "./src/layouts/MainLayout";
import LoginPage from "./src/pages/LoginPage";
import ChangePassword from "./src/pages/ChangePassword";
import EmployeePortal from "./src/pages/EmployeeDashboard/EmployeePortal";
import UnauthorizedPage from "./src/pages/UnauthorizedPage";
import { Dashboard } from "./src/pages/Dashboard";

import { EmployeeProvider } from "./src/context/EmployeeContext";
import { DTRProvider } from "./src/context/DTRContext";
import { ToastProvider } from "./src/context/ToastContext";
import { AuthProvider } from "./src/context/AuthContext";
import { ConfirmProvider } from "./src/context/ConfirmContext";
import ProtectedRoute from "./src/components/ProtectedRoute";

import { Employee, DTREntry } from "./src/types/types";
import Logout from "./src/pages/Logout";

const AppContent: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dtrEntries, setDtrEntries] = useState<DTREntry[]>([]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/logout" element={<Logout />} />

        {/* Employee dashboard */}
        <Route
          path="/employee/:employee_id"
          element={
            <ProtectedRoute>
              <EmployeePortal />
            </ProtectedRoute>
          }
        />

        {/* Admin/HR Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <Dashboard employees={employees} dtrEntries={dtrEntries} />
            }
          />

          <Route
            path="employees"
            element={<EmployeeManager setEmployees={setEmployees} />}
          />

          <Route
            path="dtr"
            element={<DTRManager setDtrEntries={setDtrEntries} />}
          />

          <Route path="payroll" element={<PayrollCalculator />} />

          {/* Catch-all inside admin routes */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Global fallback for ANY unknown route */}
        {/* Fallback for any unknown route */}
        <Route path="/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <EmployeeProvider>
      <DTRProvider>
        <ToastProvider>
          <AuthProvider>
            <ConfirmProvider>
              <AppContent />
            </ConfirmProvider>
          </AuthProvider>
        </ToastProvider>
      </DTRProvider>
    </EmployeeProvider>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
