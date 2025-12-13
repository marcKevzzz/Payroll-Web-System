import React, { useState, useEffect } from "react";
import { AlertTriangle, User } from "lucide-react";
import {
  DEPARTMENTS,
  POSITIONS,
  getMinHourlyWage,
  formatCurrency,
} from "../../utils/utils";
import { Employee } from "../../types/types";
import { useToast } from "../../context/ToastContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  editEmployee?: Employee | null;
  existingEmails: string[];
}

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  onEdit,
  editEmployee,
  existingEmails,
}: Props) {
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [position, setPosition] = useState(POSITIONS[DEPARTMENTS[0]][0]);
  const [rate, setRate] = useState("");
  const [totalLoan, setTotalLoan] = useState("0");
  const [errors, setErrors] = useState<string[]>([]);

  const PH_PHONE_REGEX = /^(?:\+639|639|09)\d{9}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (editEmployee) {
      setFirstName(editEmployee.first_name || "");
      setMiddleName(editEmployee.middle_name || "");
      setLastName(editEmployee.last_name || "");
      setPhone(editEmployee.phone || "");
      setEmail(editEmployee.email || "");
      setDepartment(editEmployee.department || DEPARTMENTS[0]);
      setPosition(
        editEmployee.position ||
          POSITIONS[editEmployee.department || DEPARTMENTS[0]][0]
      );
      setRate(editEmployee.hourly_rate?.toString() || "");
      setTotalLoan(editEmployee.loan_amount?.toString() || "0");
      setErrors([]);
    } else {
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setDepartment(DEPARTMENTS[0]);
      setPosition(POSITIONS[DEPARTMENTS[0]][0]);
      setRate("");
      setTotalLoan("0");
      setErrors([]);
    }
  }, [editEmployee]);

  useEffect(() => {
    if (isOpen) document.getElementById("firstNameInput")?.focus();
  }, [isOpen]);

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

    if (!firstName.trim()) newErrors.push(`First name is required.`);
    if (!lastName.trim()) newErrors.push(`Last name is required.`);
    if (!email.trim()) newErrors.push(`Email is required.`);
    else if (!EMAIL_REGEX.test(email)) newErrors.push("Invalid email format.");

    if (
      existingEmails.includes(email.trim()) &&
      email.trim() !== editEmployee?.email
    ) {
      newErrors.push("This email is already used by another employee.");
    }

    if (phone && !PH_PHONE_REGEX.test(phone))
      newErrors.push("Invalid Philippine mobile number.");
    if (!parsedRate || parsedRate <= 0)
      newErrors.push("Hourly rate must be a positive number.");
    else if (parsedRate < minWage)
      newErrors.push(
        `Rate is below minimum wage (${formatCurrency(minWage)}).`
      );
    if (parsedLoan < 0) newErrors.push("Loan cannot be negative.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const newEmp: Employee = {
      employee_id: editEmployee ? editEmployee.employee_id : undefined,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      phone,
      email,
      department,
      position,
      hourly_rate: parsedRate,
      loan_amount: parsedLoan,
      created_at: undefined,
    };

    editEmployee ? onEdit(newEmp) : onSave(newEmp);

    // reset form
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setDepartment(DEPARTMENTS[0]);
    setPosition(POSITIONS[DEPARTMENTS[0]][0]);
    setRate("");
    setTotalLoan("0");
    setErrors([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl animate-fadeIn">
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

        {errors.length > 0 && (
          <div className="mb-4 space-y-2">
            {errors.map((err, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded"
              >
                <AlertTriangle className="w-4 h-4" /> {err}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              id="firstNameInput"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
            <input
              placeholder="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
            <input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={department}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {DEPARTMENTS.map((dep) => (
                <option key={dep}>{dep}</option>
              ))}
            </select>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {POSITIONS[department]?.map((pos) => (
                <option key={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Contact Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Hourly Rate (₱)"
              value={rate || ""}
              onChange={(e) => setRate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
            <input
              type="number"
              placeholder="Total Loan (₱)"
              value={totalLoan || ""}
              onChange={(e) => setTotalLoan(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold"
          >
            Save Employee
          </button>
        </form>
      </div>
    </div>
  );
}
