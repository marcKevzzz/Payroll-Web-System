import React, { useState, useEffect, useRef } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Settings } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { useConfirm } from "../context/ConfirmContext";
import { useEmployeeContext } from "../context/EmployeeContext";
import { Employee } from "../types/types";

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { showConfirm } = useConfirm();
  const { employee_id, isAuthenticated, logout } = useAuth();
  const { employees, fetchEmployees } = useEmployeeContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    showConfirm({
      message: "Are you sure you want to logout?",
      type: "warning",
      showActions: true,
      onConfirm: () => {
        logout();
        navigate("/login");
      },
    });
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const filteredEmp = employees.find(
    (e: Employee) => e.employee_id === employee_id
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between md:justify-end px-4 md:px-8">
          <button
            className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          <div className="flex items-center gap-4 relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">Human Resources</p>
            </div>

            <div className="relative" ref={profileMenuRef}>
              <div
                className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold cursor-pointer hover:bg-indigo-200 transition ring-2 ring-transparent hover:ring-indigo-300"
                onClick={toggleProfileMenu}
              >
                {filteredEmp?.last_name?.charAt(0).toUpperCase()}
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fadeIn">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">
                      Admin User
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {filteredEmp?.email}
                    </p>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
