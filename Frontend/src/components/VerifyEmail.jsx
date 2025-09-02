import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const response = await fetch(`http://localhost:3000/verify/${token}`);
        const text = await response.text();

        if (response.ok) {
          setStatus("success");
          setMessage(text);
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(text);
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
