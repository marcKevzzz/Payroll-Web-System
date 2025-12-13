import React, { useState, useEffect } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { DTREntry, Employee } from "../../types/types";
import { calculateHours, formatName } from "../../utils/utils";
import * as DTRService from "../../services/dtr";

interface Props {
  employees: Employee[];
  dtrEntries: DTREntry[];
  fetchDTRLogs: () => void;
  showToast: (type: string, message: string) => void;
}

const DTRForm: React.FC<Props> = ({
  employees,
  dtrEntries,
  fetchDTRLogs,
  showToast,
}) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const [empId, setEmpId] = useState("");
  const [workDate, setWorkDate] = useState(today);
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

    const selectedDateTime = new Date(`${workDate}T${timeIn}`);
    const now = new Date();
    if (selectedDateTime > now) {
      setError("You cannot log DTR for a future time.");
      return;
    }

    if (timeIn === timeOut) {
      setError("Time In cannot be the same as Time Out.");
      return;
    }

    const duration = calculateHours(timeIn, timeOut);
    if (duration.totalHours <= 0) {
      setError("Invalid time range.");
      return;
    }

    // --- DAILY LIMIT ---
    if (duration.totalHours > 12) {
      setError("Daily work cannot exceed 12 hours.");
      return;
    }

    // --- WEEKLY LIMIT ---
    // Calculate total hours worked for the week of this date
    // Inside handleAdd function in DTRForm:

    // ... (Existing Daily Limit check) ...

    // --- WEEKLY LIMIT (DOLE - Max 48 hours/week) ---
    const workDateObj = new Date(workDate);
    // Find the start of the week (Sunday, day index 0)
    const dayOfWeek = workDateObj.getDay(); // 0 (Sun) - 6 (Sat)
    const weekStart = new Date(workDateObj);
    weekStart.setDate(workDateObj.getDate() - dayOfWeek); // Set to Sunday's date
    weekStart.setHours(0, 0, 0, 0); // Normalize time to start of day

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Set to Saturday's date
    weekEnd.setHours(23, 59, 59, 999); // Normalize time to end of day

    // Calculate total hours worked for the week of this date (excluding the new entry's time)
    const weeklyHours = dtrEntries
      .filter(
        (d) =>
          d.employee_id === empId &&
          // Check if existing log date falls within the calculated week (inclusive)
          new Date(d.work_date).getTime() >= weekStart.getTime() &&
          new Date(d.work_date).getTime() <= weekEnd.getTime() &&
          // Also ensure we don't count a log if we are editing an existing one (not applicable here, but good practice)
          d.work_date !== workDate // Ensures we aren't including the current day's log if it already exists in the DTRs array.
      )
      .reduce((sum, d) => sum + calculateHours(d.time_in, d.time_out), 0);

    if (weeklyHours + duration > 48) {
      setError(
        `Total work hours for the week (${(weeklyHours + duration).toFixed(
          1
        )} hrs) exceed the 48-hour DOLE limit.`
      );
      return;
    }
    // ... (rest of the handleAdd function) ...

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
      fetchDTRLogs();
      showToast("success", "DTR added successfully");
    } catch {
      showToast("error", "Failed to add DTR");
    }

    // Reset form
    setEmpId("");
    setWorkDate(today);
    setTimeIn("");
    setTimeOut("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 border-b pb-2">
        Log New Entry
      </h3>
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2 ">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end"
      >
        {/* Employee */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
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

        {/* Date */}
        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={workDate}
            max={today}
            onChange={(e) => setWorkDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        {/* Time In */}
        <div className="col-span-1 sm:col-span-1 md:col-span-1">
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

        {/* Time Out */}
        <div className="col-span-1 sm:col-span-1 md:col-span-1">
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

        {/* Submit Button */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Log Time
          </button>
        </div>
      </form>
    </div>
  );
};

export default DTRForm;
