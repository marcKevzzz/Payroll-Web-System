import React, { useState, useEffect, useRef } from "react";
import {
  Employee,
  DTREntry,
  LeaveRequest,
  PayrollResult,
} from "../../../types/types"; // Make sure MonthlyCalculation is exported from types/types
import EmployeeSelector from "./PayrollComponents/EmployeeSelector";
import PayslipHeader from "./PayrollComponents/PayslipHeader";
import EmployeeDetails from "./PayrollComponents/EmployeeDetails";
import EarningsTable from "./PayrollComponents/EarningsTable";
import DeductionsTable from "./PayrollComponents/DeductionsTable";
import NetPaySummary from "./PayrollComponents/NetPaySummary";
import NotesSection from "./PayrollComponents/NotesSection";
// Import the async calculation utility
import { monthlyPayrollCalculation } from "../../../utils/monthlyPayrollCalculation";
import * as PayrollService from "../../../services/payroll";
import { useToast } from "@/src/context/ToastContext";
import { useConfirm } from "@/src/context/ConfirmContext";
import { downloadAndOpenPdf } from "@/src/utils/pdfGenerator";

export const MonthlyPayroll = ({
  employees,
  dtrEntries,
  leaveRequests,
}: {
  employees: Employee[];
  dtrEntries: DTREntry[];
  leaveRequests: LeaveRequest[];
}) => {
  const [selectedEmp, setSelectedEmp] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { showToast } = useToast();
  const payslipRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // NEW STATE: To hold the result of the async calculation
  const [monthlyCalculation, setMonthlyCalculation] = useState<PayrollResult>({
    result: null,
    hasRecords: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // --- REPLACING useMemo with useEffect for async operation ---
  useEffect(() => {
    // Only calculate if an employee is selected
    if (!selectedEmp || !month) return;

    const fetchPayroll = async () => {
      setIsLoading(true);
      try {
        const result = await monthlyPayrollCalculation(
          selectedEmp,
          month,
          employees,
          dtrEntries,
          leaveRequests
        );
        setMonthlyCalculation(result);
      } catch (error) {
        console.error("Payroll calculation failed:", error);
        showToast("error", "Failed to calculate payroll.");
        setMonthlyCalculation({ result: null, hasRecords: false });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayroll();
  }, [selectedEmp, month, employees, dtrEntries, leaveRequests]); // Added leaveRequests to dependency array

  const handleDownload = async () => {
    // Check if result is available before proceeding and prevent double-click
    if (downloading || !monthlyCalculation.result) return;

    setDownloading(true);
    const filename = `Payslip-${selectedEmployeeData?.employee_id}-${month}.pdf`;
    // ^ Changed filename slightly for uniqueness/clarity

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

  const selectedEmployeeData = employees.find(
    (e) => e.employee_id === selectedEmp
  );

  if (!selectedEmp)
    return (
      <EmployeeSelector
        employees={employees}
        selectedEmp={selectedEmp}
        setSelectedEmp={setSelectedEmp}
        month={month}
        setMonth={setMonth}
      />
    );

  // Check for loading state before trying to access the result
  if (isLoading) {
    return (
      <div className="mt-6 p-8 bg-white rounded-xl shadow-sm text-center text-indigo-600">
        Calculating Payroll...
      </div>
    );
  }

  // Destructure the result safely
  const result = monthlyCalculation.result;

  return (
    <div className="animate-fadeIn">
      <EmployeeSelector
        employees={employees || []}
        selectedEmp={selectedEmp}
        setSelectedEmp={setSelectedEmp}
        month={month || ""}
        setMonth={setMonth}
      />
      {monthlyCalculation.hasRecords && result ? (
        <>
          <div
            ref={payslipRef}
            className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200"
          >
            <div className="px-4">
              <PayslipHeader employee={selectedEmployeeData!} month={month} />
              <EmployeeDetails employee={selectedEmployeeData!} />
              <div className="p-8 grid md:grid-cols-2 gap-12">
                <EarningsTable
                  employeeRate={selectedEmployeeData!.hourly_rate}
                  result={result}
                />
                <DeductionsTable
                  result={result}
                  loanBalanceAfter={monthlyCalculation.loanInfo?.balanceAfter}
                  employee={selectedEmployeeData!} // CHANGED: Pass the Employee object
                />
              </div>
            </div>
            <NetPaySummary netPay={result.net_pay} />
          </div>
          <NotesSection onClick={handleDownload} />
        </>
      ) : (
        <div className="mt-6 p-8 bg-white rounded-xl shadow-sm text-xs border border-slate-200 text-center text-slate-500">
          No DTR Records Found for {selectedEmployeeData?.employee_id}
          for {month}.
        </div>
      )}
    </div>
  );
};
