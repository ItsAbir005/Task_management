import React from "react";
import { motion } from "framer-motion";

const HrLeaveChart = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const getGradient = (status) => {
    switch(status) {
        case "APPROVED":
            return "from-emerald-400 to-green-600";
        case "PENDING":
             return "from-amber-400 to-orange-500";
        case "REJECTED":
             return "from-red-400 to-rose-600";
        default:
             return "from-blue-400 to-indigo-600";
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Leave Requests Overview</h3>
      
      <div className="space-y-6">
        {data.map((stat, index) => (
          <div key={stat.name} className="group">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase group-hover:text-blue-600 transition-colors">
                {stat.name}
              </span>
              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-0.5 rounded-full">{stat.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stat.value / maxVal) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                className={`bg-gradient-to-r ${getGradient(stat.name)} h-full rounded-full shadow-sm`}
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
            <div className="text-center text-gray-500 py-4">
                No leave request data available yet.
            </div>
        )}
      </div>
    </div>
  );
};

export default HrLeaveChart;
