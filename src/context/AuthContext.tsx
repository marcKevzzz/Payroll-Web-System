import React, { createContext, useState, useMemo, useEffect } from "react";
import * as AuthAPI from "../services/auth";
import { jwtDecode } from "jwt-decode";

// -------------------------
// 1. Interfaces
// -------------------------

// Data inside the JWT payload
interface DecodedToken {
  employee_id: string;
  role: string;
  iat: number;
  exp: number;
}

// Data returned from the successful login API call
interface LoginResponse {
  token: string;
  employee_id: string;
  mustChangePassword?: boolean;
  created_at?: string;
}

// Data returned by the context's login function (for immediate redirection)
interface AuthData {
  role: string;
  employee_id: string;
  mustChangePassword: boolean;
}

// The shape of the data provided by the AuthContext
interface AuthContextType {
  token: string | null;
  employee_id: string | null;
  role: string | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  // FIX 1: Added missing fields to the interface
  created_at: string | null;
  isCheckingAuth: boolean;
  // FIX 2: Updated login return type to AuthData for better handling in LoginPage
  login: (employee_id: string, password: string) => Promise<AuthData>;
  logout: () => void;
}

// -------------------------
// 2. Context Creation
// -------------------------

// Default values for the context
export const AuthContext = createContext<AuthContextType>({
  token: null,
  employee_id: null,
  role: null,
  mustChangePassword: false,
  isAuthenticated: false,
  // Added default values for missing fields
  created_at: null,
  isCheckingAuth: true,
  login: async () => ({} as AuthData), // Dummy return for type safety
  logout: () => {},
});

// -------------------------
// 3. Provider Component
// -------------------------

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employee_id")
  );
  const [createdAt, setCreatedAt] = useState(
    localStorage.getItem("created_at")
  );
  // Initial state should ideally derive the loading status from the presence of a token
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(
    localStorage.getItem("mustChangePassword") === "true"
  ); 

  useEffect(() => {
    setIsCheckingAuth(false);
  }, []); // DERIVED STATE: Calculate role from token whenever the token changes

  const logout = () => {
    setToken(null);
    setEmployeeId(null);
    setMustChangePassword(false);
    setCreatedAt(null);
    localStorage.clear();
  }; // Login function implementation

  const role = useMemo(() => {
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired. Logging out.");
          logout(); // Auto-logout if expired
          return null;
        }

        return decoded.role;
      } catch (e) {
        console.error("Failed to decode token:", e);
        return null;
      }
    }
    return null;
  }, [token]); // Added logout to dependencies

  // Define logout inside the provider to use the setter functions, and ensure it's stable

  const login = async (
    employee_id: string,
    password: string
  ): Promise<AuthData> => {
    const res: LoginResponse = await AuthAPI.login(employee_id, password);

    const newMustChangePassword = res.mustChangePassword ?? false;

    setToken(res.token);
    setEmployeeId(res.employee_id);
    setMustChangePassword(newMustChangePassword);
    setCreatedAt(res.created_at);

    localStorage.setItem("jwtToken", res.token);
    localStorage.setItem("employee_id", res.employee_id);
    localStorage.setItem(
      "mustChangePassword",
      newMustChangePassword ? "true" : "false"
    );
    localStorage.setItem("created_at", res.created_at || "");

    // Decode the token immediately to get the role for the return object
    const decoded = jwtDecode<DecodedToken>(res.token);

    // Return the necessary data for immediate redirection in LoginPage
    return {
      role: decoded.role,
      employee_id: res.employee_id,
      mustChangePassword: newMustChangePassword,
    };
  }; // console.log(role); // Removed console.log for clean output

  return (
    <AuthContext.Provider
      value={{
        token,
        employee_id: employeeId,
        role,
        mustChangePassword,
        isAuthenticated: !!token && !!role, 
        isCheckingAuth,
        created_at: createdAt,
        login,
        logout,
      }}
    >
            {children}   {" "}
    </AuthContext.Provider>
  );
};
