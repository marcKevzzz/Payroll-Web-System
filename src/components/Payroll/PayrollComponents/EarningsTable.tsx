import React from "react";
import { PayrollResult } from "../../../types/types";
import { formatCurrency, OT_MULTIPLIER } from "../../../utils/utils";

interface EarningsTableProps {
  employeeRate: number;
  result: PayrollResult;
}

const EarningsTable: React.FC<EarningsTableProps> = ({
  employeeRate,
  result,
}) => {
  const regularPay = result.regular_hours * employeeRate;
  const overtimePay = result.overtime_hours * employeeRate * OT_MULTIPLIER;

  const regularHoliday = result.holidayBreakdowns.find(
    (h) => h.type === "Regular"
  );
  const specialHoliday = result.holidayBreakdowns.find(
    (h) => h.type === "Special Non-Working"
  );

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-800 pb-2 mb-4">
        Earnings
      </h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-xs text-left">
            <th className="pb-2 font-medium">Description</th>
            <th className="pb-2 font-medium text-right">Rate</th>
            <th className="pb-2 font-medium text-right">Hrs</th>
            <th className="pb-2 font-medium text-right">Amount</th>
          </tr>
        </thead>

        <tbody className="text-slate-700">
          {/* Regular Pay */}
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2">Regular Pay</td>
            <td className="text-right font-mono text-slate-500 text-xs">
              {formatCurrency(employeeRate)}
            </td>
            <td className="text-right font-mono text-slate-500">
              {result.regular_hours.toFixed(2)}
            </td>
            <td className="text-right font-medium">
              {formatCurrency(regularPay)}
            </td>
          </tr>

          {/* Regular Holiday */}
          {regularHoliday && regularHoliday.pay > 0 && (
            <tr className="border-b border-slate-100 last:border-0 bg-blue-50/50">
              <td className="py-2 pl-2">
                Regular Holiday
                <span className="block text-[10px] text-blue-600 font-medium">
                  Double Pay
                </span>
              </td>
              <td className="text-right font-mono text-slate-500 text-xs">
                {formatCurrency(employeeRate * 2)}
              </td>
              <td className="text-right font-mono text-slate-500">
                {regularHoliday.hours.toFixed(2)}
              </td>
              <td className="text-right font-medium text-blue-700">
                {formatCurrency(regularHoliday.pay)}
              </td>
            </tr>
          )}

          {/* Special Holiday */}
          {specialHoliday && specialHoliday.pay > 0 && (
            <tr className="border-b border-slate-100 last:border-0 bg-yellow-50/50">
              <td className="py-2 pl-2">
                Special Holiday
                <span className="block text-[10px] text-amber-600 font-medium">
                  130% Pay
                </span>
              </td>
              <td className="text-right font-mono text-slate-500 text-xs">
                {formatCurrency(employeeRate * 1.3)}
              </td>
              <td className="text-right font-mono text-slate-500">
                {specialHoliday.hours.toFixed(2)}
              </td>
              <td className="text-right font-medium text-amber-700">
                {formatCurrency(specialHoliday.pay)}
              </td>
            </tr>
          )}

          {/* Overtime */}
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2">
              Overtime{" "}
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded ml-2">
                x{OT_MULTIPLIER}
              </span>
            </td>
            <td className="text-right font-mono text-slate-500 text-xs">
              {formatCurrency(employeeRate * OT_MULTIPLIER)}
            </td>
            <td className="text-right font-mono text-slate-500">
              {result.overtime_hours.toFixed(2)}
            </td>
            <td className="text-right font-medium">
              {formatCurrency(overtimePay)}
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td className="pt-4 font-bold text-slate-800" colSpan={3}>
              Gross Pay
            </td>
            <td className="pt-4 text-right font-bold text-emerald-600 text-lg">
              {formatCurrency(result.gross_pay)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default EarningsTable;
