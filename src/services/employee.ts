// src/services/employee.service.ts
import axios from "axios";
import { Employee } from "../types/types";

const API_URL = "http://localhost:5000/employees"; // your backend URL

export const getEmployees = async (): Promise<Employee[]> => {
  const res = await axios.get<Employee[]>(API_URL);
  return res.data;
};
export const getEmployeeById = async (
  employee_id: string
): Promise<Employee[]> => {
  const res = await axios.get<Employee[]>(`${API_URL}/employee/${employee_id}`);
  return res.data;
};

export const createEmployee = async (emp: Employee) => {
  return axios.post(API_URL, emp);
};

export const updateEmployee = async (employee_id: string, emp: Employee) => {
  return axios.put(`${API_URL}/${employee_id}`, emp);
};

export const deleteEmployee = async (employee_id: string) => {
  return axios.delete(`${API_URL}/${employee_id}`);
};
