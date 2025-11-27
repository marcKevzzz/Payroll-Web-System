import React, { useState } from "react";
import { Clock, Save, Trash2, AlertTriangle, Filter } from "lucide-react";
import { Employee, DTREntry } from "./types";
import { calculateHours } from "./utils";

interface DTRManagerProps {
  employees: Employee[];
  dtrEntries: DTREntry[];
  setDtrEntries: (d: DTREntry[]) => void;
}

export const DTRManager = ({
  employees,
  dtrEntries,
  setDtrEntries,
}: DTRManagerProps) => {
  const [empId, setEmpId] = useState("");
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [error, setError] = useState("");

  // Filter States
  const [filterEmp, setFilterEmp] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const addDTR = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!empId || !date || !timeIn || !timeOut) {
      setError("All fields are required.");
      return;
    }
    if (timeIn === timeOut) {
      setError("Time In cannot be the same as Time Out.");
      return;
    }
    const duration = calculateHours(timeIn, timeOut);
    if (duration <= 0) {
      setError("Invalid time range. Duration must be greater than 0.");
      return;
    }
    const exists = dtrEntries.some(
      (e) => e.employeeId === empId && e.date === date
    );
    if (exists) {
      setError("This employee already has a DTR entry for this date.");
      return;
    }

    const newEntry: DTREntry = {
      id: Date.now().toString(),
      employeeId: empId,
      date,
      timeIn,
      timeOut,
    };

    setDtrEntries([newEntry, ...dtrEntries]);
    // Reset only times to allow quick adding for same emp/date sequence
    setTimeIn("");
    setTimeOut("");
    setError("");
  };

  const deleteDTR = (id: string) => {
    if (window.confirm("Delete this log?")) {
      setDtrEntries(dtrEntries.filter((e) => e.id !== id));
    }
  };

  // Filter Logic
  const filteredDTRs = dtrEntries
    .filter((entry) => {
      const matchesEmp = filterEmp ? entry.employeeId === filterEmp : true;
      const matchesMonth = filterMonth
        ? entry.date.startsWith(filterMonth)
        : true;
      return matchesEmp && matchesMonth;
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Sort latest first

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Clock className="w-6 h-6" /> Daily Time Record (DTR)
      </h2>

      {/* Add New Log Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 border-b pb-2">
          Log New Entry
        </h3>
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        <form
          onSubmit={addDTR}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Employee
            </label>
            <select
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              required
            >
              <option value="">Select...</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Time In
            </label>
            <input
              type="time"
              value={timeIn}
              onChange={(e) => setTimeIn(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Time Out
            </label>
            <input
              type="time"
              value={timeOut}
              onChange={(e) => setTimeOut(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Log Time
          </button>
        </form>
      </div>

      {/* Filter & Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter Toolbar */}
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
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
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

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">
                Employee
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">Date</th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Shift
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Total Hours
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDTRs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No time logs found matching your filters.
                </td>
              </tr>
            ) : (
              filteredDTRs.map((entry) => {
                const emp = employees.find((e) => e.id === entry.employeeId);
                const hours = calculateHours(entry.timeIn, entry.timeOut);
                return (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 font-medium text-slate-800">
                      {emp?.name || "Unknown"}
                    </td>
                    <td className="p-4 text-slate-600">{entry.date}</td>
                    <td className="p-4 text-slate-600 font-mono text-xs">
                      <span className="bg-slate-100 px-2 py-1 rounded">
                        {entry.timeIn} - {entry.timeOut}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-semibold">
                      {hours.toFixed(2)} hrs
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteDTR(entry.id)}
                        className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
