import React from "react";
import { DTREntry } from "../../types/types";

interface Props {
  dtrEntries: DTREntry[];
  month: string;
}

const DTRViewer: React.FC<Props> = ({ dtrEntries, month }) => {
  const filteredDTR = dtrEntries.filter(
    (d) => d.work_date && d.work_date.startsWith(month)
  );

  if (!filteredDTR.length)
    return <p className="text-gray-500">No DTR records for this month.</p>;

  return (
    <table className="w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">Date</th>
          <th className="border px-4 py-2">Time In</th>
          <th className="border px-4 py-2">Time Out</th>
          <th className="border px-4 py-2">Hours Worked</th>
        </tr>
      </thead>
      <tbody>
        {filteredDTR.map((d) => (
          <tr key={d.work_date}>
            <td className="border px-4 py-2">{d.work_date}</td>
            <td className="border px-4 py-2">{d.time_in}</td>
            <td className="border px-4 py-2">{d.time_out}</td>
            <td className="border px-4 py-2">{d.hours_worked}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DTRViewer;
