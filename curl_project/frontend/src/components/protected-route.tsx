import { Navigate, Outlet } from "react-router-dom";
import { getStoredToken } from "@/lib/api";

export function ProtectedRoute() {
  const token = getStoredToken();

  if (!token || token.user.user_type !== "free") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
