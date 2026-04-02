import React from "react";
import EmpTaskManagement from "../../components/Employee/Tasks/EmpTaskManagement";

const EmpTaskManagementPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <EmpTaskManagement />
      </div>
    </div>
  );
};

export default EmpTaskManagementPage;
