import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const VerifyPending = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  const location = useLocation();
  const { apiClient, user } = useContext(AuthContext);
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const qEmail = params.get("email");
      if (qEmail) {
        setEmail(qEmail);
        return;
      }
      const pending = localStorage.getItem("pendingEmail") || user?.email;
      if (pending) setEmail(pending);
      if (!qEmail && !pending) {
        setError("We couldn't detect your email for verification. Please sign up again or open the verify link from your email.");
      }
    } catch (_) {}
  }, [location.search]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resend = async () => {
    setMessage("");
    setError("");
    if (cooldown > 0) return;
    if (!email) {
      setError("Email is required to resend verification. Use the sign up flow again or add ?email=you@example.com to the URL.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/resend-verification', { email });
      setMessage(response.data.message || "Verification email resent.");
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a verification link to <strong>{email || 'your email'}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Please check your email inbox and click the verification link to activate your account.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">Didn't receive the email?</p>
            <button 
              onClick={resend} 
              disabled={loading || cooldown > 0} 
              className="w-full px-4 py-2 bg-blue-600 disabled:bg-gray-400 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? "Sending..." : "Resend Verification"}
            </button>
            
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already verified? <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPending;
