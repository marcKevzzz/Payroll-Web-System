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
}

export interface DTREntry {
  dtr_id: string;
  employee_id: string;
  work_date: String; // YYYY-MM-DD
  time_in: string; // HH:mm format
  time_out: string; // HH:mm format
  status: "Present" | "Absent" | "Leave";
}

export interface HolidayBreakdown {
  date: string;
  name: string;
  type: "Regular" | "Special Non-Working" | "Special Working";
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

  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  birTax: number;
  loanDeduction: number;

  holidayBreakdowns: HolidayBreakdown[];
}
