import React from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  LogOut,
} from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // optional, for info modals
  message: string;
  type?: "success" | "warning" | "info" | "danger";
  showActions?: boolean; // true if you want confirm/cancel buttons
}

const iconMap = {
  success: { icon: CheckCircle, color: "text-green-500" },
  warning: { icon: AlertTriangle, color: "text-yellow-500" },
  info: { icon: Info, color: "text-blue-500" },
  danger: { icon: XCircle, color: "text-red-500" },
  leave: { icon: LogOut, color: "text-red-500" },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  type = "info",
  showActions = true,
}) => {
  if (!isOpen) return null;

  const { icon: Icon, color } = iconMap[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50 !m-0">
      <div className="relative w-full max-w-md p-4">
        <div className="relative bg-white border rounded-lg shadow p-6">
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded w-9 h-9 flex items-center justify-center"
            onClick={onClose}
          >
            <span className="sr-only">Close modal</span>✕
          </button>

          {/* Icon and message */}
          <div className="text-center">
            <Icon className={`mx-auto mb-4 w-12 h-12 ${color}`} />
            <h3 className="mb-6 text-gray-700">{message}</h3>

            {/* Buttons */}
            {showActions && (
              <div className="flex justify-center items-center gap-4">
                {type !== "info" && onConfirm && (
                  <button
                    type="button"
                    className={`px-4 py-2 rounded text-white ${
                      type === "success"
                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-400"
                        : type === "warning"
                        ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300"
                        : "bg-red-600 hover:bg-red-700 focus:ring-red-400"
                    } focus:outline-none focus:ring-2`}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    Yes
                  </button>
                )}
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
