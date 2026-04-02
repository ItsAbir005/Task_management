import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = {
  COMPLETED: "#10b981", // Emerald
  ONGOING: "#6366f1", // Indigo
  PENDING: "#f59e0b", // Amber
  CANCELLED: "#f43f5e", // Rose
};

const MangProjectChart = ({ chartData = [] }) => {
  // Add a subtle drop shadow to the chart paths
  const RADIAN = Math.PI / 180;
  
  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center relative min-h-[350px]">
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight self-start mb-4">Project Allocation</h3>

      {chartData.every((item) => item.value === 0) ? (
        <div className="text-slate-400 font-medium py-10 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 mb-4" />
          No Projects Available
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || "#cbd5e1"}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "16px", 
                  border: "none", 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", 
                  fontWeight: "bold" 
                }} 
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MangProjectChart;
