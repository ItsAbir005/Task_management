import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CheckSquare, Briefcase, FileText, Activity, Clock, ShieldCheck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

import StatsCard from "../../components/Admin/Dashboard/StatsCard";
import { GlobleContext } from "../../context/GlobleContext";

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
    { title: "In Progress Tasks", value: empStats?.stats?.inProgressTasks || 0, icon: Activity, color: "indigo", delay: 0.2 },
    { title: "Completed Tasks", value: empStats?.stats?.completedTasks || 0, icon: CheckCircle, color: "green", delay: 0.3 },
  ];

  const recentActivity = empStats?.recentActivity || [];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-indigo-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user?.firstName || 'Employee'}!
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Here is what's happening with your projects and tasks today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Recent Assignments
          </h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500 mt-1">Assigned by {activity.user} • {new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckSquare className="w-8 h-8 text-gray-400" />
               </div>
               <p className="text-gray-500 font-medium">No recent assignments yet.</p>
             </div>
          )}
        </div>
        
        {/* Quick Leave Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
             <FileText className="w-5 h-5 text-orange-500" />
             Leaves Overview
          </h3>
          <div className="space-y-6">
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
      </div>
    </div>
  );
};

export default EmpDashboard;
