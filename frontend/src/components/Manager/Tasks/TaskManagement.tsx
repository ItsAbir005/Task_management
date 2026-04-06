import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Loader2,
  Trash2,
  LayoutGrid,
  List as ListIcon,
  X,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Calendar,
  User,
} from "lucide-react";
import TaskCommentPanel from "../../shared/TaskCommentPanel";

const BASE = "http://localhost:3000/api/admin";

const TaskManagement = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [commentTask, setCommentTask] = useState<any | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeId: "",
    projectId: "",
    dueDate: "",
  });

  const priorityColors: Record<string, string> = {
    LOW: "bg-blue-50 text-blue-700 border-blue-100",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
    HIGH: "bg-rose-50 text-rose-700 border-rose-100",
  };

  const statusColors: Record<string, string> = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-teal-600 text-white shadow-lg shadow-teal-600/20",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get(`${BASE}/manager-tasks`, { withCredentials: true }),
        axios.get(`${BASE}/manager-projects`, { withCredentials: true }),
      ]);
      setTasks(tasksRes.data.tasks);
      setProjects(projectsRes.data.projects || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // When project is selected in the modal, load its members
  const handleProjectSelect = async (projectId: string) => {
    setNewTask((prev) => ({ ...prev, projectId, assigneeId: "" }));
    if (!projectId) {
      setProjectMembers([]);
      return;
    }
    setLoadingMembers(true);
    try {
      const res = await axios.get(`${BASE}/manager-project/${projectId}/members`, {
        withCredentials: true,
      });
      setProjectMembers(res.data.members || []);
    } catch {
      setProjectMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateTask = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assigneeId: newTask.assigneeId,
        projectId: newTask.projectId || undefined,
        dueDate: newTask.dueDate || undefined,
      };
      const res = await axios.post(`${BASE}/manager-task`, payload, {
        withCredentials: true,
      });
      setTasks([res.data.task, ...tasks]);
      setShowModal(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", assigneeId: "", projectId: "", dueDate: "" });
      setProjectMembers([]);
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`${BASE}/manager-task/${taskId}`, { withCredentials: true });
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const filteredTasks = (tasks || []).filter((task) => {
    const matchesFilter = filter === "ALL" || task.status === filter;
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Initializing Task Intelligence...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -top-14 -right-14 w-52 h-52 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Task Operations</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">
                Project-Scoped Workflow Control
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </motion.button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, assignee, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="h-8 w-[1px] bg-slate-100" />
            <div className="flex gap-1 px-1">
              {["ALL", "TODO", "IN_PROGRESS", "COMPLETED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    filter === f
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-100 shadow-sm self-end">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Grid/List */}
        <AnimatePresence mode="popLayout">
          {viewMode === "grid" ? (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={task.id}
                  className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-500/5 transition-all group relative overflow-hidden"
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

                  <div className="flex items-start justify-between mb-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                      {task.priority} Priority
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-3 line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {task.description || "No description provided."}
                  </p>

                  {task.dueDate && (
                    <div className="flex items-center gap-1.5 mb-4 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 border-t border-slate-50 pt-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                          {task.assignee?.firstName?.[0] || "U"}{task.assignee?.lastName?.[0] || ""}
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">
                          {task.assignee?.firstName} {task.assignee?.lastName || ""}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${statusColors[task.status] || "bg-slate-100 text-slate-600"}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Comment button */}
                    <button
                      onClick={() => setCommentTask(task)}
                      className="flex items-center gap-2 w-full justify-center py-2.5 bg-slate-50 hover:bg-violet-50 hover:text-violet-600 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group/btn"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {task._count?.comments > 0
                        ? `${task._count.comments} Comment${task._count.comments > 1 ? "s" : ""}`
                        : "Add Comment"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800 text-sm">{task.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{task.description}</p>
                      </td>
                      <td className="px-8 py-5">
                        {task.project ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 w-fit">
                            <Briefcase className="w-2.5 h-2.5" />
                            {task.project.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-xs font-bold text-slate-600">
                            {task.assignee?.firstName} {task.assignee?.lastName || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${statusColors[task.status] || "bg-slate-100 text-slate-600"}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setCommentTask(task)}
                            className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Task Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 relative z-10 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Assignment</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                    Configure workspace task — select a project first
                  </p>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-5">
                  {/* Project selector — first! */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> Project (optional)
                    </label>
                    <select
                      value={newTask.projectId}
                      onChange={(e) => handleProjectSelect(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">No specific project (general task)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — {p.client}</option>
                      ))}
                    </select>
                  </div>

                  {/* Task Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title *</label>
                    <input
                      required
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g. Q2 Performance Review"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      rows={2}
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Define the scope and objectives..."
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Priority */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Assignee — filtered by project members */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      Assignee * {newTask.projectId && "(filtered to project members)"}
                    </label>
                    {loadingMembers ? (
                      <div className="flex items-center gap-2 bg-slate-50 rounded-2xl py-3.5 px-5">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        <span className="text-sm text-slate-400 font-medium">Loading members...</span>
                      </div>
                    ) : (
                      <select
                        required
                        value={newTask.assigneeId}
                        onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">Select Employee</option>
                        {(newTask.projectId ? projectMembers : []).map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName || ""} ({emp.role})
                          </option>
                        ))}
                        {newTask.projectId && projectMembers.length === 0 && (
                          <option disabled>No members in this project yet</option>
                        )}
                      </select>
                    )}
                    {newTask.projectId && projectMembers.length === 0 && !loadingMembers && (
                      <p className="text-[10px] text-amber-600 font-bold ml-1">
                        ⚠ This project has no members assigned yet.
                      </p>
                    )}
                  </div>

                  <div className="flex pt-2">
                    <button
                      disabled={submitting || (!!newTask.projectId && projectMembers.length === 0)}
                      className="flex-1 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      Deploy Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
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

export default TaskManagement;
