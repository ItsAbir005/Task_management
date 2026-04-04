import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ClipboardList, Calendar, CheckCircle2,
  XCircle, Clock, Filter, ChevronDown
} from "lucide-react";
import { GlobleContext } from "../../context/GlobleContext";

const API = "http://localhost:3000/api/admin";

const STATUS_CONFIG: Record<string, any> = {
  PENDING:  { label: "Pending",  color: "amber",   bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  APPROVED: { label: "Approved", color: "emerald",  bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-400" },
  REJECTED: { label: "Rejected", color: "rose",    bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200",   dot: "bg-rose-400"   },
};

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export default function MangLeaveManagement() {
  const [leaves, setLeaves]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null); // leaveId being updated

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API}/manager-leaves`, { withCredentials: true });
        setLeaves(data.leaves || []);
      } catch (err) {
        console.error("Error fetching manager leaves:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = activeTab === "ALL"
    ? leaves
    : leaves.filter((l: any) => l.managerStatus === activeTab);

  // ── Action ─────────────────────────────────────────────────────────────────
  const handleDecision = async (leaveId: string, managerStatus: string) => {
    setUpdating(leaveId);
    try {
      const { data } = await axios.put(
        `${API}/manager-leave-status`,
        { leaveId, managerStatus },
        { withCredentials: true }
      );
      // Optimistic update
      setLeaves((prev: any[]) =>
        prev.map((l: any) => l.id === leaveId ? { ...l, managerStatus, status: data.leave.status } : l)
      );
    } catch (err) {
      console.error("Error updating leave:", err);
    } finally {
      setUpdating(null);
    }
  };

  // ── Counts ─────────────────────────────────────────────────────────────────
  const counts: Record<string, number> = {
    ALL:      leaves.length,
    PENDING:  leaves.filter(l => l.managerStatus === "PENDING").length,
    APPROVED: leaves.filter(l => l.managerStatus === "APPROVED").length,
    REJECTED: leaves.filter(l => l.managerStatus === "REJECTED").length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 bg-white/60 p-6 rounded-3xl border border-white backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Leave Approvals</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Review and action your team members' leave requests</p>
          </div>
        </div>
      </div>

      {/* ── Segmented Tabs ──────────────────────────────────────────────────── */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner flex-wrap gap-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2 text-sm font-bold rounded-xl transition-colors duration-300 ${
              activeTab === tab ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="mangLeaveTab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
              }`}>
                {counts[tab]}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-indigo-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="mt-3 font-medium text-slate-500">Loading leave requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((leave, index) => (
              <LeaveCard
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

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

const LeaveCard = ({ leave, index, updating, onDecision }: any) => {
  const cfg = STATUS_CONFIG[leave.managerStatus] || STATUS_CONFIG.PENDING;
  const isPending = leave.managerStatus === "PENDING";
  const isUpdating = updating === leave.id;

  const emp = leave.employee;
  const initials = `${emp?.firstName?.[0] ?? ""}${emp?.lastName?.[0] ?? ""}`;
  const days = Math.ceil(
    (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`bg-white rounded-[24px] border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group ${
        isPending ? "border-slate-100 hover:border-indigo-100" : `${cfg.border} ${cfg.bg}/20`
      }`}
    >
      {/* Top accent line */}
      <div className={`h-1 w-full ${isPending ? "bg-gradient-to-r from-indigo-400 to-violet-400" : cfg.dot}`} />

      <div className="p-6 flex flex-col gap-4">
        {/* Employee Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">
                {emp?.firstName} {emp?.lastName}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {emp?.department?.name || emp?.role || "Employee"}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Leave Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoPill icon={<Calendar className="w-3.5 h-3.5" />} label="From" value={new Date(leave.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
          <InfoPill icon={<Calendar className="w-3.5 h-3.5" />} label="To"   value={new Date(leave.endDate).toLocaleDateString("en-IN",   { day: "numeric", month: "short" })} />
          <InfoPill icon={<Clock className="w-3.5 h-3.5" />}    label="Duration" value={`${days} day${days > 1 ? "s" : ""}`} />
          <InfoPill icon={<ClipboardList className="w-3.5 h-3.5" />} label="Type"  value={leave.type} />
        </div>

        {/* Reason */}
        {leave.reason && (
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Reason</p>
            <p className="text-sm text-slate-600 font-medium line-clamp-2">{leave.reason}</p>
          </div>
        )}

        {/* Action Buttons (only for PENDING) */}
        {isPending && (
          <div className="flex gap-3 mt-2">
            <button
              disabled={isUpdating}
              onClick={() => onDecision(leave.id, "APPROVED")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-emerald-200 hover:shadow-md"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve
            </button>
            <button
              disabled={isUpdating}
              onClick={() => onDecision(leave.id, "REJECTED")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white text-sm font-bold border border-rose-200 transition-all duration-200 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          </div>
        )}

        {/* Applied At */}
        <p className="text-[10px] font-semibold text-slate-400 text-right">
          Applied: {new Date(leave.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </motion.div>
  );
};

const InfoPill = ({ icon, label, value }: any) => (
  <div className="flex flex-col gap-0.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="text-sm font-bold text-slate-700 capitalize">{value}</p>
  </div>
);

const EmptyState = ({ tab }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto"
  >
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <ClipboardList className="w-8 h-8 text-slate-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-700">No {tab === "ALL" ? "" : tab.toLowerCase()} leaves</h3>
    <p className="text-slate-500 font-medium mt-1">Your team has no matching leave requests.</p>
  </motion.div>
);
