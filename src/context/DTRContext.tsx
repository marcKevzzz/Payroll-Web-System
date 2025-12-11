import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { DTREntry } from "../types/types";
import * as DTRService from "../services/dtr";

interface DTRContextType {
  DTREntries: DTREntry[];
  fetchDTRLogs: () => Promise<void>;
  loading: boolean;
}

const DTRContext = createContext<DTRContextType | undefined>(undefined);

export const DTRProvider = ({ children }: { children: React.ReactNode }) => {
  const [DTREntries, setDTREntries] = useState<DTREntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDTRLogs = useCallback(async () => {
    if (DTREntries.length > 0) return; // only fetch if empty
    setLoading(true);
    try {
      const data = await DTRService.getDTR();
      setDTREntries(data);
    } finally {
      setLoading(false);
    }
  }, []); // empty deps so function is stable

  useEffect(() => {
    fetchDTRLogs(); // fetch once on provider mount
  }, [fetchDTRLogs]);

  return (
    <DTRContext.Provider value={{ DTREntries, fetchDTRLogs, loading }}>
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
