import React, { useState, useMemo } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import { Employee, DTREntry, PayrollResult } from './types';
import { calculateHours, calculateSSS, calculateBIR, formatCurrency, OT_MULTIPLIER } from './utils';

interface PayrollCalculatorProps {
  employees: Employee[];
  dtrEntries: DTREntry[];
}

export const PayrollCalculator = ({ employees, dtrEntries }: PayrollCalculatorProps) => {
  const [selectedEmp, setSelectedEmp] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  const calculation: PayrollResult | null = useMemo(() => {
    if (!selectedEmp) return null;
    
    const emp = employees.find(e => e.id === selectedEmp);
    if (!emp) return null;

    // Filter DTRs for this employee and selected month
    const relevantDTRs = dtrEntries.filter(d => 
      d.employeeId === selectedEmp && d.date.startsWith(month)
    );

    let totalRegularHours = 0;
    let totalOTHours = 0;

    relevantDTRs.forEach(d => {
      const hours = calculateHours(d.timeIn, d.timeOut);
      const regular = Math.min(8, hours);
      const ot = Math.max(0, hours - 8);
      totalRegularHours += regular;
      totalOTHours += ot;
    });

    const regularPay = totalRegularHours * emp.hourlyRate;
    const overtimePay = totalOTHours * emp.hourlyRate * OT_MULTIPLIER;
    const grossPay = regularPay + overtimePay;

    // Deductions
    const sssDeduction = calculateSSS(grossPay);
    const loanDeduction = emp.loanDeduction || 0;
    
    // Taxable Income = Gross - (SSS + PhilHealth + PagIbig). We only have SSS here per requirements.
    const taxableIncome = Math.max(0, grossPay - sssDeduction); 
    const birTax = calculateBIR(taxableIncome);

    const totalDeduction = sssDeduction + birTax + loanDeduction;
    const netPay = grossPay - totalDeduction;

    return {
      regularHours: totalRegularHours,
      overtimeHours: totalOTHours,
      regularPay,
      overtimePay,
      grossPay,
      sssDeduction,
      birTax,
      loanDeduction,
      totalDeduction,
      netPay
    };
  }, [selectedEmp, month, dtrEntries, employees]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="w-6 h-6" /> Payroll Computation
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Employee</label>
              <select 
                value={selectedEmp} 
                onChange={(e) => setSelectedEmp(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payroll Period (Month)</label>
              <input 
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
           </div>
         </div>

         {!calculation ? (
           <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
             Select an employee and period to generate payslip.
           </div>
         ) : (
           <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold text-lg">Payslip: {employees.find(e => e.id === selectedEmp)?.name}</h3>
                <span className="text-indigo-200 font-mono text-sm">{month}</span>
              </div>
              
              <div className="p-6 grid md:grid-cols-2 gap-8">
                {/* Earnings */}
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Earnings</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Regular Pay ({calculation.regularHours.toFixed(1)} hrs)</span>
                      <span className="font-medium">{formatCurrency(calculation.regularPay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overtime Pay ({calculation.overtimeHours.toFixed(1)} hrs)</span>
                      <span className="font-medium">{formatCurrency(calculation.overtimePay)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-100">
                      <span className="text-slate-800 font-bold">Gross Pay</span>
                      <span className="text-emerald-600 font-bold text-lg">{formatCurrency(calculation.grossPay)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Deductions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">SSS Contribution (5%)</span>
                      <span className="text-rose-600 font-medium">-{formatCurrency(calculation.sssDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">BIR Tax (TRAIN Law)</span>
                      <span className="text-rose-600 font-medium">-{formatCurrency(calculation.birTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Loan Deduction</span>
                      <span className="text-rose-600 font-medium">-{formatCurrency(calculation.loanDeduction)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-100">
                      <span className="text-slate-800 font-bold">Total Deductions</span>
                      <span className="text-rose-600 font-bold">-{formatCurrency(calculation.totalDeduction)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
                 <div className="text-slate-500 text-sm">
                   <p>Net Pay Formula = Gross - (SSS + BIR + Loan)</p>
                 </div>
                 <div className="text-right">
                   <span className="block text-sm text-slate-500">Net Pay</span>
                   <span className="block text-3xl font-bold text-indigo-700">{formatCurrency(calculation.netPay)}</span>
                 </div>
              </div>
           </div>
         )}
      </div>

      {calculation && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Tax Calculation Note:</strong> The BIR tax is calculated using the standard Monthly Tax Table (TRAIN Law) based on the accumulated gross pay for the selected period.
          </div>
        </div>
      )}
    </div>
  );
};
