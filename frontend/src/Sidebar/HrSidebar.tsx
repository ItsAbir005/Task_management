import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  User,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Palmtree,
  UserPlus
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", to: "/hr/dashboard", icon: <LayoutDashboard size={20} /> },
  { title: "Invite Employee", to: "/hr/invite", icon: <UserPlus size={20} /> },
  { title: "Department Management", to: "/hr/department", icon: <CheckSquare size={20} /> },
  { title: "Leave Management", to: "/hr/leave", icon: <Palmtree size={20} /> },
  { title: "Profile Management", to: "/hr/profile", icon: <Settings size={20} /> },
];

const NavItem = ({ collapsed, item }: { collapsed: boolean; item: { title: string; to: string; icon: React.ReactNode } }) => {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center p-2 rounded-md cursor-pointer transition
        ${collapsed ? "justify-center" : "space-x-3"}
        hover:bg-gray-100 ${isActive ? "bg-gray-200 font-semibold" : ""}`
      }
    >
      {item.icon}
      {!collapsed && <span>{item.title}</span>}
    </NavLink>
  );
};

const HrSidebar = ({ logout, user }: { logout: any; user?: any }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user?.name || 'HR Manager');
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'H';

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h1 className="font-bold text-lg">HRConnect Pro</h1>}

        {/* Desktop Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-100 hidden md:block"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="p-2 rounded hover:bg-gray-100 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile */}
      <div className="p-4 border-b">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center space-x-3 w-full hover:bg-gray-100 p-2 rounded"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          {!collapsed && <span className="text-sm font-medium truncate max-w-[120px]">{displayName}</span>}
        </button>

        {profileOpen && !collapsed && (
          <div className="mt-2 bg-white border rounded shadow-md">
            <NavLink
              to="/hr/profile"
              onClick={() => setProfileOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Profile
            </NavLink>

            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="p-1 space-y-2 flex-1">
        {menuItems.map((item, index) => (
          <NavItem key={index} collapsed={collapsed} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-gray-500 text-center">
        © 2025 HRConnect Pro
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top-Bar */}
      <div className="md:hidden flex items-center p-4 border-b bg-white shadow-sm">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">HRConnect Pro</h1>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-screen transition-all duration-300 
        ${collapsed ? "w-16" : "w-64"}`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-md w-64 transform 
        transition-transform duration-300 md:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {SidebarContent}
      </div>
    </>
  );
};

export default HrSidebar;
