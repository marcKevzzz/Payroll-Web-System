import { Employee } from '@/src/types/types'
import { formatCurrency } from '@/src/utils/utils'
import { CalendarRange, Printer } from 'lucide-react'
import React from 'react'

interface GenerateAllPayslip {
  employees: Employee[];
}

const GenerateAllPayslip: React.FC<GenerateAllPayslip> = ({ employees }) => {
  return (
    <div className="animate-fadeIn">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-end gap-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fiscal Year</label>
                  <input 
                    type="number"
                    
                    className="w-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <CalendarRange className="w-5 h-5 text-indigo-500" /> Annual Payroll Summary 
                 </h3>
                 <button 
                    onClick={() => window.print()}
                    className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                 >
                    <Printer className="w-4 h-4" /> Print Report
                 </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                    <th className="p-4">Employee</th>
                    <th className="p-4 text-right">Total Gross</th>
                    <th className="p-4 text-right">Total SSS</th>
                    <th className="p-4 text-right">Total Tax</th>
                    <th className="p-4 text-right">Total Loan Paid</th>
                    <th className="p-4 text-right">Total Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No data found.</td></tr>
                  ) : (
                    employees.map(data => (
                      <tr key={data.employee_id} className="border-b border-slate-100 hover:bg-slate-50 text-sm">
                        {/* <td className="p-4 font-bold text-slate-700">{data.first_name}</td>
                        <td className="p-4 text-right font-medium text-slate-600">{formatCurrency(data.gross)}</td>
                        <td className="p-4 text-right text-rose-600">({formatCurrency(data.sss)})</td>
                        <td className="p-4 text-right text-rose-600">({formatCurrency(data.bir)})</td>
                         <td className="p-4 text-right text-rose-600">({formatCurrency(data.loan)})</td>
                        <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(data.net)}</td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>
        </div>
  )
}

export default GenerateAllPayslip