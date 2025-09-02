import { Navigate, Outlet } from "react-router-dom";
import { getStoredToken } from "@/lib/api";

export function GuestRoute() {
  const token = getStoredToken();

  if (token && token.user.user_type === "free") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
