import React from "react";
import { PayrollResult } from "../../types/types";

interface Props {
  payslip: PayrollResult | null;
  onClose: () => void;
}

const PayslipDetails: React.FC<Props> = ({ payslip, onClose }) => {
  if (!payslip) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">
          Payslip: {payslip.pay_period_start} - {payslip.pay_period_end}
        </h2>

        <section className="mb-4">
          <h3 className="font-semibold mb-2">Earnings</h3>
          <ul className="list-disc list-inside">
            <li>Regular Hours: {payslip.regular_hours} hrs</li>
            <li>Overtime Hours: {payslip.overtime_hours} hrs</li>
            <li>Gross Pay: ₱{payslip.gross_pay}</li>
            <li>Net Pay: ₱{payslip.net_pay}</li>
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold mb-2">Deductions</h3>
          {payslip.deductions?.length ? (
            <ul className="list-disc list-inside">
              {payslip.deductions.map((d, idx) => (
                <li key={idx}>
                  {d.deduction_type}: ₱{d.deduction_amount}
                </li>
              ))}
            </ul>
          ) : (
            <p>No deductions</p>
          )}
        </section>

        <section>
          <h3 className="font-semibold mb-2">Holidays</h3>
          {payslip.holidays?.length ? (
            <ul className="list-disc list-inside">
              {payslip.holidays.map((h, idx) => (
                <li key={idx}>
                  {h.holiday_name} ({h.holiday_type}) - {h.holiday_hours} hrs, ₱
                  {h.holiday_pay}
                </li>
              ))}
            </ul>
          ) : (
            <p>No holiday pay</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default PayslipDetails;
