import React, { useEffect } from "react";
import TaskManagement from "../../components/Manager/Tasks/TaskManagement";

const TaskManagementPage = () => {
  useEffect(() => {
    console.log("TaskManagementPage mounted successfully");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 p-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">
          DEBUG: MANAGER TASK PORTAL ACTIVE
        </div>
        <TaskManagement />
      </div>
    </div>
  );
};

export default TaskManagementPage;
