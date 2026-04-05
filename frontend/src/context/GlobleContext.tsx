import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import axios from "axios";
import socket from "../utils/socket";
import { User, Employee, Department, Project, Leave } from "../types";
import toast, { Toaster } from "react-hot-toast";

interface GlobleContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  employeeList: Employee[];
  setEmployeeList: Dispatch<SetStateAction<Employee[]>>;
  departments: Department[];
  setDepartments: Dispatch<SetStateAction<Department[]>>;
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  empProject: any[];
  setEmpProject: Dispatch<SetStateAction<any[]>>;
  managerProjects: Project[];
  setManagerProjects: Dispatch<SetStateAction<Project[]>>;
  leaves: Leave[];
  setLeaves: Dispatch<SetStateAction<Leave[]>>;
  socket: any;
  notifications: any[];
  setNotifications: Dispatch<SetStateAction<any[]>>;
  unreadCount: number;
  setUnreadCount: Dispatch<SetStateAction<number>>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  logout: () => Promise<void>;
  adminStats: any;
  setAdminStats: Dispatch<SetStateAction<any>>;
  hrStats: any;
  setHrStats: Dispatch<SetStateAction<any>>;
  managerStats: any;
  setManagerStats: Dispatch<SetStateAction<any>>;
  empStats: any;
  setEmpStats: Dispatch<SetStateAction<any>>;
}

export const GlobleContext = createContext<GlobleContextType | undefined>(undefined);

export const GlobleProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [empProject, setEmpProject] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [hrStats, setHrStats] = useState<any>(null);
  const [managerProjects, setManagerProjects] = useState<Project[]>([]);
  const [managerStats, setManagerStats] = useState<any>(null);
  const [empStats, setEmpStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/me", {
          withCredentials: true
        });
        setUser(res.data.user);
      } catch (error: any) {
        console.log("No logged in user:", error?.response?.data || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/notifications", {
          withCredentials: true
        });
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: any) => !n.read).length);
      } catch (error) {
        console.log("Error fetching notifications", error);
      }
    };

    fetchUser().then(() => fetchNotifications());
  }, []);

  useEffect(() => {
    if (user) {
      socket.connect();
      console.log("Socket connected");

      socket.on("notification", (data: any) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.custom((t: any) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative overflow-hidden p-4`}>
             <div className="flex-1 w-0">
                <p className="text-sm font-bold text-slate-800">{data.title}</p>
                <p className="text-xs text-slate-500 mt-1">{data.message}</p>
             </div>
          </div>
        ), { duration: 4000 });
      });

    } else {
      socket.disconnect();
      console.log("Socket disconnected");
    }

    return () => {
      socket.off("notification");
      socket.disconnect();
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`http://localhost:3000/api/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch(err) {
      console.log(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`http://localhost:3000/api/notifications/read-all`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch(err) {
      console.log(err);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      socket.disconnect();
      window.location.href = "/login";
    } catch (error) {
      console.log("Error logging out:", error);
      // Determine if we should force logout on error or just alert
      // For safety, force client-side logout even if server fails
      setUser(null);
      socket.disconnect();
      window.location.href = "/login";
    }
  };

  return (
    <GlobleContext.Provider value={{
      user, setUser, loading, employeeList, setEmployeeList, departments, setDepartments, 
      projects, setProjects, empProject, setEmpProject, managerProjects, setManagerProjects,
      leaves, setLeaves, socket, logout, adminStats, setAdminStats, hrStats, setHrStats,
      managerStats, setManagerStats, empStats, setEmpStats, notifications, setNotifications,
      unreadCount, setUnreadCount, markAsRead, markAllAsRead
    }}>
      <Toaster position="bottom-right" />
      {children}
    </GlobleContext.Provider>
  );
};
