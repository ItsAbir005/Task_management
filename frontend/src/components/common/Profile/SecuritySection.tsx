import React, { useState } from "react";
import { Lock, Fingerprint, Shield, Eye, EyeOff, Loader2, Save } from "lucide-react";
import ProfileField from "./ProfileField";

const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too Short", color: "#f87171" },
    { label: "Weak", color: "#fbbf24" },
    { label: "Fair", color: "#fb923c" },
    { label: "Strong", color: "#34d399" },
    { label: "Very Strong", color: "#10b981" },
  ];
  return { score, ...map[score] };
};

const SecuritySection = ({ onSubmit, loading, themeColor = "violet" }) => {
  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const strength = getStrength(securityInfo.newPassword);
  const passwordsMatch = securityInfo.newPassword === securityInfo.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(securityInfo, () => {
      setSecurityInfo({ currentPassword: "", newPassword: "", confirmPassword: "" });
    });
  };

  const btnClasses = {
    violet: "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20",
    emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
    blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
    indigo: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
  }[themeColor];

  const iconClasses = {
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    indigo: "text-indigo-600",
  }[themeColor];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Lock className={`w-5 h-5 ${iconClasses}`} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">
            Security & Password
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Keep your account safe with a strong, unique password
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type={showPasswords.current ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={securityInfo.currentPassword}
              onChange={(e) =>
                setSecurityInfo({ ...securityInfo, currentPassword: e.target.value })
              }
              required
              className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none transition-all font-semibold text-slate-700 tracking-[0.25em] placeholder:tracking-normal focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              New Password
            </label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPasswords.new ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={securityInfo.newPassword}
                onChange={(e) =>
                  setSecurityInfo({ ...securityInfo, newPassword: e.target.value })
                }
                required
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none transition-all font-semibold text-slate-700 tracking-[0.25em] placeholder:tracking-normal focus:ring-2 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {securityInfo.newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: i <= strength.score ? strength.color : "#e2e8f0",
                        transition: "background-color 0.3s",
                      }}
                      className="h-1.5 flex-1 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-[10px] font-bold ml-1" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={securityInfo.confirmPassword}
                onChange={(e) =>
                  setSecurityInfo({ ...securityInfo, confirmPassword: e.target.value })
                }
                required
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none transition-all font-semibold text-slate-700 tracking-[0.25em] placeholder:tracking-normal focus:ring-2 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {securityInfo.confirmPassword && (
              <p
                className={`text-[10px] font-bold ml-1 mt-1 ${
                  passwordsMatch ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !passwordsMatch || securityInfo.newPassword.length < 6}
            className={`group flex items-center gap-3 px-8 py-4 ${btnClasses} text-white font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            )}
            <span className="uppercase text-xs tracking-widest">
              {loading ? "Updating..." : "Change Password"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySection;
