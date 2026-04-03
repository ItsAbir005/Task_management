import React, { useState, useContext } from "react";
import axios from "axios";
import { GlobleContext } from "../../context/GlobleContext";
import { Mail, UserPlus, Send, CheckCircle, ChevronDown, Users } from "lucide-react";

const ManagerInvitePage = () => {
  const { departments } = useContext(GlobleContext)!;
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    salary: "",
  });
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
        "http://localhost:3000/api/auth/inviteEmployee",
        form,
        { withCredentials: true }
      );
      setSuccess(res.data.message);
      if (!res.data.emailSent && res.data.setupLink) {
        setSetupLink(res.data.setupLink);
      } else {
        setSetupLink("");
      }
      setForm({ firstName: "", lastName: "", email: "", departmentId: "", salary: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", maxWidth: "700px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Users size={24} color="#10b981" />
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1e1b4b", margin: 0 }}>Invite Employee</h1>
        </div>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Invite a new employee to your team. They will receive an email to set up their account and password.
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
        border: "1px solid #a7f3d0",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}>
        <Send size={18} color="#059669" style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 700, color: "#065f46", margin: "0 0 4px", fontSize: "14px" }}>How it works</p>
          <p style={{ color: "#047857", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>
            Enter the employee's details and click send. They'll receive a personalized email from you with a secure link to set up their password and log in.
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <UserPlus size={18} color="#10b981" />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e1b4b", margin: 0 }}>New Employee Details</h2>
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
            <div
              style={{
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
            <div>
              <label style={labelStyle}>First Name *</label>
              <input type="text" name="firstName" placeholder="Jane" value={form.firstName} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input type="text" name="lastName" placeholder="Smith" value={form.lastName} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Work Email *</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="email"
                name="email"
                placeholder="jane@company.com"
                value={form.email}
                onChange={handleChange}
                required
                style={{ ...inputStyle, paddingLeft: "36px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            {/* Department */}
            <div>
              <label style={labelStyle}>Department (Optional)</label>
              <div style={{ position: "relative" }}>
                <select name="departmentId" value={form.departmentId} onChange={handleChange} style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: "36px" }}>
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Salary */}
            <div>
              <label style={labelStyle}>Monthly Salary (Optional)</label>
              <input
                type="number"
                name="salary"
                placeholder="45000"
                value={form.salary}
                onChange={handleChange}
                style={inputStyle}
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #10b981, #059669)",
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
            }}
          >
            {loading ? (
              <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            ) : (
              <><Send size={16} /><span>Send Invite to Employee</span></>
            )}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
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

export default ManagerInvitePage;
