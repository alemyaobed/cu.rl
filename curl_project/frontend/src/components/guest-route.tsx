import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function GuestRoute() {
  const { user } = useAuth();

  if (user && user.user_type === "free") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
