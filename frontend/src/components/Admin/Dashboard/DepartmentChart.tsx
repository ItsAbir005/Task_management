import React from "react";
import { motion } from "framer-motion";

const DepartmentChart = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Workforce Distribution</h3>
      
      <div className="space-y-4">
        {data.map((dept, index) => (
          <div key={dept.name} className="group">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                {dept.name}
              </span>
              <span className="text-sm font-bold text-gray-800">{dept.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(dept.value / maxVal) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full shadow-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentChart;
