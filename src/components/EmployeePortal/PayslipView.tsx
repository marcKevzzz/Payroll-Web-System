import React, { useState, useRef, useEffect } from "react";

import {
  Employee,
  DTREntry,
  LeaveRequest,
  PayrollResult,
} from "../../types/types";
import { MonthlyCalculation } from "../../utils/monthlyPayrollCalculation";
import { Printer } from "lucide-react";

import PayslipHeader from "../Payroll/EmployeePayslipPreview/PayrollComponents/PayslipHeader";
import EmployeeDetails from "../Payroll/EmployeePayslipPreview/PayrollComponents/EmployeeDetails";
import EarningsTable from "../Payroll/EmployeePayslipPreview/PayrollComponents/EarningsTable";
import DeductionsTable from "../Payroll/EmployeePayslipPreview/PayrollComponents/DeductionsTable";
import NetPaySummary from "../Payroll/EmployeePayslipPreview/PayrollComponents/NetPaySummary";
import NotesSection from "../Payroll/EmployeePayslipPreview/PayrollComponents/NotesSection";
import { calculateSingleEmployeeMonthlyPayroll } from "../../utils/monthlyPayrollCalculation";
import { downloadAndOpenPdf } from "@/src/utils/pdfGenerator";
import { useToast } from "@/src/context/ToastContext";

export const PayslipView = ({
  employee,
  dtrEntries,
  leaveRequests,
}: {
  employee: Employee | null;
  dtrEntries: DTREntry[];
  leaveRequests: LeaveRequest[];
}) => {
  const [month, setMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const payslipRef = useRef(null);
  const { showToast } = useToast();

  const [monthlyCalculation, setMonthlyCalculation] =
    useState<MonthlyCalculation>({
      result: null,
      hasRecords: false,
    });

  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!employee) {
    return (
      <div className="mt-6 p-8 bg-white rounded-xl shadow-sm text-xs border border-slate-200 text-center text-slate-500">
        Loading employee info...{" "}
      </div>
    );
  }

  useEffect(() => {
    if (!employee || !month) return;

    const fetchPayroll = async () => {
      setIsLoading(true);
      try {
        const result = await calculateSingleEmployeeMonthlyPayroll(
          employee,
          month,
          dtrEntries,
          leaveRequests
        );

        setMonthlyCalculation(result);
      } catch (error) {
        console.error("Payroll calculation failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayroll();
  }, [employee.employee_id, month, dtrEntries, leaveRequests, employee]); // Dependency array

  // ...

  const handleDownload = async () => {
    // Check if result is available before proceeding and prevent double-click
    if (
      !payslipRef.current ||
      !monthlyCalculation.result ||
      !employee ||
      downloading
    )
      return;

    setDownloading(true);
    const filename = `Payslip-${employee.employee_id}-${month}.pdf`;
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
  // FIX 8: Use destructuring from the state
  const { result, hasRecords, loanInfo } = monthlyCalculation;

  if (isLoading) {
    return (
      <div className="mt-6 p-8 bg-white rounded-xl shadow-sm text-center text-indigo-600">
        Calculating Payslip for {month}...
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="  mx-auto">
        <div className="flex justify-between items-end">
          <div className=" max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Payroll Period
            </label>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>
          {hasRecords && (
            <button
              onClick={handleDownload}
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Printer className="w-4 h-4" /> Print Report
            </button>
          )}
        </div>

        {hasRecords && result ? (
          <>
            <div
              ref={payslipRef}
              className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 mx-auto"
            >
              <div className="px-2 sm:px-4">
                <PayslipHeader employee={employee} month={month} />

                <EmployeeDetails employee={employee} />

                <div className="p-4 md:p-8 grid md:grid-cols-2 gap-12">
                  <EarningsTable
                    employeeRate={employee.hourly_rate}
                    result={result}
                  />

                  <DeductionsTable
                    result={result}
                    loanBalanceAfter={loanInfo?.balanceAfter}
                    employee={employee.employee_id}
                  />
                </div>
              </div>

              <NetPaySummary netPay={result.net_pay} />
            </div>

            <NotesSection />
          </>
        ) : (
          <div className="mt-6 p-8 bg-white rounded-xl shadow-sm text-xs border border-slate-200 text-center text-slate-500">
            No DTR Records Found for {employee.employee_id}.
          </div>
        )}
      </div>
    </div>
  );
};

export default PayslipView;
