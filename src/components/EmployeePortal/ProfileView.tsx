// src/components/ProfileView.jsx

import React from "react";
import { Edit } from "lucide-react";
import { useEmployeeContext } from "@/src/context/EmployeeContext";
import { Employee } from "@/src/types/types";

interface ProfileViewProps {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  employee: Employee;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  employee,
  editMode,
  setEditMode,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">My Profile</h3>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal information
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition text-sm"
        >
          <Edit className="w-4 h-4" />
          {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={employee.first_name}
              disabled={!editMode}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={employee.last_name}
              disabled={!editMode}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={employee.email}
              disabled={!editMode}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={employee.phone}
              disabled={!editMode}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Position
            </label>
            <input
              type="text"
              value={employee.position}
              disabled
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employee.employee_id}
              disabled
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-500 font-mono"
            />
          </div>
        </div>
        {editMode && (
          <div className="mt-6 flex gap-3">
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
