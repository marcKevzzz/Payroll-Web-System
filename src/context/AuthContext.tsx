import React, { createContext, useState } from "react";
import * as AuthAPI from "../api/auth";

interface AuthContextType {
  token: string | null;
  employeeId: string | null;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  employeeId: null,
  login: async () => {},
  logout: () => {},
  changePassword: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("jwtToken")
  );
  const [employeeId, setEmployeeId] = useState<string | null>(() =>
    localStorage.getItem("employeeId")
  );

  const login = async (empId: string, password: string) => {
    const res = await AuthAPI.login(empId, password);
    setToken(res.token);
    setEmployeeId(res.employee_id);
    localStorage.setItem("jwtToken", res.token);
    localStorage.setItem("employeeId", res.employee_id);
  };

  const logout = () => {
    setToken(null);
    setEmployeeId(null);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("employeeId");
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!token) throw new Error("Not authenticated");
    await AuthAPI.changePassword(token, currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{ token, employeeId, login, logout, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
