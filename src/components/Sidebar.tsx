import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Clock, Calculator } from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const location = useLocation(); // to highlight active link

  const NavItem = ({
    to,
    label,
    icon: Icon,
  }: {
    to: string;
    label: string;
    icon: any;
  }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? "bg-indigo-600 text-white shadow-md"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0`}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <h1 className="text-xl font-bold text-white">AeroStack Co.</h1>
        </div>
        <nav className="space-y-2">
          <NavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem to="/employees" label="Employees" icon={Users} />
          <NavItem to="/dtr" label="DTR Logs" icon={Clock} />
          <NavItem to="/payroll" label="Payroll" icon={Calculator} />
        </nav>
      </div>
      <div className="absolute bottom-0 w-full p-6 text-slate-500 text-xs text-center border-t border-slate-800">
        &copy; 2025 PayrollPro System
      </div>
    </aside>
  );
};
