// src/hooks/useAdminHrDashboardData.ts

import { useMemo } from "react";
import { Employee, DTREntry } from "../types/types";
import {
  calculateHours,
  OT_MULTIPLIER,
  calculateSSSW,
  calculateBIR,
  formatName,
} from "../utils/utils";

// Define the shape of the calculated data
export interface DashboardStats {
  // ... (omitted for brevity)
}

export interface TopEmployee {
  // ... (omitted for brevity)
}

export const useAdminHrDashboardData = (
  employees: Employee[],
  dtrEntries: DTREntry[]
) => {
  // --- 1. Payroll Statistics Calculation ---
  const stats: DashboardStats = useMemo(() => {
    let totalRegularHours = 0;
    let totalOTHours = 0;
    let totalGross = 0;
    let totalSSS = 0;
    let totalBIR = 0;
    let totalLoans = 0;

    const empDataMap = new Map<
      string,
      { totalLoan: number; paidLoan: number }
    >();

    // FIX 1: Use employee.employee_id as the map key, and employee.loan_amount for total loan
    employees.forEach((e: any) =>
      empDataMap.set(e.employee_id, {
        totalLoan: e.loan_amount || 0, // Using employee.loan_amount
        paidLoan: 0,
      })
    );

    const monthlyGrossMap = new Map<string, number>();

    dtrEntries.forEach((entry: any) => {
      const hours = calculateHours(entry.time_in, entry.time_out); // Use snake_case for consistency
      const reg = Math.min(8, hours.totalHours);
      const ot = Math.max(0, hours.totalHours - 8);

      // FIX 2: Use employee.employee_id for lookup
      const emp = employees.find(
        (e: any) => e.employee_id === entry.employee_id
      );

      if (!emp) return;

      totalRegularHours += reg;
      totalOTHours += ot;

      // Ensure 'hourly_rate' is used from the Employee interface
      const gross =
        reg * emp.hourly_rate + ot * emp.hourly_rate * OT_MULTIPLIER;

      // FIX 3: Use entry.work_date
      const key = `${emp.employee_id}-${entry.work_date.slice(0, 7)}`;

      monthlyGrossMap.set(key, (monthlyGrossMap.get(key) || 0) + gross);
    });

    Array.from(monthlyGrossMap.entries())
      .sort()
      .forEach(([key, gross]) => {
        const [empId] = key.split("-");
        const sss = calculateSSSW(gross);
        const bir = calculateBIR(Math.max(0, gross - sss.totalEE));
        const netBeforeLoan = gross - (sss.totalEE + bir);

        let loan = 0;
        const empData = empDataMap.get(empId);

        if (empData) {
          // Loan deduction capped at 25% of net pay before loan deduction
          const loanDeductionCap = netBeforeLoan * 0.25;
          const remainingBalance = empData.totalLoan - empData.paidLoan;

          loan = Math.min(loanDeductionCap, Math.max(0, remainingBalance));
          empData.paidLoan += loan;
        }

        totalGross += gross;
        totalSSS += sss.totalEE;
        totalBIR += bir;
        totalLoans += loan;
      });

    return {
      totalRegularHours: parseFloat(totalRegularHours.toFixed(2)),
      totalOTHours: parseFloat(totalOTHours.toFixed(2)),
      totalGross: parseFloat(totalGross.toFixed(2)),
      totalSSS: parseFloat(totalSSS.toFixed(2)),
      totalBIR: parseFloat(totalBIR.toFixed(2)),
      totalLoans: parseFloat(totalLoans.toFixed(2)),
      totalNet: parseFloat(
        (totalGross - (totalSSS + totalBIR + totalLoans)).toFixed(2)
      ),
    };
  }, [employees, dtrEntries]);

  // --- 2. Top Employees Calculation ---
  const topEmployees: TopEmployee[] = useMemo(() => {
    const hoursMap = new Map<string, number>();

    dtrEntries.forEach((entry: any) => {
      const hours = calculateHours(entry.time_in, entry.time_out); // Use snake_case for consistency

      // FIX 4: Use entry.employee_id for the hours map
      hoursMap.set(
        entry.employee_id,
        (hoursMap.get(entry.employee_id) || 0) + hours.totalHours
      );
    });

    return Array.from(hoursMap.entries())
      .map(([id, hours]) => {
        // FIX 5: Use employee.employee_id for employee lookup
        const emp = employees.find((e: any) => e.employee_id === id);
        return {
          name: emp ? formatName(emp) : "Unknown",
          hours: parseFloat(hours.toFixed(1)),
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [employees, dtrEntries]);

  // --- 3. Department Headcount Calculation (No changes needed, uses employee.department) ---
  const departmentHeadcount = useMemo(() => {
    const countMap = new Map<string, number>();
    employees.forEach((emp) => {
      const dept = (emp as any).department || "Unassigned";
      countMap.set(dept, (countMap.get(dept) || 0) + 1);
    });
    // Convert map to a sortable array for chart use
    return Array.from(countMap.entries()).map(([department, count]) => ({
      department,
      count,
    }));
  }, [employees]);

  return {
    stats,
    topEmployees,
    departmentHeadcount,
  };
};
