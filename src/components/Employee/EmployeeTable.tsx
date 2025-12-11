import { Trash2, Pencil } from "lucide-react";
import { Employee } from "../../types/types";
import { formatCurrency, formatName } from "../../utils/utils";

interface Props {
  employees: Employee[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function EmployeeTable({ employees, onDelete, onEdit }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b ">
            <th className="py-4 px-3 text-right font-semibold text-slate-600">
              ID
            </th>
            <th className="py-4 px-3 text-left font-semibold text-slate-600">
              Employee
            </th>
            <th className="py-4 px-3 text-left font-semibold text-slate-600">
              Contacts
            </th>
            <th className="py-4 px-3 text-left font-semibold text-slate-600">
              Role
            </th>
            <th className="py-4 px-3 text-left font-semibold text-slate-600">
              Financials
            </th>
            <th className="py-4 px-3 text-left font-semibold text-slate-600">
              Date Hired
            </th>
            <th className="py-4 px-3 text-right font-semibold text-slate-600">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-500">
                No employees found.
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.employee_id} className="border-b hover:bg-slate-50">
                <td className="py-4 px-3 text-right font-semibold">
                  <div className="text-xs ">{emp.employee_id}</div>
                </td>

                <td className="py-4 px-3">
                  <div className="font-semibold">{formatName(emp)}</div>
                </td>
                <td className="py-4 px-3">
                  <div className="text-xs text-slate-500">{emp.phone}</div>
                  <div className="text-xs text-slate-500">{emp.email}</div>
                </td>

                <td className="py-4 px-3">
                  <div>{emp.position}</div>
                  <div className="text-xs bg-slate-100 inline-block px-2 rounded">
                    {emp.department}
                  </div>
                </td>

                <td className="py-4 px-3">
                  {formatCurrency(emp.hourly_rate)}/hr
                  {emp.loan_amount > 0 && (
                    <div className="text-xs text-rose-600">
                      Loan: {formatCurrency(emp.loan_amount)}
                    </div>
                  )}
                </td>
                <td className="py-4 px-3">
                   <div className="text-xs text-slate-500">{new Date(emp.created_at).toLocaleDateString("en-CA")}</div>
                </td>

                <td className="py-4 px-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(emp.employee_id)}
                    className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(emp.employee_id)}
                    className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
