import React from "react";
import { UserCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";

const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Recent Hires</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-lg">LIVE</span>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 max-h-[300px]">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.email}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800 text-sm">{activity.firstName}</p>
                <div className="flex items-center text-xs text-gray-400 gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                Joined as <span className="text-indigo-600 font-bold">{activity.role}</span>
              </p>
              <p className="text-[10px] text-gray-400 truncate">{activity.email}</p>
            </div>
          </motion.div>
        ))}
        {activities.length === 0 && (
          <p className="text-center text-gray-500 py-10">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
