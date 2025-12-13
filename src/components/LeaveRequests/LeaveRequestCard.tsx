import React from "react";
import { Calendar, Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "../../utils/utils";

const LeaveRequestCard = ({ leave, openDetails, getStatusColor, isAdmin }) => {
  return (
    <div
      key={leave.request_id}
      onClick={() => openDetails(leave)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2">
        <div className="flex-1 space-y-2 w-full ">
          <div className="flex items-start justify-start gap-3 w-full flex-wrap">
            <div className="min-w-[70px]">
              <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition">
                {leave.type_name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Request ID: #{leave.request_id}
              </p>
            </div>
            <span
              className={`px-3 py-1 mt-1 rounded-full text-xs font-bold border ${getStatusColor(
                leave.status
              )}`}
            >
              {leave.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Start Date</p>
                <p className="text-slate-700 font-semibold truncate">
                  {formatDate(leave.start)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">End Date</p>
                <p className="text-slate-700 font-semibold truncate">
                  {formatDate(leave.end)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Duration</p>
                <p className="text-slate-700 font-semibold truncate">
                  {leave.days} day{leave.days > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {leave.reason && (
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Reason
              </p>
              <p className="text-sm text-slate-700 truncate">{leave.reason}</p>
            </div>
          )}
        </div>

        {isAdmin && leave.status === "Pending" ? (
          <div className="flex sm:flex-col flex-row gap-2  sm:mt-0 w-full sm:w-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetails(leave);
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 justify-center"
            >
              <CheckCircle className="w-3 h-3" />
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetails(leave);
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 justify-center"
            >
              <XCircle className="w-3 h-3" />
              Reject
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LeaveRequestCard;
