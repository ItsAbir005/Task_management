import React, { useContext, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Briefcase,
  CalendarDays,
  Users,
} from "lucide-react";
import { GlobleContext } from "../../../context/GlobleContext";
import axios from "axios";

const DepartmentList = () => {
  const [expandedDept, setExpandedDept] = useState(null);

  const toggleExpand = (id) => {
    setExpandedDept(expandedDept === id ? null : id);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "HR":
        return "bg-pink-100 text-pink-700 border-pink-300";
      case "MANAGER":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "EMPLOYEE":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const { departments, setDepartments } = useContext(GlobleContext);

  const getDepartment = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/getDepartment", { withCredentials: true });
      setDepartments(res.data.departments);
      console.log("Departments fetched:", res.data.departments);
    } catch (error) {
      console.log(error, "Unable to find Deparment");
    }
  }
  useEffect(() => {
    getDepartment();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8 space-y-8">
      {departments && departments.map((dept) => {
        const isExpanded = expandedDept === dept.id;
        const employees = dept.employees || [];
        const displayedEmployees = isExpanded
          ? employees
          : employees.slice(0, 3);

        return (
          <div
            key={dept.id}
            className="relative w-full bg-white/90 backdrop-blur-md border-l-[3px] border-indigo-600 shadow-lg rounded-2xl px-8 py-6 hover:shadow-2xl transition-all duration-300"
          >
            {/* 🔹 View More Button (Top Right) */}
            {employees.length > 3 && (
              <button
                onClick={() => toggleExpand(dept.id)}
                className="absolute top-5 right-6 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    View Less <ChevronUp size={18} />
                  </>
                ) : (
                  <>
                    View More <ChevronDown size={18} />
                  </>
                )}
              </button>
            )}

            {/* 🔹 Header Section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
              <div>
                <h2 className="text-3xl font-bold text-indigo-700 tracking-tight border-l-4 border-indigo-500 pl-3">
                  {dept.name}
                </h2>

                <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarDays size={15} className="text-indigo-500" />
                    <span>Created on {dept.createdAt}</span>
                  </div>

                  {/* 🧑‍💼 Employee Count Badge (Moved Here) */}
                  <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    <Users size={14} className="text-indigo-600" />
                    {employees.length} Employees
                  </div>
                </div>
              </div>
            </div>

            {/* 🔹 Employees Section */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Team Members
              </h3>

              {employees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="bg-gradient-to-tr from-indigo-50 to-white border border-indigo-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-transform hover:scale-[1.02]"
                    >
                      <p className="font-semibold text-indigo-800 text-base">
                        {emp.firstName}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <Mail size={14} className="text-indigo-500" />
                        {emp.email}
                      </p>
                      <p
                        className={`flex items-center gap-2 text-sm mt-2 border px-3 py-1 rounded-full font-medium w-fit ${getRoleColor(
                          emp.role
                        )}`}
                      >
                        <Briefcase size={14} />
                        {emp.role}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">No employees yet</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DepartmentList;
