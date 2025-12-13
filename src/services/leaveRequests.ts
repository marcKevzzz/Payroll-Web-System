import axios from "axios";
import { LeaveRequest } from "../types/types";
const API_URL = "http://localhost:5000/leave-requests"; // your backend URL

// ===================== LeaveType =====================
export const getLeaveTypes = async () => {
  const res = await axios.get(`${API_URL}/types`);
  return res.data;
};

// ===================== LeaveRequest =====================
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const res = await axios.get(`${API_URL}/requests`);
  return res.data;
};
export const getLeaveRequestsByEmployee = async (employee_id: string) => {
  const res = await axios.get(`${API_URL}/requests/${employee_id}`);
  return res.data;
};

export const createLeaveRequest = async (leaveRequest) => {
  // leaveRequest = { employee_id, leave_type_id, start_date, end_date, total_days, reason }
  return axios.post(`${API_URL}/requests`, leaveRequest);
};

export const updateLeaveRequestStatus = async (request_id, statusData) => {
  // statusData = { status, approver_id, rejection_reason }
  return axios.patch(`${API_URL}/requests/${request_id}/status`, statusData);
};
