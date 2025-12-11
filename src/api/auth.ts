// src/api/auth.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // backend URL

export interface LoginResponse {
  token: string;
  employee_id: string;
}

export const login = async (
  employeeId: string,
  password: string
): Promise<LoginResponse> => {
  const res = await axios.post(`${API_URL}/login`, { employeeId, password });
  return res.data;
};

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  const res = await axios.put(
    `${API_URL}/change-password`,
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
