import React from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface MainLayoutProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between md:justify-end px-4 md:px-8">
        <button
          className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-800">Admin User</p>
            <p className="text-xs text-slate-500">Human Resources</p>
          </div>

          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
            A
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
