import React from "react";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const MangRecentLeaves = ({ activity = [] }) => {
  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Recent Leave Requests</h3>
        <Link 
          to="/manager/leavemanagement" 
          className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group"
        >
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {activity.length > 0 ? (
          <div className="space-y-1">
            {activity.map((leave) => (
              <div
                key={leave.id}
                className="group flex flex-col p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm">
                      {leave.firstName?.[0]}{leave.lastName?.[0] || ""}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {leave.firstName} {leave.lastName}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400">
                        {leave.type} LEAVE
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                        leave.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : leave.status === "REJECTED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-2 pl-13">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(leave.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
            <Clock className="w-12 h-12 mb-3 bg-slate-50 rounded-full p-2" />
            <p className="font-medium">No recent leave requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MangRecentLeaves;
