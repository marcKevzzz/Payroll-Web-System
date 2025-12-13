export interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
  department: string;
  position: string;
  hourlyRate: number;
  totalLoan: number;
  password?: string;
}
export interface LeaveType {
  type_id?: number;
  type_name: string;
}

export interface LeaveRequest {
  request_id?: number;
  employee_id: string;
  leave_type_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: number;
  reason?: string;
  status?: "Pending" | "Approved" | "Rejected" | "Cancelled";
  approver_id?: string | null;
  approval_date?: string | null;
  rejection_reason?: string | null;
}
