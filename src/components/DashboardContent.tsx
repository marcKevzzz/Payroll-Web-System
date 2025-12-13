// src/components/DashboardContent.tsx
import React, { useState } from "react";
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  PieChart,
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Briefcase,
  Shield,
  Wallet, // Added Wallet for Gross Pay
  MinusCircle, // Added MinusCircle for Deductions
  Zap, // Added Zap for OT
  Banknote, // Added Banknote for Loans
  Target, // Added Target for Net Pay
  BarChart, // Added BarChart for Headcount
  LayoutDashboard,
} from "lucide-react";
import { formatCurrency } from "../utils/utils";
import { DashboardStats, TopEmployee } from "../hooks/useAdminHrDashboardData"; // Import interfaces from the new hook

// --- Interfaces ---
interface DepartmentCount {
  department: string;
  count: number;
}

interface DashboardContentProps {
  stats: DashboardStats;
  topEmployees: TopEmployee[];
  totalEmployees: number;
  departmentHeadcount: DepartmentCount[]; // New prop
  role: string | null;
}

// --- Helper Component for Legend ---
interface LegendItemProps {
  color: string;
  label: string;
  percentage: number;
  value: number;
}
const LegendItem: React.FC<LegendItemProps> = ({
  color,
  label,
  percentage,
  value,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <div className="flex items-center text-sm font-semibold text-slate-800">
      {formatCurrency(value)}
      <span className="ml-2 text-slate-500 font-normal">
        ({percentage.toFixed(1)}%)
      </span>
    </div>
  </div>
);

// --- Stat Card Helper (Refactored to match the design proposal) ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string; // e.g., 'text-indigo-500'
}
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBg,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </h3>
        <p className="mt-1 text-3xl text-el font-bold text-slate-800">
          {typeof value === "number" ? formatCurrency(value) : value}
        </p>
      </div>
      <div className={`p-3 rounded-full ${iconBg} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${iconBg}`} />
      </div>
    </div>
  </div>
);

const DashboardContent: React.FC<DashboardContentProps> = ({
  stats,
  topEmployees,
  totalEmployees,
  departmentHeadcount = [],
  role,
}) => {
  const [showManual, setShowManual] = useState(false);

  const deductionTotal = stats.totalSSS + stats.totalBIR + stats.totalLoans;
  const overallTotal = stats.totalGross; // Use Gross Pay as the 100% basis for distribution
  const safeTotal = overallTotal || 1;

  const netPct = (stats.totalNet / safeTotal) * 100;
  const sssPct = (stats.totalSSS / safeTotal) * 100;
  const birPct = (stats.totalBIR / safeTotal) * 100;
  const loanPct = (stats.totalLoans / safeTotal) * 100;

  const maxHours = topEmployees[0]?.hours || 1;
  const isHR = role === "hr";

  const roleTitle = isHR
    ? "HR Operations Dashboard"
    : "Executive System Overview";
  const roleIcon = isHR ? Briefcase : Shield;

  // Department data preparation for chart
  const maxHeadcount = departmentHeadcount.reduce(
    (max, dept) => Math.max(max, dept.count),
    1
  );

  return (
    <div className="space-y-4  min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {React.createElement(LayoutDashboard, {
            className: "w-6 h-6 ",
          })}
          {roleTitle}
        </h2>
        {/* Simplified Guide Button (moved logic out of template) */}
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-indigo-100 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          {showManual ? "Hide System Guide" : "Show System Guide"}
          {showManual ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* MANUAL/GUIDE EXPANDABLE SECTION (Tailwind cleanup) */}
      {showManual && (
        <div className="bg-white rounded-xl shadow-xl border border-indigo-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-500" /> Getting Started
            Guide
          </h3>
          <div className="text-sm text-slate-600">
            <p className="mb-2">
              This dashboard provides an aggregate view of all DTR logs and
              payroll estimates. All amounts represent total figures based on
              current data, not a single pay period.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                **Total Gross** includes Regular Pay and OT Pay before
                deductions.
              </li>
              <li>**Payroll Distribution** chart uses Total Gross as 100%.</li>
              <li>**Top Performers** are ranked by total hours logged.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 📊 ROW 1: KEY FINANCIAL INDICATORS (4-COLUMN DESIGN) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Workforce"
          value={totalEmployees}
          icon={Users}
          iconBg="text-indigo-500"
        />
        <StatCard
          title="Total Gross Pay"
          value={stats.totalGross}
          icon={Wallet}
          iconBg="text-violet-500"
        />
        <StatCard
          title="Total Deductions"
          value={deductionTotal}
          icon={MinusCircle}
          iconBg="text-red-500"
        />
        <StatCard
          title="Total Net Payable"
          value={stats.totalNet}
          icon={Target}
          iconBg="text-teal-500"
        />
      </section>

      {/* 📈 ROW 2: ANALYTICS (Headcount & Top Performers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel: Department Headcount Bar Chart (New) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-purple-500" /> Employee Headcount
          </h3>
          <div className="flex-1 space-y-4">
            {departmentHeadcount.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm py-12">
                No employee data available for headcount.
              </div>
            ) : (
              departmentHeadcount
                .sort((a, b) => b.count - a.count)
                .map((dept, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">
                        {dept.department}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {dept.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all duration-700 ease-out group-hover:bg-purple-600"
                        style={{
                          width: `${(dept.count / maxHeadcount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right Panel: Top Employees (Optimized existing) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Top 5 Performers
            (Hours)
          </h3>
          <div className="flex-1 space-y-4">
            {topEmployees.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm py-12">
                No DTR logs available to rank employees.
              </div>
            ) : (
              topEmployees.map((emp, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {idx + 1}. {emp.name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {emp.hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-3 rounded-full transition-all duration-700 ease-out group-hover:bg-indigo-600"
                      style={{ width: `${(emp.hours / maxHours) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 💸 ROW 3: DETAILED PAYROLL BREAKDOWN & DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Operational Stats (Hours) */}
        <div className="lg:col-span-1 space-y-6">
          <StatCard
            title="Total Regular Hours"
            value={`${stats.totalRegularHours} hrs`}
            icon={Clock}
            iconBg="text-sky-500"
          />
          <StatCard
            title="Total OT Hours"
            value={`${stats.totalOTHours} hrs`}
            icon={Zap}
            iconBg="text-orange-500"
          />
          <StatCard
            title="Total Loan Deductions"
            value={stats.totalLoans}
            icon={Banknote}
            iconBg="text-pink-500"
          />
        </div>

        {/* Right Column: Payroll Distribution Pie Chart (2/3 width) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" /> Payroll
            Distribution (vs. Gross Pay)
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            {/* Donut Chart (Self-contained SVG) */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg
                viewBox="0 0 32 32"
                className="w-full h-full transform -rotate-90"
              >
                {/* Background Circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="4"
                />
                {/* Net Pay (Emerald) */}
                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${netPct} 100`}
                  strokeDashoffset="0"
                  pathLength="100"
                />
                {/* SSS (Blue) */}
                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray={`${sssPct} 100`}
                  strokeDashoffset={`-${netPct}`}
                  pathLength="100"
                />
                {/* BIR (Orange) */}
                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray={`${birPct} 100`}
                  strokeDashoffset={`-${netPct + sssPct}`}
                  pathLength="100"
                />
                {/* Loans (Rose) */}
                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="4"
                  strokeDasharray={`${loanPct} 100`}
                  strokeDashoffset={`-${netPct + sssPct + birPct}`}
                  pathLength="100"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 font-medium uppercase">
                  Gross
                </span>
                <span className="text-xl font-bold text-slate-800">
                  {formatCurrency(stats.totalGross)}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 w-full sm:w-1/2">
              <LegendItem
                color="bg-emerald-500"
                label="Net Pay"
                percentage={netPct}
                value={stats.totalNet}
              />
              <LegendItem
                color="bg-blue-500"
                label="SSS Contribution"
                percentage={sssPct}
                value={stats.totalSSS}
              />
              <LegendItem
                color="bg-orange-500"
                label="Withholding Tax"
                percentage={birPct}
                value={stats.totalBIR}
              />
              <LegendItem
                color="bg-rose-500"
                label="Loan Deductions"
                percentage={loanPct}
                value={stats.totalLoans}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Last Update */}
      <div className="text-center pt-8 text-sm text-gray-500">
        Dashboard data is an all-time aggregate based on current DTR logs and
        employee payroll details.
      </div>
    </div>
  );
};

export default DashboardContent;
