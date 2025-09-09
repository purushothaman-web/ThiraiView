import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return; // Avoid double-call in React StrictMode
    ranOnce.current = true;
    async function verify() {
      try {
        const response = await fetch(`${API_BASE_URL}/verify/${token}`);
        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json") ? await response.json() : await response.text();

        if (response.ok) {
          setStatus("success");
          setMessage(typeof payload === "string" ? payload : payload?.message || "Email verified successfully.");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(typeof payload === "string" ? payload : payload?.error || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      }
    }
    verify();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {status === "loading" && <p>Verifying your email, please wait...</p>}
      {status === "success" && (
        <>
          <p className="text-green-600 font-semibold">{message}</p>
          <p>Redirecting you shortly...</p>
        </>
      )}
      {status === "error" && <p className="text-red-600 font-semibold">{message}</p>}
    </div>
  );
};

export default VerifyEmail;
