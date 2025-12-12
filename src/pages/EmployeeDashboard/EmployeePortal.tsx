// src/components/EmployeePortal.jsx

import React, { useState, lazy, Suspense, useEffect } from "react";
import { User, FileText, Calendar, Clock, LogOut, Loader2 } from "lucide-react";
// import { mockEmployee } from "../utils/mockData";
import { useEmployeeContext } from "@/src/context/EmployeeContext";
import { DTREntry, Employee } from "@/src/types/types";
import { useParams } from "react-router-dom";
import { useDTRContext } from "@/src/context/DTRContext";

// --- 1. Dynamic Imports (Code Splitting) ---
// These components will be loaded only when needed.
const PayslipView = lazy(
  () => import("../../components/EmployeePortal/PayslipView")
);
const DTRView = lazy(() => import("../../components/EmployeePortal/DTRView"));
const LeaveView = lazy(
  () => import("../../components/EmployeePortal/LeaveView")
);
const ProfileView = lazy(
  () => import("../../components/EmployeePortal/ProfileView")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    <span className="ml-3 text-slate-600">Loading view...</span>
  </div>
);

const EmployeePortal = () => {
  const { employee_id } = useParams();
  const { employees, fetchEmployeeById } = useEmployeeContext();
  const { DTREntries, fetchEmployeeDTRLogs } = useDTRContext();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("payslip");
  const [leaveForm, setLeaveForm] = useState({
    type: "Vacation Leave",
    start: "",
    end: "",
    reason: "",
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employee_id) return;
      await fetchEmployeeById(employee_id);
      setEmployee(employees);
    };
    loadEmployee();
  }, [employee_id, fetchEmployeeById]);

  useEffect(() => {
    if (employee?.employee_id) {
      fetchEmployeeDTRLogs(employee.employee_id);
    }
  }, [employee, fetchEmployeeDTRLogs]);

  const dtr = [
    {
      employee_id: "25-0002",
      dtr_id: 1,
      work_date: "2025-12-11T16:00:00.000Z",
      time_in: "14:50:00",
      time_out: "19:50:00",
      status: "Present",
    },
    {
      employee_id: "25-0002",
      dtr_id: 3,
      work_date: "2025-12-08T16:00:00.000Z",
      time_in: "15:00:00",
      time_out: "19:00:00",
      status: "Present",
    },
    {
      employee_id: "25-0002",
      dtr_id: 7,
      work_date: "2025-12-12T16:00:00.000Z",
      time_in: "13:23:00",
      time_out: "20:24:00",
      status: "Present",
    },
    {
      employee_id: "25-0002",
      dtr_id: 9,
      work_date: "2025-12-09T16:00:00.000Z",
      time_in: "14:52:00",
      time_out: "20:53:00",
      status: "Present",
    },
  ];

  const tabs = [
    { id: "payslip", label: "My Payslips", icon: FileText },
    { id: "dtr", label: "DTR Records", icon: Clock },
    { id: "leave", label: "Leave Request", icon: Calendar },
    { id: "profile", label: "My Profile", icon: User },
  ];

  console.log(dtr);

  const renderContent = () => {
    try {
      switch (activeTab) {
        case "payslip":
          return employee ? (
            <Suspense fallback={<LoadingFallback />}>
              <PayslipView employee={employee} dtrEntries={dtr} />
            </Suspense>
          ) : (
            <LoadingFallback />
          );
        case "dtr":
          return <DTRView dtrEntries={dtr} />;
        case "leave":
          return (
            <LeaveView leaveForm={leaveForm} setLeaveForm={setLeaveForm} />
          );
        case "profile":
          return (
            <ProfileView
              employee={employee}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          );
        default:
          return null;
      }
    } catch (err) {
      console.error(
        "Error rendering content:",
        err,
        JSON.stringify({ employee, DTREntries }, null, 2) // Explicitly stringify the context object
      );
      return <div>Error rendering content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Employee Portal
              </h1>
              <p className="text-slate-500 mt-1">
                Welcome back, {employee?.first_name || "Employee"}!
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content with Suspense */}
        <div className="animate-fadeIn">
          <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
