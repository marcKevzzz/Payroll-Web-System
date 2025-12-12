// src/context/AuthContext.tsx
import React, { createContext, useState, useMemo, useContext } from "react";
import * as AuthAPI from "../services/auth";

interface AuthContextType {
  token: string | null;
  employee_id: string | null;
  role: string | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  login: (employee_id: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  token: string;
  employee_id: string;
  role?: string;
  mustChangePassword?: boolean;
  created_at?: string;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  employee_id: null,
  role: null,
  mustChangePassword: false,
  isAuthenticated: false,
  created_at: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employee_id")
  );
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [createdAt, setCreatedAt] = useState(
    localStorage.getItem("created_at")
  );
  const [mustChangePassword, setMustChangePassword] = useState(
    localStorage.getItem("mustChangePassword") === "true"
  );

  const login = async (employee_id: string, password: string) => {
    const res: LoginResponse = await AuthAPI.login(employee_id, password);

    setToken(res.token);
    setEmployeeId(res.employee_id);
    setRole(res.role || null);
    setMustChangePassword(res.mustChangePassword ?? false);
    setCreatedAt(res.created_at);

    localStorage.setItem("jwtToken", res.token);
    localStorage.setItem("employee_id", res.employee_id);
    localStorage.setItem("role", res.role || "");
    localStorage.setItem(
      "mustChangePassword",
      res.mustChangePassword ? "true" : "false"
    );
    localStorage.setItem("created_at", res.created_at);
  };

  const logout = () => {
    setToken(null);
    setEmployeeId(null);
    setRole(null);
    setMustChangePassword(false);
    setCreatedAt(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        employee_id: employeeId,
        role,
        mustChangePassword,
        isAuthenticated: !!token,
        created_at: createdAt,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
