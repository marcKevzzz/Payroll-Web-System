import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { MonthlyPayroll } from "../components/Payroll/EmployeePayslipPreview/MonthlyPayroll";
import { useEmployeeContext } from "../context/EmployeeContext";
import { useDTRContext } from "../context/DTRContext";
import GenerateAllPayslip from "../components/Payroll/GenerateAllEmployeesPayslip/GenerateAllPayslip";

export const PayrollCalculator = () => {
 const [mode, setMode] = useState<'preview' | 'generate'>("preview");
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
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setMode("preview")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              mode === "preview"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMode("generate")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              mode === "generate"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Generate
          </button>
        </div>
      </div>
      {mode === "preview" && (
        <MonthlyPayroll employees={employees} dtrEntries={DTREntries} />
      )}
      {mode === "generate" && <GenerateAllPayslip employees={employees} />}
    </div>
  );
};
