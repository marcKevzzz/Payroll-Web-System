// components/Toast.tsx
import React, { useEffect } from "react";
import { X, Check, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = {
    success: <Check className="w-5 h-5 text-green-600" />,
    error: <X className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  }[type];

  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
  }[type];

  return (
    <div
      className={`flex items-center w-full max-w-sm p-4 text-body rounded shadow border ${bgColor}`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded bg-white">
        {icon}
      </div>
      <div className="ms-3 text-sm font-normal flex-1">{message}</div>
      <button
        onClick={onClose}
        className="ms-auto flex items-center justify-center h-8 w-8 rounded text-body"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
