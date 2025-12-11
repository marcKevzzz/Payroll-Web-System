// src/context/AuthContext.tsx
import React, { createContext, useState, useMemo, useContext } from "react";
import * as AuthAPI from "../services/auth";

export interface AuthContextType {
  token: string | null;
  employee_id: string | null;
  isAuthenticated: boolean;
  login: (employee_id: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  employee_id: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  changePassword: async () => {},
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("jwtToken"));
  const [employee_id, setEmployeeId] = useState<string | null>(() => localStorage.getItem("employee_id"));

  const login = async (employee_id: string, password: string) => {
    try {
      const res = await AuthAPI.login(employee_id, password);
      setToken(res.token);
      setEmployeeId(res.employee_id);
      localStorage.setItem("jwtToken", res.token);
      localStorage.setItem("employee_id", res.employee_id);
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err.message || "Login failed");
    }
  };

  const logout = () => {
    setToken(null);
    setEmployeeId(null);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("employee_id");
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error("Not authenticated");
    await AuthAPI.changePassword(token, currentPassword, newPassword);
  };

  const value = useMemo(() => ({
    token,
    employee_id,
    isAuthenticated: !!token,
    login,
    logout,
    changePassword,
  }), [token, employee_id]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
