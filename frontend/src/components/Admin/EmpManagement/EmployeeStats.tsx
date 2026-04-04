import React, { useState } from "react";
import { Download, UserPlus, Building2, Users, BadgeDollarSign, UserCheck, UserX } from "lucide-react";
const EmployeeStats = () => {

  // ✅ Raw Data instead of importing from assets
  const stats = [
    {
      title: "Total Employees",
      value: 250,
      change: "+12 this month",
      trend: "positive",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Hired",
      value: 18,
      change: "+5 this month",
      trend: "positive",
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "Terminated",
      value: 4,
      change: "-1 this month",
      trend: "negative",
      icon: UserX,
      color: "bg-red-500",
    },
    {
      title: "Avg Salary",
      value: "$75,000",
      change: "+$3,200",
      trend: "positive",
      icon: BadgeDollarSign,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="mb-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-600">
            Manage your workforce and employee information
          </p>
        </div>

        <div className="flex gap-3">
          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h2 className="text-2xl font-bold text-gray-800">{stat.value}</h2>
                <p
                  className={`text-sm ${
                    stat.trend === "positive" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default EmployeeStats;
