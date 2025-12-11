import React, { useState, useEffect } from "react";
import { Users, Search, Plus } from "lucide-react";
import EmployeeModal from "../components/Employee/EmployeeModal";
import EmployeeTable from "../components/Employee/EmployeeTable";
import { Employee, DTREntry } from "../types/types";
import * as EmployeeService from "../services/employee";
import { useToast } from "../context/ToastContext";
import { useEmployeeContext } from "../context/EmployeeContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useConfirm } from "../context/ConfirmContext";

interface Props {
  dtrEntries: DTREntry[];
  setDtrEntries: React.Dispatch<React.SetStateAction<DTREntry[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export default function EmployeeManager({
  dtrEntries,
  setDtrEntries,
  setEmployees,
}: Props) {
  const { employees, fetchEmployees, loading } = useEmployeeContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  // Add employee
  const addEmployee = async (emp: Employee) => {
    try {
      const created = await EmployeeService.createEmployee(emp);

      // Update global list immediately
      setEmployees((prev) => [...prev, created]);

      showToast("success", "Employee added successfully");
      fetchEmployees();
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to add employee");
    }
  };

  // Update employee
  const updateEmployee = async (emp: Employee) => {
    try {
      await EmployeeService.updateEmployee(emp.employee_id, emp);
      // Update global list
      setEmployees((prev) =>
        prev.map((e) => (e.employee_id === emp.employee_id ? emp : e))
      );
      showToast("success", "Employee updated successfully");
      fetchEmployees();
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to update employee");
    }
  };

  // Delete employee
  const deleteEmployee = async (employee_id: string) => {
    try {
      await EmployeeService.deleteEmployee(employee_id);

      // Remove from global list
      setEmployees((prev) => prev.filter((e) => e.employee_id !== employee_id));

      // Remove employee's DTR
      setDtrEntries((prev) => prev.filter((d) => d.employeeId !== employee_id));

      showToast("success", "Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to delete employee");
    } finally {
      setEditEmployee(null);
    }
  };

  // Confirm actions
  const handleAddConfirm = (emp: Employee) => {
    showConfirm({
      message: "Are you sure you want to add this employee?",
      type: "warning",
      onConfirm: () => addEmployee(emp),
    });
  };

  const handleEditConfirm = (emp: Employee) => {
    showConfirm({
      message: "Are you sure you want to update this employee?",
      type: "warning",
      onConfirm: () => updateEmployee(emp),
    });
  };

  const handleDeleteConfirm = (id: string) => {
    showConfirm({
      message: "Are you sure you want to delete this employee?",
      type: "danger",
      onConfirm: () => deleteEmployee(id),
    });
  };

  const filtered = (employees || []).filter((e) =>
    `${e.employee_id} ${e.first_name} ${e.last_name} ${e.position} ${e.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // if (loading) return <div>Loading employees...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex  lg:items-center items-start justify-between gap-3 lg:flex-row flex-col" >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" /> Employee Management
        </h2>
        <div className="flex gap-3 lg:max-w-lg w-full"> 
          <div className="relative flex flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-9 pr-4 py-2 border rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditEmployee(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>
      {loading ? (
        <div>
          <Skeleton
            count={5}
            height={30}
            className="mb-2"
            baseColor="#dbdadaff"
            borderRadius="0.5rem"
          />
        </div>
      ) : (
        <EmployeeTable
          employees={filtered}
          onDelete={handleDeleteConfirm}
          onEdit={(employee_id: string) => {
            const emp = employees.find((e) => e.employee_id === employee_id);
            if (emp) {
              setEditEmployee(emp);
              setShowModal(true);
            }
          }}
        />
      )}

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddConfirm}
        onEdit={handleEditConfirm}
        editEmployee={editEmployee}
      />
    </div>
  );
}
