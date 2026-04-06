import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  CheckCircle2,
  Loader2,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  TrendingUp,
  Target,
  Briefcase,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { AnimatePresence as AP } from "framer-motion";
import TaskCommentPanel from "../../shared/TaskCommentPanel";

const BASE = "http://localhost:3000/api/admin";

const EmpTaskManagement = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [commentTask, setCommentTask] = useState<any | null>(null);

  const priorityColors: Record<string, string> = {
    LOW: "bg-blue-50 text-blue-700 border-blue-100",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
    HIGH: "bg-rose-50 text-rose-700 border-rose-100",
  };

  const statusBg: Record<string, string> = {
    TODO: "bg-slate-50 text-slate-600 border-slate-100",
    IN_PROGRESS: "bg-violet-50 text-violet-700 border-violet-100",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${BASE}/emp-tasks`, { withCredentials: true });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      const res = await axios.patch(
        `${BASE}/emp-task-status/${taskId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setTasks(tasks.map((t) => (t.id === taskId ? res.data.task : t)));
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTasks = (tasks || []).filter((task) => {
    const matchesFilter = filter === "ALL" || task.status === filter;
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.creator?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status !== "COMPLETED").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">
          Syncing Task Workspace...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-20">
        {/* Dynamic Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-violet-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Mission Control</h1>
                <p className="text-violet-100 font-medium mt-2 uppercase text-[10px] tracking-[0.2em]">
                  Personal Performance Hub
                </p>
              </div>
              <div className="flex gap-8 pt-4">
                <div className="space-y-1">
                  <p className="text-3xl font-black">{stats.total}</p>
                  <p className="text-[10px] font-bold text-violet-200 uppercase tracking-widest">Global Tasks</p>
                </div>
                <div className="w-[1px] h-12 bg-white/20" />
                <div className="space-y-1">
                  <p className="text-3xl font-black">{stats.pending}</p>
                  <p className="text-[10px] font-bold text-violet-200 uppercase tracking-widest">Active Ops</p>
                </div>
                <div className="w-[1px] h-12 bg-white/20" />
                <div className="space-y-1">
                  <p className="text-3xl font-black">
                    {Math.round((stats.completed / (stats.total || 1)) * 100)}%
                  </p>
                  <p className="text-[10px] font-bold text-violet-200 uppercase tracking-widest">Velocity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col justify-between shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-20 h-20 text-violet-600" />
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Current Focus</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">
                {stats.pending > 0
                  ? `You have ${stats.pending} items requiring attention.`
                  : "All clear! You've achieved peak throughput."}
              </p>
            </div>
            <button className="mt-6 flex items-center justify-between w-full p-4 bg-slate-50 rounded-2xl hover:bg-violet-50 transition-colors group">
              <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-violet-600">
                Quick view stats
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-slate-100 shadow-sm w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by title, manager, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div className="h-8 w-[1px] bg-slate-100 hidden lg:block" />
            <div className="hidden lg:flex gap-1">
              {["ALL", "TODO", "IN_PROGRESS", "COMPLETED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 p-2 rounded-2xl border border-slate-100 shadow-sm self-end lg:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-violet-50 text-violet-600" : "text-slate-300 hover:text-slate-500"}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-violet-50 text-violet-600" : "text-slate-300 hover:text-slate-500"}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tasks */}
        <AnimatePresence mode="popLayout">
          {viewMode === "grid" ? (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={task.id}
                  className="bg-white rounded-[2.5rem] p-8 border border-white shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all group relative"
                >
                  {/* Project badge */}
                  {task.project && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <Briefcase className="w-3 h-3 text-emerald-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        {task.project.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-6">
                    <span className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] border ${priorityColors[task.priority]}`}>
                      {task.priority || "NORMAL"}
                    </span>
                    <div className={`p-2 rounded-xl ${statusBg[task.status]}`}>
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-violet-600 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-400 line-clamp-3 min-h-[4.5rem]">
                      {task.description || "Detailed scope parameters haven't been provided for this assignment."}
                    </p>
                  </div>

                  {task.dueDate && (
                    <div className="flex items-center gap-1.5 mt-3 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shadow-inner">
                          {task.creator?.firstName?.[0] || "M"}{task.creator?.lastName?.[0] || ""}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Reporter</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {task.creator?.firstName} {task.creator?.lastName || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status controls */}
                    <div className="flex gap-2">
                      {task.status !== "COMPLETED" ? (
                        <>
                          {task.status !== "TODO" && (
                            <button
                              disabled={updatingId === task.id}
                              onClick={() => handleStatusUpdate(task.id, "TODO")}
                              className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                              Restart
                            </button>
                          )}
                          {task.status !== "IN_PROGRESS" && (
                            <button
                              disabled={updatingId === task.id}
                              onClick={() => handleStatusUpdate(task.id, "IN_PROGRESS")}
                              className="flex-1 py-3 bg-violet-50 text-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all"
                            >
                              In Progress
                            </button>
                          )}
                          <button
                            disabled={updatingId === task.id}
                            onClick={() => handleStatusUpdate(task.id, "COMPLETED")}
                            className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
                          >
                            Finish
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-3 bg-emerald-50 text-emerald-600/60 cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Completed
                        </button>
                      )}
                    </div>

                    {/* Comment button */}
                    <button
                      onClick={() => setCommentTask(task)}
                      className="mt-3 flex items-center gap-2 w-full justify-center py-2.5 bg-slate-50 hover:bg-violet-50 hover:text-violet-600 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {task._count?.comments > 0
                        ? `${task._count.comments} Comment${task._count.comments > 1 ? "s" : ""}`
                        : "Discuss"}
                    </button>
                  </div>

                  {updatingId === task.id && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Task</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reporter</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-10 py-6">
                        <p className="font-black text-slate-800 text-sm group-hover:text-violet-600 transition-colors">{task.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{task.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-10 py-6">
                        {task.project ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 w-fit">
                            <Briefcase className="w-2.5 h-2.5" />
                            {task.project.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 uppercase">
                            {task.creator?.firstName?.[0] || "M"}
                          </div>
                          <span className="text-xs font-bold text-slate-600">
                            {task.creator?.firstName} {task.creator?.lastName || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <select
                          disabled={updatingId === task.id || task.status === "COMPLETED"}
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                          className={`text-[9px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border border-slate-100 shadow-sm outline-none transition-all ${updatingId === task.id ? "opacity-50" : ""} ${task.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 cursor-not-allowed opacity-60" : "bg-white cursor-pointer focus:ring-2 focus:ring-violet-500"}`}
                        >
                          <option value="TODO">Backlog</option>
                          <option value="IN_PROGRESS">Executing</option>
                          <option value="COMPLETED">Delivered</option>
                        </select>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={() => setCommentTask(task)}
                          className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                          title="View comments"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {task._count?.comments > 0 && (
                            <span className="ml-1 text-[9px] font-black">{task._count.comments}</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comment Panel */}
      <AnimatePresence>
        {commentTask && (
          <TaskCommentPanel
            taskId={commentTask.id}
            taskTitle={commentTask.title}
            projectId={commentTask.project?.id}
            onClose={() => setCommentTask(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default EmpTaskManagement;
