import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Building2, Briefcase, FileText, TrendingUp, Bell, Search } from "lucide-react";
import { motion } from "framer-motion";

import StatsCard from "../../components/Admin/Dashboard/StatsCard";
import DepartmentChart from "../../components/Admin/Dashboard/DepartmentChart";
import RecentActivity from "../../components/Admin/Dashboard/RecentActivity";

import { GlobleContext } from "../../context/GlobleContext";
import { useContext } from "react";

const AdminDashboardPage = () => {
  const { adminStats, setAdminStats } = useContext(GlobleContext);
  const [loading, setLoading] = useState(!adminStats);

  useEffect(() => {
    const fetchStats = async () => {
      // If data already exists, don't show loading state
      if (adminStats) {
        setLoading(false);
      }

      try {
        const res = await axios.get("http://localhost:3000/api/admin/dashboard-stats", {
          withCredentials: true,
        });
        setAdminStats(res.data);
      } catch (error) {
        console.error("Dashboard Error:", error);
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
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const stats = [
    { title: "Total Talent", value: adminStats?.stats.totalEmployees, icon: Users, color: "blue", delay: 0 },
    { title: "Departments", value: adminStats?.stats.totalDepartments, icon: Building2, color: "indigo", delay: 0.1 },
    { title: "Active Projects", value: adminStats?.stats.totalProjects, icon: Briefcase, color: "green", delay: 0.2 },
    { title: "Pending Leaves", value: adminStats?.stats.pendingLeaves, icon: FileText, color: "orange", delay: 0.3 },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitoring organizational health & efficiency</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search metrics..." 
                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-64"
                />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 hover:bg-blue-700 transition-all cursor-pointer">
                <TrendingUp className="w-4 h-4" />
                Generate Report
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workforce Distribution Chart */}
        <div className="lg:col-span-2">
            <DepartmentChart data={adminStats?.chartData || []} />
        </div>

        {/* Activity Sidebar */}
        <RecentActivity activities={adminStats?.recentActivity || []} />

      </div>

    </div>
  );
};

export default AdminDashboardPage;
