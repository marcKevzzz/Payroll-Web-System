import React from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { formatDate } from "../../utils/utils";

const LeaveDetailsModal = ({
  selectedLeave,
  closeDetails,
  getStatusColor,
  isAdmin,
  handleApprove,
  handleReject,
  reasonInput,
  setReasonInput,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 !m-0 ">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95dvh] shadow-2xl animate-fadeIn overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-3 w-fit rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Leave Request Details
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-500">
                  Request #{selectedLeave.request_id}
                </p>
                <span
                  className={` px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                    selectedLeave.status
                  )}`}
                >
                  {selectedLeave.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={closeDetails}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-8 h-8 text-slate-500" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Leave Type
              </p>
              <p className="text-slate-800 font-semibold flex items-center gap-2">
                {selectedLeave.type_name}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration
              </p>
              <p className="text-slate-800 font-semibold">
                {selectedLeave.days} day{selectedLeave.days > 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-2">
                Start Date
              </p>
              <p className="text-slate-800 font-semibold">
                {formatDate(selectedLeave.start)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-2">
                End Date
              </p>
              <p className="text-slate-800 font-semibold">
                {formatDate(selectedLeave.end)}
              </p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-700 font-bold uppercase mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Employee's Reason
            </p>
            <p className="text-slate-700">{selectedLeave.reason}</p>
          </div>
          {isAdmin && selectedLeave.status === "Pending" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Admin Remarks
                <span className="text-rose-600 ml-1">*</span>
                <span className="text-xs font-normal text-slate-500 ml-2">
                  (Required for rejection)
                </span>
              </label>
              <textarea
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={4}
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="Enter your remarks here..."
              />
            </div>
          )}
          {selectedLeave.rejection_reason && (
            <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
              <p className="text-xs text-rose-700 font-bold uppercase mb-2">
                Rejection Reason
              </p>
              <p className="text-slate-700">{selectedLeave.rejection_reason}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button
            onClick={closeDetails}
            className="px-6 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-white rounded-lg transition"
          >
            Close
          </button>
          {isAdmin && selectedLeave.status === "Pending" && (
            <>
              <button
                className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 justify-center"
                onClick={handleReject}
              >
                <XCircle className="w-4 h-4" />
                Reject Request
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 justify-center"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Request
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailsModal;
