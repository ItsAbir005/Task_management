import React from "react";
import { Stethoscope, Umbrella, Send, HelpCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const HrRecentActivity = ({ activities }) => {

  const getLeaveIconAndColor = (type) => {
    switch (type) {
        case "SICK":
            return { icon: Stethoscope, bg: "bg-red-50", text: "text-red-500" }
        case "VACATION":
            return { icon: Umbrella, bg: "bg-blue-50", text: "text-blue-500" }
        case "CASUAL":
            return { icon: Send, bg: "bg-green-50", text: "text-green-500" }
        default:
            return { icon: HelpCircle, bg: "bg-gray-50", text: "text-gray-500" }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
        case "APPROVED":
            return "text-green-600 font-semibold";
        case "REJECTED":
            return "text-red-600 font-semibold";
        default:
            return "text-amber-500 font-semibold";
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Recent Leave Requests</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg">LIVE</span>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 max-h-[300px]">
        {activities.map((activity, index) => {
          const { icon: Icon, bg, text } = getLeaveIconAndColor(activity.type);
          
          return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${text} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800 text-sm">{activity.firstName} {activity.lastName}</p>
                <div className="flex items-center text-xs text-gray-400 gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                Applied for <span className="text-indigo-600 font-bold">{activity.type}</span> leave
              </p>
              <div className="flex justify-between items-center mt-1">
                  <p className="text-[10px] text-gray-400 truncate w-32">{activity.email}</p>
                  <p className={`text-[10px] ${getStatusColor(activity.status)}`}>{activity.status}</p>
              </div>
            </div>
          </motion.div>
        )})}
        {(!activities || activities.length === 0) && (
          <p className="text-center text-gray-500 py-10">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default HrRecentActivity;
