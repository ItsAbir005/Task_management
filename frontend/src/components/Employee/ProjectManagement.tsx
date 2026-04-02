import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GlobleContext } from "../../context/GlobleContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Briefcase, Calendar, Users, Crown, FolderOpen } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function ProjectManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const { empProject, setEmpProject } = useContext(GlobleContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/admin/getEmpProject",
          { withCredentials: true }
        );
        setEmpProject(res.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [setEmpProject]);

  const filteredProjects =
    activeTab === "all"
      ? empProject
      : empProject.filter((p) => p.status.toLowerCase() === activeTab.toLowerCase());

  const TABS = [
    { id: "all", label: "All Projects" },
    { id: "ongoing", label: "Ongoing" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/60 p-6 rounded-3xl border border-white backdrop-blur-xl shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Projects</h1>
          </div>
          <p className="text-slate-500 font-medium pl-14">
            View your assigned projects and collaborate with your team.
          </p>
        </div>
      </div>

      {/* Segmented Controls (Tabs) */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 ${
              activeTab === tab.id ? "text-violet-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-violet-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="mt-4 font-medium text-slate-500">Loading your assignments...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <FragmentEmptyState tab={activeTab} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((proj, index) => (
              <ProjectCard key={proj.id} proj={proj} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ----------------------
// SUBCOMPONENTS
// ----------------------

const ProjectCard = ({ proj, index }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all duration-300 flex flex-col group relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-50 to-transparent rounded-bl-full opacity-50 -z-10 transition-transform group-hover:scale-110 duration-500" />

      {/* Top Header */}
      <div className="flex justify-between items-start mb-4 z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-violet-600 transition-colors">
            {proj.name}
          </h3>
          <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
            Client: {proj.client || "Internal"}
          </p>
        </div>
        <StatusBadge status={proj.status} />
      </div>

      <p className="text-slate-600 text-sm line-clamp-2 mb-6 min-h-[40px] z-10">
        {proj.description || "No project description provided."}
      </p>

      {/* Details Footer */}
      <div className="mt-auto space-y-4 z-10">
        
        {/* Manager Info */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Manager</p>
            <p className="text-sm font-semibold text-slate-700">
              {proj.manager?.firstName} {proj.manager?.lastName}
            </p>
          </div>
        </div>

        {/* Date & Teammates Row */}
        <div className="flex items-center justify-between pt-2">
          
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400" />
            {proj.deadline ? new Date(proj.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {proj.members && proj.members.slice(0, 3).map((member, i) => (
                <div 
                  key={member.id} 
                  title={`${member.firstName} ${member.lastName}`}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-violet-100 transition-all"
                  style={{ zIndex: 10 - i }}
                >
                  {member.firstName?.[0]}
                </div>
              ))}
            </div>
            {proj.members?.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold border-2 border-white shadow-sm">
                +{proj.members.length - 3}
              </div>
            )}
            {(!proj.members || proj.members.length === 0) && (
              <span className="text-xs text-slate-400 font-medium">Solo Dev</span>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

const FragmentEmptyState = ({ tab }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto"
  >
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <FolderOpen className="w-8 h-8 text-slate-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-700">No {tab === "all" ? "" : tab} projects</h3>
    <p className="text-slate-500 font-medium mt-1">You don't have any assignments under this category.</p>
  </motion.div>
);
