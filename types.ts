export interface Employee {
  id: string;
  name: string;
  hourlyRate: number;
  loanDeduction: number; // Fixed monthly amortization
}

export interface DTREntry {
  id: string;
  employeeId: string;
  date: string;
  timeIn: string; // HH:mm format
  timeOut: string; // HH:mm format
}

export interface PayrollResult {
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  sssDeduction: number;
  birTax: number;
  loanDeduction: number;
  totalDeduction: number;
  netPay: number;
}
