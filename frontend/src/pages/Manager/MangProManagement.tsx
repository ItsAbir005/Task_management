import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GlobleContext } from "../../context/GlobleContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Calendar, LayoutGrid, Users, CheckCircle, Clock } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";

const MangProManagement = () => {
  const { managerProjects, setManagerProjects } = useContext(GlobleContext);
  const [loading, setLoading] = useState(managerProjects.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/manager-projects", {
          withCredentials: true,
        });
        if (res.data.success) {
          setManagerProjects(res.data.projects);
        }
      } catch (error) {
        console.error("Failed to fetch manager projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [setManagerProjects]);

  const handleStatusUpdate = async (projectId, newStatus) => {
    setUpdatingId(projectId);
    try {
      const res = await axios.put(
        `http://localhost:3000/api/admin/manager-project/${projectId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        // Optimistically update the exact project in state
        setManagerProjects((prev) =>
          prev.map((proj) =>
            proj.id === projectId ? { ...proj, status: newStatus } : proj
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProjects = managerProjects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalProjects = managerProjects.length;
  const completedProjects = managerProjects.filter((p) => p.status === "COMPLETED").length;
  const ongoingProjects = managerProjects.filter((p) => p.status === "ONGOING").length;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/60 p-6 rounded-3xl border border-white backdrop-blur-xl shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Project Portfolio</h1>
          </div>
          <p className="text-slate-500 font-medium pl-14">
            Manage your assigned projects, timelines, and execution phases.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <div className="flex flex-col items-center px-6 py-2 bg-white rounded-xl shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ongoing</span>
            <span className="text-2xl font-black text-blue-600">{ongoingProjects}</span>
          </div>
          <div className="flex flex-col items-center px-6 py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</span>
            <span className="text-2xl font-black text-emerald-600">{completedProjects}</span>
          </div>
          <div className="flex flex-col items-center px-6 py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
            <span className="text-2xl font-black text-slate-800">{totalProjects}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="mt-4 font-medium text-slate-500">Loading your matrix...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50 -z-10 transition-transform group-hover:scale-110 duration-500" />
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                      Client: {project.client}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                <p className="text-slate-600 text-sm line-clamp-2 mb-6 min-h-[40px] z-10">
                  {project.description || "No description provided for this project."}
                </p>

                {/* Footer Section (Members, Date, Actions) */}
                <div className="mt-auto space-y-5 z-10">
                  
                  {/* Stats Row */}
                  <div className="flex items-center justify-between py-3 border-y border-slate-100 border-dashed">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-2">
                        {project.members && project.members.slice(0, 3).map((member, i) => (
                          <div 
                            key={member.id} 
                            title={`${member.firstName} ${member.lastName}`}
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-indigo-100 transition-all"
                            style={{ zIndex: 10 - i }}
                          >
                            {member.firstName[0]}
                          </div>
                        ))}
                      </div>
                      {project.members?.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold border-2 border-white shadow-sm">
                          +{project.members.length - 3}
                        </div>
                      )}
                      {(!project.members || project.members.length === 0) && (
                        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">Unassigned</span>
                      )}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-full">
                      <select
                        disabled={updatingId === project.id}
                        value={project.status}
                        onChange={(e) => handleStatusUpdate(project.id, e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer shadow-sm hover:bg-slate-100 disabled:opacity-50"
                      >
                        <option value="ONGOING">Mark as Actionable</option>
                        <option value="PENDING">Move to Pending</option>
                        <option value="COMPLETED">Mark as Completed</option>
                        <option value="CANCELLED">Cancel Project</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        {updatingId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Empty State */}
          {!loading && filteredProjects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No projects found.</h3>
              <p className="text-slate-500 font-medium">You currently do not manage any projects under this criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MangProManagement;
