import React, { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Employee, DTREntry } from './types';
import { formatCurrency } from './utils';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: (e: Employee[]) => void;
  dtrEntries: DTREntry[];
  setDtrEntries: (d: DTREntry[]) => void;
}

export const EmployeeManager = ({ employees, setEmployees, dtrEntries, setDtrEntries }: EmployeeManagerProps) => {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [loan, setLoan] = useState('');

  const addEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rate) return;
    const newEmp: Employee = {
      id: Date.now().toString(),
      name,
      hourlyRate: parseFloat(rate),
      loanDeduction: parseFloat(loan) || 0
    };
    setEmployees([...employees, newEmp]);
    setName('');
    setRate('');
    setLoan('');
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    // Also cleanup DTRs linked to this employee
    setDtrEntries(dtrEntries.filter(d => d.employeeId !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
       <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6" /> Employee Management
       </h2>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={addEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Juan Dela Cruz"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (₱)</label>
              <input 
                type="number" 
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loan Deduction (₱)</label>
              <input 
                type="number" 
                value={loan}
                onChange={(e) => setLoan(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Fixed amount per payroll"
                step="0.01"
              />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          </form>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Hourly Rate</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Monthly Loan</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No employees added yet.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{emp.name}</td>
                    <td className="p-4 text-slate-600">{formatCurrency(emp.hourlyRate)}/hr</td>
                    <td className="p-4 text-slate-600">{formatCurrency(emp.loanDeduction)}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteEmployee(emp.id)}
                        className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
       </div>
    </div>
  );
};
