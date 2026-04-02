import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import axios from "axios";
import socket from "../utils/socket";
import { User, Employee, Department, Project, Leave } from "../types";

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
  logout: () => Promise<void>;
  adminStats: any;
  setAdminStats: Dispatch<SetStateAction<any>>;
  hrStats: any;
  setHrStats: Dispatch<SetStateAction<any>>;
  managerStats: any;
  setManagerStats: Dispatch<SetStateAction<any>>;
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

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      socket.connect();
      console.log("Socket connected");
    } else {
      socket.disconnect();
      console.log("Socket disconnected");
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

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
      managerStats, setManagerStats
    }}>
      {children}
    </GlobleContext.Provider>
  );
};
