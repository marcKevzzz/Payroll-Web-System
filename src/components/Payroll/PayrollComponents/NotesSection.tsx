import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";

const NotesSection: React.FC = () => (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <div>
        <strong>Tax Note:</strong> MWEs are exempt from tax on holiday pay, OT,
        and basic pay. Non-MWEs are taxed on Gross (including holiday pay).
      </div>
    </div>
    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm text-amber-800 flex gap-3">
      <ShieldAlert className="w-5 h-5 flex-shrink-0" />
      <div>
        <strong>Loan Policy:</strong> Loan deduction is strictly 25% of Net Pay
        until the total loan balance is fully paid.
      </div>
    </div>
  </div>
);

export default NotesSection;
