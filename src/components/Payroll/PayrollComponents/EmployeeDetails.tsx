import React from "react";
import { Employee } from "../../../types/types";
import { formatCurrency, formatName } from "../../../utils/utils";

interface EmployeeDetailsProps {
  employee: Employee;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee }) => (
  <div className="bg-slate-50 p-6 border-b border-slate-200">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
      <div className="col-span-2">
        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
          Employee Name
        </span>
        <span className="block font-bold text-lg text-slate-800">
          {formatName(employee)}
        </span>
        <span className="text-xs text-slate-500">{employee.position}</span>
      </div>
      <div>
        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
          Employee ID
        </span>
        <span className="block font-mono text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded inline-block">
          {employee.employee_id}
        </span>
      </div>
      <div className="text-right md:text-left">
        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
          Hourly Rate
        </span>
        <span className="block font-mono text-slate-700">
          {formatCurrency(employee.hourly_rate)}
        </span>
      </div>
    </div>
  </div>
);

export default EmployeeDetails;
