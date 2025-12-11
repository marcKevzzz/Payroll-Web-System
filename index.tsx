import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Dashboard } from "./src/pages/Dashboard";
import EmployeeManager from "./src/pages/EmployeeManager";
import { DTRManager } from "./src/pages/DTRManager";
import { PayrollCalculator } from "./src/pages/PayrollCalculator";
import { Sidebar } from "./src/components/Sidebar";
import { MainLayout } from "./src/layouts/MainLayout";

import { Employee, DTREntry } from "./src/types/types";
import LoginPage from "./src/pages/LoginPage";
import { AuthProvider } from "./src/context/AuthContext";
import ChangePassword from "./src/pages/ChangePassword";
import { ToastProvider } from "./src/context/ToastContext";
import { EmployeeProvider } from "./src/context/EmployeeContext";
import { ConfirmProvider } from "./src/context/ConfirmContext";
import { DTRProvider } from "./src/context/DTRContext";
import EmployeeDashboard from "./src/pages/EmployeeDashboard/EmployeeDashboard";

const App = () => {
  const [dtrEntries, setDtrEntries] = useState<DTREntry[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);

  return (
    <EmployeeProvider>
      <DTRProvider>
        <ToastProvider>
          <AuthProvider>
            <ConfirmProvider>
              <Router>
                <Routes>
                  {/* Login Page - No Layout */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route
                    path="/employee/:employee_id"
                    element={<EmployeeDashboard />}
                  ></Route>
                  {/* Protected Pages With Layout */}
                  <Route
                    path="/"
                    element={
                      <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
                        <Sidebar
                          isSidebarOpen={isSidebarOpen}
                          setIsSidebarOpen={setIsSidebarOpen}
                        />
                        <MainLayout
                          isSidebarOpen={isSidebarOpen}
                          setIsSidebarOpen={setIsSidebarOpen}
                        />
                      </div>
                    }
                  >
                    <Route
                      path="dashboard"
                      element={
                        <Dashboard
                          employees={employees}
                          dtrEntries={dtrEntries}
                        />
                      }
                    />

                    <Route
                      path="employees"
                      element={
                        <EmployeeManager
                          dtrEntries={dtrEntries}
                          setDtrEntries={setDtrEntries}
                          setEmployees={setEmployees}
                        />
                      }
                    />

                    <Route
                      path="dtr"
                      element={<DTRManager setDtrEntries={setDtrEntries} />}
                    />

                    <Route
                      path="payroll"
                      element={
                        <PayrollCalculator
                        // employees={employees}
                        // dtrEntries={dtrEntries}
                        />
                      }
                    />

                    {/* Default Redirect */}
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Route>
                </Routes>
              </Router>
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
