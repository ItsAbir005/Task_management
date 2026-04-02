import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950 min-h-screen flex items-center">
      {/* Background Gradients & Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"
      ></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Text Content */}
          <motion.div 
            className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-medium text-slate-300">Modern HR is finally here</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6"
            >
              Build a workplace where your team <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">actually wants to be.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl font-light leading-relaxed"
            >
              From onboarding new hires to tracking time off and handling performance reviews. Leave the spreadsheets behind and manage your people without the headaches.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 rounded-full font-semibold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-white/5"
              >
                Start your free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 rounded-full font-medium text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                Book a demo
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-slate-950" src="https://i.pravatar.cc/100?img=1" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-950" src="https://i.pravatar.cc/100?img=2" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-950" src="https://i.pravatar.cc/100?img=3" alt="User" />
                <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs font-medium text-white">4k+</div>
              </div>
              <div className="flex flex-col">
                <div className="flex text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span>Loved by HR teams globally</span>
              </div>
            </motion.div>

          </motion.div>

          {/* Visual UI Mockup (Floating Dashboard) */}
          <motion.div 
            className="w-full lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          >
            {/* The main dashboard window */}
            <div className="relative z-10 rounded-2xl md:rounded-3xl bg-slate-900 border border-white/10 shadow-2xl shadow-indigo-500/20 overflow-hidden transform perspective-1000">
              {/* Window Header */}
              <div className="h-10 bg-slate-800/50 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              
              {/* Fake Dashboard Content */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-white font-medium mb-1">Company Overview</h3>
                    <p className="text-xs text-slate-400">Your team pulse at a glance</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-lg font-medium">Monthly</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Metric Card */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-slate-400 text-xs mb-2">Total Employees</div>
                    <div className="text-2xl font-semibold text-white mb-2">1,248</div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                      <span className="bg-emerald-400/20 px-1 rounded">+12%</span> vs last month
                    </div>
                  </div>
                  {/* Metric Card */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-slate-400 text-xs mb-2">Pending Leaves</div>
                    <div className="text-2xl font-semibold text-white mb-2">24</div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs text-amber-400">
                      Requires action
                    </div>
                  </div>
                </div>

                {/* Activity List */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Recent Activity</div>
                  {[
                    { action: "Sarah signed onboarding docs", time: "10m ago", color: "bg-blue-500/20 text-blue-400" },
                    { action: "Engineering requested 2 hires", time: "2h ago", color: "bg-indigo-500/20 text-indigo-400" },
                    { action: "Design team Q3 reviews done", time: "5h ago", color: "bg-emerald-500/20 text-emerald-400" },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-lg border border-white/5"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-200">{item.action}</div>
                      </div>
                      <div className="text-xs text-slate-500">{item.time}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Element 1 - Notification */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-12 z-20 bg-slate-800/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl flex items-center gap-4 hidden md:flex"
            >
              <div className="relative">
                <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full" alt="avatar" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Alex Johnson</div>
                <div className="text-xs text-slate-400">Leave approved ✅</div>
              </div>
            </motion.div>

            {/* Floating Element 2 - Context */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-10 bottom-24 z-20 bg-slate-800/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl flex flex-col gap-2 hidden lg:flex"
            >
              <div className="text-xs text-slate-400">Employee Happiness</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-emerald-400">92%</span>
                <span className="text-xs text-slate-400 pb-1">Great!</span>
              </div>
              <div className="flex gap-1">
                {[40, 60, 80, 50, 90, 85, 95].map((h, i) => (
                  <div key={i} className="w-2 bg-emerald-400/30 rounded-t-sm relative flex items-end" style={{ height: '30px' }}>
                     <div className="w-full bg-emerald-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
