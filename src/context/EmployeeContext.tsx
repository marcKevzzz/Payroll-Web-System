import React, { createContext, useContext, useState, useCallback } from "react";
import { Employee } from "../types/types";
import * as EmployeeService from "../services/employee";

interface EmployeeContextType {
  employees: Employee[];
  fetchEmployees: () => Promise<void>;
  fetchEmployeeById: (employee_id: string) => Promise<Employee | null>;
  loading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all employees (optional cache)
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EmployeeService.getEmployees();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single employee by ID
  const fetchEmployeeById = useCallback(
    async (employee_id: string) => {
      setLoading(true);
      try {
        const existing = employees.find((e) => e.employee_id === employee_id);
        if (existing) return existing;

        const result = await EmployeeService.getEmployeeById(employee_id);
        const employee = Array.isArray(result) ? result[0] : result;

        if (employee) setEmployees((prev) => [...prev, employee]);

        return employee || null;
      } catch (err) {
        console.error(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [employees]
  );

  return (
    <EmployeeContext.Provider
      value={{ employees, fetchEmployees, fetchEmployeeById, loading }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook
export const useEmployeeContext = () => {
  const ctx = useContext(EmployeeContext);
  if (!ctx)
    throw new Error("useEmployeeContext must be used inside EmployeeProvider");
  return ctx;
};
