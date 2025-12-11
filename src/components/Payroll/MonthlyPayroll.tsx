import React, { useState, useMemo } from "react";
import { Employee, DTREntry } from "../../types/types";
import EmployeeSelector from "./PayrollComponents/EmployeeSelector";
import PayslipHeader from "./PayrollComponents/PayslipHeader";
import EmployeeDetails from "./PayrollComponents/EmployeeDetails";
import EarningsTable from "./PayrollComponents/EarningsTable";
import DeductionsTable from "./PayrollComponents/DeductionsTable";
import NetPaySummary from "./PayrollComponents/NetPaySummary";
import NotesSection from "./PayrollComponents/NotesSection";
import {
  monthlyPayrollCalculation,
  allEmployeesMonthlyPayroll,
} from "../../utils/monthlyPayrollCalculation"; // Move your useMemo logic here
import * as PayrollService from "../../services/payroll";
import { useToast } from "@/src/context/ToastContext";
import { useConfirm } from "@/src/context/ConfirmContext";

export const MonthlyPayroll = ({
  employees,
  dtrEntries,
}: {
  employees: Employee[];
  dtrEntries: DTREntry[];
}) => {
  const [selectedEmp, setSelectedEmp] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const monthlyCalculation = useMemo(
    () => monthlyPayrollCalculation(selectedEmp, month, employees, dtrEntries),
    [selectedEmp, month, employees, dtrEntries]
  );

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

  const result = monthlyCalculation.result;

  const generateAllPayslips = async () => {
    const allResults = allEmployeesMonthlyPayroll(month, employees, dtrEntries);
    try {
      const data = await PayrollService.generateAllPayslips(allResults);
      showToast("success", "Payslips generate successfully.");
    } catch (error) {
      console.log(error);
      showToast("error", "Failed to generate payslips.");
    }
  };

  const handleClick = () => {
    showConfirm({
      message: "Are you sure you want to generate all payslips?",
      type: "warning",
      onConfirm: () => generateAllPayslips(),
    });
  };

  return (
    <div className="animate-fadeIn">
      <EmployeeSelector
        employees={employees || []}
        selectedEmp={selectedEmp}
        setSelectedEmp={setSelectedEmp}
        month={month || ""}
        setMonth={setMonth}
        onClick={handleClick}
      />
      {monthlyCalculation.hasRecords && monthlyCalculation.result ? (
        <>
          <div className="mt-6  bg-white rounded-xl shadow-sm border border-slate-200">
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
                  employee={selectedEmp}
                />
              </div>
            </div>
            {/* <EmployerContributions result={result} /> */}
            <NetPaySummary netPay={result.net_pay} />
          </div>

          <NotesSection />
        </>
      ) : (
        <div className="mt-6 p-8 bg-white rounded-xl shadow-sm text-xs border border-slate-200 text-center text-slate-500">
          No DTR Records Found for {selectedEmployeeData?.employee_id}.
        </div>
      )}
    </div>
  );
};
