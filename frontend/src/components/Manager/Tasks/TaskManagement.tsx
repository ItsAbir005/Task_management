import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  X
} from "lucide-react";
import { GlobleContext } from "../../../context/GlobleContext";

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeId: "",
  });

  const priorityColors = {
    LOW: "bg-blue-50 text-blue-700 border-blue-100",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
    HIGH: "bg-rose-50 text-rose-700 border-rose-100",
  };

  const statusColors = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-teal-600 text-white shadow-lg shadow-teal-600/20",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, empRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/manager-tasks", { withCredentials: true }),
        axios.get("http://localhost:3000/api/admin/getEmployee", { withCredentials: true }),
      ]);
      setTasks(tasksRes.data.tasks);
      setEmployees(empRes.data.employees);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:3000/api/admin/manager-task", newTask, {
        withCredentials: true,
      });
      setTasks([res.data.task, ...tasks]);
      setShowModal(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", assigneeId: "" });
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/admin/manager-task/${taskId}`, { status: newStatus }, {
        withCredentials: true,
      });
      setTasks(tasks.map(t => t.id === taskId ? res.data.task : t));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/manager-task/${taskId}`, {
        withCredentials: true,
      });
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const filteredTasks = (tasks || []).filter(task => {
    const matchesFilter = filter === "ALL" || task.status === filter;
    const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.assignee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Initializing Task Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -top-14 -right-14 w-52 h-52 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Task Operations</h1>
            <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Enterprise Workflow Control</p>
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
              placeholder="Search assignments..."
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
                  filter === f ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
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
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTasks.map((task) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={task.id}
                className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-500/5 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                    {task.priority} Priority
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-800 leading-tight mb-3 line-clamp-2">
                  {task.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6 min-h-[2.5rem]">
                  {task.description || "No description provided."}
                </p>

                <div className="flex flex-col gap-4 border-t border-slate-50 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase border-2 border-white ring-1 ring-slate-100 overflow-hidden">
                        {task.assignee?.firstName?.[0] || "U"}{task.assignee?.lastName?.[0] || ""}
                      </div>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">
                        {task.assignee?.firstName} {task.assignee?.lastName || ""}
                      </span>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-none outline-none ring-0 ${statusColors[task.status] || "bg-slate-100 text-slate-600"}`}
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment</th>
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
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">{task.assignee.firstName} {task.assignee.lastName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className={`text-[9px] font-black uppercase tracking-widest rounded-lg px-2 py-1 border-none outline-none ${statusColors[task.status]}`}
                      >
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Integration */}
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
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Configure workspace task</p>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                    <input
                      required
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g. Q2 Performance Review"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      rows={3}
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Define the scope and objectives..."
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignee</label>
                      <select
                        required
                        value={newTask.assigneeId}
                        onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex pt-4">
                  <button
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
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
  );
};

export default TaskManagement;
