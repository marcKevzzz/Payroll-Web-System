import React from "react";
import { Employee } from "../../../types/types";
import { formatName } from "../../../utils/utils";

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmp: string;
  setSelectedEmp: (val: string) => void;
  month: string;
  setMonth: (val: string) => void;
  onClick: () => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmp,
  setSelectedEmp,
  month,
  setMonth,
  onClick,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select Employee
          </label>
          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="">-- Choose Employee --</option>
            {employees.map((e) => (
              <option key={e.employee_id} value={e.employee_id}>
                {formatName(e)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Payroll Period (Month)
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          />
        </div>
        <button
          onClick={onClick}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex self-end justify-center gap-2 transition-colors"
        >
          Generate All Payslips
        </button>
      </div>
    </div>
  );
};

export default EmployeeSelector;
