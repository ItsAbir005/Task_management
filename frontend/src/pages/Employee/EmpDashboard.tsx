import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  CheckSquare,
  Briefcase,
  FileText,
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import StatsCard from "../../components/Admin/Dashboard/StatsCard";
import { GlobleContext } from "../../context/GlobleContext";

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-rose-100 text-rose-700",
};

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  TODO: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  IN_PROGRESS: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
};

const EmpDashboard = () => {
  const { empStats, setEmpStats, user } = useContext(GlobleContext) as any;
  const [loading, setLoading] = useState(!empStats);

  useEffect(() => {
    const fetchStats = async () => {
      if (empStats) setLoading(false);
      try {
        const res = await axios.get("http://localhost:3000/api/admin/emp-dashboard-stats", {
          withCredentials: true,
        });
        setEmpStats(res.data);
      } catch (error) {
        console.error("Employee Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const stats = [
    { title: "Total Projects", value: empStats?.stats?.totalProjects || 0, icon: Briefcase, color: "blue", delay: 0 },
    { title: "Pending Tasks", value: empStats?.stats?.pendingTasks || 0, icon: Clock, color: "orange", delay: 0.1 },
    { title: "In Progress", value: empStats?.stats?.inProgressTasks || 0, icon: Activity, color: "indigo", delay: 0.2 },
    { title: "Completed", value: empStats?.stats?.completedTasks || 0, icon: CheckCircle, color: "green", delay: 0.3 },
  ];

  const recentActivity: any[] = empStats?.recentActivity || [];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-indigo-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user?.firstName || "Employee"}!
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Here is what's happening with your projects and tasks today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Task Assignments — enriched */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Recent Assignments
          </h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any, index: number) => {
                const st = statusColors[activity.status] || statusColors["TODO"];
                return (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-50 group"
                  >
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${st.bg} ${st.text}`}>
                      {st.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-gray-800 font-bold text-sm leading-tight">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {/* Priority badge */}
                          {activity.priority && (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${priorityColors[activity.priority] || "bg-slate-100 text-slate-600"}`}>
                              {activity.priority}
                            </span>
                          )}
                          {/* Status badge */}
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                            {(activity.status || "TODO").replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Project & creator row */}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {activity.project && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Briefcase className="w-2.5 h-2.5" />
                            {activity.project.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-medium">
                          Assigned by{" "}
                          <span className="font-bold text-gray-600">{activity.user}</span>
                          {" "}({activity.creatorRole || "Manager"})
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                        {activity.commentCount > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600">
                            <MessageSquare className="w-3 h-3" />
                            {activity.commentCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent assignments yet.</p>
              <p className="text-gray-400 text-sm mt-1">Tasks assigned by your manager will appear here.</p>
            </div>
          )}
        </div>

        {/* Leaves + Quick Stats */}
        <div className="space-y-6">
          {/* Leaves Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Leaves Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Pending</span>
                </div>
                <span className="text-xl font-bold text-orange-600">{empStats?.stats?.pendingLeaves || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Approved</span>
                </div>
                <span className="text-xl font-bold text-green-600">{empStats?.stats?.approvedLeaves || 0}</span>
              </div>
            </div>
          </div>

          {/* Task Progress card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-indigo-200">Task Progress</h3>
            <div className="space-y-3">
              {[
                { label: "Completed", value: empStats?.stats?.completedTasks || 0, total: empStats?.stats?.totalTasks || 1, color: "bg-emerald-400" },
                { label: "In Progress", value: empStats?.stats?.inProgressTasks || 0, total: empStats?.stats?.totalTasks || 1, color: "bg-amber-400" },
                { label: "Todo", value: empStats?.stats?.pendingTasks || 0, total: empStats?.stats?.totalTasks || 1, color: "bg-slate-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white/80">{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.round((item.value / item.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpDashboard;
