import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { MonthlyPayroll } from "../components/Payroll/MonthlyPayroll";
import { useEmployeeContext } from "../context/EmployeeContext";
import { useDTRContext } from "../context/DTRContext";

export const PayrollCalculator = () => {
  const { employees } = useEmployeeContext();
  const { DTREntries } = useDTRContext();

  // console.log("Employees in PayrollCalculator:", employees);
  // console.log("DTR Entries in PayrollCalculator:", DTREntries);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="w-6 h-6" /> Payroll Computation
        </h2>
      </div>

      <MonthlyPayroll employees={employees} dtrEntries={DTREntries} />
    </div>
  );
};
