import {
  // ... existing imports ...
  LeaveRequest, // Import the new type
} from "../types/types";
import {
  // ... existing imports ...
  PAID_LEAVE_TYPES, // Import the new constant
  calculateDailyRate, // Import the new utility
} from "./utils";

// Helper function to count approved paid leave days within a specific month
export const calculatePaidLeaveDays = (
  employeeId: string,
  month: string, // YYYY-MM
  leaveRequests: LeaveRequest[],
  regularHolidayDates: string[]
): number => {
  let paidDays = 0;

  const [year, monthStr] = month.split("-");
  const monthIndex = parseInt(monthStr, 10) - 1;

  const approvedPaidLeaves = leaveRequests.filter(
    (req) =>
      req.employee_id === employeeId &&
      req.status === "Approved" &&
      PAID_LEAVE_TYPES.includes(req.leave_type_id)
  );

  for (const req of approvedPaidLeaves) {
    let currentDate = new Date(req.start_date);
    const endDate = new Date(req.end_date);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

      if (
        currentDate.getFullYear() === parseInt(year, 10) &&
        currentDate.getMonth() === monthIndex
      ) {
        // **NEW CHECK:** Exclude the day if it is a Regular Holiday
        if (!regularHolidayDates.includes(dateStr)) {
          paidDays += 1;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return paidDays;
};
