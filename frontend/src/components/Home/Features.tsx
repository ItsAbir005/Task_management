import React from "react";
import { motion } from "framer-motion";
import { Shield, Users, Briefcase, CalendarDays, BarChart, Zap } from "lucide-react";

const FeatureCard = ({ title, description, icon: Icon, colorClass, offset }) => {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group ${offset ? 'mt-0 md:mt-16' : ''}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-${colorClass}-500`} />
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${colorClass}-500/10 mb-8 border border-${colorClass}-500/20`}>
        <Icon className={`w-7 h-7 text-${colorClass}-400`} />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-slate-400 font-light leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row gap-8 items-end justify-between mb-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-slate-300">Why SyncHR?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Everything you need to run a team, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">minus the friction.</span>
            </h2>
          </div>
          <p className="text-slate-400 max-w-sm font-light">
            We built a platform that respects your time. Designed for HR perfectly, built for managers practically, and loved by employees universally.
          </p>
        </div>

        {/* Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <FeatureCard 
            title="HR & Admin Control" 
            description="Manage departments, projects, and employee profiles from a centralized hub. Automated workflows mean less manual data entry and fewer errors." 
            icon={Shield} 
            colorClass="indigo"
          />

          <FeatureCard 
            title="Employee Self-Service" 
            description="Give your team autonomy. They can request time off, view project tasks, and update personal profiles without submitting IT tickets." 
            icon={Users} 
            colorClass="emerald"
            offset={true}
          />

          <FeatureCard 
            title="Manager Insights" 
            description="Real-time visibility into project allocation, leave approvals, and team performance. Spot bottlenecks before they impact your delivery." 
            icon={BarChart} 
            colorClass="amber"
          />

          <FeatureCard 
            title="Project Tracking" 
            description="Tie people to projects effortlessly. Track hours, assign milestones, and ensure cross-functional alignment across all your departments." 
            icon={Briefcase} 
            colorClass="blue"
            offset={true}
          />

          <FeatureCard 
            title="Leave Management" 
            description="No more infinite email threads for PDO requests. One-click approvals, clear accrual balances, and automated calendar integrations." 
            icon={CalendarDays} 
            colorClass="rose"
          />

          <FeatureCard 
            title="Dynamic Dashboards" 
            description="Role-based access ensures that admins see system-wide metrics while employees focus entirely on their specific deliverables." 
            icon={Zap} 
            colorClass="fuchsia"
            offset={true}
          />

        </div>
      </div>
    </section>
  );
};

export default Features;
