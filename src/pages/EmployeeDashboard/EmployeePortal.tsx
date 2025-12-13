// src/components/EmployeePortal.jsx

import React, { useState, lazy, Suspense, useEffect } from "react";
import { User, FileText, Calendar, Clock, LogOut, Loader2 } from "lucide-react";
// import { mockEmployee } from "../utils/mockData";
import { useEmployeeContext } from "@/src/context/EmployeeContext";
import { DTREntry, Employee } from "@/src/types/types";
import { useNavigate, useParams } from "react-router-dom";
import { useDTRContext } from "@/src/context/DTRContext";
import { useConfirm } from "@/src/context/ConfirmContext";
import { useLeaveRequestContext } from "@/src/context/LeaveRequestContext";
import { useAuth } from "@/src/hooks/useAuth";

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
  const {
    employeeDTREntries, // <-- This holds the fetched data
    fetchEmployeeDTRLogs,
    employeeLoading,
  } = useDTRContext();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("payslip");

  const [editMode, setEditMode] = useState(false);
  const { showConfirm } = useConfirm();
  const navigate = useNavigate();
  const { leaveRequests } = useLeaveRequestContext();
  const { employee_id: empId } = useAuth();

  useEffect(() => {
    if (empId !== employee_id) {
      navigate("/login");
      return;
    }
  }, []);

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employee_id) return;
      const emp = await fetchEmployeeById(employee_id);

      setEmployee(emp);
    };
    loadEmployee();
  }, [employee_id, fetchEmployeeById]);

  useEffect(() => {
    if (employee_id) {
      fetchEmployeeDTRLogs(employee_id);
    }
  }, [employee_id, fetchEmployeeDTRLogs]);

  const tabs = [
    { id: "payslip", label: "My Payslips", icon: FileText },
    { id: "dtr", label: "DTR Records", icon: Clock },
    { id: "leave", label: "Leave Request", icon: Calendar },
    { id: "profile", label: "My Profile", icon: User },
  ];

  const handleLogout = () => {
    showConfirm({
      message: "Are you sure you want to logout?",
      type: "leave",
      onConfirm: () => navigate("/logout"),
    });
  };

  const renderContent = () => {
    try {
      switch (activeTab) {
        case "payslip":
          return employee ? (
            <Suspense fallback={<LoadingFallback />}>
              <PayslipView
                employee={employee}
                dtrEntries={employeeDTREntries}
                leaveRequests={leaveRequests}
              />
            </Suspense>
          ) : (
            <LoadingFallback />
          );
        case "dtr":
          return <DTRView dtrEntries={employeeDTREntries} />;
        case "leave":
          return <LeaveView employee={employees} employee_id={employee_id} />;
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
      return <div>Error rendering content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-6 ">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div>AeroStack Co.</div>
              <h1 className="text-2xl font-bold text-slate-900">
                Employee Portal
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-md text-slate-500 ">
                {`${employee?.first_name} ${employee?.last_name}` || "Employee"}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-2 md:px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
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
