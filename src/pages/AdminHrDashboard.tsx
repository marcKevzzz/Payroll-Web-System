// src/pages/AdminHrDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardContent from "../components/DashboardContent";
import { Employee, DTREntry } from "../types/types";
import { useDTRContext } from "../context/DTRContext";
import { useEmployeeContext } from "../context/EmployeeContext";
import { Loader2 } from "lucide-react";
// Import the new custom hook
import { useAdminHrDashboardData } from "../hooks/useAdminHrDashboardData";

const AdminHrDashboard: React.FC = () => {
  const { role } = useAuth();

  // Local state to hold data synced from context
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dtrEntries, setDtrEntries] = useState<DTREntry[]>([]);

  // Context hook calls
  const { DTREntries, fetchAllDTRLogs, loading: dtrLoading } = useDTRContext();
  const {
    employees: empContext,
    fetchEmployees,
    loading: empLoading,
  } = useEmployeeContext();

  const isLoading = dtrLoading || empLoading;

  // --- Data Fetching and Syncing ---
  useEffect(() => {
    fetchAllDTRLogs();
    fetchEmployees();
  }, [fetchAllDTRLogs, fetchEmployees]);

  useEffect(() => {
    // Only update local state if context data is available/non-null
    if (empContext) setEmployees(empContext);
    if (DTREntries) setDtrEntries(DTREntries);
  }, [empContext, DTREntries]);

  // --- Logic Abstraction (The useMemo logic is now here) ---
  const { stats, topEmployees, departmentHeadcount } = useAdminHrDashboardData(
    employees,
    dtrEntries
  );

  const totalEmployees = employees.length;

  // --- Conditional Renders ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (role !== "admin" && role !== "hr") {
    return (
      <div className="p-12 text-center text-red-500 bg-white rounded-xl shadow-sm">
        Access Denied: Insufficient permissions.
      </div>
    );
  }

  // --- Final Render ---
  return (
    <DashboardContent
      stats={stats}
      topEmployees={topEmployees}
      totalEmployees={totalEmployees}
      departmentHeadcount={departmentHeadcount} // Pass the new metric
      role={role}
    />
  );
};

export default AdminHrDashboard;
