import React from "react";
import { Filter } from "lucide-react";
import { Employee } from "../../types/types";
import { formatName } from "../../utils/utils";

interface DTRFilterProps {
  employees: Employee[];
  filterEmp: string;
  setFilterEmp: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
}

const DTRFilter: React.FC<DTRFilterProps> = ({
  employees,
  filterEmp,
  setFilterEmp,
  filterMonth,
  setFilterMonth,
}) => {
  return (
    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center">
      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
        <Filter className="w-4 h-4" /> Filter Logs:
      </div>

      <select
        value={filterEmp}
        onChange={(e) => setFilterEmp(e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 bg-white w-full md:w-auto"
      >
        <option value="">All Employees</option>
        {employees.map((e, i) => (
          <option key={i} value={e.employee_id}>
            {formatName(e)} ({e.employee_id})
          </option>
        ))}
      </select>

      <input
        type="month"
        value={filterMonth}
        onChange={(e) => setFilterMonth(e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 bg-white w-full md:w-auto"
        placeholder="Select Month"
      />

      {(filterEmp || filterMonth) && (
        <button
          onClick={() => {
            setFilterEmp("");
            setFilterMonth("");
          }}
          className="text-indigo-600 text-sm hover:underline ml-auto"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default DTRFilter;
