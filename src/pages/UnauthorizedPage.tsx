import React from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 to-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Unauthorized</h1>
        <p className="text-slate-200 mb-8 leading-relaxed">
          You don’t have permission to access this page.
        </p>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-xl bg-white text-slate-900 font-semibold shadow hover:bg-slate-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
