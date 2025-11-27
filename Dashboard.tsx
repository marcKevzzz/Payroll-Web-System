import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import { Employee, DTREntry } from "./types";
import {
  calculateHours,
  formatCurrency,
  OT_MULTIPLIER,
  calculateSSS,
  calculateBIR,
} from "./utils";

interface DashboardProps {
  employees: Employee[];
  dtrEntries: DTREntry[];
}

export const Dashboard = ({ employees, dtrEntries }: DashboardProps) => {
  const totalEmployees = employees.length;
  const [showManual, setShowManual] = useState(false);

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    let totalRegularHours = 0;
    let totalOTHours = 0;
    let totalGross = 0;
    let totalSSS = 0;
    let totalBIR = 0;
    let totalLoans = 0;
    let totalNet = 0;

    // Track loans per employee
    const empDataMap = new Map<
      string,
      {
        totalLoan: number;
        paidLoan: number;
      }
    >();

    employees.forEach((e) =>
      empDataMap.set(e.id, {
        totalLoan: e.totalLoan || 0,
        paidLoan: 0,
      })
    );

    // Group DTRs by Key: "EMPID-YYYY-MM"
    const monthlyGrossMap = new Map<string, number>();

    dtrEntries.forEach((entry) => {
      const hours = calculateHours(entry.timeIn, entry.timeOut);
      const reg = Math.min(8, hours);
      const ot = Math.max(0, hours - 8);
      const emp = employees.find((e) => e.id === entry.employeeId);

      if (emp) {
        totalRegularHours += reg;
        totalOTHours += ot;

        const gross =
          reg * emp.hourlyRate + ot * emp.hourlyRate * OT_MULTIPLIER;
        const key = `${entry.employeeId}-${entry.date.slice(0, 7)}`;
        monthlyGrossMap.set(key, (monthlyGrossMap.get(key) || 0) + gross);
      }
    });

    // Chronological processing
    const sortedKeys = Array.from(monthlyGrossMap.keys()).sort();

    sortedKeys.forEach((key) => {
      const [empId] = key.split("-");
      const gross = monthlyGrossMap.get(key) || 0;

      const sss = calculateSSS(gross);
      const bir = calculateBIR(Math.max(0, gross - sss));
      const netBeforeLoan = gross - (sss + bir);

      // Loan Calculation
      const empData = empDataMap.get(empId);
      let loan = 0;

      if (empData) {
        const deduction25 = netBeforeLoan * 0.25;
        const remainingBalance = Math.max(
          0,
          empData.totalLoan - empData.paidLoan
        );

        // Logic: Min(25% Net, Balance)
        loan = Math.min(deduction25, remainingBalance);
        empData.paidLoan += loan;
      }

      totalGross += gross;
      totalSSS += sss;
      totalBIR += bir;
      totalLoans += loan;
    });

    totalNet = totalGross - (totalSSS + totalBIR + totalLoans);

    return {
      totalRegularHours,
      totalOTHours,
      totalGross,
      totalSSS,
      totalBIR,
      totalLoans,
      totalNet,
    };
  }, [employees, dtrEntries]);

  // --- Employee Rankings ---
  const topEmployees = useMemo(() => {
    const hoursMap = new Map<string, number>();
    dtrEntries.forEach((entry) => {
      const hours = calculateHours(entry.timeIn, entry.timeOut);
      hoursMap.set(
        entry.employeeId,
        (hoursMap.get(entry.employeeId) || 0) + hours
      );
    });

    return Array.from(hoursMap.entries())
      .map(([id, hours]) => ({
        name: employees.find((e) => e.id === id)?.name || "Unknown",
        hours,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5); // Top 5
  }, [employees, dtrEntries]);

  const maxHours = topEmployees[0]?.hours || 1;

  // --- Chart Data Helpers ---
  const deductionTotal = stats.totalSSS + stats.totalBIR + stats.totalLoans;
  const overallTotal = stats.totalNet + deductionTotal;
  const safeTotal = overallTotal || 1;

  const netPct = (stats.totalNet / safeTotal) * 100;
  const sssPct = (stats.totalSSS / safeTotal) * 100;
  const birPct = (stats.totalBIR / safeTotal) * 100;
  const loanPct = (stats.totalLoans / safeTotal) * 100;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Executive Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManual(!showManual)}
            className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> System Manual
          </button>
          <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {showManual && (
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" /> Getting Started
            Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
            <div className="space-y-2">
              <div className="font-bold text-indigo-700 flex items-center gap-2">
                1. Add Employees
              </div>
              <p>
                Go to the <strong>Employees</strong> tab. Set a{" "}
                <strong>Total Loan</strong>. The system will automatically
                deduct 25% of the Net Pay (Gross - Tax - SSS) each month until
                paid.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-indigo-700 flex items-center gap-2">
                2. Log Daily Time
              </div>
              <p>
                Go to the <strong>DTR Logs</strong> tab. Select an employee and
                record their Time In and Time Out. The system automatically
                calculates regular (8h) and overtime hours.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-indigo-700 flex items-center gap-2">
                3. Process Payroll
              </div>
              <p>
                Go to the <strong>Payroll</strong> tab. Select an employee and
                the month (e.g., September 2025). The system generates a payslip
                with SSS, Tax, and Loan deductions automatically calculated.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>
              * Validations are in place for time logs and loan inputs.
            </span>
            <button
              onClick={() => setShowManual(false)}
              className="text-indigo-600 hover:underline"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500">
              Total Workforce
            </p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {totalEmployees}
            </p>
            <div className="mt-4 flex items-center text-xs text-indigo-600 font-medium bg-indigo-50 w-fit px-2 py-1 rounded">
              <Activity className="w-3 h-3 mr-1" /> Active
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500">
              Total Gross Processed
            </p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {formatCurrency(stats.totalGross)}
            </p>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" /> All-Time Estimate
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500">Hours Logged</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {(stats.totalRegularHours + stats.totalOTHours).toFixed(1)}{" "}
              <span className="text-lg text-slate-400 font-normal">hrs</span>
            </p>
            <div className="mt-4 flex items-center text-xs text-blue-600 font-medium bg-blue-50 w-fit px-2 py-1 rounded">
              OT Hours: {stats.totalOTHours.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Top Employees
              (Hours)
            </h3>
          </div>

          <div className="flex-1 space-y-4">
            {topEmployees.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            ) : (
              topEmployees.map((emp, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {emp.name}
                    </span>
                    <span className="text-slate-500">
                      {emp.hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:bg-indigo-600"
                      style={{ width: `${(emp.hours / maxHours) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" /> Payroll
              Distribution
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="relative w-52 h-52 p-2 flex-shrink-0">
              <svg
                viewBox="0 0 32 32"
                className="w-full h-full transform -rotate-90"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="4"
                />

                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${netPct} 100`}
                  strokeDashoffset="0"
                  className="transition-all duration-1000"
                />

                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray={`${sssPct} 100`}
                  strokeDashoffset={`-${netPct}`}
                  className="transition-all duration-1000"
                />

                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray={`${birPct} 100`}
                  strokeDashoffset={`-${netPct + sssPct}`}
                  className="transition-all duration-1000"
                />

                <circle
                  cx="16"
                  cy="16"
                  r="13.9"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="4"
                  strokeDasharray={`${loanPct} 100`}
                  strokeDashoffset={`-${netPct + sssPct + birPct}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 font-medium uppercase">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {formatCurrency(overallTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-slate-600">Net Pay</span>
                <span className="text-sm font-bold text-slate-800 ml-auto sm:ml-2">
                  {netPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-600">SSS Contribution</span>
                <span className="text-sm font-bold text-slate-800 ml-auto sm:ml-2">
                  {sssPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-slate-600">Withholding Tax</span>
                <span className="text-sm font-bold text-slate-800 ml-auto sm:ml-2">
                  {birPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-sm text-slate-600">Loan Deductions</span>
                <span className="text-sm font-bold text-slate-800 ml-auto sm:ml-2">
                  {loanPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
