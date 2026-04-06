import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Trash2,
  MessageSquare,
  AtSign,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { GlobleContext } from "../../context/GlobleContext";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  mentions: string[];
  author: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    role: string;
    profilePic?: string;
  };
}

interface Member {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
}

interface TaskCommentPanelProps {
  taskId: string;
  taskTitle: string;
  projectId?: string;
  onClose: () => void;
}

const BASE = "http://localhost:3000/api/admin";

const roleColors: Record<string, string> = {
  MANAGER: "bg-emerald-100 text-emerald-700",
  EMPLOYEE: "bg-violet-100 text-violet-700",
  ADMIN: "bg-rose-100 text-rose-700",
  HR: "bg-amber-100 text-amber-700",
};

const TaskCommentPanel: React.FC<TaskCommentPanelProps> = ({
  taskId,
  taskTitle,
  projectId,
  onClose,
}) => {
  const { user } = useContext(GlobleContext) as any;
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<Member[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { socket } = useContext(GlobleContext) as any;

  useEffect(() => {
    fetchComments();
    if (projectId) fetchProjectMembers();

    // Socket integration
    if (socket) {
      socket.emit("join-room", `task-${taskId}`);

      const handleNewComment = (data: { comment: Comment }) => {
        setComments((prev) => {
          if (prev.find((c) => c.id === data.comment.id)) return prev;
          return [...prev, data.comment];
        });
      };

      const handleDeleteComment = (data: { commentId: string }) => {
        setComments((prev) => prev.filter((c) => c.id !== data.commentId));
      };

      socket.on("comment-added", handleNewComment);
      socket.on("comment-deleted", handleDeleteComment);

      return () => {
        socket.emit("leave-room", `task-${taskId}`);
        socket.off("comment-added", handleNewComment);
        socket.off("comment-deleted", handleDeleteComment);
      };
    }
  }, [taskId, projectId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${BASE}/task/${taskId}/comments`, {
        withCredentials: true,
      });
      setComments(res.data.comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async () => {
    if (!projectId) return;
    try {
      const res = await axios.get(`${BASE}/manager-project/${projectId}/members`, {
        withCredentials: true,
      });
      setMembers(res.data.members || []);
    } catch {
      // fallback: no members for mention suggestions
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const cursor = e.target.selectionStart;
    setCursorPosition(cursor);

    // Detect @mention
    const textUpToCursor = val.slice(0, cursor);
    const mentionMatch = textUpToCursor.match(/@([A-Za-z]*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      const filtered = members.filter(
        (m) =>
          m.firstName.toLowerCase().startsWith(query) ||
          `${m.firstName} ${m.lastName || ""}`.toLowerCase().startsWith(query)
      );
      setMentionSuggestions(filtered);
      setShowMentionDropdown(filtered.length > 0);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (member: Member) => {
    const textUpToCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    const mentionStart = textUpToCursor.lastIndexOf("@");
    const fullName = `${member.firstName} ${member.lastName || ""}`.trim();
    const newText =
      content.slice(0, mentionStart) + `@${fullName} ` + textAfterCursor;
    setContent(newText);
    setShowMentionDropdown(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE}/task/${taskId}/comment`,
        { content: content.trim() },
        { withCredentials: true }
      );
      setComments((prev) => [...prev, res.data.comment]);
      setContent("");
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await axios.delete(`${BASE}/task-comment/${commentId}`, {
        withCredentials: true,
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  const highlightMentions = (text: string) => {
    const parts = text.split(/(@[A-Za-z]+(?: [A-Za-z]+)?)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-violet-600 font-bold">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const initials = (c: Comment) =>
    `${c.author.firstName[0]}${c.author.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-md h-[90vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 leading-tight line-clamp-1">
                {taskTitle}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Comments Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                No comments yet. Be the first!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 group"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm">
                  {initials(comment)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-black text-slate-800">
                        {comment.author.firstName} {comment.author.lastName || ""}
                      </span>
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          roleColors[comment.author.role] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {comment.author.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed break-words">
                      {highlightMentions(comment.content)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {formatTime(comment.createdAt)}
                    </span>
                    {comment.author.id === user?.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-rose-500 text-slate-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose Area */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          {/* Mention dropdown */}
          <AnimatePresence>
            {showMentionDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mb-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <AtSign className="w-3 h-3" /> Mention someone
                  </p>
                </div>
                {mentionSuggestions.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => insertMention(m)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[9px] font-black">
                      {m.firstName[0]}{m.lastName?.[0] || ""}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {m.firstName} {m.lastName || ""}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium">{m.role}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-300 ml-auto" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !showMentionDropdown) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                  if (e.key === "Escape") setShowMentionDropdown(false);
                }}
                rows={2}
                placeholder="Write a comment... type @ to mention someone"
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-violet-500 outline-none resize-none"
              />
              <div className="absolute bottom-2.5 right-3">
                <AtSign className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting || !content.trim()}
              className="w-11 h-11 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors shrink-0"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </form>
          <p className="text-[9px] text-slate-400 font-medium mt-2 ml-1">
            Press Enter to send · Shift+Enter for new line · @ to mention
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskCommentPanel;
