import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Employee } from "../types/types";
import * as EmployeeService from "../services/employee";

interface EmployeeContextType {
  employees: Employee[];
  fetchEmployees: () => Promise<void>;
  loading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const EmployeeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    if (employees.length > 0) return; // <-- only fetch if empty
    setLoading(true);
    try {
      const data = await EmployeeService.getEmployees();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }, [employees]);

  useEffect(() => {
    fetchEmployees(); // fetch once on provider mount
  }, [fetchEmployees]);

  return (
    <EmployeeContext.Provider value={{ employees, fetchEmployees, loading }}>
      {children}
    </EmployeeContext.Provider>
  );
};

// CUSTOM HOOK
export const useEmployeeContext = () => {
  const ctx = useContext(EmployeeContext);
  if (!ctx)
    throw new Error("useEmployeeContext must be used inside EmployeeProvider");
  return ctx;
};
