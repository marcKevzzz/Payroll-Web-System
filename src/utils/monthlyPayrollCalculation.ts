// Functional payroll calculation utilities

import {
  Employee,
  DTREntry,
  PayrollResult,
  HolidayBreakdown,
} from "../types/types";
import {
  calculateHours,
  OT_MULTIPLIER,
  getHolidayMultiplier,
  getHolidayName,
  getHolidayData,
  getMinHourlyWage,
  calculateSSS,
  calculateSSSEC,
  calculatePagIBIG,
  calculatePhilHealth,
  calculateBIR,
} from "./utils";

export interface MonthlyCalculation {
  result: PayrollResult | null;
  hasRecords: boolean;
  loanInfo?: { balanceAfter: number };
  holidayDetails?: HolidayBreakdown | null;
}

interface ProcessedDTR {
  regularHours: number;
  overtimeHours: number;
  regularHolidayHours: number;
  specialHolidayHours: number;
  regularPay: number;
  overtimePay: number;
  regularHolidayPay: number;
  specialHolidayPay: number;
  lastWorkDate: string;
}

const processDTR = (
  entries: DTREntry[],
  hourlyRate: number,
  requiredHours = 8
): ProcessedDTR => {
  return entries.reduce(
    (acc, d) => {
      const hours = calculateHours(d.time_in as string, d.time_out as string);
      const mult = getHolidayMultiplier(d.work_date as string);

      const dailyOT = Math.max(0, hours - requiredHours);
      const dailyRegular = hours - dailyOT;

      acc.overtimeHours += dailyOT;
      acc.overtimePay += dailyOT * hourlyRate * OT_MULTIPLIER;

      if (mult === 1) {
        acc.regularHours += dailyRegular;
        acc.regularPay += dailyRegular * hourlyRate;
      } else if (mult === 2) {
        acc.regularHolidayHours += dailyRegular;
        acc.regularHolidayPay += dailyRegular * hourlyRate * mult;
      } else if (mult === 1.3) {
        acc.specialHolidayHours += dailyRegular;
        acc.specialHolidayPay += dailyRegular * hourlyRate * mult;
      }

      acc.lastWorkDate = d.work_date as string;
      return acc;
    },
    {
      regularHours: 0,
      overtimeHours: 0,
      regularHolidayHours: 0,
      specialHolidayHours: 0,
      regularPay: 0,
      overtimePay: 0,
      regularHolidayPay: 0,
      specialHolidayPay: 0,
      lastWorkDate: "",
    }
  );
};

export const monthlyPayrollCalculation = (
  employeeId: string,
  month: string,
  employees: Employee[],
  dtrEntries: DTREntry[]
): MonthlyCalculation => {
  const employee = employees.find((e) => e.employee_id === employeeId);
  if (!employee) return { result: null, hasRecords: false };

  const empDTR = dtrEntries.filter(
    (d) => d.employee_id === employeeId && d.work_date.startsWith(month)
  );
  if (empDTR.length === 0) return { result: null, hasRecords: false };

  const hourlyRate = Math.max(employee.hourly_rate, getMinHourlyWage());

  const processed = processDTR(empDTR, hourlyRate);

  const grossPay =
    processed.regularPay +
    processed.overtimePay +
    processed.regularHolidayPay +
    processed.specialHolidayPay;

  const sss = calculateSSS(grossPay);
  const sssEC = calculateSSSEC(grossPay);
  const pagibig = calculatePagIBIG(grossPay);
  const philhealth = calculatePhilHealth(grossPay);

  const taxableIncome = grossPay - sss - philhealth.employee - pagibig.employee;

  const bir = calculateBIR(taxableIncome);

  const totalDeductionBase = sss + philhealth.employee + pagibig.employee + bir;

  const netBeforeLoan = grossPay - totalDeductionBase;

  const loanDeduction = employee.loan_amount
    ? Math.min(employee.loan_amount, netBeforeLoan * 0.25)
    : 0;

  const netPay = netBeforeLoan - loanDeduction;

  return {
    result: {
      employee_id: employee.employee_id,
      pay_period_start: `${month}-01`,
      pay_period_end: `${month}-31`,

      regular_hours: processed.regularHours,
      overtime_hours: processed.overtimeHours,

      gross_pay: grossPay,
      net_pay: netPay,

      sssDeduction: sss,
      philHealthDeduction: philhealth.employee,
      pagIbigDeduction: pagibig.employee,
      birTax: bir,
      loanDeduction,
      // total_deduction: netBeforeLoan - loanDeduction,

      holidayBreakdowns: [
        {
          date: processed.lastWorkDate,
          name: getHolidayName(processed.lastWorkDate),
          type: getHolidayData(processed.lastWorkDate)?.type || "Regular",
          hours: processed.regularHolidayHours + processed.specialHolidayHours,
          pay: processed.regularHolidayPay + processed.specialHolidayPay,
        },
      ],
    },

    hasRecords: true,

    loanInfo: {
      balanceAfter: employee.loan_amount
        ? employee.loan_amount - loanDeduction
        : 0,
    },
  };
};

export const allEmployeesMonthlyPayroll = (
  month: string,
  employees: Employee[],
  dtrEntries: DTREntry[]
): PayrollResult[] => {
  const results: PayrollResult[] = [];

  employees.forEach((emp) => {
    const calc = monthlyPayrollCalculation(
      emp.employee_id,
      month,
      employees,
      dtrEntries
    );

    if (calc.hasRecords && calc.result) {
      results.push(calc.result);
    }
  });

  return results;
};
