import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useToast } from "./../context/ToastContext";
import { useConfirm } from "./../context/ConfirmContext";
import { useDTRContext } from "./../context/DTRContext";
import { useEmployeeContext } from "./../context/EmployeeContext";

import DTRForm from "./../components/DTR/DTRForm";
import DTRFilter from "./../components/DTR/DTRFilter";
import DTRTable from "./../components/DTR/DTRTable";

export const DTRManager = () => {
  const { employees, fetchEmployees } = useEmployeeContext();
  const { DTREntries, fetchAllDTRLogs, loading } = useDTRContext();
  const dtrEntries = DTREntries;
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const [filterEmp, setFilterEmp] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    fetchAllDTRLogs();
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Clock className="w-6 h-6" /> Daily Time Record (DTR)
      </h2>

      <DTRForm
        employees={employees}
        dtrEntries={dtrEntries}
        fetchDTRLogs={fetchAllDTRLogs}
        showToast={showToast}
      />

      <DTRFilter
        employees={employees}
        filterEmp={filterEmp}
        setFilterEmp={setFilterEmp}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
      />

      <DTRTable
        employees={employees}
        dtrEntries={dtrEntries}
        setDtrEntries={() => fetchAllDTRLogs()}
        showConfirm={showConfirm}
        filterEmp={filterEmp}
        filterMonth={filterMonth}
        loading={loading}
        fetchDTRLogs={fetchAllDTRLogs}
      />
    </div>
  );
};
