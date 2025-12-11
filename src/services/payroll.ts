import axios from "axios";
import { PayrollResult, DTREntry } from "../types/types";

const API_URL = "http://localhost:5000/payroll";

export const generatePayslip = async (payroll: PayrollResult) => {
  return axios.post(API_URL, payroll);
};

export const generateAllPayslips = async (payrolls: PayrollResult[]) => {
  return axios.post(`${API_URL}/bulk`, payrolls);
};

export const getPayrollByMonth = async (employeeId: string, month: string) => {
  const res = await axios.get(
    `${API_URL}/employee/${employeeId}?month=${month}`
  );
  return res.data;
};

export const getEmployeePayslips = async (employee_id: string) => {
  const res = await axios.get(`${API_URL}/employee/${employee_id}`);
  return res.data;
};

export const getEmployeeDTR = async (employee_id: string) => {
  const res = await axios.get<DTREntry[]>(`${API_URL}/employee/${employee_id}`);
  return res.data;
};
