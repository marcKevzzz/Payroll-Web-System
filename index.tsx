import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { Employee, DTREntry } from "./types";
import { Dashboard } from "./Dashboard";
import { EmployeeManager } from "./EmployeeManager";
import { DTRManager } from "./DTRManager";
import { PayrollCalculator } from "./PayrollCalculator";

// --- SEED DATA GENERATION ---
const SEED_EMPLOYEES: Employee[] = [
  // Maria has a 50k loan, deduction will be 25% of her monthly net pay
  { id: "EMP001", name: "Maria Santos", hourlyRate: 450.0, totalLoan: 50000.0 },
  // Pedro has no loan
  { id: "EMP002", name: "Pedro Penduko", hourlyRate: 280.5, totalLoan: 0 },
];

const generateSeedDTR = (): DTREntry[] => {
  const entries: DTREntry[] = [];

  // Helper to add days for a specific month
  const addMonthLogs = (
    empId: string,
    year: number,
    monthIndex: number,
    startHour: number
  ) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat

      // Skip Weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = `${year}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      const hasOT = Math.random() < 0.2;
      const otHours = hasOT ? Math.floor(Math.random() * 3) + 1 : 0; // 1 to 3 hours OT

      const minOffset = Math.floor(Math.random() * 15);
      const timeIn = `${String(startHour).padStart(2, "0")}:${String(
        minOffset
      ).padStart(2, "0")}`;

      let outHour = startHour + 8 + otHours;
      const timeOut = `${String(outHour).padStart(2, "0")}:${String(
        minOffset
      ).padStart(2, "0")}`;

      entries.push({
        id: `DTR-${empId}-${dateStr}`,
        employeeId: empId,
        date: dateStr,
        timeIn,
        timeOut,
      });
    }
  };

  // Generate 6 months for Maria (Jan - June 2025)
  for (let m = 5; m <= 11; m++) {
    addMonthLogs("EMP001", 2025, m, 8); // 8:00 AM Start
  }

  // Generate 2 months for Pedro (May - June 2025)
  for (let m = 3; m <= 4; m++) {
    addMonthLogs("EMP002", 2025, m, 9); // 9:00 AM Start
  }

  return entries;
};

// --- Main App Component ---

const App = () => {
  // State initialization with Seed Data Fallback
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem("payroll_employees");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse employees", e);
    }
    // Return Seed Data if empty
    return SEED_EMPLOYEES;
  });

  const [dtrEntries, setDtrEntries] = useState<DTREntry[]>(() => {
    try {
      const saved = localStorage.getItem("payroll_dtr");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse DTR", e);
    }
    // Return Seed Data if empty
    return generateSeedDTR();
  });

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "employees" | "dtr" | "payroll"
  >("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem("payroll_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("payroll_dtr", JSON.stringify(dtrEntries));
  }, [dtrEntries]);

  // Navigation Component
  const NavItem = ({
    id,
    label,
    icon: Icon,
  }: {
    id: typeof activeTab;
    label: string;
    icon: any;
  }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id
          ? "bg-indigo-600 text-white shadow-md"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar */}
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
            <h1 className="text-xl font-bold text-white">PayrollPro</h1>
          </div>

          <nav className="space-y-2">
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="employees" label="Employees" icon={Users} />
            <NavItem id="dtr" label="DTR Logs" icon={Clock} />
            <NavItem id="payroll" label="Payroll" icon={DollarSign} />
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 text-slate-500 text-xs text-center border-t border-slate-800">
          &copy; 2025 PayrollPro System
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8">
          <button
            className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">Human Resources</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === "dashboard" && (
            <Dashboard employees={employees} dtrEntries={dtrEntries} />
          )}
          {activeTab === "employees" && (
            <EmployeeManager
              employees={employees}
              setEmployees={setEmployees}
              dtrEntries={dtrEntries}
              setDtrEntries={setDtrEntries}
            />
          )}
          {activeTab === "dtr" && (
            <DTRManager
              employees={employees}
              dtrEntries={dtrEntries}
              setDtrEntries={setDtrEntries}
            />
          )}
          {activeTab === "payroll" && (
            <PayrollCalculator employees={employees} dtrEntries={dtrEntries} />
          )}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Mount
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
