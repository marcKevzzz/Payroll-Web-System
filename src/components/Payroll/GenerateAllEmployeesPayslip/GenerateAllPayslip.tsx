// src/components/Payroll/GenerateAllEmployeesPayslip/GenerateAllPayslip.tsx (Refactored)

import { useToast } from "@/src/context/ToastContext";
import { DTREntry, Employee, PayrollResult } from "@/src/types/types";
import { downloadAndOpenPdf } from "@/src/utils/pdfGenerator";
import { formatCurrency } from "@/src/utils/utils";
import { CalendarRange, Printer, Users } from "lucide-react"; // Added Users icon
import React, { useRef, useState } from "react";

// Updated Interface remains the same (assuming you pass allEmployees)
interface GenerateAllPayslipProps {
  allEmployees: Employee[];
  payrollResults: PayrollResult[] | null;
  onClick: () => void;
  setMonth: (value: string) => void;
  month: string;
  dtrEntry: DTREntry[] | null;
}

const GenerateAllPayslip: React.FC<GenerateAllPayslipProps> = ({
  allEmployees,
  payrollResults,
  onClick,
  setMonth,
  month,
  dtrEntry,
}) => {
  const safePayrollResults = payrollResults ?? [];
  const payslipRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const displayInitialData = safePayrollResults.length === 0 || !month;

  const employeeMap = new Map(
    allEmployees.map((e) => [e.employee_id, `${e.first_name} ${e.last_name}`])
  );

  const getEmployeeById = (id: string) =>
    allEmployees.find((e) => e.employee_id === id);

  const getDtrEmp = (id: string) => dtrEntry.find((e) => e.employee_id === id);

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);
    const filename = `Employees-Payslip-${month}.pdf`;

    try {
      // The core PDF generation call
      await downloadAndOpenPdf(payslipRef.current!, filename);
      showToast("success", "Payslip downloaded successfully.");
    } catch (error) {
      console.error("PDF Download Error:", error);
      showToast("error", "Failed to generate or download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* --- Action Section --- (Unchanged) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 w-full items-end">
        <div className="w-full flex items-end gap-4">
          <div className="w-full flex flex-col">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Payroll Period (Month)
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>
          <div className="w-full">
            <button
              onClick={onClick}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex self-end justify-center gap-2 transition-colors"
            >
              Generate All Payslips
            </button>
          </div>
        </div>
      </div>

      {/* --- Payroll Summary Table --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            {displayInitialData ? (
              <>
                <Users className="w-5 h-5 text-slate-500" /> Employee Data (
                {month || "Current Period"})
              </>
            ) : (
              <>
                <CalendarRange className="w-5 h-5 text-indigo-500" /> Monthly
                Payroll Summary
              </>
            )}
          </h3>
          {!displayInitialData && (
            <button
              onClick={handleDownload}
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1 print:hidden"
            >
              <Printer className="w-4 h-4" /> Print Report
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          {/* Conditional Table Structure */}
          {displayInitialData ? (
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">Position</th>
                  <th className="p-4 text-right">Daily Rate</th>
                  <th className="p-4 text-right">Loan Balance</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {allEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No employees found in the system.
                    </td>
                  </tr>
                ) : (
                  allEmployees.map((emp) => {
                    return (
                      <tr
                        key={emp.employee_id}
                        className="border-b border-slate-100 hover:bg-slate-50 text-sm"
                      >
                        <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                          {`${emp.first_name} ${emp.last_name}`}
                        </td>

                        <td className="p-4 text-slate-600">{emp.position}</td>

                        <td className="p-4 text-right text-slate-600">
                          {formatCurrency(
                            emp.daily_rate || emp.hourly_rate * 8
                          )}
                        </td>

                        {/* FIX: Replace undefined variable with placeholder */}

                        <td className="p-4 text-right font-medium text-rose-600">
                          {formatCurrency(emp.loan_amount)}
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium 
                            ${
                              getDtrEmp(emp.employee_id)
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {getDtrEmp(emp.employee_id)
                              ? "Ready "
                              : "Not Ready "}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            // --- Calculated Payroll Results Table ---
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4 text-right">Gross Pay</th>
                  {/* ADDING TOTAL HOURS WORKED HEADER BACK FOR CALCULATED VIEW */}
                  <th className="p-4 text-right">Total Hours Worked</th>
                  <th className="p-4 text-right">SSS/PH/PAGIBIG</th>
                  <th className="p-4 text-right">BIR Tax</th>
                  <th className="p-4 text-right">Loan Deduction</th>
                  <th className="p-4 text-right">NET PAY</th>
                </tr>
              </thead>

              <tbody>
                {safePayrollResults.map((data) => {
                  const employeeName =
                    employeeMap.get(data.employee_id) || "Unknown Employee";

                  const totalContributions =
                    data.sssDeduction +
                    data.philHealthDeduction +
                    data.pagIbigDeduction;

                  // CALCULATION: Sum up all hour types (Regular + OT + NSD)
                  const totalHoursWorked =
                    data.regular_hours + data.overtime_hours + data.nsd_hours;

                  return (
                    <tr
                      key={data.employee_id}
                      className="border-b border-slate-100 hover:bg-slate-50 text-sm"
                    >
                      <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                        {employeeName}
                      </td>

                      <td className="p-4 text-right font-medium text-slate-700">
                        {formatCurrency(data.gross_pay)}
                      </td>
                      {/* ADDING THE TOTAL HOURS WORKED DATA HERE */}
                      <td className="p-4 text-right text-slate-600">
                        {totalHoursWorked.toFixed(1)}
                      </td>

                      <td className="p-4 text-right text-rose-600">
                        ({formatCurrency(totalContributions)})
                      </td>

                      <td className="p-4 text-right text-rose-600">
                        ({formatCurrency(data.birTax)})
                      </td>

                      <td className="p-4 text-right text-rose-600">
                        ({formatCurrency(data.loanDeduction)})
                      </td>

                      <td className="p-4 text-right font-bold text-md text-emerald-600 whitespace-nowrap">
                        {formatCurrency(data.net_pay)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateAllPayslip;
