import React, { useState } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { DTREntry, Employee } from "../../types/types";
import { calculateHours, formatName } from "../../utils/utils";
import * as DTRService from "../../services/dtr";

interface Props {
  employees: Employee[];
  dtrEntries: DTREntry[];
  setDtrEntries: (d: DTREntry[]) => void;
  showToast: (type: string, message: string) => void;
}

const DTRForm: React.FC<Props> = ({
  employees,
  dtrEntries,
  setDtrEntries,
  showToast,
}) => {
  const [empId, setEmpId] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!empId || !workDate || !timeIn || !timeOut) {
      setError("All fields are required.");
      return;
    }

    if (timeIn === timeOut) {
      setError("Time In cannot be the same as Time Out.");
      return;
    }

    const duration = calculateHours(timeIn, timeOut);
    if (duration <= 0) {
      setError("Invalid time range.");
      return;
    }

    const duplicate = dtrEntries.find(
      (d) =>
        d.employee_id === empId &&
        new Date(d.work_date).toLocaleDateString("en-CA") ===
          new Date(workDate).toLocaleDateString("en-CA")
    );

    if (duplicate) {
      setError("This employee already has a DTR on this date.");
      return;
    }

    const newEntry: DTREntry = {
      dtr_id: undefined!,
      employee_id: empId,
      work_date: workDate,
      time_in: timeIn,
      time_out: timeOut,
      status: "Present",
    };

    try {
      await DTRService.addDTR(newEntry);
      setDtrEntries([...dtrEntries, newEntry]);
      showToast("success", "DTR added successfully");
    } catch {
      showToast("error", "Failed to add DTR");
    }
    setWorkDate("");
    setTimeIn("");
    setTimeOut("");
  };

  return (
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
        onSubmit={handleAdd}
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
            {employees.map((e, i) => (
              <option key={i} value={e.employee_id}>
                {formatName(e)} ({e.employee_id})
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
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
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
  );
};

export default DTRForm;
