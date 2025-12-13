import React from "react";
import { Divide, Trash2 } from "lucide-react";
import { DTREntry, Employee } from "../../types/types";
import { calculateHours, formatName } from "../../utils/utils";
import * as DTRService from "../../services/dtr";
import { useToast } from "../../context/ToastContext";

interface DTRTableProps {
  dtrEntries: DTREntry[];
  employees: Employee[];
  showConfirm: (options: {
    message: string;
    type: "success" | "warning" | "info" | "danger";
    onConfirm: () => void;
  }) => void;
  filterEmp: string;
  filterMonth: string;
  loading: boolean;
  fetchDTRLogs: () => void;
}

const DTRTable: React.FC<DTRTableProps> = ({
  dtrEntries,
  employees,
  showConfirm,
  filterEmp,
  filterMonth,
  loading,
  fetchDTRLogs,
}) => {
  const { showToast } = useToast();

  const filteredDTRs = dtrEntries
    .filter((entry) => {
      const matchesEmp = filterEmp ? entry.employee_id === filterEmp : true;
      const matchesMonth = filterMonth
        ? entry.work_date.startsWith(filterMonth)
        : true;
      return matchesEmp && matchesMonth;
    })
    .sort((a, b) => b.work_date.localeCompare(a.work_date as string));

  const handleDelete = (dtr_id: string) => {
    showConfirm({
      message: "Are you sure you want to delete this log?",
      type: "danger",
      onConfirm: () => deleteDTRLogs(dtr_id),
    });
  };

  const deleteDTRLogs = async (dtr_id: string) => {
    try {
      await DTRService.deleteDTRLogs(dtr_id);
      showToast("success", "Log deleted successfully");
      fetchDTRLogs();
    } catch {
      showToast("error", "Failed to delete dtr log");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Desktop Table */}
      <table className="hidden md:table w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-sm font-semibold text-slate-600 text-right">
              ID
            </th>
            <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Date</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Shift</th>
            <th className="p-4 text-sm font-semibold text-slate-600">
              Regular
            </th>
            <th className="p-4 text-sm font-semibold text-slate-600">
              Overtime
            </th>
            <th className="p-4 text-sm font-semibold text-slate-600 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="p-4 text-center">
                Loading...
              </td>
            </tr>
          ) : filteredDTRs.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="p-8 text-center text-sm text-slate-500"
              >
                No time logs found.
              </td>
            </tr>
          ) : (
            filteredDTRs.map((entry, i) => {
              const emp = employees.find(
                (e) => e.employee_id === entry.employee_id
              );
              const totalHours = calculateHours(entry.time_in, entry.time_out);
              const regularHours = Math.min(totalHours.totalHours, 8);
              const overtimeHours = Math.max(totalHours.totalHours - 8, 0);

              return (
                <tr
                  key={entry.dtr_id || i}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 text-xs text-right font-medium text-slate-800">
                    {entry.employee_id}
                  </td>
                  <td className="p-4 font-medium text-sm text-slate-800">
                    {emp ? formatName(emp) : "Unknown"}
                    <p className="text-xs text-slate-500 font-normal">
                      {emp?.position}
                    </p>
                  </td>
                  <td className="p-4 text-xs text-slate-600">
                    {entry.work_date
                      ? new Date(entry.work_date).toLocaleDateString("en-CA")
                      : ""}
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-xs">
                    <span className="bg-slate-100 px-2 py-1 rounded">
                      {entry.time_in} - {entry.time_out}
                    </span>
                  </td>
                  <td className="p-4 text-slate-800 text-xs font-semibold">
                    {regularHours.toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-800 text-xs font-semibold">
                    {overtimeHours > 0 ? (
                      overtimeHours.toFixed(2)
                    ) : (
                      <div className="text-red-500">-</div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(entry.dtr_id)}
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 p-3">
        {loading ? (
          <p className="text-center text-sm">Loading...</p>
        ) : filteredDTRs.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            No time logs found.
          </p>
        ) : (
          filteredDTRs.map((entry, i) => {
            const emp = employees.find(
              (e) => e.employee_id === entry.employee_id
            );
            const totalHours = calculateHours(entry.time_in, entry.time_out);
            const regularHours = Math.min(totalHours.totalHours, 8);
            const overtimeHours = Math.max(totalHours.totalHours - 8, 0);

            return (
              <div
                key={entry.dtr_id || i}
                className="border border-slate-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600">
                    {entry.employee_id}
                  </p>
                  <button
                    onClick={() => handleDelete(entry.dtr_id)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-medium text-sm">
                  {emp ? formatName(emp) : "Unknown"}
                </p>
                <p className="text-xs text-slate-500">{emp?.position}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {entry.work_date
                    ? new Date(entry.work_date).toLocaleDateString("en-CA")
                    : ""}
                </p>
                <p className="text-xs mt-1 font-mono bg-slate-100 px-2 py-1 rounded">
                  {entry.time_in} - {entry.time_out}
                </p>
                <div className="flex justify-between mt-2 text-xs font-semibold text-slate-800">
                  <span>Regular: {regularHours.toFixed(2)} hrs</span>
                  <span>OT: {overtimeHours.toFixed(2)} hrs</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DTRTable;
