import React, { useEffect, useState } from "react";
import { formatDate } from "@/src/utils/utils";
import {
  getLeaveRequests,
  createLeaveRequest,
  getLeaveRequestsByEmployee,
} from "@/src/services/leaveRequests";
import { useConfirm } from "@/src/context/ConfirmContext";
import { useToast } from "@/src/context/ToastContext";
import { Employee } from "@/src/types/types";

interface LeaveViewProps {
  employee_id: string;
  employees: Employee[];
}

const LeaveView: React.FC<LeaveViewProps> = ({ employee_id, employees }) => {
  const { showConfirm } = useConfirm();
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    start: "",
    end: "",
    reason: "",
  });

  const [leaveHistory, setLeaveHistory] = useState([]);
  const { showToast } = useToast();

  // Load employee leave requests
  const loadLeaves = async () => {
    try {
      const data = await getLeaveRequestsByEmployee(employee_id);
      setLeaveHistory(data);
    } catch (err) {
      showToast("error", "Failed to load leave requests.");
    }
  };

  useEffect(() => {
    if (employee_id) loadLeaves();
  }, [employee_id]);

  // Submit Leave Request
  const submitLeave = async () => {
    if (!leaveForm.type || !leaveForm.start || !leaveForm.end) {
      showToast("warning", "Please fill all required fields.");
      return;
    }

    try {
      await createLeaveRequest({
        employee_id,
        leave_type: leaveForm.type,
        start_date: leaveForm.start,
        end_date: leaveForm.end,
        reason: leaveForm.reason,
      });

      showToast("success", "Leave request submitted successfully.");

      setLeaveForm({ type: "", start: "", end: "", reason: "" });
      loadLeaves();
    } catch (err) {
      showToast("error", "Failed to submit request.");
    }
  };

  return (
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
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Leave Type</option>
                <option>Vacation Leave</option>
                <option>Sick Leave</option>
                <option>Emergency Leave</option>
              </select>
            </div>

            {/* Dates */}
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Provide a reason..."
            />
          </div>

          {/* Submit Button */}
          <button
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={submitLeave}
          >
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
          {leaveHistory?.length > 0 ? (
            leaveHistory.map((leave) => (
              <div key={leave.request_id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {leave.type_name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(leave.start_date)} -{" "}
                      {formatDate(leave.end_date)} ({leave.total_days} day
                      {leave.total_days > 1 ? "s" : ""})
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
            ))
          ) : (
            <div className="p-6 text-slate-500">No leave requests</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveView;
