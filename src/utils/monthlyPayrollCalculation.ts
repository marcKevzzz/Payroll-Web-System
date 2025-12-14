// Functional payroll calculation utilities

import {
  Employee,
  DTREntry,
  PayrollResult,
  HolidayBreakdown,
  LeaveRequest,
  HolidayClassification,
} from "../types/types";
import {
  calculateHours,
  getHolidayOTMultiplier,
  OT_MULTIPLIER,
  getHolidayMultiplier,
  getHolidayName,
  getHolidayData,
  getMinHourlyWage,
  calculateSSSW,
  calculateSSSEC,
  calculatePagIBIG,
  calculatePhilHealth,
  calculateBIR,
  POSITION_BENEFITS,
  NIGHT_SHIFT_DIFFERENTIAL,
  calculateDailyRate,
  isEmployeeRestDay,
  getAllRegularHolidayDatesInMonth,
  PAID_LEAVE_TYPES,
} from "./utils";

import { calculatePaidLeaveDays } from "./calculatePaidLeaveDays";

import { ProcessedDTR } from "../types/types";

export interface MonthlyCalculation {
  result: PayrollResult | null;
  hasRecords: boolean;
  loanInfo?: { balanceAfter: number };
  holidayDetails?: HolidayBreakdown | null;
}

const processDTR = (
  entries: DTREntry[],
  hourlyRate: number,
  employee_id: string
): ProcessedDTR => {
  return entries.reduce(
    (acc, d) => {
      const { totalHours, nsdHours } = calculateHours(
        d.time_in as string,
        d.time_out as string
      ); // Updated util
      const isRestDay = isEmployeeRestDay(
        d.work_date as string,
        d.employee_id as string
      );

      const holidayData = getHolidayData(d.work_date as string);
      const isHoliday = !!holidayData;
      const baseMultiplier = isHoliday
        ? getHolidayMultiplier(d.work_date as string, isRestDay)
        : isRestDay
        ? 1.3
        : 1.0; // Base multiplier for regular hours (no OT)

      const dailyOT = Math.max(0, totalHours - 8);
      const dailyRegular = totalHours - dailyOT;

      const dailyBasePay = dailyRegular * hourlyRate * baseMultiplier;

      const otMultiplier = getHolidayOTMultiplier(baseMultiplier);
      const dailyOTPay = dailyOT * hourlyRate * otMultiplier;

      const nsdRatePremium =
        hourlyRate * baseMultiplier * NIGHT_SHIFT_DIFFERENTIAL;
      const dailyNSDPay = nsdHours * nsdRatePremium;

      // ACCUMULATE RESULTS
      acc.overtimeHours += dailyOT;
      acc.overtimePay += dailyOTPay;
      acc.nsdHours += nsdHours;
      acc.nsdPay += dailyNSDPay;

      if (baseMultiplier === 1.0 || (isRestDay && !isHoliday)) {
        // Regular Day or Pure Rest Day (no holiday)
        acc.regularHours += dailyRegular;
        acc.regularPay += dailyBasePay;
      } else if (holidayData?.type === "Regular") {
        acc.regularHolidayHours += dailyRegular;
        acc.regularHolidayPay += dailyBasePay;
      } else if (
        holidayData?.type === "Special" ||
        holidayData?.type === "Special Non-Working"
      ) {
        acc.specialHolidayHours += dailyRegular;
        acc.specialHolidayPay += dailyBasePay;
      }

      acc.lastWorkDate = d.work_date as string;
      return acc;
    },
    {
      regularHours: 0,
      overtimeHours: 0,
      regularHolidayHours: 0,
      specialHolidayHours: 0,
      nsdHours: 0, // Initialized
      regularPay: 0,
      overtimePay: 0,
      regularHolidayPay: 0,
      specialHolidayPay: 0,
      nsdPay: 0, // Initialized
      lastWorkDate: "",
    }
  );
};

export const calculateSingleEmployeeMonthlyPayroll = async (
  employee: Employee,
  month: string, // YYYY-MM
  empDTR: DTREntry[],
  leaveRequests: LeaveRequest[]
): Promise<MonthlyCalculation> => {
  if (empDTR.length === 0) return { result: null, hasRecords: false };

  const hourlyRate = Math.max(employee.hourly_rate, getMinHourlyWage());

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date

  // Find the latest work date in the DTRs for the current month
  const latestWorkDateStr = empDTR.reduce((latest, entry) => {
    if (!entry.work_date.startsWith(month)) return latest; // Only consider the current month
    return entry.work_date > latest ? entry.work_date : latest;
  }, "0000-00-00"); // Start with a very old date

  let cutoffDate = new Date(latestWorkDateStr || month + "-01"); // Default to first day of month if no DTR

  // Use the earliest of (Today) OR (Latest Work Date in DTRs)
  if (cutoffDate.getTime() > today.getTime()) {
    cutoffDate = today;
  }
  // Final cutoff date now represents the last day whose events should be paid.

  // --- 2. CALCULATE REGULAR HOLIDAY PAY FOR NON-WORKED DAYS ---
  const allRegularHolidayDates = await getAllRegularHolidayDatesInMonth(month);
  const dailyRate = calculateDailyRate(hourlyRate);
  let holidayPayForNonWorkedDays = 0;

  const isCoveredByPaidLeave = (
    dateStr: string,
    employeeId: string,
    leaveRequests: LeaveRequest[]
  ): boolean => {
    return leaveRequests.some(
      (req) =>
        req.employee_id === employeeId &&
        req.status === "Approved" &&
        PAID_LEAVE_TYPES.includes(req.leave_type_id) &&
        dateStr >= req.start_date && // Simple range check
        dateStr <= req.end_date // Simple range check
    );
  };

  allRegularHolidayDates.forEach((holidayDateStr) => {
    // Check if the day was not worked AND not covered by a paid leave
    const wasWorked = empDTR.some((d) => d.work_date === holidayDateStr);
    const wasOnPaidLeave = isCoveredByPaidLeave(
      holidayDateStr,
      employee.employee_id,
      leaveRequests
    );

    if (!wasWorked && !wasOnPaidLeave) {
      holidayPayForNonWorkedDays += dailyRate;
    }
  });

  const processed = processDTR(empDTR, hourlyRate, employee.employee_id);

  const positionBenefit = POSITION_BENEFITS[employee.position] || 0;
  const paidLeaveDays = calculatePaidLeaveDays(
    employee.employee_id,
    month,
    leaveRequests,
    allRegularHolidayDates
  );
  const paidLeavePay = paidLeaveDays * dailyRate;

  // --- 4. CALCULATE GROSS PAY ---
  const grossPay =
    processed.regularPay +
    processed.overtimePay +
    holidayPayForNonWorkedDays +
    processed.regularHolidayPay +
    processed.specialHolidayPay +
    processed.nsdPay +
    positionBenefit +
    paidLeavePay;

  // SSS calculation now uses the new table-based logic
  const sssDeduction = calculateSSSW(grossPay);
  const sssEC = calculateSSSEC(grossPay);
  const philHealthDeduction = calculatePhilHealth(grossPay).employee;
  const pagibigDeduction = calculatePagIBIG(grossPay).employee;

  const taxableIncome =
    grossPay - sssDeduction.totalEE - philHealthDeduction - pagibigDeduction;

  // --- 4. DEDUCT WITHHOLDING TAX (BIR) ---
  const birTax = calculateBIR(taxableIncome);

  const totalDeductionBase =
    sssDeduction.totalEE + philHealthDeduction + pagibigDeduction + birTax;

  const netBeforeLoan = grossPay - totalDeductionBase;

  // --- 6. DEDUCT LOAN PAYMENT ---
  const loanDeduction = employee.loan_amount
    ? Math.min(employee.loan_amount, netBeforeLoan * 0.25)
    : 0;


  // --- 7. FINAL NET PAY ---
  const netPay = netBeforeLoan - loanDeduction;
  return {
    result: {
      employee_id: employee.employee_id,
      pay_period_start: `${month}-01`,
      pay_period_end: `${month}-31`,
      regular_hours: processed.regularHours,
      overtime_hours: processed.overtimeHours,
      nsd_hours: processed.nsdHours, // ADDED TO RESULT TYPE
      gross_pay: grossPay,
      net_pay: netPay,
      sssDeduction: sssDeduction.totalEE,
      philHealthDeduction: philHealthDeduction,
      pagIbigDeduction: pagibigDeduction,
      birTax: birTax,
      loanDeduction: loanDeduction,
      paid_leave_days: paidLeaveDays,
      paid_leave_pay: paidLeavePay,
      positionBenefit, // ADDED TO RESULT TYPE
      holiday_unworked_pay: holidayPayForNonWorkedDays,
      holidayBreakdowns: [
        // Combine all holiday entries for the period (assuming this logic will be refined later)
        // For now, retaining the original structure but acknowledging all processed holiday hours
        {
          date: processed.lastWorkDate,
          name: getHolidayName(processed.lastWorkDate),
          type:
            getHolidayData(processed.lastWorkDate)?.type ??
            ("Regular"),
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

export const monthlyPayrollCalculation = async (
  employee_id: string,
  month: string,
  employees: Employee[],
  dtrEntries: DTREntry[],
  leaveRequests: LeaveRequest[] // NEW: Passed in here
): Promise<MonthlyCalculation> => {
  const employee = employees.find((e) => e.employee_id === employee_id);
  if (!employee) return { result: null, hasRecords: false };

  const empDTR = dtrEntries.filter(
    (d) => d.employee_id === employee_id && d.work_date.startsWith(month)
  );

  // UPDATED CALL
  return await calculateSingleEmployeeMonthlyPayroll(
    employee,
    month,
    empDTR,
    leaveRequests // Passed to the main calculation
  );
};

export const allEmployeesMonthlyPayroll = async (
  month: string,
  employees: Employee[],
  dtrEntries: DTREntry[],
  leaveRequests: LeaveRequest[] // NEW: Main wrapper must accept it
): Promise<PayrollResult[]> => {
  const results: PayrollResult[] = [];

  for (const emp of employees) {
    const calc = await monthlyPayrollCalculation(
      emp.employee_id,
      month,
      employees,
      dtrEntries,
      leaveRequests // Passed to the single calculation
    );
    if (calc.hasRecords && calc.result) results.push(calc.result);
  }

  return results;
};
