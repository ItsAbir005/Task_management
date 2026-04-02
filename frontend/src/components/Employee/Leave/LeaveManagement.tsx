import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { CalendarDays, PlusCircle, Loader2, FileText, CheckCircle2, XCircle, Clock, Crown, User2 } from "lucide-react";
import LeaveManagementForm from "./LeaveManagementForm";
import socket from "../../../utils/socket";
import { GlobleContext } from "../../../context/GlobleContext";

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

// Multi-level Pipeline Stage Component
const ApprovalPipeline = ({ managerStatus, hrStatus, managerId }) => {
  const stages = [];

  // Only show Manager stage if there's a manager assigned
  if (managerId !== undefined) {
    stages.push({ key: "manager", label: "Manager", status: managerStatus });
  }
  stages.push({ key: "hr", label: "HR Final", status: hrStatus });

  const stageColor = (status) => {
    if (status === "APPROVED") return { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200" };
    if (status === "REJECTED") return { bg: "bg-rose-500",    text: "text-rose-600",    ring: "ring-rose-200"   };
    return { bg: "bg-slate-300", text: "text-slate-400", ring: "ring-slate-100" };
  };

  const stageIcon = (status) => {
    if (status === "APPROVED") return <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
    if (status === "REJECTED") return <XCircle      className="w-3.5 h-3.5 text-white" />;
    return <Clock className="w-3.5 h-3.5 text-white" />;
  };

  return (
    <div className="flex items-center gap-1 mt-3">
      {stages.map((stage, i) => {
        const c = stageColor(stage.status);
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center ring-2 ${c.ring}`}>
                {stageIcon(stage.status)}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${c.text}`}>{stage.label}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 ${managerStatus === "APPROVED" ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function LeaveManagement() {
  const [showForm, setShowForm]   = useState(false);
  const [leaves, setLeaves]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  const { user } = useContext(GlobleContext);
  const userId = user?.id;

  const filtered = activeTab === "ALL"
    ? leaves
    : leaves.filter(l => l.status === activeTab);

  const counts = {
    ALL:      leaves.length,
    PENDING:  leaves.filter(l => l.status === "PENDING").length,
    APPROVED: leaves.filter(l => l.status === "APPROVED").length,
    REJECTED: leaves.filter(l => l.status === "REJECTED").length,
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/getLeaves", { withCredentials: true });
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    if (userId) socket.emit("join", userId);
    socket.on("leave-updated", ({ leave }) => {
      setLeaves(prev => prev.map(l => l.id === leave.id ? { ...l, ...leave } : l));
    });
    return () => socket.off("leave-updated");
  }, [userId]);

  const handleNewLeave = (newLeave) => {
    setLeaves(prev => [newLeave, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-6 rounded-3xl border border-white backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Leaves</h1>
            <p className="text-sm font-medium text-slate-500">Track your leave history and approval stage</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-sm transition-all duration-200 hover:shadow-violet-200 hover:shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* Segmented Tabs */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner flex-wrap gap-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2 text-sm font-bold rounded-xl transition-colors duration-300 ${
              activeTab === tab ? "text-violet-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="empLeaveTab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? "bg-violet-100 text-violet-700" : "bg-slate-200 text-slate-500"
              }`}>
                {counts[tab]}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-violet-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="mt-3 font-medium text-slate-500">Fetching your leaves...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto">
          <FileText className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-xl font-bold text-slate-700">No {activeTab === "ALL" ? "" : activeTab.toLowerCase()} leaves</h3>
          <p className="text-slate-500 font-medium mt-1">You haven't submitted any leaves in this category.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((leave, index) => (
              <LeaveCard key={leave.id} leave={leave} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <LeaveManagementForm
          closeForm={() => setShowForm(false)}
          onCreateLeave={handleNewLeave}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Leave Card
// ─────────────────────────────────────────────────────
const GLOBAL_STATUS = {
  PENDING:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400",   label: "Pending"  },
  APPROVED: { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-400", label: "Approved" },
  REJECTED: { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200",   dot: "bg-rose-400",    label: "Rejected" },
};

const LeaveCard = ({ leave, index }) => {
  const cfg = GLOBAL_STATUS[leave.status] || GLOBAL_STATUS.PENDING;
  const days = Math.ceil(
    (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all duration-300 overflow-hidden flex flex-col group"
    >
      {/* Top accent */}
      <div className={`h-1 w-full ${cfg.dot}`} />

      <div className="p-6 flex flex-col gap-4">
        {/* Type + Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg capitalize leading-tight">{leave.type}</h3>
              <p className="text-xs font-semibold text-slate-400">{days} day{days > 1 ? "s" : ""}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">From</p>
            <p className="text-sm font-bold text-slate-700">
              {new Date(leave.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">To</p>
            <p className="text-sm font-bold text-slate-700">
              {new Date(leave.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        {/* Reason */}
        {leave.reason && (
          <p className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 line-clamp-2">
            {leave.reason}
          </p>
        )}

        {/* Multi-level Approval Pipeline */}
        <ApprovalPipeline
          managerId={leave.managerId}
          managerStatus={leave.managerStatus}
          hrStatus={leave.hrStatus}
        />

        {/* Approvers */}
        {(leave.manager || leave.hr) && (
          <div className="flex gap-3 pt-1">
            {leave.manager && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                {leave.manager.firstName} {leave.manager.lastName}
              </div>
            )}
            {leave.hr && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <User2 className="w-3.5 h-3.5 text-indigo-400" />
                {leave.hr.firstName} {leave.hr.lastName}
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-slate-400 font-semibold text-right">
          Applied: {new Date(leave.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </motion.div>
  );
};
