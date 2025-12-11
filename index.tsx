// src/App.tsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { Dashboard } from "./src/pages/Dashboard";
import EmployeeManager from "./src/pages/EmployeeManager";
import { DTRManager } from "./src/pages/DTRManager";
import { PayrollCalculator } from "./src/pages/PayrollCalculator";
import { Sidebar } from "./src/components/Sidebar";
import { MainLayout } from "./src/layouts/MainLayout";
import LoginPage from "./src/pages/LoginPage";
import ChangePassword from "./src/pages/ChangePassword";
import EmployeeDashboard from "./src/pages/EmployeeDashboard/EmployeeDashboard";

import { EmployeeProvider } from "./src/context/EmployeeContext";
import { DTRProvider } from "./src/context/DTRContext";
import { ToastProvider } from "./src/context/ToastContext";
import { AuthProvider } from "./src/context/AuthContext";
import { ConfirmProvider } from "./src/context/ConfirmContext";

import { Employee, DTREntry } from "./src/types/types";
import { useAuth } from "./src/hooks/useAuth";

// ProtectedRoute wrapper
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dtrEntries, setDtrEntries] = useState<DTREntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/employee/:employee_id" element={<EmployeeDashboard />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Routes>
                    <Route
                      path="dashboard"
                      element={<Dashboard employees={employees} dtrEntries={dtrEntries} />}
                    />
                    <Route
                      path="employees"
                      element={
                        <EmployeeManager
                          setEmployees={setEmployees}
                          dtrEntries={dtrEntries}
                          setDtrEntries={setDtrEntries}
                        />
                      }
                    />
                    <Route path="dtr" element={<DTRManager setDtrEntries={setDtrEntries} />} />
                    <Route path="payroll" element={<PayrollCalculator />} />

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </div>
            </ProtectedRoute>
          }
        />
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
