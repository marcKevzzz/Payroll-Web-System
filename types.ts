export interface Employee {
  id: string;
  name: string;
  hourlyRate: number;
  totalLoan: number; // The starting total balance of the loan
}

export interface DTREntry {
  id: string;
  employeeId: string;
  date: string;
  timeIn: string; // HH:mm format
  timeOut: string; // HH:mm format
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: "Regular" | "Special";
}

export interface PayrollResult {
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;

  // Specific Holiday Breakdowns
  regularHolidayHours: number;
  regularHolidayPay: number;
  specialHolidayHours: number;
  specialHolidayPay: number;

  grossPay: number;
  sssDeduction: number;
  sssEC: number; // Employees Compensation (Employer Share)
  birTax: number;
  loanDeduction: number;
  totalDeduction: number;
  netPay: number;
}
