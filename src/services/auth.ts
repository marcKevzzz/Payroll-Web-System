import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export interface LoginResponse {
  token: string;
  employee_id: string;
  role?: string;
  mustChangePassword?: boolean;
}

export const login = async (
  employee_id: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const res = await axios.post(
      `${API_URL}/login`,
      { employee_id, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Login failed");
  }
};

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  await axios.put(
    `${API_URL}/change-password`,
    { currentPassword, newPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
