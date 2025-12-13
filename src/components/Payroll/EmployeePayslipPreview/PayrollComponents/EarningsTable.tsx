import React from "react";

import { PayrollResult } from "../../../../types/types";

import { formatCurrency, OT_MULTIPLIER } from "../../../../utils/utils";

// Assuming this is your updated EarningsTable.tsx

// NOTE: Ensure 'holiday_unworked_pay', 'nsd_hours', 'positionBenefit', 'nsdPay', etc.

// are added to the PayrollResult type from your calculation utility.

interface EarningsTableProps {
  employeeRate: number;

  result: PayrollResult;
}

const EarningsTable: React.FC<EarningsTableProps> = ({
  employeeRate,

  result,
}) => {
  const regularPay = result.regular_hours * employeeRate; // Values taken directly from the processed result object

  const otPay = result.overtime_pay;

  const rhPay = result.regular_holiday_pay; // Premium pay for worked RH

  const shPay = result.special_holiday_pay;

  const nsdPay = result.nsd_pay;

  // START OF CHANGE: New state variable for Unworked Regular Holiday Pay

  const unworkedRhPay = result.holiday_unworked_pay || 0;

  // END OF CHANGE

  const regularHoliday = result.holidayBreakdowns.find(
    (h) => h.type === "Regular"
  );

  const specialHoliday = result.holidayBreakdowns.find(
    (h) => h.type === "Special Non-Working" || h.type === "Special"
  );

  const positionBenefit = result.positionBenefit || 0;

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
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2">Regular Pay</td>
            <td className="text-right font-mono text-slate-500 text-xs px-1">
              {formatCurrency(employeeRate)}
            </td>
            <td className="text-right text-xs pl-2 font-mono text-slate-500">
              {result.regular_hours.toFixed(2)}
            </td>
            <td className="text-right font-medium">
              {formatCurrency(regularPay)}
            </td>
          </tr>

          {unworkedRhPay > 0 && (
            <tr className="border-b border-slate-100 last:border-0 bg-indigo-50/50">
              <td className="py-1 pl-1 text-sm ">
                Unworked Regular Holiday Pay
                <span className="block -mt-1 text-[10px] text-indigo-600 font-medium">
                  100% daily wage (Fixed)
                </span>
              </td>
              <td
                className="text-right font-mono text-slate-500 text-xs"
                colSpan={2}
              >
                -
              </td>
              <td className="text-right font-medium text-indigo-700">
                {formatCurrency(unworkedRhPay)}
              </td>
            </tr>
          )}

          {rhPay > 0 && (
            <tr className="border-b border-slate-100 last:border-0 bg-blue-50/50">
              <td className="py-1 pl-1 text-sm">
                Worked Regular Holiday Pay (Premium)
                <span className="block text-[10px] -mt-1 text-blue-600 font-medium">
                  Premium for working (200% total compensation).
                </span>
              </td>
              <td
                className="text-right font-mono text-slate-500 text-xs"
                colSpan={2}
              >
                {regularHoliday?.hours.toFixed(2)}
              </td>
              <td className="text-right font-medium text-blue-700">
                {formatCurrency(rhPay)}
              </td>
            </tr>
          )}
          {shPay > 0 && (
            <tr className="border-b border-slate-100 last:border-0 bg-yellow-50/50">
              <td className="py-1 pl-1 text-sm">
                Special Holiday Pay
                <span className="block -mt-1 text-[10px] text-amber-600 font-medium">
                  Includes 130% base pay.
                </span>
              </td>
              <td
                className="text-right font-mono text-slate-500 text-xs"
                colSpan={2}
              >
                {specialHoliday?.hours.toFixed(2)}
              </td>
              <td className="text-right font-medium text-amber-700">
                {formatCurrency(shPay)}
              </td>
            </tr>
          )}
          {nsdPay > 0 && (
            <tr className="border-b border-slate-100 last:border-0 bg-purple-50/50">
              <td className="py-1 pl-1 text-sm">
                Night Shift Differential
                <span className="block -mt-1 text-[10px] text-purple-600 font-medium">
                  10% premium (10PM - 6AM)
                </span>
              </td>
              <td
                className="text-right font-mono text-slate-500 text-xs"
                colSpan={2}
              >
                {result.nsd_hours.toFixed(2)}
              </td>
              <td className="text-right font-medium text-purple-700">
                {formatCurrency(nsdPay)}
              </td>
            </tr>
          )}
          {otPay > 0 && (
            <tr className="border-b border-slate-100 last:border-0 bg-green-50/50">
              <td className="py-2 pl-1 text-sm">
                Overtime Pay
                <span className="block -mt-1 text-[10px] text-green-600 font-medium">
                  (Includes statutory premium)
                </span>
              </td>
              <td
                className="text-right font-mono text-slate-500 text-xs"
                colSpan={2}
              >
                {result.overtime_hours.toFixed(2)}
              </td>
              <td className="text-right font-medium text-green-700">
                {formatCurrency(otPay)}
              </td>
            </tr>
          )}

          {positionBenefit > 0 && (
            <tr className="border-b border-slate-100 last:border-0">
              <td className="py-1 text-xs font-semibold">
                Position Benefit / Allowance
              </td>
              <td
                className="text-right font-mono text-slate-500 text-xs"
                colSpan={2}
              >
                FIXED
              </td>
              <td className="text-right font-medium">
                {formatCurrency(positionBenefit)}
              </td>
            </tr>
          )}
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
