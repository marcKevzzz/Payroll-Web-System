export interface Employee {
  employee_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  hourly_rate: number;
  loan_amount: number; // The starting total balance of the loan
  created_at: string;
}

export interface LeaveType {
  type_id?: number;
  type_name: string;
}

export interface LeaveRequest {
  request_id?: number;
  employee_id: string;
  leave_type_id: number;
  type_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: number;
  reason?: string;
  status?: "Pending" | "Approved" | "Rejected" | "Cancelled";
  approver_id?: string | null;
  approval_date?: string | null;
  rejection_reason?: string | null;
}

export interface DTREntry {
  dtr_id: string;
  employee_id: string;
  work_date: string; // YYYY-MM-DD
  time_in: string; // HH:mm format
  time_out: string; // HH:mm format
  status: "Present" | "Absent" | "Leave";
}

export interface HolidayBreakdown {
  date: string;
  name: string;
  type: HolidayClassification;
  hours: number;
  pay: number;
}

export interface PayrollResult {
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;

  regular_hours: number;
  overtime_hours: number;
  gross_pay: number;
  net_pay: number;
  nsd_hours: number;
  positionBenefit: number;

  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  birTax: number;
  loanDeduction: number;

  holiday_unworked_pay: number;

  paid_leave_days: number;
  paid_leave_pay: number;

  holidayBreakdowns: HolidayBreakdown[];
}
export type HolidayClassification =
  | "Regular"
  | "Special Non-Working"
  | "Special";

export interface ProcessedDTR {
  regularHours: number;
  overtimeHours: number;
  regularHolidayHours: number;
  specialHolidayHours: number;
  nsdHours: number; // New
  regularPay: number;
  overtimePay: number;
  regularHolidayPay: number;
  specialHolidayPay: number;
  nsdPay: number; // New
  lastWorkDate: string;
}
