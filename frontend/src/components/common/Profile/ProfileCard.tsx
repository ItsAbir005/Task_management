import React from "react";
import { motion } from "framer-motion";
import { Mail, Briefcase, Activity, Building2 } from "lucide-react";

const InfoRow = ({ icon: Icon, label, value, themeColor = "violet" }) => {
  const iconClasses = {
    violet: "group-hover/row:bg-violet-50 group-hover/row:text-violet-600",
    emerald: "group-hover/row:bg-emerald-50 group-hover/row:text-emerald-600",
    blue: "group-hover/row:bg-blue-50 group-hover/row:text-blue-600",
    indigo: "group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600",
  }[themeColor];

  return (
    <div className="flex items-center gap-4 group/row cursor-default">
      <div className={`p-2.5 bg-slate-50 rounded-xl transition-colors duration-300 flex-shrink-0 ${iconClasses}`}>
        <Icon className="w-4 h-4 text-slate-400 transition-colors duration-300" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
};

const ProfileCard = ({ user, personalInfo, employmentInfo, themeColor = "violet", stats = [] }) => {
  const initials = `${personalInfo.firstName.charAt(0)}${personalInfo.lastName.charAt(0)}`.toUpperCase() || "U";

  const gradientClasses = {
    violet: "from-violet-400 via-fuchsia-500 to-violet-700 shadow-violet-500/30",
    emerald: "from-emerald-400 via-teal-500 to-emerald-700 shadow-emerald-500/30",
    blue: "from-blue-400 via-sky-500 to-blue-700 shadow-blue-500/30",
    indigo: "from-indigo-400 via-blue-500 to-indigo-700 shadow-indigo-500/30",
  }[themeColor];

  const badgeClasses = {
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  }[themeColor];

  const dotClasses = {
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
  }[themeColor];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-500/5 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-transparent to-slate-50/30 pointer-events-none" />
        
        {/* Avatar */}
        <div className="relative mx-auto w-28 h-28 mb-5">
          <div className={`w-full h-full bg-gradient-to-br ${gradientClasses} rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl select-none`}>
            {initials}
          </div>
          <div className={`absolute bottom-1 right-1 w-5 h-5 ${dotClasses} rounded-full border-2 border-white shadow`} />
        </div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {personalInfo.firstName || user?.firstName} {personalInfo.lastName || user?.lastName}
        </h2>
        
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <span className={`px-3 py-1 ${badgeClasses} text-[10px] font-black rounded-full uppercase tracking-widest border`}>
            {user?.role || "Member"}
          </span>
          <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${
            employmentInfo.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
          }`}>
            {employmentInfo.status}
          </span>
        </div>

        {/* Info rows */}
        <div className="mt-8 space-y-4 text-left border-t border-slate-50 pt-7">
          <InfoRow icon={Mail} label="Corporate Email" value={user?.email || "—"} themeColor={themeColor} />
          <InfoRow icon={Briefcase} label="Position · Department" value={`${personalInfo.position || "—"} · ${employmentInfo.department}`} themeColor={themeColor} />
          <InfoRow icon={Activity} label="Employment Type" value={employmentInfo.employmentType?.replace("_", " ") || "—"} themeColor={themeColor} />
        </div>
      </div>

      {/* Employment Records Card */}
      <motion.div whileHover={{ scale: 1.015 }} className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-xl shadow-slate-500/5 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 ${badgeClasses} rounded-xl`}>
            <Building2 className={`w-5 h-5 ${themeColor === 'violet' ? 'text-violet-600' : themeColor === 'emerald' ? 'text-emerald-600' : 'text-blue-600'}`} />
          </div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">Employment Records</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined On</p>
            <p className="text-sm font-bold text-slate-700">{employmentInfo.dateOfJoining}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Compensation</p>
            <p className="text-sm font-bold text-slate-700">{employmentInfo.salary}</p>
          </div>
        </div>
      </motion.div>

      {/* Optional Stats Snapshot */}
      {stats.length > 0 && (
        <motion.div whileHover={{ scale: 1.015 }} className={`bg-gradient-to-br ${gradientClasses} rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden`}>
          <div className="relative z-10">
            <p className="text-white/80 text-[9px] font-black uppercase tracking-[0.25em] mb-3">Snapshot</p>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  {Icon && <Icon className="w-4 h-4 text-white/70 mb-1.5" />}
                  <p className="text-xl font-black text-white leading-none">{value}</p>
                  <p className="text-[9px] font-bold text-white/70 uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileCard;
