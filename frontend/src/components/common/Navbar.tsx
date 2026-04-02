import React, { useContext, useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobleContext } from "../../context/GlobleContext";

const Navbar = () => {
  const { user, logout } = useContext(GlobleContext);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const notifications = [
    { id: 1, title: "New Task Assigned", time: "2m ago", type: "TASK" },
    { id: 2, title: "Leave Approved", time: "1h ago", type: "LEAVE" },
    { id: 3, title: "System Update", time: "5h ago", type: "SYSTEM" },
  ];

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/50" : "bg-transparent"
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
        
        {/* Left: Organization Context */}
        <div className="flex items-center gap-4 min-w-fit">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl">
             <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Enterprise v4.0</span>
          </div>
          <div className="lg:hidden w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Center: Command Search */}
        <div className="flex-1 max-w-2xl relative">
          <div className={`relative group transition-all duration-300 ${searchFocused ? "scale-[1.01]" : ""}`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              searchFocused ? "text-emerald-600" : "text-slate-400"
            }`} />
            <input
              type="text"
              placeholder="Search anything... (Ctrl + K)"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex gap-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-400">⌘</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-400">K</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center relative hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shadow-slate-100/50"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            </motion.button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-2"
                >
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</span>
                    <button className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700">Clear All</button>
                  </div>
                  <div className="py-2">
                    {notifications.map(n => (
                      <button key={n.id} className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl transition-colors flex gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                           <Zap className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{n.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-[1px] bg-slate-200/60 hidden md:block" />

          {/* User Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setShowProfile(!showProfile)}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shadow-slate-100/50 active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-emerald-500/20">
                {user?.firstName?.[0] || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-black text-slate-800 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{user?.role}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-60 bg-white rounded-3xl border border-slate-100 shadow-2xl p-2"
                >
                  <div className="p-4 bg-slate-50 rounded-2xl mb-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Level</p>
                     <p className="text-xs font-black text-emerald-600 mt-2 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> High Precision
                     </p>
                  </div>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all text-xs font-bold text-slate-600 group">
                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      Account Settings
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 p-3 hover:bg-rose-50 rounded-2xl transition-all text-xs font-bold text-rose-600 group"
                    >
                      <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
