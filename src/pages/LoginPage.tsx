import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [employee_id, setEmployeeId] = useState(
    localStorage.getItem("rememberedEmployeeId") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberedEmployeeId")
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    if (!employee_id || !password) {
      return setError("Please enter both Employee ID and password.");
    }

    setLoading(true);
    try {
      await login(employee_id, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmployeeId", employee_id);
      } else {
        localStorage.removeItem("rememberedEmployeeId");
      }

      // Redirect or show success message
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Blue Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden min-h-[40vh] md:min-h-screen">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10 ">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-white rounded-3xl"
              style={{
                width: "400px",
                height: "300px",
                left: `${-100 + i * 50}px`,
                top: `${100 + i * 40}px`,
                transform: `rotate(${-15 + i * 5}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 my-auto pb-16">
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-8 leading-tight">
            Hello<br />AeroStack!👋
          </h1>
          <p className="text-base md:text-xl text-white text-opacity-90 leading-relaxed max-w-lg">
            Please log in to access your dashboard, check your payslips, manage your details, and stay up-to-date.
          </p>
        </div>

        <p className="text-white text-opacity-70 relative z-10 text-sm md:text-base mt-8 md:mt-0">
          © 2025 AeroStack. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 bg-gray-50 p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-lg md:text-2xl font-bold text-indigo-700 mb-2">AeroStack</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Welcome</h3>

          <form onSubmit={handleSubmit} className="mt-8 md:mt-12">
            {/* Employee ID */}
            <div className="mb-6">
              <input
                type="text"
                value={employee_id}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent focus:border-blue-600 focus:outline-none text-gray-900"
                placeholder="Employee ID"
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent focus:border-blue-600 focus:outline-none text-gray-900 pr-12"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 text-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Remember Me */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                id="rememberMe"
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">
                Remember Me
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 mt-2 rounded-lg font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? "Loading..." : "Login Now"}
            </button>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <span className="text-gray-500">Forgot password? </span>
              <Link to="/change-password" className="text-gray-900 font-semibold underline hover:text-gray-700" > 
                Click here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
