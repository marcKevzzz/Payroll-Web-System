import React, { useState, useMemo } from "react";
import { Employee, DTREntry } from "../../types/types";

import PayslipHeader from "../Payroll/EmployeePayslipPreview/PayrollComponents/PayslipHeader";
import EmployeeDetails from "../Payroll/EmployeePayslipPreview/PayrollComponents/EmployeeDetails";
import EarningsTable from "../Payroll/EmployeePayslipPreview/PayrollComponents/EarningsTable";
import DeductionsTable from "../Payroll/EmployeePayslipPreview/PayrollComponents/DeductionsTable";
import NetPaySummary from "../Payroll/EmployeePayslipPreview/PayrollComponents/NetPaySummary";
import NotesSection from "../Payroll/EmployeePayslipPreview/PayrollComponents/NotesSection";

import { monthlyPayrollCalculation } from "../../utils/monthlyPayrollCalculation";

export const PayslipView = ({
  employee,
  dtrEntries,
}: {
  employee: Employee;
  dtrEntries: DTREntry[];
}) => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  if (!employee) {
    return (
      <div className="mt-6 p-8 bg-white rounded-xl shadow-sm text-xs border border-slate-200 text-center text-slate-500">
        Loading employee info...
      </div>
    );
  }

  const monthlyCalculation = useMemo(
    () =>
      monthlyPayrollCalculation(
        employee.employee_id,
        month,
        [employee],
        dtrEntries
      ),
    [employee.employee_id, month, employee, dtrEntries]
  );

  const result = monthlyCalculation.result;

  console.log("Employee:", employee);
  console.log(
    "DTR Entries for employee:",
    dtrEntries.filter((d) => d.employee_id === employee.employee_id)
  );

  return (
    <div className="animate-fadeIn">
      {monthlyCalculation.hasRecords ? (
        <>
          <div>
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

          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-4">
              <PayslipHeader employee={employee} month={month} />
              <EmployeeDetails employee={employee} />

              <div className="p-8 grid md:grid-cols-2 gap-12">
                <EarningsTable
                  employeeRate={employee.hourly_rate}
                  result={result}
                />
                <DeductionsTable
                  result={result}
                  loanBalanceAfter={monthlyCalculation.loanInfo?.balanceAfter}
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
  );
};
