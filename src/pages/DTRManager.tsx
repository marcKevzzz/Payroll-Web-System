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
  const { employees } = useEmployeeContext();
  const { DTREntries, fetchDTRLogs, loading } = useDTRContext();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const [dtrEntries, setDTREntries] = useState(DTREntries);
  const [filterEmp, setFilterEmp] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    setDTREntries(DTREntries);
  }, [DTREntries]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Clock className="w-6 h-6" /> Daily Time Record (DTR)
      </h2>

      <DTRForm
        employees={employees}
        dtrEntries={dtrEntries}
        setDtrEntries={setDTREntries}
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
        setDtrEntries={setDTREntries}
        showConfirm={showConfirm}
        filterEmp={filterEmp}
        filterMonth={filterMonth}
        loading={loading}
      />
    </div>
  );
};
