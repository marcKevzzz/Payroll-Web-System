// src/components/ForgotPasswordRequest.tsx (NEW FILE)

import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const API_URL = "http://localhost:5000/api/auth";

const ForgotPasswordRequest: React.FC = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { showToast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!employeeId) {
      return setMessage("Employee ID is required.");
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/forgot-password`, { employee_id: employeeId });

      // SECURITY NOTE: The message should be vague to avoid revealing if the employee ID exists.
      setMessage("If the account exists, a password reset link has been sent (check console for token placeholder).");
      showToast("success", "Reset request processed.");

      // In a real application, you might show a link to the reset page for testing,
      // but in production, the user must check their email.
    } catch (err: any) {
      // Catch specific errors, but keep the response vague for security
      setMessage("An error occurred during the reset request. Please check the ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Password Reset</h2>
      <p className="text-gray-600 mb-6">
        Enter your Employee ID below to receive a password reset link.
      </p>
      <form onSubmit={handleRequestReset} className="space-y-6">
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        {message && (
          <p className={`text-sm ${message.includes("error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !employeeId}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Request Reset Link"}
        </button>
      </form>
      <div className="text-center mt-6">
        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordRequest;