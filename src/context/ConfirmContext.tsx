// src/context/ConfirmContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ConfirmOptions {
  message: string;
  type?: "success" | "warning" | "info" | "danger";
  onConfirm?: () => void;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    message: "",
    type: "info",
  });

  const showConfirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const closeConfirm = () => setIsOpen(false);

  return (
    <ConfirmContext.Provider value={{ showConfirm, closeConfirm }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        message={options.message}
        type={options.type}
        onConfirm={() => {
          options.onConfirm?.();
          closeConfirm();
        }}
        onClose={closeConfirm}
      />
    </ConfirmContext.Provider>
  );
};

// Custom hook for easier usage
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
};

// Import ConfirmModal here
import ConfirmModal from "../components/ConfirmModal";
