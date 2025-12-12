import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Employee, DTREntry } from "../types/types";
import * as EmployeeService from "../services/employee";
import * as DTRService from "../services/dtr";

interface EmployeeContextType {
  employees: Employee[];
  DTREntries: DTREntry[];
  fetchEmployees: () => Promise<void>;
  fetchDTRLogs: () => Promise<void>;
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
  const [DTREntries, setDTREntries] = useState<DTREntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EmployeeService.getEmployees();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDTRLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DTRService.getDTR();
      setDTREntries(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchDTRLogs();
  }, [fetchEmployees, fetchDTRLogs]);

  return (
    <EmployeeContext.Provider
      value={{ employees, DTREntries, fetchEmployees, fetchDTRLogs, loading }}
    >
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
