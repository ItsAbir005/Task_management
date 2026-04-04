import { Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import SignUp from "./pages/Auth/SignUp";
import SignUpSuccess from "./pages/Auth/SignUpSuccess";
import SetPassword from "./pages/Auth/SetPassword";
import MainLayout from "./layouts/MainLayout";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import DapManagement from "./pages/Admin/DepManagement";
import ProManagement from "./pages/Admin/ProManagement";
import ProfieManagement from "./pages/Admin/ProfieManagement";
import EmpManagement from "./pages/Admin/EmpManagement";
import InvitePage from "./pages/Admin/InvitePage";
import HrInvitePage from "./pages/HR/HrInvitePage";
import HrDashboard from "./pages/HR/HrDashboard";
import HrDepManagement from "./pages/HR/HrDepManagement";
import HrProfileManagement from "./pages/HR/HrProfileManagement";
import HrLeaveManagement from "./pages/HR/HrLeaveManagement";
import MangDashboard from "./pages/Manager/MangDashboard";
import MangLeaveManagement from "./pages/Manager/MangLeaveManagement";
import ManProfileManagement from "./pages/Manager/ManProfileManagement";
import MangProManagement from "./pages/Manager/MangProManagement";
import TaskManagementPage from "./pages/Manager/TaskManagementPage";
import EmpDashboard from "./pages/Employee/EmpDashboard";
import EmpTaskManagement from "./pages/Employee/EmpTaskManagement";
import EmpProfileManagement from "./pages/Employee/EmpProfileManagement";
import EmpLeaveManagemnet from "./pages/Employee/EmpLeaveManagemnet";
import ProtectedRoute from "./layouts/ProtectedRoute";
import EmpProject from "./pages/Employee/EmpProject";

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup/success" element={<SignUpSuccess />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* ADMIN */}
      <Route element={<ProtectedRoute allowed={["ADMIN"]} />}>
        <Route path="/admin" element={<MainLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="department" element={<DapManagement />} />
          <Route path="project" element={<ProManagement />} />
          <Route path="profile" element={<ProfieManagement />} />
          <Route path="employee" element={<EmpManagement />} />
          <Route path="invite" element={<InvitePage />} />
        </Route>
      </Route>

      {/* HR */}
      <Route element={<ProtectedRoute allowed={["HR"]} />}>
        <Route path="/hr" element={<MainLayout />}>
          <Route path="dashboard" element={<HrDashboard />} />
          <Route path="department" element={<HrDepManagement />} />
          <Route path="profile" element={<HrProfileManagement />} />
          <Route path="leave" element={<HrLeaveManagement />} />
          <Route path="invite" element={<HrInvitePage />} />
        </Route>
      </Route>

      {/* MANAGER */}
      <Route element={<ProtectedRoute allowed={["MANAGER"]} />}>
        <Route path="/manager" element={<MainLayout />}>
          <Route path="dashboard" element={<MangDashboard />} />
          <Route path="projectmanagement" element={<MangProManagement />} />
          <Route path="profilemanagement" element={<ManProfileManagement />} />
          <Route path="leavemanagement" element={<MangLeaveManagement />} />
          <Route path="taskmanagement" element={<TaskManagementPage />} />
        </Route>
      </Route>

      {/* EMPLOYEE */}
      <Route element={<ProtectedRoute allowed={["EMPLOYEE"]} />}>
        <Route path="/employee" element={<MainLayout />}>
          <Route path="dashboard" element={<EmpDashboard />} />
          <Route path="task" element={<EmpTaskManagement />} />
          <Route path="profile" element={<EmpProfileManagement />} />
          <Route path="project" element={<EmpProject />} />
          <Route path="leave" element={<EmpLeaveManagemnet />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
