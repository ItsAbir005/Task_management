import React, { useState, useContext } from "react";
import axios from "axios";
import { GlobleContext } from "../../context/GlobleContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ChevronDown, ArrowRight, Building2, AlertTriangle } from "lucide-react";

const Login = () => {
  const { setUser } = useContext(GlobleContext)!;
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", role: "ADMIN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSubscriptionRequired(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubscriptionRequired(false);

    try {
      const endpoint =
        form.role === "ADMIN"
          ? "http://localhost:3000/api/auth/login"
          : "http://localhost:3000/api/auth/employeeLogin";

      const res = await axios.post(endpoint, { email: form.email, password: form.password }, { withCredentials: true });

      setUser(res.data);
      const role = res.data.role || res.data.employee?.role || res.data.tenant?.role;

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "HR") navigate("/hr/dashboard");
      else if (role === "MANAGER") navigate("/manager/dashboard");
      else if (role === "EMPLOYEE") navigate("/employee/dashboard");
      else navigate("/");
    } catch (err: any) {
      const data = err.response?.data;
      if (err.response?.status === 402 && data?.subscriptionRequired) {
        setSubscriptionRequired(true);
      } else {
        setError(data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    setPayLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/stripe/create-checkout",
        {},
        { withCredentials: true }
      );
      window.location.href = res.data.url;
    } catch (err: any) {
      setError("Could not start payment. Please try again.");
      setPayLoading(false);
    }
  };

  const roles = [
    { value: "ADMIN", label: "Admin", emoji: "👑" },
    { value: "HR", label: "HR Manager", emoji: "🏢" },
    { value: "MANAGER", label: "Manager", emoji: "📊" },
    { value: "EMPLOYEE", label: "Employee", emoji: "👤" },
  ];

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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{
        width: "100%",
        maxWidth: "920px",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Left — branding */}
        <div style={{
          flex: 1,
          background: "linear-gradient(160deg, #6c63ff 0%, #a855f7 100%)",
          padding: "48px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
            <Building2 size={30} />
            <span style={{ fontSize: "20px", fontWeight: 800 }}>HRM SaaS</span>
          </div>

          <h1 style={{ fontSize: "34px", fontWeight: 800, lineHeight: 1.2, marginBottom: "16px" }}>
            Welcome Back 👋
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.8, marginBottom: "36px", fontSize: "15px" }}>
            Your all-in-one platform for HR, projects, leaves, and team management.
          </p>

          {/* Role cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "👑", role: "Admin", desc: "Manage everything — invite HR & Managers" },
              { icon: "🏢", role: "HR", desc: "Handle leaves, employees & compliance" },
              { icon: "📊", role: "Manager", desc: "Projects, tasks & team performance" },
              { icon: "👤", role: "Employee", desc: "Your dashboard, tasks & leave requests" },
            ].map(({ icon, role, desc }) => (
              <div key={role} style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <span style={{ fontSize: "20px" }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>{role}</div>
                  <div style={{ opacity: 0.75, fontSize: "12px" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{
          flex: 1,
          background: "#1a1a2e",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Sign In</h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Select your role and enter your credentials</p>
          </div>

          {/* Subscription required banner */}
          {subscriptionRequired && (
            <div style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: "14px", margin: "0 0 4px" }}>
                    Subscription Not Active
                  </p>
                  <p style={{ color: "#d97706", fontSize: "13px", margin: 0 }}>
                    Your account needs an active subscription to log in. Complete payment to continue.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetryPayment}
                disabled={payLoading}
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: payLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  alignSelf: "flex-start",
                }}
              >
                {payLoading ? "Redirecting..." : "Complete Payment →"}
              </button>
            </div>
          )}

          {/* General error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "18px",
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Role selector */}
            <div>
              <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Login As
              </label>
              <div style={{ position: "relative" }}>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "12px 40px 12px 14px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value} style={{ background: "#1a1a2e" }}>
                      {r.emoji} {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "12px 12px 12px 40px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "12px 12px 12px 40px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                background: loading ? "#4c4c8a" : "linear-gradient(135deg, #6c63ff, #a855f7)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <div style={{ width: "18px", height: "18px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <><span>Sign In</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "13px", marginTop: "24px" }}>
            New company?{" "}
            <Link to="/signup" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Create Account</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
