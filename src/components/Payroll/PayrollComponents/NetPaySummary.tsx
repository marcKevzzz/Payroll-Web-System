import React from "react";
import { formatCurrency } from "../../../utils/utils";

interface NetPaySummaryProps {
  netPay: number;
}

const NetPaySummary: React.FC<NetPaySummaryProps> = ({ netPay }) => (
  <div className="bg-slate-900 text-white p-8 flex flex-col md:flex-row justify-between items-center print:bg-slate-200 print:text-black rounded-b-xl">
    <div className="text-center md:text-left mb-4 md:mb-0">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
        Net Pay Calculation
      </p>
      <p className="text-xs text-slate-500">Gross Pay - Total Deductions</p>
    </div>
    <div className="text-center md:text-right">
      <span className="block text-4xl font-extrabold tracking-tight">
        {formatCurrency(netPay)}
      </span>
      <span className="block text-xs text-emerald-400 font-medium uppercase mt-1">
        Total Net Income
      </span>
    </div>
  </div>
);

export default NetPaySummary;
