import React from "react";
import { PayrollResult, Employee } from "../../../../types/types";
import { formatCurrency, getMinHourlyWage } from "../../../../utils/utils";

interface DeductionsTableProps {
  result: PayrollResult;
  loanBalanceAfter?: number;
  employee: Employee;
}

const DeductionsTable: React.FC<DeductionsTableProps> = ({
  result,
  loanBalanceAfter,
  employee,
}) => {
  const totalDeductions =
    result.sssDeduction +
    result.pagIbigDeduction +
    result.philHealthDeduction +
    result.birTax +
    result?.loanDeduction;
  const isMWE = result.hourly_rate <= getMinHourlyWage();
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-800 pb-2 mb-4">
        Deductions
      </h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-xs text-left">
            <th className="pb-2 font-medium">Description</th>
            <th className="pb-2 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2">SSS Contribution</td>
            <td className="text-right font-medium text-rose-600">
              ({formatCurrency(result.sssDeduction)})
            </td>
          </tr>
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2">Pag-IBIG Fund</td>
            <td className="text-right font-medium text-rose-600">
              ({formatCurrency(result.pagIbigDeduction)})
            </td>
          </tr>
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2">PhilHealth</td>
            <td className="text-right font-medium text-rose-600">
              ({formatCurrency(result.philHealthDeduction)})
            </td>
          </tr>
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2">
              Withholding Tax (BIR)
              {isMWE && (
                <span className="block text-[10px] text-emerald-600 font-medium">
                  MWE - Tax Exempt
                </span>
              )}
            </td>
            <td className="text-right font-medium text-rose-600">
              ({formatCurrency(result.birTax)})
            </td>
          </tr>
          <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2 align-top">
              Loan Repayment
              <div className="mt-1 space-y-0.5">
                <div className="text-[10px] text-slate-400">
                  Remaining Balance: {formatCurrency(loanBalanceAfter || 0)}
                </div>
                <div className="text-[10px] text-amber-600 font-medium">
                  Fixed @ 25% Net
                </div>
              </div>
            </td>
            <td className="text-right font-medium text-rose-600 align-top">
              {result.loanDeduction > 0
                ? `(${formatCurrency(result.loanDeduction)})`
                : "-"}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="pt-4 font-bold text-slate-800">Total Deductions</td>
            <td className="pt-4 text-right font-bold text-rose-600">
              ({formatCurrency(totalDeductions)})
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default DeductionsTable;
