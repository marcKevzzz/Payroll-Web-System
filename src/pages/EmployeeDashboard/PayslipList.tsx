import React from "react";
import { PayrollResult } from "../../types/types";

interface Props {
  payslips: PayrollResult[];
  onSelectMonth: (month: string) => void;
}

const PayslipList: React.FC<Props> = ({ payslips, onSelectMonth }) => {
  if (!payslips.length)
    return <p className="text-gray-500">No payslips available yet.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {payslips.map((p) => {
        const month = p.pay_period_end.slice(0, 7); // YYYY-MM
        return (
          <div
            key={month}
            className="p-4 border rounded-lg shadow hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectMonth(month)}
          >
            <h3 className="font-semibold">{month}</h3>
            <p>Gross Pay: ₱{p.gross_pay}</p>
            <p>Net Pay: ₱{p.net_pay}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PayslipList;
