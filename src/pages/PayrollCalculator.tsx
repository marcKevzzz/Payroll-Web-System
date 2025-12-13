// src/pages/PayrollCalculator.tsx
import React, { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { MonthlyPayroll } from "../components/Payroll/EmployeePayslipPreview/MonthlyPayroll";
import { useEmployeeContext } from "../context/EmployeeContext";
import { useDTRContext } from "../context/DTRContext";
import GenerateAllPayslip from "../components/Payroll/GenerateAllEmployeesPayslip/GenerateAllPayslip";
import { useToast } from "../context/ToastContext";
import * as PayrollService from "../services/payroll";
import { useConfirm } from "../context/ConfirmContext";
import { allEmployeesMonthlyPayroll } from "../utils/monthlyPayrollCalculation";
import { PayrollResult } from "../types/types"; // Import only PayrollResult
import { useLeaveRequestContext } from "../context/LeaveRequestContext";

const getCurrentMonth = () => {
  const now = new Date();
  // Get the year (e.g., 2023)
  const year = now.getFullYear();
  // Get the month (0-indexed, so add 1) and pad with a leading zero if needed
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`; // Returns "YYYY-MM"
};

export const PayrollCalculator = () => {
  const [mode, setMode] = useState<"preview" | "generate">("preview");
  const { employees } = useEmployeeContext();
  const { DTREntries, fetchAllDTRLogs } = useDTRContext();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [month, setMonth] = useState(getCurrentMonth());

  // State holds the calculated payroll results
  const [payrollResults, setPayrollResults] = useState<PayrollResult[] | null>(
    null
  );
  const { leaveRequests } = useLeaveRequestContext();

  useEffect(() => {
    // Fetch DTR logs on mount
    fetchAllDTRLogs();
  }, [fetchAllDTRLogs]);

  const generateAllPayslips = async () => {
    if (!month) {
      showToast("error", "Please select a pay period month.");
      return;
    }

    try {
      // 1. Calculate payroll for all employees
      const calculatedPayroll = await allEmployeesMonthlyPayroll(
        month,
        employees, // Use all employees
        DTREntries,
        leaveRequests
      );

      // 2. Update state with the results for display in the table
      setPayrollResults(calculatedPayroll);

      if (calculatedPayroll.length === 0) {
        showToast(
          "warning",
          `No DTR records found for ${month}. Payslips not generated.`
        );
        return;
      }

      // 3. Send the calculated results to the service for saving/storage
      await PayrollService.generateAllPayslips(calculatedPayroll);

      showToast(
        "success",
        `Payslips for ${calculatedPayroll.length} employees generated successfully.`
      );
    } catch (error) {
      console.error("Payslip Generation Error:", error);
      showToast(
        "error",
        "Failed to generate payslips. Check console for details."
      );
    }
  };

  const handleClick = () => {
    if (!month) {
      showToast("error", "Please select a pay period month first.");
      return;
    }

    showConfirm({
      message: `Are you sure you want to calculate and generate all payslips for ${month}? This will overwrite existing payroll data for the month if it exists.`,
      type: "warning",
      onConfirm: generateAllPayslips, // Call the async function directly
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-indigo-600" /> Payroll Computation
        </h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setMode("preview")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              mode === "preview"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMode("generate")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              mode === "generate"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Generate
          </button>
        </div>
      </div>
      {mode === "preview" && (
        <MonthlyPayroll
          employees={employees}
          dtrEntries={DTREntries}
          leaveRequests={leaveRequests}
        />
      )}
      {mode === "generate" && (
        <GenerateAllPayslip
          setMonth={setMonth}
          month={month}
          // FIX: Pass the list of all employees and the calculated payroll results
          allEmployees={employees}
          payrollResults={payrollResults}
          onClick={handleClick}
          dtrEntry={DTREntries}
        />
      )}
    </div>
  );
};
