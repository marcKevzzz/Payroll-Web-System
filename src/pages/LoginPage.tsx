import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const LoginPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    if (!employeeId || !password)
      return setError("Please enter employee ID and password");

    setLoading(true);
    try {
      await login(employeeId, password);
      // redirect to dashboard or payroll page
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Blue Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden min-h-[40vh] md:min-h-screen">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-10">
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

        <div className="relative z-10">
          {/* Asterisk Icon */}
          <div className="mb-6 md:mb-12">
            <svg
              width="60"
              height="60"
              viewBox="0 0 80 80"
              fill="none"
              className="md:w-20 md:h-20"
            >
              <path
                d="M40 0L40 80M0 40L80 40M13.5 13.5L66.5 66.5M66.5 13.5L13.5 66.5"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-8 leading-tight">
            Hello
            <br />
            AeroStack!👋
          </h1>

          {/* Description */}
          <p className="text-base md:text-xl text-white text-opacity-90 leading-relaxed max-w-lg">
            Hello! Please log in to access your dashboard, check your payslips,
            manage your details, and stay up-to-date with company updates. We’re
            glad to have you on board!
          </p>
        </div>

        {/* Footer */}
        <p className="text-white text-opacity-70 relative z-10 text-sm md:text-base mt-8 md:mt-0">
          © 2025 AeroStack. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 bg-gray-50 p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-lg md:text-2xl font-bold text-indigo-700 mb-2">
            AeroStack
          </h2>

          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Aerostack
          </h3>
          <div className="mt-8 md:mt-12">
            <div>
              {/* Email Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent focus:border-blue-600 focus:outline-none text-gray-900"
                  placeholder="Employee ID"
                />
              </div>

              {/* Password Input */}
              <div className="mb-8">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent focus:border-blue-600 focus:outline-none text-gray-900"
                  placeholder="Password"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 mt-2 rounded-lg font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? "Loading..." : "Login Now"}
              </button>

              {/* Forget Password Link */}
              <div className="text-center mt-6">
                <span className="text-gray-500">Forget password </span>
                <button className="text-gray-900 font-semibold underline hover:text-gray-700">
                  Click here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
