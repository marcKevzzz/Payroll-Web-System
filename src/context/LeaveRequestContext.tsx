// src/context/LeaveRequestContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LeaveRequest } from "../types/types";
import {
  getLeaveRequests,
  updateLeaveRequestStatus,
} from "../services/leaveRequests";

/**
 * Interface for the state and functions provided by the context.
 */
interface LeaveRequestContextType {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
  refetchLeaveRequests: () => void;
  updateRequestStatus: (
    request_id: number,
    status: "Approved" | "Rejected",
    approver_id: string,
    rejection_reason?: string | null
  ) => Promise<void>;
}

// Create the context
const LeaveRequestContext = createContext<LeaveRequestContextType | undefined>(
  undefined
);

/**
 * Hook to use the Leave Request Context.
 * @returns The LeaveRequestContextType object.
 */
export const useLeaveRequestContext = () => {
  const context = useContext(LeaveRequestContext);
  if (!context) {
    throw new Error(
      "useLeaveRequestContext must be used within a LeaveRequestProvider"
    );
  }
  return context;
};

// Define the Provider component
interface LeaveRequestProviderProps {
  children: ReactNode;
}

export const LeaveRequestProvider = ({
  children,
}: LeaveRequestProviderProps) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the leave requests from the service and updates the state.
   */
  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeaveRequests();
      setLeaveRequests(data);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
      setError("Failed to load leave requests data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /**
   * Refetches data (useful after creation/approval/rejection).
   */
  const refetchLeaveRequests = () => {
    fetchRequests();
  };

  /**
   * Updates the status of a specific leave request via the service and refreshes the list.
   */
  const updateRequestStatus = async (
    request_id: number,
    status: "Approved" | "Rejected",
    approver_id: string,
    rejection_reason: string | null = null
  ) => {
    try {
      await updateLeaveRequestStatus(request_id, {
        status,
        approver_id,
        rejection_reason: rejection_reason || null,
      });
      // Refresh the data after a successful update
      fetchRequests();
    } catch (err) {
      console.error("Failed to update leave request status:", err);
      throw new Error("Could not update request status.");
    }
  };

  const contextValue: LeaveRequestContextType = {
    leaveRequests,
    isLoading,
    error,
    refetchLeaveRequests,
    updateRequestStatus,
  };

  return (
    <LeaveRequestContext.Provider value={contextValue}>
      {children}
    </LeaveRequestContext.Provider>
  );
};
