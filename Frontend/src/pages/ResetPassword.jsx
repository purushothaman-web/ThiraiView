import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { isNonEmptyString } from "../components/ui/validation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const { apiClient } = useContext(AuthContext);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid reset link");
        setValidating(false);
        return;
      }

      try {
        const response = await apiClient.get(`/password-reset/validate/${token}`);
        setTokenValid(true);
      } catch (err) {
        setError(err.response?.data?.error || "Invalid or expired reset link");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, apiClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNonEmptyString(password)) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiClient.post('/password-reset/reset', {
        token,
        password,
      });
      
      setMessage(response.data.message || "Password reset successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
  <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
  <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Invalid Reset Link</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-center"
            >
              Request New Reset Link
            </Link>
            <Link
              to="/login"
              className="block w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
  <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    New Password
  </label>
  <div className="relative">
    <input
      type={passwordVisible ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-3 pr-16 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      placeholder="Enter new password"
      required
      minLength={6}
    />
    <button
      type="button"
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
      onClick={() => setPasswordVisible(!passwordVisible)}
    >
      {passwordVisible ? "Hide" : "Show"}
    </button>
  </div>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Confirm Password
  </label>
  <div className="relative">
    <input
      type={confirmPasswordVisible ? "text" : "password"}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-3 pr-16 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      placeholder="Confirm new password"
      required
      minLength={6}
    />
    <button
      type="button"
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
    >
      {confirmPasswordVisible ? "Hide" : "Show"}
    </button>
  </div>
</div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">{message}</p>
              <p className="text-green-700 text-xs mt-1">Redirecting to login...</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || message}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? "Resetting..." : message ? "Password Reset!" : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/login" className="text-green-600 hover:underline font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
