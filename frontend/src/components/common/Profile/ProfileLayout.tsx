import React from "react";
import { motion } from "framer-motion";

const ProfileLayout = ({ header, children, sidebar }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        {header}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {sidebar}
          </div>

          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileLayout;
