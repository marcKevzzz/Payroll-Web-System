// src/components/LeaveView.jsx

import React from "react";
import { formatDate } from "@/src/utils/utils";

export const mockLeaves = [
  {
    id: 1,
    type: "Vacation Leave",
    start: "2024-12-20",
    end: "2024-12-22",
    days: 3,
    status: "Approved",
  },
  {
    id: 2,
    type: "Sick Leave",
    start: "2024-11-15",
    end: "2024-11-15",
    days: 1,
    status: "Approved",
  },
];

const LeaveView = ({ leaveForm, setLeaveForm }) => (
  <div className="space-y-6">
    {/* Leave Request Form */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Request Leave</h3>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Leave Type
            </label>
            <select
              value={leaveForm.type}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, type: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option>Vacation Leave</option>
              <option>Sick Leave</option>
              <option>Emergency Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={leaveForm.start}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, start: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={leaveForm.end}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, end: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reason
          </label>
          <textarea
            value={leaveForm.reason}
            onChange={(e) =>
              setLeaveForm({ ...leaveForm, reason: e.target.value })
            }
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Please provide a reason for your leave..."
          />
        </div>
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
          Submit Request
        </button>
      </div>
    </div>

    {/* Leave History */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Leave History</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {mockLeaves.map((leave) => (
          <div key={leave.id} className="p-6 hover:bg-slate-50 transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-800">{leave.type}</h4>
                <p className="text-sm text-slate-500 mt-1">
                  {formatDate(leave.start)} - {formatDate(leave.end)} (
                  {leave.days} day{leave.days > 1 ? "s" : ""})
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  leave.status === "Approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : leave.status === "Pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {leave.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LeaveView;
