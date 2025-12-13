// src/components/Payroll/EmployeePayslipPreview/PayrollComponents/NotesSection.tsx

import React, { useState, useRef } from "react";
import { AlertCircle, ShieldAlert, Printer } from "lucide-react";
// import { downloadAndOpenPdf } from "@/src/utils/pdfGenerator"; // (Keeping unused import commented out)

// Define the Props interface
interface NotesSectionProps {
  onClick: () => void;
}

// Correctly define the component using React.FC<Props> and destructure onClick
const NotesSection: React.FC<NotesSectionProps> = ({ onClick }) => {
  return (
    <div className="mt-8 gap-8 flex flex-col items-end">
      <button
        // Correct usage of the destructured onClick prop
        onClick={onClick}
        className="text-sm text-indigo-600 hover:underline flex items-center gap-1 print:hidden mr-10"
      >
        <Printer className="w-4 h-4" /> Print Report
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Tax Note:</strong> MWEs are exempt from tax on holiday pay,
            OT, and basic pay. Non-MWEs are taxed on Gross (including holiday
            pay).
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm text-amber-800 flex gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Loan Policy:</strong> Loan deduction is strictly 25% of Net
            Pay until the total loan balance is fully paid.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
