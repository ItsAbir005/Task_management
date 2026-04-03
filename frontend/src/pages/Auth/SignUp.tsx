import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Globe, ArrowRight, Building2, Sparkles, CheckCircle } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", domain: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        form,
        { withCredentials: true }
      );

      // Redirect to Stripe Checkout
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        navigate("/signup/success");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Unlimited Employees & Departments",
    "Role-based Access (HR, Manager, Employee)",
    "Leave & Task Management",
    "Real-time Notifications",
    "Monthly Subscription — Cancel Anytime",
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
        maxWidth: "900px",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Left Panel */}
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #6c63ff, #a855f7)",
          padding: "48px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <Building2 size={32} />
            <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "0.5px" }}>HRM SaaS</span>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1.2, marginBottom: "16px" }}>
            Powerful HR Management<br />for Your Business
          </h1>
          <p style={{ opacity: 0.85, marginBottom: "32px", lineHeight: 1.7, fontSize: "15px" }}>
            Start your <strong>$29.99/month</strong> subscription and get everything you need to manage your team.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} style={{ color: "#c4b5fd", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", opacity: 0.92 }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "40px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "14px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <Sparkles size={20} style={{ color: "#fde68a" }} />
            <span style={{ fontSize: "13px", opacity: 0.9 }}>You'll be redirected to Stripe to complete payment securely.</span>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div style={{
          flex: 1,
          background: "#1a1a2e",
          padding: "48px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Create Your Account</h2>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>Register as Admin — Complete payment to activate</p>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "20px",
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: <User size={16} />, label: "Company Name", name: "name", type: "text", placeholder: "Acme Corp" },
              { icon: <Mail size={16} />, label: "Business Email", name: "email", type: "email", placeholder: "admin@company.com" },
              { icon: <Lock size={16} />, label: "Password", name: "password", type: "password", placeholder: "Min. 8 characters" },
              { icon: <Globe size={16} />, label: "Company Domain (optional)", name: "domain", type: "text", placeholder: "acme" },
            ].map(({ icon, label, name, type, placeholder }) => (
              <div key={name}>
                <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  {label}
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                    color: "#6b7280", display: "flex", alignItems: "center",
                  }}>{icon}</span>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    required={name !== "domain"}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "12px 12px 12px 38px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>
            ))}

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
                <><span>Register & Pay</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "13px", marginTop: "24px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Log In</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SignUp;
