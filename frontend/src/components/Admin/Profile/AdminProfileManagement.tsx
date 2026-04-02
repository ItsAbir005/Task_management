import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Users,
  FolderTree,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";
import { GlobleContext } from "../../../context/GlobleContext";

// Shared Components
import ProfileLayout from "../../Common/Profile/ProfileLayout";
import ProfileHeader from "../../Common/Profile/ProfileHeader";
import ProfileField from "../../Common/Profile/ProfileField";
import ProfileCard from "../../Common/Profile/ProfileCard";
import SecuritySection from "../../Common/Profile/SecuritySection";

const AdminProfileManagement = () => {
  const { user, setUser, adminStats } = useContext(GlobleContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    domain: "",
  });

  // Sync state when user data is available
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || "",
        email: user.email || "",
        domain: user.domain || "Not Set",
      });
    }
  }, [user]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.put("http://localhost:3000/api/auth/updateMe", {
        name: personalInfo.name,
        email: personalInfo.email
      }, {
        withCredentials: true,
      });
      setUser(res.data.user);
      showMsg("success", "Administrator profile updated successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (securityData, callback) => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.put("http://localhost:3000/api/auth/changePassword", securityData, {
        withCredentials: true,
      });
      showMsg("success", "Administrator credentials updated successfully!");
      if (callback) callback();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Security update failed.");
    } finally {
      setLoading(false);
    }
  };

  const statsForCard = [
    { label: "Total Employees", value: adminStats?.totalEmployees || 0, icon: Users },
    { label: "Departments", value: adminStats?.totalDepartments || 0, icon: LayoutDashboard },
    { label: "Active Projects", value: adminStats?.totalProjects || 0, icon: FolderTree },
    { label: "Security", value: "Level 4", icon: ShieldCheck },
  ];

  return (
    <ProfileLayout
      header={
        <ProfileHeader 
          title="Root Administration"
          subtitle="Enterprise Tenant Control Center"
          badgeText="System Secured"
          themeColor="blue"
        />
      }
      sidebar={
        <ProfileCard 
          user={user}
          personalInfo={{ firstName: user?.name, lastName: "" }}
          employmentInfo={{
            department: "System Root",
            dateOfJoining: new Date(user?.createdAt || Date.now()).toLocaleDateString(),
            salary: "Unlimited Access",
            employmentType: "TENANT_OWNER",
            status: "ACTIVE"
          }}
          themeColor="blue"
          stats={statsForCard}
        />
      }
    >
      {/* Global Feedback Banner */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            } shadow-lg relative z-20`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-bold text-sm tracking-tight">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tenant Records Form */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Tenant Configuration</h3>
            <p className="text-[11px] text-slate-400 font-medium">Manage your organization's root owner account</p>
          </div>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Administrator Name" icon={User} themeColor="blue">
              <input
                type="text"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
              />
            </ProfileField>

            <ProfileField label="Primary Email Address" icon={Mail} themeColor="blue">
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              />
            </ProfileField>

            <div className="md:col-span-2">
              <ProfileField label="Corporate Domain" icon={Building} themeColor="blue">
                <input
                  type="text"
                  value={personalInfo.domain}
                  readOnly
                  className="bg-slate-100 cursor-not-allowed opacity-70"
                />
              </ProfileField>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              <span className="uppercase text-xs tracking-widest">Commit Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <SecuritySection 
        onSubmit={handlePasswordUpdate}
        loading={loading}
        themeColor="blue"
      />

    </ProfileLayout>
  );
};

export default AdminProfileManagement;
