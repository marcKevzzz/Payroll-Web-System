import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext"; // Assuming you have a Toast context

// Helper for basic password strength check
const isPasswordStrong = (password: string): boolean => {
  // Requires at least 8 characters, one uppercase, one lowercase, one number
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  return (
    password.length >= minLength && hasUpperCase && hasLowerCase && hasDigit
  );
};

const ChangePassword: React.FC = () => {
  const { token, employee_id, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      setMessage(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number."
      );
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast(
        "success",
        "Password changed successfully! Please log in again."
      );
      // 1. Log the user out immediately after a successful password change for security
      logout();

      // 2. Redirect to login page
      navigate("/login");
    } catch (err: any) {
      setMessage(
        err.response?.data?.message ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 md:mt-24 p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
        Change Password
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Employee ID:
        <span className="font-semibold text-gray-700">
          {employee_id || "N/A"}
        </span>
      </p>
      <div className="space-y-4">
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        {/* New Password */}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        {/* Confirm New Password */}
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      {/* Password Strength Tip */}
      {newPassword && !isPasswordStrong(newPassword) && (
        <p className="mt-3 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Password must be 8+ chars, with an uppercase, a lowercase, and a
          number.
        </p>
      )}
      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
      <button
        onClick={handleChangePassword}
        disabled={
          loading ||
          newPassword !== confirmPassword ||
          !isPasswordStrong(newPassword)
        }
        className="w-full bg-indigo-600 text-white py-3 mt-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Set New Password"}
      </button>
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="w-full text-sm text-gray-500 hover:text-gray-700 mt-4"
      >
        Cancel and Go to Login
      </button>
    </div>
  );
};

export default ChangePassword;
