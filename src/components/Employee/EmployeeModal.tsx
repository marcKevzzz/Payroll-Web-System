import React, { useState, useEffect } from "react";
import { AlertTriangle, Briefcase, Phone, User, Plus } from "lucide-react";
import {
  DEPARTMENTS,
  POSITIONS,
  getMinHourlyWage,
  formatCurrency,
} from "../../utils/utils";
import { Employee } from "../../types/types";
import { useToast } from "../../context/ToastContext"; // your toast context

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  editEmployee?: Employee | null;
}

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  onEdit,
  editEmployee,
}: Props) {
  const [first_name, setfirst_name] = useState("");
  const [middle_name, setmiddle_name] = useState("");
  const [last_name, setlast_name] = useState("");
  const [phone, setphone] = useState("");
  const [email, setemail] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [position, setPosition] = useState(POSITIONS[DEPARTMENTS[0]][0]);
  const [rate, setRate] = useState("");
  const [totalLoan, setTotalLoan] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { showToast } = useToast();

  const PH_PHONE_REGEX = /^(?:\+639|639|09)\d{9}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const generateEmpId = (lastId?: string): string => {
    const year = new Date().getFullYear() % 100; // Last two digits of year, e.g., 2025 → 25
    let nextNumber = 1;

    if (lastId) {
      const parts = lastId.split("-");
      if (parts.length === 2 && parseInt(parts[0]) === year) {
        nextNumber = parseInt(parts[1]) + 1;
      }
    }

    const paddedNumber = String(nextNumber).padStart(4, "0");
    return `${year}-${paddedNumber}`;
  };

  // Load edit data
  useEffect(() => {
    if (editEmployee) {
      setfirst_name(editEmployee.first_name);
      setmiddle_name(editEmployee.middle_name);
      setlast_name(editEmployee.last_name);
      setphone(editEmployee.phone);
      setemail(editEmployee.email);
      setDepartment(editEmployee.department);
      setPosition(editEmployee.position);
      setRate(String(editEmployee.hourly_rate));
      setTotalLoan(String(editEmployee?.loan_amount) || "0");
      setErrors([]);
    } else {
      setfirst_name("");
      setmiddle_name("");
      setlast_name("");
      setphone("");
      setemail("");
      setDepartment(DEPARTMENTS[0]);
      setPosition(POSITIONS[DEPARTMENTS[0]][0]);
      setRate("");
      setTotalLoan("0");
      setErrors([]);
    }
  }, [editEmployee]);

  useEffect(() => {
    if (isOpen) {
      document.getElementById("firstNameInput")?.focus();
    }
  }, [isOpen]);

  // Early return
  if (!isOpen) return null;

  const handleDeptChange = (newDept: string) => {
    setDepartment(newDept);
    setPosition(POSITIONS[newDept][0] || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    const parsedRate = parseFloat(rate);
    const parsedLoan = parseFloat(totalLoan) || 0;
    const minWage = getMinHourlyWage();

    if (!first_name.trim()) {
      newErrors.push(
        `First ${!last_name.trim() ? "and Last" : ""} name are required.`
      );
    }
    if (!last_name.trim() && first_name.trim()) {
      newErrors.push(`Last name are required.`);
    }

    if (!parsedRate || parsedRate <= 0) {
      newErrors.push("Hourly rate must be a valid number.");
    }
    if (parsedRate < minWage) {
      newErrors.push(
        `Rate is below Minimum Wage (${formatCurrency(minWage)} per hour).`
      );
    }
    if (!email.trim()) {
      newErrors.push("Email address is required.");
    }
    if (email.trim() && !EMAIL_REGEX.test(email)) {
      newErrors.push("Invalid email address.");
    }

    if (phone.trim() && !PH_PHONE_REGEX.test(phone)) {
      newErrors.push("Invalid mobile number. ");
    }
    if (parsedLoan < 0) {
      newErrors.push("Loan cannot be negative.");
    }

    setErrors(newErrors);
    if (newErrors.length > 0) return;

    try {
      const newEmp: Employee = {
        employee_id: editEmployee ? editEmployee.employee_id : undefined,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        department,
        position,
        hourly_rate: parsedRate,
        loan_amount: parsedLoan,
      };

      if (editEmployee) onEdit(newEmp);
      else onSave(newEmp);

      // Clear form
      setfirst_name("");
      setmiddle_name("");
      setlast_name("");
      setphone("");
      setemail("");
      setDepartment(DEPARTMENTS[0]);
      setPosition(POSITIONS[DEPARTMENTS[0]][0]);
      setRate("");
      setTotalLoan("0");

      onClose();
    } catch (error) {
      showToast("error", "Something went wrong while saving.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex !m-0 items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full h-fit max-w-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5" />
            {editEmployee ? "Edit Employee" : "Add New Employee"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-500 p-2 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {errors &&
          errors.map((errMsg: string, index: number) => (
            <div
              className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2"
              key={index}
            >
              <AlertTriangle className="w-4 h-4" /> {errMsg}
            </div>
          ))}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              placeholder="First Name"
              value={first_name}
              onChange={(e) => setfirst_name(e.target.value)}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              placeholder="Middle Name"
              value={middle_name}
              onChange={(e) => setmiddle_name(e.target.value)}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              placeholder="Last Name"
              value={last_name}
              onChange={(e) => setlast_name(e.target.value)}
            />
          </div>

          {/* Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={department}
              onChange={(e) => handleDeptChange(e.target.value)}
            >
              {DEPARTMENTS.map((dep) => (
                <option key={dep}>{dep}</option>
              ))}
            </select>

            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              {POSITIONS[department]?.map((pos) => (
                <option key={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              placeholder="Contact Number"
              value={phone}
              onChange={(e) => setphone(e.target.value)}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              name="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              type="number"
              placeholder="Hourly Rate (₱)"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              type="number"
              placeholder="Total Loan (₱)"
              value={totalLoan ? totalLoan : 0}
              onChange={(e) => setTotalLoan(e.target.value)}
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded flex items-center justify-center gap-1">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
