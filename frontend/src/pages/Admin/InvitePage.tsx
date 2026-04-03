import React, { useState, useContext } from "react";
import axios from "axios";
import { GlobleContext } from "../../context/GlobleContext";
import { Mail, UserPlus, Send, CheckCircle, Building2, ChevronDown } from "lucide-react";

const InvitePage = () => {
  const { user, departments } = useContext(GlobleContext)!;
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "HR", departmentId: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [setupLink, setSetupLink] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/inviteHRManager",
        form,
        { withCredentials: true }
      );
      setSuccess(res.data.message);
      if (!res.data.emailSent && res.data.setupLink) {
        setSetupLink(res.data.setupLink);
      } else {
        setSetupLink("");
      }
      setForm({ firstName: "", lastName: "", email: "", role: "HR", departmentId: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inviteStats = [
    { icon: "🏢", label: "Invite HR Manager", desc: "HR will handle leaves, employees & compliance", value: "HR" },
    { icon: "📊", label: "Invite Manager", desc: "Managers will invite employees & manage projects", value: "MANAGER" },
  ];

  return (
    <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", maxWidth: "900px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <UserPlus size={24} color="#6c63ff" />
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1e1b4b", margin: 0 }}>Invite Team Members</h1>
        </div>
        <p style={{ color: "#6b7280", margin: 0 }}>
          As Admin, invite HR Managers & Managers to your organization. They will receive an email invite to set their password.
        </p>
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        {inviteStats.map(stat => (
          <div
            key={stat.value}
            onClick={() => setForm(prev => ({ ...prev, role: stat.value }))}
            style={{
              background: form.role === stat.value
                ? "linear-gradient(135deg, #6c63ff15, #a855f720)"
                : "#f9fafb",
              border: form.role === stat.value ? "2px solid #6c63ff" : "2px solid #e5e7eb",
              borderRadius: "16px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontWeight: 700, color: "#1e1b4b", marginBottom: "4px" }}>{stat.label}</div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Form card */}
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <Send size={18} color="#6c63ff" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e1b4b", margin: 0 }}>
            Send Invite Email — {form.role === "HR" ? "HR Manager" : "Manager"}
          </h2>
        </div>

        {success && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#16a34a",
            fontSize: "14px",
            marginBottom: setupLink ? "0" : "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <CheckCircle size={16} />{success}
          </div>
        )}

        {setupLink && (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            marginTop: "8px",
          }}>
            <p style={{ color: "#92400e", fontWeight: 700, fontSize: "13px", margin: "0 0 6px" }}>
              ⚠️ Email could not be delivered — share this link manually:
            </p>
            <div style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#1d4ed8",
              wordBreak: "break-all",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
              onClick={() => { navigator.clipboard.writeText(setupLink); }}
              title="Click to copy"
            >
              {setupLink}
            </div>
            <p style={{ color: "#b45309", fontSize: "11px", margin: "6px 0 0" }}>Click the link to copy it</p>
          </div>
        )}

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#dc2626",
            fontSize: "14px",
            marginBottom: "20px",
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            {/* First Name */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* Last Name */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Work Email *
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="email"
                name="email"
                placeholder="hr@company.com"
                value={form.email}
                onChange={handleChange}
                required
                style={{ ...inputStyle, paddingLeft: "36px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            {/* Role */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Role *
              </label>
              <div style={{ position: "relative" }}>
                <select name="role" value={form.role} onChange={handleChange} style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: "36px" }}>
                  <option value="HR">HR Manager</option>
                  <option value="MANAGER">Manager</option>
                </select>
                <ChevronDown size={15} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Department (optional) */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Department (Optional)
              </label>
              <div style={{ position: "relative" }}>
                <select name="departmentId" value={form.departmentId} onChange={handleChange} style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: "36px" }}>
                  <option value="">No Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #6c63ff, #a855f7)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? (
              <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            ) : (
              <><Send size={16} /><span>Send Invite Email</span></>
            )}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "11px 14px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
  background: "#fafafa",
  transition: "border 0.2s",
};

export default InvitePage;
