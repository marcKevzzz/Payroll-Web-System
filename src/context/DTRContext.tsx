import React, { createContext, useContext, useState, useCallback } from "react";
import { DTREntry } from "../types/types";
import * as DTRService from "../services/dtr";

interface DTRContextType {
  DTREntries: DTREntry[];
  employeeDTREntries: DTREntry[];
  fetchAllDTRLogs: () => Promise<void>;
  fetchEmployeeDTRLogs: (employee_id: string) => Promise<void>;
  loading: boolean;
  employeeLoading: boolean;
}

const DTRContext = createContext<DTRContextType | undefined>(undefined);

export const DTRProvider = ({ children }: { children: React.ReactNode }) => {
  const [DTREntries, setDTREntries] = useState<DTREntry[]>([]);
  const [employeeDTREntries, setEmployeeDTREntries] = useState<DTREntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  // Fetch all DTR logs (for admin)
  const fetchAllDTRLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DTRService.getDTR();
      setDTREntries(data);
    } catch (error) {
      console.error("Error fetching all DTR logs:", error);
      setDTREntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch DTR logs for specific employee (for employee portal)
  const fetchEmployeeDTRLogs = useCallback(async (employee_id: string) => {
    setEmployeeLoading(true);
    try {
      const data = await DTRService.getDTRByEmployeeId(employee_id);
      setEmployeeDTREntries(data);
    } catch (error) {
      console.error(`Error fetching DTR logs for ${employee_id}:`, error);
      setEmployeeDTREntries([]);
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

  return (
    <DTRContext.Provider
      value={{
        DTREntries,
        employeeDTREntries,
        fetchAllDTRLogs,
        fetchEmployeeDTRLogs,
        loading,
        employeeLoading,
      }}
    >
      {children}
    </DTRContext.Provider>
  );
};

// CUSTOM HOOK
export const useDTRContext = () => {
  const ctx = useContext(DTRContext);
  if (!ctx) throw new Error("useDTRContext must be used inside DTRProvider");
  return ctx;
};
