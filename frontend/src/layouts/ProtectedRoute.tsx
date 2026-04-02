import { useContext } from "react";
import { GlobleContext } from "../context/GlobleContext";
import { Navigate, Outlet } from "react-router-dom";
import { Role } from "../types";

interface ProtectedRouteProps {
  allowed: Role[];
}

const ProtectedRoute = ({ allowed }: ProtectedRouteProps) => {
  const context = useContext(GlobleContext);
  
  if (!context) return <div>Error: Context not initialized</div>;
  
  const { user, loading } = context;
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  
  return <Outlet />;
};

export default ProtectedRoute;
