import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  FolderTree,
  FileText,
  TrendingUp,
  Star
} from "lucide-react";
import { GlobleContext } from "../../../context/GlobleContext";

// Shared Components
import ProfileLayout from "../../Common/Profile/ProfileLayout";
import ProfileHeader from "../../Common/Profile/ProfileHeader";
import ProfileField from "../../Common/Profile/ProfileField";
import ProfileCard from "../../Common/Profile/ProfileCard";
import SecuritySection from "../../Common/Profile/SecuritySection";

const ProfileManagement = () => {
  const { user, setUser } = useContext(GlobleContext);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [empStats, setEmpStats] = useState({
    projectsCount: 0,
    leavesCount: 0,
    performance: "Exceptional" 
  });

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    position: "",
  });

  const [employmentInfo, setEmploymentInfo] = useState({
    department: "",
    dateOfJoining: "",
    salary: "",
    employmentType: "",
    status: "",
  });

  // Sync state when user data is available
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        position: user.position || "",
      });
      setEmploymentInfo({
        department: user.department?.name || "Unassigned",
        dateOfJoining: user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : "N/A",
        salary: user.salary ? `$${user.salary.toLocaleString()}` : "Confidential",
        employmentType: user.employmentType || "Regular",
        status: user.status || "ACTIVE",
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [projRes, leaveRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/getEmpProject", { withCredentials: true }),
        axios.get("http://localhost:3000/api/admin/getLeaves", { withCredentials: true })
      ]);
      setEmpStats({
        projectsCount: projRes.data.projects?.length || 0,
        leavesCount: leaveRes.data.leaves?.length || 0,
        performance: "Exceptional" 
      });
    } catch (err) {
      console.error("Error fetching employee stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handlePersonalUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.put("http://localhost:3000/api/auth/updateMe", personalInfo, {
        withCredentials: true,
      });
      setUser(res.data.user);
      showMsg("success", "Profile settings updated successfully!");
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
      await axios.put("http://localhost:3000/api/auth/changePassword", {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      }, {
        withCredentials: true,
      });
      showMsg("success", "Security credentials updated successfully!");
      if (callback) callback();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Security update failed.");
    } finally {
      setLoading(false);
    }
  };

  const statsForCard = [
    { label: "Projects", value: empStats.projectsCount, icon: FolderTree },
    { label: "Leaves", value: empStats.leavesCount, icon: FileText },
    { label: "Success Rate", value: "98%", icon: TrendingUp },
    { label: "Performance", value: empStats.performance, icon: Star },
  ];

  return (
    <ProfileLayout
      header={
        <ProfileHeader 
          title="Employee Profile Intelligence"
          subtitle="Enterprise Human Resources Portal"
          badgeText="System Active"
          themeColor="violet"
        />
      }
      sidebar={
        <ProfileCard 
          user={user}
          personalInfo={personalInfo}
          employmentInfo={employmentInfo}
          themeColor="violet"
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
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-100/50"
                : "bg-rose-50 border-rose-200 text-rose-700 shadow-rose-100/50"
            } shadow-lg relative z-20`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-bold text-sm tracking-tight">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personnel Records Form */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Fingerprint className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Personnel Records</h3>
            <p className="text-[11px] text-slate-400 font-medium">Manage your personal identification and corporate identity</p>
          </div>
        </div>
        
        <form onSubmit={handlePersonalUpdate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="First Name" icon={User} themeColor="violet">
              <input
                type="text"
                value={personalInfo.firstName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
              />
            </ProfileField>

            <ProfileField label="Last Name" icon={User} themeColor="violet">
              <input
                type="text"
                value={personalInfo.lastName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
              />
            </ProfileField>

            <ProfileField label="Corporate Email" icon={Mail} themeColor="violet">
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              />
            </ProfileField>

            <ProfileField label="Contact Number" icon={Phone} themeColor="violet">
              <input
                type="text"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              />
            </ProfileField>

            <ProfileField label="Date of Birth" themeColor="violet">
              <input
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
              />
            </ProfileField>

            <ProfileField label="Gender Identification" themeColor="violet">
              <select
                value={personalInfo.gender}
                onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </ProfileField>

            <div className="md:col-span-2">
              <ProfileField label="Assigned Designation" icon={Briefcase} themeColor="violet">
                <input
                  type="text"
                  value={personalInfo.position}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, position: e.target.value })}
                />
              </ProfileField>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              <span className="uppercase text-xs tracking-widest">Update Records</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <SecuritySection 
        onSubmit={handlePasswordUpdate}
        loading={loading}
        themeColor="violet"
      />

    </ProfileLayout>
  );
};

export default ProfileManagement;
