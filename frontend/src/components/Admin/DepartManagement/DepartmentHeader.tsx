import React, { useState } from "react";
import { Plus } from "lucide-react";
import CreateDepartmentForm from "../EmpManagement/CreateDepartmentForm";

const DepartmentHeader = () => {
  const [showDeptForm, setShowDeptForm] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-md rounded-2xl px-6 py-4 mb-6">
      
      {/* 🔹 Left Section: Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">
          Department Details
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and view all departments and their teams.
        </p>
      </div>

      {/* 🔹 Right Section: Button */}
      <button
        className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-md transition-all duration-300 cursor-pointer"
        onClick={() => setShowDeptForm(true)}
      >
        <Plus size={18} className="text-white" />
        Add Department
      </button>

      {/* 🔹 Modal Component */}
      {showDeptForm && (
        <CreateDepartmentForm onClose={() => setShowDeptForm(false)} />
      )}
    </div>
  );
};

export default DepartmentHeader;
