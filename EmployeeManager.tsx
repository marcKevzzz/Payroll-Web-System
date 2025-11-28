import React, { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  Wallet,
  Search,
} from "lucide-react";
import { Employee, DTREntry } from "./types";
import { formatCurrency, REGIONS, getMinHourlyWage } from "./utils";

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: (e: Employee[]) => void;
  dtrEntries: DTREntry[];
  setDtrEntries: (d: DTREntry[]) => void;
}

export const EmployeeManager = ({
  employees,
  setEmployees,
  dtrEntries,
  setDtrEntries,
}: EmployeeManagerProps) => {
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [totalLoan, setTotalLoan] = useState("");
  const [region, setRegion] = useState("NCR");
  const [error, setError] = useState("");

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");

  const addEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedRate = parseFloat(rate);
    const parsedTotalLoan = parseFloat(totalLoan) || 0;
    const minWage = getMinHourlyWage(region);

    if (!name.trim() || isNaN(parsedRate)) {
      setError("Please provide a valid name and hourly rate.");
      return;
    }

    if (parsedRate <= 0) {
      setError("Hourly rate must be greater than 0.");
      return;
    }

    // Minimum Wage Validation
    if (parsedRate < minWage) {
      setError(
        `Rate below Minimum Wage for ${region} (${formatCurrency(minWage)}/hr).`
      );
      return;
    }

    if (parsedTotalLoan < 0) {
      setError("Loan amounts cannot be negative.");
      return;
    }

    const newEmp: Employee = {
      id: Date.now().toString(),
      name: name.trim(),
      hourlyRate: parsedRate,
      region,
      totalLoan: parsedTotalLoan,
    };

    setEmployees([...employees, newEmp]);

    // Reset
    setName("");
    setRate("");
    setTotalLoan("");
    setRegion("NCR");
  };

  const deleteEmployee = (id: string) => {
    if (
      window.confirm(
        "Are you sure? This will delete the employee and all their associated DTR logs."
      )
    ) {
      setEmployees(employees.filter((e) => e.id !== id));
      // Also cleanup DTRs linked to this employee
      setDtrEntries(dtrEntries.filter((d) => d.employeeId !== id));
    }
  };

  // Filter Logic
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6" /> Employee Management
        </h2>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        <form
          onSubmit={addEmployee}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Juan Dela Cruz"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {Object.keys(REGIONS).map((regKey) => (
                <option key={regKey} value={regKey}>
                  {regKey} - {REGIONS[regKey].name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hourly Rate (₱)
              <span className="block text-[10px] text-slate-400 font-normal">
                Min: {formatCurrency(getMinHourlyWage(region))}
              </span>
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          {/* Loan Section */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              Total Loan{" "}
              <span className="text-xs text-slate-400 font-normal">
                (Balance)
              </span>
            </label>
            <input
              type="number"
              value={totalLoan}
              onChange={(e) => setTotalLoan(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Total amount borrowed"
              step="0.01"
              min="0"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Region
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Hourly Rate
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Total Loan
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {searchTerm
                    ? "No employees match your search."
                    : "No employees added yet."}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="p-4 font-medium text-slate-800">{emp.name}</td>
                  <td className="p-4 text-slate-600 text-xs">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 font-medium">
                      {emp.region || "NCR"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-mono">
                    {formatCurrency(emp.hourlyRate)}/hr
                  </td>
                  <td className="p-4 text-slate-600 font-mono">
                    {emp.totalLoan > 0 ? formatCurrency(emp.totalLoan) : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
