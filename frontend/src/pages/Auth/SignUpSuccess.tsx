import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Building2, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import axios from "axios";

const SignUpSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        setErrorMsg("No session ID found. If you completed payment, please try logging in.");
        return;
      }

      try {
        await axios.post(
          "http://localhost:3000/api/stripe/verify-session",
          { sessionId },
          { withCredentials: true }
        );
        setStatus("success");
        // Auto-redirect to login after 5 seconds
        setTimeout(() => navigate("/login"), 5000);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Could not verify payment.";
        setStatus("error");
        setErrorMsg(msg);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      padding: "24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "28px",
        padding: "64px 48px",
        maxWidth: "520px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>

        {/* ── VERIFYING ── */}
        {status === "verifying" && (
          <>
            <div style={{
              width: "90px", height: "90px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6c63ff, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 32px",
              boxShadow: "0 0 40px rgba(108,99,255,0.4)",
              animation: "spin 1.5s linear infinite",
            }}>
              <Loader2 size={40} color="#fff" />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
              Verifying Your Payment...
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "15px", lineHeight: 1.7 }}>
              Please wait while we confirm your subscription with Stripe.
            </p>
          </>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <>
            <div style={{
              width: "90px", height: "90px", borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 32px",
              boxShadow: "0 0 40px rgba(16,185,129,0.4)",
              animation: "pulse 2s ease-in-out infinite",
            }}>
              <CheckCircle size={44} color="#fff" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
              <Building2 size={20} color="#a78bfa" />
              <span style={{ color: "#a78bfa", fontSize: "15px", fontWeight: 700 }}>HRM SaaS</span>
            </div>

            <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#fff", marginBottom: "12px", lineHeight: 1.2 }}>
              Payment Verified! 🎉
            </h1>
            <p style={{ color: "#9ca3af", lineHeight: 1.8, marginBottom: "28px", fontSize: "15px" }}>
              Your subscription is now <span style={{ color: "#10b981", fontWeight: 700 }}>active</span>.<br />
              Log in to set up your team.
            </p>

            <div style={{
              background: "rgba(108,99,255,0.15)",
              border: "1px solid rgba(108,99,255,0.3)",
              borderRadius: "14px",
              padding: "14px 18px",
              marginBottom: "28px",
            }}>
              <p style={{ color: "#c4b5fd", fontSize: "13px", margin: 0 }}>
                🔑 <strong>Next:</strong> Log in as Admin → Invite HR & Managers from the dashboard
              </p>
            </div>

            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #6c63ff, #a855f7)",
                color: "#fff", textDecoration: "none", borderRadius: "12px",
                padding: "14px 32px", fontWeight: 700, fontSize: "15px",
                boxShadow: "0 8px 20px rgba(108,99,255,0.4)",
              }}
            >
              Go to Login <ArrowRight size={18} />
            </Link>
            <p style={{ color: "#4b5563", marginTop: "16px", fontSize: "12px" }}>
              Auto-redirecting to login in a few seconds...
            </p>
          </>
        )}

        {/* ── ERROR ── */}
        {status === "error" && (
          <>
            <div style={{
              width: "90px", height: "90px", borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 32px",
              boxShadow: "0 0 40px rgba(245,158,11,0.4)",
            }}>
              <AlertTriangle size={44} color="#fff" />
            </div>

            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
              Verification Issue
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>
              {errorMsg}
            </p>
            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "24px" }}>
              If you completed payment but can't log in, please contact support.
            </p>
            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff", textDecoration: "none", borderRadius: "12px",
                padding: "14px 28px", fontWeight: 700, fontSize: "14px",
              }}
            >
              Try Logging In <ArrowRight size={16} />
            </Link>
          </>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{box-shadow:0 0 40px rgba(16,185,129,0.4)} 50%{box-shadow:0 0 60px rgba(16,185,129,0.7)} }
      `}</style>
    </div>
  );
};

export default SignUpSuccess;
