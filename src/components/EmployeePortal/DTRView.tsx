import React from "react"; // Removed useState, useEffect as they are not needed here

import { formatDate, calculateHours } from "@/src/utils/utils";

import { DTREntry } from "@/src/types/types";

interface DTRViewInterface {
  dtrEntries: DTREntry[];
}

const DTRView: React.FC<DTRViewInterface> = ({ dtrEntries }) => {
  // Removed: const [calculateOt, setCalculateOt] = useState(0);

  // Removed: useEffect hook

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Daily Time Record</h3>

        <p className="text-sm text-slate-500 mt-1">Recent attendance records</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Time In
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                Time Out
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                Hours
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                Overtime
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {dtrEntries.map((record: DTREntry, idx: number) => {
              // 1. CALCULATE HOURS and OT PER RECORD

              const { totalHours } = calculateHours(
                record.time_in,
                record.time_out
              );

              const dailyOt = Math.max(0, totalHours - 8); // Overtime is hours > 8

              return (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                    {formatDate(record.work_date as string)}
                  </td>

                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {record.time_in}
                  </td>

                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {record.time_out}
                  </td>

                  <td className="px-6 py-4 text-sm text-right font-mono text-slate-700">
                    {/* 2. DISPLAY TOTAL HOURS */}

                    {totalHours.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-sm text-right font-mono text-amber-600 font-medium">
                    {/* 3. DISPLAY DAILY OT */}

                    {dailyOt > 0 ? `+${dailyOt.toFixed(2)}` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DTRView;
