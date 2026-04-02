import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const ProfileHeader = ({ title, subtitle, badgeText, themeColor = "violet" }) => {
  const badgeClasses = {
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  }[themeColor];

  const iconClasses = {
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    indigo: "text-indigo-600",
  }[themeColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-8 shadow-sm relative overflow-hidden"
    >
      <div className={`absolute -top-14 -right-14 w-52 h-52 rounded-full ${themeColor === 'violet' ? 'bg-violet-100/60' : 'bg-emerald-100/60'} blur-2xl pointer-events-none opacity-50`} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">{subtitle}</p>
        </div>
        {badgeText && (
          <div className={`flex items-center gap-2 px-4 py-2 ${badgeClasses} rounded-full border`}>
            <Activity className={`w-4 h-4 ${iconClasses} animate-pulse`} />
            <span className="text-sm font-bold">{badgeText}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
