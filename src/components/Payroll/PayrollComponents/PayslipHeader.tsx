import React from "react";
import { Employee } from "../../../types/types";

interface PayslipHeaderProps {
  employee: Employee;
  month: string;
}

const PayslipHeader: React.FC<PayslipHeaderProps> = ({ employee, month }) => {
  return (
    <div className="p-8 border-b border-slate-200 flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-widest text-indigo-900">
          Payslip
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          PAYROLL PRO SYSTEM INC.
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-slate-400 uppercase">Pay Period</p>
        <p className="font-mono font-bold text-lg text-slate-700">{month}</p>
        <p className="text-xs text-slate-400 mt-1">
          Generated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PayslipHeader;
