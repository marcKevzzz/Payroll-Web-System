import React, { useState } from 'react';
import { Clock, Save, Trash2 } from 'lucide-react';
import { Employee, DTREntry } from './types';
import { calculateHours } from './utils';

interface DTRManagerProps {
  employees: Employee[];
  dtrEntries: DTREntry[];
  setDtrEntries: (d: DTREntry[]) => void;
}

export const DTRManager = ({ employees, dtrEntries, setDtrEntries }: DTRManagerProps) => {
  const [empId, setEmpId] = useState('');
  const [date, setDate] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');

  const addDTR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId || !date || !timeIn || !timeOut) return;
    
    const newEntry: DTREntry = {
      id: Date.now().toString(),
      employeeId: empId,
      date,
      timeIn,
      timeOut
    };

    setDtrEntries([newEntry, ...dtrEntries]);
    // Reset only times to allow quick adding for same emp/date sequence
    setTimeIn('');
    setTimeOut('');
  };

  const deleteDTR = (id: string) => {
    setDtrEntries(dtrEntries.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-6 h-6" /> Daily Time Record (DTR)
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={addDTR} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
              <select 
                value={empId} 
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                required
              >
                <option value="">Select...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time In</label>
              <input 
                type="time" 
                value={timeIn} 
                onChange={(e) => setTimeIn(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Out</label>
              <input 
                type="time" 
                value={timeOut} 
                onChange={(e) => setTimeOut(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Save className="w-4 h-4" /> Log Time
            </button>
          </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Employee</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Date</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Shift</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Total Hours</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dtrEntries.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No time logs yet.</td></tr>
            ) : (
              dtrEntries.map(entry => {
                const emp = employees.find(e => e.id === entry.employeeId);
                const hours = calculateHours(entry.timeIn, entry.timeOut);
                return (
                  <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{emp?.name || 'Unknown'}</td>
                    <td className="p-4 text-slate-600">{entry.date}</td>
                    <td className="p-4 text-slate-600 font-mono text-xs bg-slate-100 rounded inline-block my-2 mx-4">{entry.timeIn} - {entry.timeOut}</td>
                    <td className="p-4 text-slate-800 font-semibold">{hours.toFixed(2)} hrs</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteDTR(entry.id)}
                        className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
