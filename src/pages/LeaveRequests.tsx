import React, { useEffect, useState, lazy, Suspense } from "react";

// Remove imports for getLeaveRequests, updateLeaveRequestStatus

// import { getLeaveRequests, updateLeaveRequestStatus } from "../services/leaveRequests";

// --- NEW CONTEXT IMPORT ---

import { useLeaveRequestContext } from "../context/LeaveRequestContext"; // Use the new context

// --------------------------

import { ClipboardList } from "lucide-react";

import { useConfirm } from "../context/ConfirmContext";

const LeaveRequestCard = lazy(
  () => import("../components/LeaveRequests/LeaveRequestCard")
);

const LeaveDetailsModal = lazy(
  () => import("../components/LeaveRequests/LeaveDetailsModal")
);

const LoadingFallback = () => (
  <div className="text-center py-8 text-slate-500">
    Loading request details...
  </div>
);

const LeaveRequests = ({ isAdmin = true }) => {
  const employee_id = localStorage.getItem("employee_id");

  // --- USE CONTEXT STATE AND FUNCTIONS ---

  const {
    leaveRequests,

    refetchLeaveRequests,

    updateRequestStatus,

    isLoading,
  } = useLeaveRequestContext();

  // ---------------------------------------

  const [selectedLeave, setSelectedLeave] = useState(null);

  const [reasonInput, setReasonInput] = useState("");

  const [showDetails, setShowDetails] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");

  const { showConfirm } = useConfirm();

  // Remove the useEffect and loadRequests, context handles initial load

  // useEffect(() => {

  //   loadRequests();

  // }, []);

  // const loadRequests = async () => { ... } // REMOVED

  const openDetails = (leave) => {
    setSelectedLeave(leave);

    setReasonInput("");

    setShowDetails(true);
  };

  const closeDetails = () => setShowDetails(false);

  const handleApprove = () => {
    showConfirm({
      message: "Approve this leave request?",

      type: "warning",

      showActions: true,

      onConfirm: async () => {
        try {
          await updateRequestStatus(
            selectedLeave.request_id,

            "Approved",

            employee_id,

            null
          );

          closeDetails();
        } catch (error) {
          // Handle error (e.g., show toast)

          console.error("Approval failed:", error);
        }
      },
    });
  };

  const handleReject = () => {
    if (!reasonInput.trim()) {
      alert("Rejection reason is required.");

      return;
    }

    showConfirm({
      message: "Reject this leave request?",

      type: "danger",

      showActions: true,

      onConfirm: async () => {
        try {
          await updateRequestStatus(
            selectedLeave.request_id,

            "Rejected",

            employee_id,

            reasonInput
          );

          closeDetails();
        } catch (error) {
          // Handle error (e.g., show toast)

          console.error("Rejection failed:", error);
        }
      },
    });
  };

  const filteredRequests =
    filterStatus === "All"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "Rejected":
        return "bg-rose-100 text-rose-700 border-rose-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const statusCounts = {
    All: leaveRequests.length,

    Pending: leaveRequests.filter((r) => r.status === "Pending").length,

    Approved: leaveRequests.filter((r) => r.status === "Approved").length,

    Rejected: leaveRequests.filter((r) => r.status === "Rejected").length,
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
          </div>
          Employee Leave Requests
        </h2>

        <div className="text-sm text-slate-500 flex gap-2">
          Total Requests:
          <span className="font-bold text-slate-700">
            {leaveRequests.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 overflow-x-auto">
        <div className="flex sm:gap-2 w-full">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-1.5 sm:px-5 grow py-2 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                filterStatus === status
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status}

              <span className="ml-1 sm:ml-2 text-xs opacity-75">
                ({statusCounts[status]})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 ">
        {filteredRequests.length > 0 ? (
          <Suspense fallback={<LoadingFallback />}>
            {filteredRequests.map((leave) => (
              <LeaveRequestCard
                key={leave.request_id}
                leave={{
                  ...leave,
                  type_name: leave.type || leave.type_name,
                  start: leave.start_date,
                  end: leave.end_date,
                  days: leave.total_days,
                }}
                openDetails={openDetails}
                getStatusColor={getStatusColor}
                isAdmin={isAdmin}
              />
            ))}
          </Suspense>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>

            <p className="text-slate-500 font-medium">
              No {filterStatus.toLowerCase()} requests found
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Try changing the filter or check back later
            </p>
          </div>
        )}
      </div>

      {showDetails && selectedLeave && (
        <Suspense fallback={<LoadingFallback />}>
          <LeaveDetailsModal
            selectedLeave={selectedLeave}
            closeDetails={closeDetails}
            getStatusColor={getStatusColor}
            isAdmin={isAdmin}
            handleApprove={handleApprove}
            handleReject={handleReject}
            reasonInput={reasonInput}
            setReasonInput={setReasonInput}
          />
        </Suspense>
      )}
    </div>
  );
};

export default LeaveRequests;
