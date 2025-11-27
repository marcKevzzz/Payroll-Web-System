import React, { useState, useMemo } from "react";
import {
  Calculator,
  AlertCircle,
  Printer,
  ShieldAlert,
  CalendarRange,
  Table,
  FileX,
} from "lucide-react";
import { Employee, DTREntry, PayrollResult } from "./types";
import {
  calculateHours,
  calculateSSS,
  calculateSSSEC,
  calculateBIR,
  formatCurrency,
  OT_MULTIPLIER,
  getHolidayMultiplier,
  getHolidayName,
} from "./utils";

interface PayrollCalculatorProps {
  employees: Employee[];
  dtrEntries: DTREntry[];
}

export const PayrollCalculator = ({
  employees,
  dtrEntries,
}: PayrollCalculatorProps) => {
  const [mode, setMode] = useState<"monthly" | "annual">("monthly");
  const [selectedEmp, setSelectedEmp] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // --- CORE CALCULATION LOGIC (Reusable) ---
  const calculateMonthData = (
    emp: Employee,
    monthStr: string,
    allDtrs: DTREntry[]
  ) => {
    // Filter DTRs for this specific month
    const relevantDTRs = allDtrs.filter(
      (d) => d.employeeId === emp.id && d.date.startsWith(monthStr)
    );

    if (relevantDTRs.length === 0) {
      return { hasRecords: false, data: null };
    }

    let totalRegularHours = 0;
    let regularPay = 0;
    let regularHolidayHours = 0;
    let regularHolidayPay = 0;
    let specialHolidayHours = 0;
    let specialHolidayPay = 0;
    let totalOTHours = 0;
    let overtimePay = 0;

    relevantDTRs.forEach((d) => {
      const hours = calculateHours(d.timeIn, d.timeOut);
      const regular = Math.min(8, hours);
      const ot = Math.max(0, hours - 8);
      const multiplier = getHolidayMultiplier(d.date);

      if (multiplier === 2.0) {
        regularHolidayHours += regular;
        regularHolidayPay += regular * emp.hourlyRate * multiplier;
      } else if (multiplier === 1.3) {
        specialHolidayHours += regular;
        specialHolidayPay += regular * emp.hourlyRate * multiplier;
      } else {
        totalRegularHours += regular;
        regularPay += regular * emp.hourlyRate;
      }

      const dailyOTPay = ot * emp.hourlyRate * OT_MULTIPLIER * multiplier;
      overtimePay += dailyOTPay;
      totalOTHours += ot;
    });

    const grossPay =
      regularPay + regularHolidayPay + specialHolidayPay + overtimePay;
    const sssDeduction = calculateSSS(grossPay);
    const sssEC = calculateSSSEC(grossPay);
    const taxableIncome = Math.max(0, grossPay - sssDeduction);
    const birTax = calculateBIR(taxableIncome);
    const netBeforeLoan = grossPay - (sssDeduction + birTax);

    // Strict 25% Logic
    const loanDeductionAmount = netBeforeLoan * 0.25;

    return {
      hasRecords: true,
      data: {
        regularHours: totalRegularHours,
        overtimeHours: totalOTHours,
        regularPay,
        overtimePay,
        regularHolidayHours,
        regularHolidayPay,
        specialHolidayHours,
        specialHolidayPay,
        grossPay,
        sssDeduction,
        sssEC,
        birTax,
        netBeforeLoan,
        loanDeductionAmount,
      },
    };
  };

  // --- MONTHLY CALCULATION ENGINE WITH LOAN BALANCE TRACKING ---
  const monthlyCalculation = useMemo(() => {
    if (!selectedEmp && mode === "monthly")
      return { result: null, hasRecords: false, loanInfo: null };

    const emp = employees.find((e) => e.id === selectedEmp);
    if (!emp) return { result: null, hasRecords: false, loanInfo: null };

    const employeeDtrs = dtrEntries.filter((d) => d.employeeId === selectedEmp);
    const uniqueMonths = Array.from(
      new Set(employeeDtrs.map((d) => d.date.slice(0, 7)))
    );
    if (!uniqueMonths.includes(month)) uniqueMonths.push(month);
    uniqueMonths.sort();

    // Initial Balance
    let currentLoanBalance = emp.totalLoan || 0;

    let targetMonthData = null;
    let targetLoanDeduction = 0;

    // Iterate chronologically
    for (const m of uniqueMonths) {
      const calc = calculateMonthData(emp, m, employeeDtrs);

      if (calc.hasRecords && calc.data) {
        // Logic: Strictly 25% of Net Pay (unless balance is lower)
        const deduction = Math.min(
          calc.data.loanDeductionAmount,
          currentLoanBalance
        );

        if (m === month) {
          targetMonthData = calc.data;
          targetLoanDeduction = deduction;
        } else {
          currentLoanBalance = Math.max(0, currentLoanBalance - deduction);
        }
      } else if (m === month) {
        return { result: null, hasRecords: false, loanInfo: null };
      }
    }

    if (!targetMonthData)
      return { result: null, hasRecords: false, loanInfo: null };

    const totalDeduction =
      targetMonthData.sssDeduction +
      targetMonthData.birTax +
      targetLoanDeduction;
    const netPay = targetMonthData.grossPay - totalDeduction;

    return {
      hasRecords: true,
      loanInfo: {
        totalLoan: emp.totalLoan || 0,
        balanceBefore: currentLoanBalance,
        payment: targetLoanDeduction,
        balanceAfter: Math.max(0, currentLoanBalance - targetLoanDeduction),
      },
      result: {
        ...targetMonthData,
        loanDeduction: targetLoanDeduction,
        totalDeduction,
        netPay,
      },
    };
  }, [selectedEmp, month, dtrEntries, employees, mode]);

  // --- ANNUAL CALCULATION ENGINE ---
  const annualData = useMemo(() => {
    if (mode !== "annual") return [];

    return employees.map((emp) => {
      const yearlyDTRs = dtrEntries.filter(
        (d) => d.employeeId === emp.id && d.date.startsWith(year)
      );

      // Re-run timeline logic to get accurate loan payments for the specific year
      const allDTRs = dtrEntries.filter((d) => d.employeeId === emp.id);
      const allMonths = Array.from(
        new Set(allDTRs.map((d) => d.date.slice(0, 7)))
      ).sort();

      let runningLoanBalance = emp.totalLoan || 0;
      let annualGross = 0;
      let annualSSS = 0;
      let annualBIR = 0;
      let annualLoanPaid = 0;

      allMonths.forEach((m) => {
        const calc = calculateMonthData(emp, m, allDTRs);
        if (calc.hasRecords && calc.data) {
          const deduction = Math.min(
            calc.data.loanDeductionAmount,
            runningLoanBalance
          );
          runningLoanBalance = Math.max(0, runningLoanBalance - deduction);

          // Only accumulate for the selected year report
          if (m.startsWith(year)) {
            annualGross += calc.data.grossPay;
            annualSSS += calc.data.sssDeduction;
            annualBIR += calc.data.birTax;
            annualLoanPaid += deduction;
          }
        }
      });

      return {
        ...emp,
        gross: annualGross,
        sss: annualSSS,
        bir: annualBIR,
        loan: annualLoanPaid,
        net: annualGross - (annualSSS + annualBIR + annualLoanPaid),
      };
    });
  }, [employees, dtrEntries, year, mode]);

  const selectedEmployeeData = employees.find((e) => e.id === selectedEmp);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="w-6 h-6" /> Payroll Computation
        </h2>

        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setMode("monthly")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === "monthly"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Monthly Payslip
          </button>
          <button
            onClick={() => setMode("annual")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === "annual"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Annual Report
          </button>
        </div>
      </div>

      {mode === "monthly" && (
        <>
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

          {!selectedEmp ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
              Please select an employee and period to generate a payslip.
            </div>
          ) : !monthlyCalculation.hasRecords || !monthlyCalculation.result ? (
            <div className="flex flex-col items-center justify-center py-12 bg-rose-50 rounded-lg border border-dashed border-rose-200 text-rose-600">
              <FileX className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">No DTR Records Found</p>
              <p className="text-sm text-rose-400 mt-1">
                There are no time logs for {selectedEmployeeData?.name} in{" "}
                {month}.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
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
                        {selectedEmployeeData?.name}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Employee ID
                      </span>
                      <span className="block font-mono text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded inline-block">
                        {selectedEmployeeData?.id}
                      </span>
                    </div>
                    <div className="text-right md:text-left">
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Hourly Rate
                      </span>
                      <span className="block font-mono text-slate-700">
                        {formatCurrency(selectedEmployeeData?.hourlyRate || 0)}
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
                            <th className="pb-2 font-medium text-right">
                              Rate
                            </th>
                            <th className="pb-2 font-medium text-right">Hrs</th>
                            <th className="pb-2 font-medium text-right">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-700">
                          <tr className="border-b border-slate-100 last:border-0">
                            <td className="py-2">Regular Pay</td>
                            <td className="text-right font-mono text-slate-500 text-xs">
                              {formatCurrency(
                                selectedEmployeeData?.hourlyRate || 0
                              )}
                            </td>
                            <td className="text-right font-mono text-slate-500">
                              {monthlyCalculation.result.regularHours.toFixed(
                                2
                              )}
                            </td>
                            <td className="text-right font-medium">
                              {formatCurrency(
                                monthlyCalculation.result.regularPay
                              )}
                            </td>
                          </tr>
                          {monthlyCalculation.result.regularHolidayPay > 0 && (
                            <tr className="border-b border-slate-100 last:border-0 bg-blue-50/50">
                              <td className="py-2 pl-2">
                                Regular Holiday{" "}
                                <span className="block text-[10px] text-blue-600 font-medium">
                                  Double Pay
                                </span>
                              </td>
                              <td className="text-right font-mono text-slate-500 text-xs">
                                {formatCurrency(
                                  (selectedEmployeeData?.hourlyRate || 0) * 2
                                )}
                              </td>
                              <td className="text-right font-mono text-slate-500">
                                {monthlyCalculation.result.regularHolidayHours.toFixed(
                                  2
                                )}
                              </td>
                              <td className="text-right font-medium text-blue-700">
                                {formatCurrency(
                                  monthlyCalculation.result.regularHolidayPay
                                )}
                              </td>
                            </tr>
                          )}
                          {monthlyCalculation.result.specialHolidayPay > 0 && (
                            <tr className="border-b border-slate-100 last:border-0 bg-yellow-50/50">
                              <td className="py-2 pl-2">
                                Special Holiday{" "}
                                <span className="block text-[10px] text-amber-600 font-medium">
                                  130% Pay
                                </span>
                              </td>
                              <td className="text-right font-mono text-slate-500 text-xs">
                                {formatCurrency(
                                  (selectedEmployeeData?.hourlyRate || 0) * 1.3
                                )}
                              </td>
                              <td className="text-right font-mono text-slate-500">
                                {monthlyCalculation.result.specialHolidayHours.toFixed(
                                  2
                                )}
                              </td>
                              <td className="text-right font-medium text-amber-700">
                                {formatCurrency(
                                  monthlyCalculation.result.specialHolidayPay
                                )}
                              </td>
                            </tr>
                          )}
                          <tr className="border-b border-slate-100 last:border-0">
                            <td className="py-2">
                              Overtime{" "}
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded ml-2">
                                x{OT_MULTIPLIER}
                              </span>
                            </td>
                            <td className="text-right font-mono text-slate-500 text-xs">
                              -
                            </td>
                            <td className="text-right font-mono text-slate-500">
                              {monthlyCalculation.result.overtimeHours.toFixed(
                                2
                              )}
                            </td>
                            <td className="text-right font-medium">
                              {formatCurrency(
                                monthlyCalculation.result.overtimePay
                              )}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td
                              className="pt-4 font-bold text-slate-800"
                              colSpan={3}
                            >
                              Gross Pay
                            </td>
                            <td className="pt-4 text-right font-bold text-emerald-600 text-lg">
                              {formatCurrency(
                                monthlyCalculation.result.grossPay
                              )}
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
                            <th className="pb-2 font-medium text-right">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-700">
                          <tr className="border-b border-slate-100 last:border-0">
                            <td className="py-2">SSS Contribution</td>
                            <td className="text-right font-medium text-rose-600">
                              (
                              {formatCurrency(
                                monthlyCalculation.result.sssDeduction
                              )}
                              )
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 last:border-0">
                            <td className="py-2">Withholding Tax (BIR)</td>
                            <td className="text-right font-medium text-rose-600">
                              (
                              {formatCurrency(monthlyCalculation.result.birTax)}
                              )
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 last:border-0">
                            <td className="py-2 align-top">
                              Loan Repayment
                              <div className="mt-1 space-y-0.5">
                                <div className="text-[10px] text-slate-400">
                                  Balance:{" "}
                                  {formatCurrency(
                                    monthlyCalculation.loanInfo
                                      ?.balanceBefore || 0
                                  )}
                                </div>
                                <div className="text-[10px] text-amber-600 font-medium">
                                  Fixed @ 25% Net
                                </div>
                              </div>
                            </td>
                            <td className="text-right font-medium text-rose-600 align-top">
                              (
                              {formatCurrency(
                                monthlyCalculation.result.loanDeduction
                              )}
                              )
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="pt-4 font-bold text-slate-800">
                              Total Deductions
                            </td>
                            <td className="pt-4 text-right font-bold text-rose-600">
                              (
                              {formatCurrency(
                                monthlyCalculation.result.totalDeduction
                              )}
                              )
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-dashed border-slate-300">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Employer Contributions (Not Deducted)
                    </h4>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>SSS Employees Compensation (EC)</span>
                      <span className="font-mono">
                        {formatCurrency(monthlyCalculation.result.sssEC)}
                      </span>
                    </div>
                  </div>
                </div>

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
                      {formatCurrency(monthlyCalculation.result.netPay)}
                    </span>
                    <span className="block text-xs text-emerald-400 font-medium uppercase mt-1">
                      Total Net Income
                    </span>
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

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Tax Note:</strong> BIR tax is calculated using TRAIN
                    Law Monthly Tables. Holiday pay is taxable.
                  </div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm text-amber-800 flex gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Loan Policy:</strong> Loan deduction is strictly 25%
                    of Net Pay until the total loan balance is fully paid.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {mode === "annual" && (
        <div className="animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fiscal Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-indigo-500" /> Annual
                Payroll Summary ({year})
              </h3>
              <button
                onClick={() => window.print()}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Printer className="w-4 h-4" /> Print Report
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4 text-right">Total Gross</th>
                  <th className="p-4 text-right">Total SSS</th>
                  <th className="p-4 text-right">Total Tax</th>
                  <th className="p-4 text-right">Total Loan Paid</th>
                  <th className="p-4 text-right">Total Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {annualData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  annualData.map((data) => (
                    <tr
                      key={data.id}
                      className="border-b border-slate-100 hover:bg-slate-50 text-sm"
                    >
                      <td className="p-4 font-bold text-slate-700">
                        {data.name}
                      </td>
                      <td className="p-4 text-right font-medium text-slate-600">
                        {formatCurrency(data.gross)}
                      </td>
                      <td className="p-4 text-right text-rose-600">
                        ({formatCurrency(data.sss)})
                      </td>
                      <td className="p-4 text-right text-rose-600">
                        ({formatCurrency(data.bir)})
                      </td>
                      <td className="p-4 text-right text-rose-600">
                        ({formatCurrency(data.loan)})
                      </td>
                      <td className="p-4 text-right font-bold text-emerald-600">
                        {formatCurrency(data.net)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
