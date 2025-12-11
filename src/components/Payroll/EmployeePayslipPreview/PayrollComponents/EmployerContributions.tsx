import React from "react";
import { PayrollResult } from "../../../../types/types";
import { formatCurrency } from "../../../../utils/utils";

interface EmployerContributionsProps {
  result: PayrollResult;
}

const EmployerContributions: React.FC<EmployerContributionsProps> = ({
  result,
}) => (
  <div className="mt-8 pt-4 border-t border-dashed border-slate-300">
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
      Employer Contributions (Not Deducted)
    </h4>
    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
      <div className="flex justify-between text-sm text-slate-600">
        <span>SSS (EC)</span>
        <span className="font-mono">{formatCurrency(result.sssEC)}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Pag-IBIG</span>
        <span className="font-mono">{formatCurrency(result.pagIbigEC)}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>PhilHealth</span>
        <span className="font-mono">{formatCurrency(result.philHealthEC)}</span>
      </div>
    </div>
  </div>
);

export default EmployerContributions;
