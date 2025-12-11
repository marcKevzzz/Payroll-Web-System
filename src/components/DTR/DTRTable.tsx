import React from "react";
import { Trash2 } from "lucide-react";
import { DTREntry, Employee } from "../../types/types";
import { calculateHours, formatName } from "../../utils/utils";
import * as DTRService from "../../services/dtr";
import { useToast } from "../../context/ToastContext";

interface DTRTableProps {
  dtrEntries: DTREntry[];
  setDtrEntries: (entries: DTREntry[]) => void;
  employees: Employee[];
  showConfirm: (options: {
    message: string;
    type: "success" | "warning" | "info" | "danger";
    onConfirm: () => void;
  }) => void;
  filterEmp: string;
  filterMonth: string;
  loading: boolean;
}

const DTRTable: React.FC<DTRTableProps> = ({
  dtrEntries,
  setDtrEntries,
  employees,
  showConfirm,
  filterEmp,
  filterMonth,
  loading,
}) => {
  const filteredDTRs = dtrEntries
    .filter((entry) => {
      const matchesEmp = filterEmp ? entry.employee_id === filterEmp : true;
      const matchesMonth = filterMonth
        ? entry.work_date.startsWith(filterMonth)
        : true;
      return matchesEmp && matchesMonth;
    })
    .sort((a, b) => b.work_date.localeCompare(a.work_date as string));

  const { showToast } = useToast();

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
      setDtrEntries(dtrEntries.filter((entry) => entry.dtr_id !== dtr_id));
      showToast("success", "Employee deleted successfully");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to delete employee");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-sm font-semibold text-slate-600 text-right">
              ID
            </th>
            <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Date</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Shift</th>
            <th className="p-4 text-sm font-semibold text-slate-600">
              Total Hours
            </th>
            <th className="p-4 text-sm font-semibold text-slate-600 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-4 text-center">
                Loading...
              </td>
            </tr>
          ) : filteredDTRs.length === 0 && filteredDTRs ? (
            <tr>
              <td
                colSpan={6}
                className="p-8 text-center text-sm text-slate-500"
              >
                No time logs found.
              </td>
            </tr>
          ) : (
            filteredDTRs.map((entry, i: number) => {
              const emp = employees.find(
                (e) => e.employee_id === entry.employee_id
              );
              const hours = calculateHours(entry.time_in, entry.time_out);

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
                    {hours.toFixed(2)} hrs
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
    </div>
  );
};

export default DTRTable;
