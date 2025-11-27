import React from 'react';
import { Users, Clock, DollarSign } from 'lucide-react';
import { Employee, DTREntry } from './types';
import { calculateHours, formatCurrency, OT_MULTIPLIER } from './utils';

interface DashboardProps {
  employees: Employee[];
  dtrEntries: DTREntry[];
}

export const Dashboard = ({ employees, dtrEntries }: DashboardProps) => {
  const totalEmployees = employees.length;
  
  // Rough estimate of monthly cost based on logged DTRs
  const totalGrossEstimate = dtrEntries.reduce((acc, entry) => {
    const emp = employees.find(e => e.id === entry.employeeId);
    if (!emp) return acc;
    const hours = calculateHours(entry.timeIn, entry.timeOut);
    const reg = Math.min(8, hours);
    const ot = Math.max(0, hours - 8);
    return acc + (reg * emp.hourlyRate) + (ot * emp.hourlyRate * OT_MULTIPLIER);
  }, 0);

  const totalHoursLogged = dtrEntries.reduce((acc, entry) => {
    return acc + calculateHours(entry.timeIn, entry.timeOut);
  }, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Employees</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{totalEmployees}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Gross Payroll Logged</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(totalGrossEstimate)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Hours Tracked</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalHoursLogged.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">System Guide</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="p-4 bg-slate-50 rounded-lg">
            <strong className="block text-slate-800 mb-1">Step 1: Add Employees</strong>
            Create employee profiles with their hourly rate and agreed loan deduction amounts.
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <strong className="block text-slate-800 mb-1">Step 2: Log DTR</strong>
            Enter Time In and Time Out records. The system automatically separates Regular vs Overtime (Over 8 hours).
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <strong className="block text-slate-800 mb-1">Step 3: Payroll</strong>
            Go to Payroll, select an employee and a month. The system calculates SSS (5% share), BIR (TRAIN Law), and Loan deductions automatically.
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <strong className="block text-slate-800 mb-1">Overtime Policy</strong>
            Excess of 8 hours is multiplied by {OT_MULTIPLIER}x the hourly rate.
          </div>
        </div>
      </div>
    </div>
  );
};
