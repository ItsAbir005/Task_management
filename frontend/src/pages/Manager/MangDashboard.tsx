import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Loader2, FolderTree, Users, Palmtree, CheckCircle } from "lucide-react";
import { GlobleContext } from "../../context/GlobleContext";
import StatsCard from "../../components/Admin/Dashboard/StatsCard";
import MangRecentLeaves from "../../components/Manager/Dashboard/MangRecentLeaves";
import MangProjectChart from "../../components/Manager/Dashboard/MangProjectChart";

const MangDashboard = () => {
  const { managerStats, setManagerStats } = useContext(GlobleContext) as any;
  const [loading, setLoading] = useState(!managerStats);

  useEffect(() => {
    const fetchStats = async () => {
      // Don't show loading overlay if data already exists in context
      if (managerStats) {
        setLoading(false);
      }

      try {
        const res = await axios.get("http://localhost:3000/api/admin/manager-dashboard-stats", {
          withCredentials: true,
        });
        if (res.data.success) {
          setManagerStats(res.data);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [setManagerStats]); // managerStats is deliberately omitted to prevent infinite loops

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-indigo-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg text-slate-700">Synthesizing Control Center...</p>
      </div>
    );
  }

  // Fallback defaults
  const stats = managerStats?.stats || {
    totalProjects: 0,
    teamMembersCount: 0,
    pendingLeaves: 0,
    completedProjects: 0,
  };

  const statCards = [
    { title: "Managed Projects", value: stats.totalProjects, icon: FolderTree, color: "indigo", delay: 0 },
    { title: "Team Members", value: stats.teamMembersCount, icon: Users, color: "blue", delay: 0.1 },
    { title: "Pending Leaves", value: stats.pendingLeaves, icon: Palmtree, color: "amber", delay: 0.2 },
    { title: "Projects Completed", value: stats.completedProjects, icon: CheckCircle, color: "emerald", delay: 0.3 },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/60 p-6 rounded-3xl border border-white backdrop-blur-xl shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manager Dashboard</h1>
          </div>
          <p className="text-slate-500 font-medium">
            Monitor your team performance, project throughput, and pending action items.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Interactive Charts & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MangProjectChart chartData={managerStats?.chartData} />
        </div>
        <div className="lg:col-span-2">
          <MangRecentLeaves activity={managerStats?.recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default MangDashboard;
