import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ClipboardCheck, Calendar, Crown } from "lucide-react";
import axios from "axios";
import { GlobleContext } from "../../context/GlobleContext";

const API = "http://localhost:3000/api/admin";

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const TYPE_COLORS = {
  SICK:      "bg-blue-100 text-blue-700",
  VACATION:  "bg-violet-100 text-violet-700",
  CASUAL:    "bg-orange-100 text-orange-700",
  UNPAID:    "bg-slate-100 text-slate-600",
  MATERNITY: "bg-pink-100 text-pink-700",
  PATERNITY: "bg-indigo-100 text-indigo-700",
  OTHER:     "bg-teal-100 text-teal-700",
};

const STATUS_CFG = {
  PENDING:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  REJECTED: { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-400"    },
};

export default function HRLeaveManagement() {
  const { leaves, setLeaves } = useContext(GlobleContext);
  const [filter, setFilter]   = useState("ALL");
  const [loading, setLoading] = useState(!leaves?.length);
  const [updating, setUpdating] = useState(null);

  const fetchLeaves = async () => {
    try {
      const { data } = await axios.get(`${API}/getHRLeave`, { withCredentials: true });
      setLeaves(data.leave || []);
    } catch (err) {
      console.error("Error fetching HR leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const filtered = filter === "ALL" ? (leaves || []) : (leaves || []).filter(l => l.hrStatus === filter || (filter === "PENDING" && !l.hrStatus));

  const counts = {
    ALL:      (leaves || []).length,
    PENDING:  (leaves || []).filter(l => !l.hrStatus || l.hrStatus === "PENDING").length,
    APPROVED: (leaves || []).filter(l => l.hrStatus === "APPROVED").length,
    REJECTED: (leaves || []).filter(l => l.hrStatus === "REJECTED").length,
  };

  const handleDecision = async (leaveId, hrStatus) => {
    setUpdating(leaveId);
    try {
      const { data } = await axios.post(
        `${API}/updateLeaveStatus`,
        { leaveId, hrStatus },
        { withCredentials: true }
      );
      setLeaves(prev =>
        prev.map(l => l.id === leaveId ? { ...l, hrStatus, status: data.leave.status } : l)
      );
    } catch (err) {
      console.error("Error updating leave:", err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/60 p-6 rounded-3xl border border-white backdrop-blur-xl shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">HR Leave Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Final HR decision on Manager-approved leave requests
          </p>
        </div>
        <div className="md:ml-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Only Manager-Approved Leaves Shown
          </span>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner flex-wrap gap-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`relative px-5 py-2 text-sm font-bold rounded-xl transition-colors duration-300 ${
              filter === tab ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {filter === tab && (
              <motion.div
                layoutId="hrLeaveTab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === tab ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
              }`}>
                {counts[tab]}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-indigo-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="mt-3 font-medium text-slate-500">Loading leave requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto">
          <ClipboardCheck className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-xl font-bold text-slate-700">No {filter === "ALL" ? "" : filter.toLowerCase()} leaves</h3>
          <p className="text-slate-500 font-medium mt-1">No manager-approved requests in this category.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((leave, index) => (
              <HRLeaveCard
                key={leave.id}
                leave={leave}
                index={index}
                updating={updating}
                onDecision={handleDecision}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// HR Leave Card
// ─────────────────────────────────────────────────────
const HRLeaveCard = ({ leave, index, updating, onDecision }) => {
  const hrS = leave.hrStatus || "PENDING";
  const cfg = STATUS_CFG[hrS] || STATUS_CFG.PENDING;
  const isPending = hrS === "PENDING";
  const isUpdating = updating === leave.id;
  const emp = leave.employee;
  const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
  const initials = `${emp?.firstName?.[0] ?? ""}${emp?.lastName?.[0] ?? ""}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`bg-white rounded-[24px] border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group ${
        isPending ? "border-slate-100 hover:border-indigo-100" : `${cfg.border}`
      }`}
    >
      {/* Accent top bar */}
      <div className={`h-1 ${isPending ? "bg-gradient-to-r from-indigo-400 to-violet-400" : cfg.dot}`} />

      <div className="p-6 flex flex-col gap-4">
        {/* Employee Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{emp?.firstName} {emp?.lastName}</h3>
              <p className="text-xs font-semibold text-slate-400">{emp?.department?.name || emp?.role}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${TYPE_COLORS[leave.type] || "bg-slate-100 text-slate-600"}`}>
            {leave.type}
          </span>
        </div>

        {/* Manager Pre-approval Banner */}
        {leave.manager && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-xs font-bold text-amber-700">
              Manager Approved by {leave.manager.firstName} {leave.manager.lastName}
            </p>
          </div>
        )}

        {/* Date Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "From",  value: new Date(leave.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) },
            { label: "To",    value: new Date(leave.endDate).toLocaleDateString("en-IN",   { day: "numeric", month: "short" }) },
            { label: "Days",  value: `${days}d` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
              <p className="text-sm font-bold text-slate-700">{value}</p>
            </div>
          ))}
        </div>

        {/* Reason */}
        {leave.reason && (
          <p className="text-sm text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 line-clamp-2 font-medium">
            {leave.reason}
          </p>
        )}

        {/* HR Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            HR: {isPending ? "Awaiting Decision" : hrS}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {new Date(leave.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex gap-3">
            <button
              disabled={isUpdating}
              onClick={() => onDecision(leave.id, "APPROVED")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-sm hover:shadow-emerald-200 hover:shadow-md"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve
            </button>
            <button
              disabled={isUpdating}
              onClick={() => onDecision(leave.id, "REJECTED")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white text-sm font-bold border border-rose-200 transition-all disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
