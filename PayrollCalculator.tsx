import React, { useState, useMemo } from "react";
import { Calculator, AlertCircle, Printer } from "lucide-react";
import { Employee, DTREntry, PayrollResult } from "./types";
import {
  calculateHours,
  calculateSSS,
  calculateBIR,
  formatCurrency,
  OT_MULTIPLIER,
} from "./utils";

interface PayrollCalculatorProps {
  employees: Employee[];
  dtrEntries: DTREntry[];
}

export const PayrollCalculator = ({
  employees,
  dtrEntries,
}: PayrollCalculatorProps) => {
  const [selectedEmp, setSelectedEmp] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const calculation: PayrollResult | null = useMemo(() => {
    if (!selectedEmp) return null;

    const emp = employees.find((e) => e.id === selectedEmp);
    if (!emp) return null;

    // Filter DTRs for this employee and selected month
    const relevantDTRs = dtrEntries.filter(
      (d) => d.employeeId === selectedEmp && d.date.startsWith(month)
    );

    let totalRegularHours = 0;
    let totalOTHours = 0;

    relevantDTRs.forEach((d) => {
      const hours = calculateHours(d.timeIn, d.timeOut);
      const regular = Math.min(8, hours);
      const ot = Math.max(0, hours - 8);
      totalRegularHours += regular;
      totalOTHours += ot;
    });

    const regularPay = totalRegularHours * emp.hourlyRate;
    const overtimePay = totalOTHours * emp.hourlyRate * OT_MULTIPLIER;
    const grossPay = regularPay + overtimePay;

    // Deductions
    const sssDeduction = calculateSSS(grossPay);
    const loanDeduction = emp.loanDeduction || 0;

    // Taxable Income = Gross - (SSS + PhilHealth + PagIbig). We only have SSS here per requirements.
    const taxableIncome = Math.max(0, grossPay - sssDeduction);
    const birTax = calculateBIR(taxableIncome);

    const totalDeduction = sssDeduction + birTax + loanDeduction;
    const netPay = grossPay - totalDeduction;

    return {
      regularHours: totalRegularHours,
      overtimeHours: totalOTHours,
      regularPay,
      overtimePay,
      grossPay,
      sssDeduction,
      birTax,
      loanDeduction,
      totalDeduction,
      netPay,
    };
  }, [selectedEmp, month, dtrEntries, employees]);

  const selectedEmployeeData = employees.find((e) => e.id === selectedEmp);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Calculator className="w-6 h-6" /> Payroll Computation
      </h2>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
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
        </div>
      </div>

      {/* Payslip Display */}
      {!calculation || !selectedEmployeeData ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
          Select an employee and period to generate payslip.
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* Realistic Paper Payslip */}
          <div className="bg-white border-t-4 border-t-indigo-600 shadow-xl rounded-sm overflow-hidden text-slate-800 print:shadow-none print:border-slate-300">
            {/* Header */}
            <div className="p-8 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-extrabold uppercase tracking-widest text-indigo-900">
                  Payslip
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  PAYROLL PRO SYSTEM INC.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Pay Period
                </p>
                <p className="font-mono font-bold text-lg text-slate-700">
                  {month}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Generated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="bg-slate-50 p-6 border-b border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                <div className="col-span-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Employee Name
                  </span>
                  <span className="block font-bold text-lg text-slate-800">
                    {selectedEmployeeData.name}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Employee ID
                  </span>
                  <span className="block font-mono text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded inline-block">
                    {selectedEmployeeData.id}
                  </span>
                </div>
                <div className="text-right md:text-left">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Hourly Rate
                  </span>
                  <span className="block font-mono text-slate-700">
                    {formatCurrency(selectedEmployeeData.hourlyRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Tables */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Earnings */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-800 pb-2 mb-4">
                    Earnings
                  </h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs text-left">
                        <th className="pb-2 font-medium">Description</th>
                        <th className="pb-2 font-medium text-right">Hrs</th>
                        <th className="pb-2 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-2">Regular Pay</td>
                        <td className="text-right font-mono text-slate-500">
                          {calculation.regularHours.toFixed(2)}
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(calculation.regularPay)}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-2">
                          Overtime
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded ml-2">
                            x{OT_MULTIPLIER}
                          </span>
                        </td>
                        <td className="text-right font-mono text-slate-500">
                          {calculation.overtimeHours.toFixed(2)}
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(calculation.overtimePay)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="pt-4 font-bold text-slate-800">
                          Gross Pay
                        </td>
                        <td></td>
                        <td className="pt-4 text-right font-bold text-emerald-600 text-lg">
                          {formatCurrency(calculation.grossPay)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-800 pb-2 mb-4">
                    Deductions
                  </h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs text-left">
                        <th className="pb-2 font-medium">Description</th>
                        <th className="pb-2 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-2">SSS Contribution</td>
                        <td className="text-right font-medium text-rose-600">
                          ({formatCurrency(calculation.sssDeduction)})
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-2">Withholding Tax (BIR)</td>
                        <td className="text-right font-medium text-rose-600">
                          ({formatCurrency(calculation.birTax)})
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-2">Loan Repayment</td>
                        <td className="text-right font-medium text-rose-600">
                          ({formatCurrency(calculation.loanDeduction)})
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="pt-4 font-bold text-slate-800">
                          Total Deductions
                        </td>
                        <td className="pt-4 text-right font-bold text-rose-600">
                          ({formatCurrency(calculation.totalDeduction)})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer / Net Pay */}
            <div className="bg-slate-900 text-white p-8 flex flex-col md:flex-row justify-between items-center print:bg-slate-200 print:text-black">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Net Pay Calculation
                </p>
                <p className="text-xs text-slate-500">
                  Gross Pay - Total Deductions
                </p>
              </div>
              <div className="text-center md:text-right">
                <span className="block text-4xl font-extrabold tracking-tight">
                  {formatCurrency(calculation.netPay)}
                </span>
                <span className="block text-xs text-emerald-400 font-medium uppercase mt-1">
                  Total Net Income
                </span>
              </div>
            </div>

            {/* Signature Area */}
            <div className="p-8 bg-white border-t border-slate-200">
              <div className="flex justify-between items-end mt-4">
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-2"></div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Approved By
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-2"></div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Employee Signature
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium px-4 py-2 hover:bg-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Payslip
            </button>
          </div>
        </div>
      )}

      {calculation && (
        <div className="max-w-3xl mx-auto bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Tax Calculation Note:</strong> The BIR tax is calculated
            using the standard Monthly Tax Table (TRAIN Law) based on the
            accumulated gross pay for the selected period.
          </div>
        </div>
      )}
    </div>
  );
};
